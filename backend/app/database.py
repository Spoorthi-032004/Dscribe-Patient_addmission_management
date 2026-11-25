"""Database engine, session management, and initial table/seed setup."""

import os
from datetime import date, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_SQLITE_PATH = BASE_DIR / "patients.db"

IST_TIMEZONE = ZoneInfo("Asia/Kolkata")


def get_database_url() -> str:
    """Resolve database URL from environment, defaulting to local SQLite."""
    raw_url = os.getenv("DATABASE_URL", "").strip()
    if not raw_url:
        return f"sqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"

    # Normalize Render/Heroku style URLs to SQLAlchemy + psycopg driver
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql+psycopg://", 1)
    if raw_url.startswith("postgresql://") and "+psycopg" not in raw_url:
        return raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return raw_url


DATABASE_URL = get_database_url()
IS_SQLITE = DATABASE_URL.startswith("sqlite")

engine_kwargs = {"pool_pre_ping": True}
if IS_SQLITE:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def current_ist_date() -> date:
    """Return today's date in IST (Asia/Kolkata)."""
    from datetime import datetime

    return datetime.now(IST_TIMEZONE).date()


def init_db(seed_demo_data: bool = True) -> None:
    """Create database tables and optionally seed initial patients once."""
    from .models import AppMetadata, Patient  # noqa: F401

    Base.metadata.create_all(bind=engine)

    if not seed_demo_data:
        return

    with SessionLocal() as db:
        already_seeded = (
            db.query(AppMetadata).filter(AppMetadata.key == "initial_seed_done").first()
        )
        if already_seeded:
            return

        today = current_ist_date()
        sample_patients = [
            Patient(
                name="Aarav Sharma",
                age=45,
                gender="Male",
                ward="ICU",
                department="Cardiology",
                doctor="Dr. Ananya Sharma",
                admission_date=today - timedelta(days=2),
                status="Admitted",
            ),
            Patient(
                name="Priya Nair",
                age=32,
                gender="Female",
                ward="Maternity Ward",
                department="General Medicine",
                doctor="Dr. Meera Iyer",
                admission_date=today - timedelta(days=1),
                status="Admitted",
            ),
            Patient(
                name="Rohan Deshmukh",
                age=61,
                gender="Male",
                ward="Surgical Ward",
                department="Orthopedics",
                doctor="Dr. Vikram Patel",
                admission_date=today - timedelta(days=5),
                status="Discharged",
            ),
            Patient(
                name="Diya Kulkarni",
                age=8,
                gender="Female",
                ward="Pediatric Ward",
                department="Pediatrics",
                doctor="Dr. Priya Nair",
                admission_date=today,
                status="Admitted",
            ),
            Patient(
                name="Karthik Menon",
                age=54,
                gender="Male",
                ward="Emergency",
                department="Neurology",
                doctor="Dr. Rajesh Verma",
                admission_date=today - timedelta(days=3),
                status="Admitted",
            ),
        ]
        db.add_all(sample_patients)
        db.add(AppMetadata(key="initial_seed_done", value="true"))
        db.commit()


def check_db_connection() -> bool:
    """Verify database connectivity for health checks."""
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return True
