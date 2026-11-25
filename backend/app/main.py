"""FastAPI application entrypoint for Patient Admission Management App."""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .database import init_db
from .routes import router as patient_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Initialize database schema and initial sample data on startup."""
    init_db(seed_demo_data=True)
    yield


app = FastAPI(
    title="Patient Admission Management API",
    description="REST API for managing hospital patient admissions, filtering, and discharge status.",
    version="1.0.0",
    lifespan=lifespan,
)

raw_origins = os.getenv("CORS_ORIGINS", "*").strip()
if raw_origins == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    """Return clear field-level validation error messages."""
    errors: dict[str, str] = {}
    messages: list[str] = []

    for err in exc.errors():
        loc = [str(part) for part in err.get("loc", []) if part != "body"]
        field = loc[-1] if loc else "non_field"
        raw_msg = err.get("msg", "Invalid value.")
        clean_msg = raw_msg.removeprefix("Value error, ").strip()
        if field not in errors:
            errors[field] = clean_msg
            messages.append(clean_msg)

    summary = messages[0] if len(messages) == 1 else "Please fix the validation errors."
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "message": summary,
            "detail": summary,
            "errors": errors,
        },
    )


app.include_router(patient_router)

# Optional static serving for single-service deployments (e.g., Render / Railway)
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
SERVE_STATIC = os.getenv("SERVE_STATIC", "false").lower() == "true"

if SERVE_STATIC and FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    resolved_dist = FRONTEND_DIST.resolve()

    @app.get("/{full_path:path}")
    async def serve_react_spa(full_path: str):
        """Serve built React SPA for non-API routes."""
        if full_path == "api" or full_path.startswith("api/"):
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"detail": "API endpoint not found."},
            )
        candidate = (resolved_dist / full_path).resolve()
        if full_path and candidate.is_file() and resolved_dist in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(resolved_dist / "index.html")
else:

    @app.get("/")
    def root():
        """Basic API info endpoint when frontend is hosted separately."""
        return {
            "service": "Patient Admission Management API",
            "docs": "/docs",
            "health": "/api/health",
        }
