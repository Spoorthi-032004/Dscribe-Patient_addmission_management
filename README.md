# MediDesk Admit — Patient Admission Management App

A full-stack hospital patient admission management web application built with **React.js** (frontend), **Python FastAPI** (backend), and **SQLite / PostgreSQL** (persistent database).

> **Live Demo:** `<ADD_YOUR_DEPLOYED_LIVE_URL_HERE>`

---

## Tech Stack

- **Frontend:** React.js 18, Vite, CSS3 (responsive design for mobile, tablet, and desktop)
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn
- **Database:** SQLite (`backend/patients.db`) for local development; PostgreSQL via `DATABASE_URL` for cloud persistence

---

## Features Implemented

1. **Add a Patient** — Modal form with all required fields (`Name`, `Age`, `Gender`, `Ward`, `Department`, `Doctor`, `Admission Date`, `Status`).
2. **View All Patients** — Responsive desktop table and mobile/tablet card views showing admitted and discharged patients, plus summary counters.
3. **Filter by Ward, Department, and Doctor** — Dedicated dropdown filters and status quick-filters (`All Records`, `Currently Admitted`, `Discharged`).
4. **Search by Name** — Instant case-insensitive patient name search backed by API query filtering.
5. **Edit Patient** — Pre-filled edit modal to update any patient field or status.
6. **Delete Patient (with Confirmation)** — Confirmation dialog before permanent deletion.
7. **Mark as Discharged** — One-click `Discharge` button on admitted patients (`PATCH /api/patients/{id}/discharge`).
8. **Dual-Layer Validation (Frontend + Backend)**:
   - **Name:** Required, letters and spaces only (`^[A-Za-z]+(?:\s+[A-Za-z]+)*$`)
   - **Age:** Required, whole number between `0` and `120`
   - **Gender, Ward, Department, Doctor:** Required, validated against predefined option lists on both client and server
   - **Admission Date:** Required, cannot be a future date (checked in IST `Asia/Kolkata`)
   - **Backend Error Responses:** Returns structured `422` JSON responses with field-specific error messages

---

## Project Structure

```text
dscribe/
├── backend/
│   ├── app/
│   │   ├── constants.py     # Allowed genders, wards, departments, doctors, statuses
│   │   ├── database.py      # SQLAlchemy engine, session, SQLite/Postgres support, initial seed
│   │   ├── main.py          # FastAPI app, CORS, validation handler, optional static SPA serving
│   │   ├── models.py        # SQLAlchemy ORM models (Patient, AppMetadata)
│   │   ├── routes.py        # REST endpoints (/api/patients, /api/options, /api/health)
│   │   └── schemas.py       # Pydantic request/response schemas & strict field validation
│   ├── tests/
│   │   └── test_patients.py # Automated API & validation tests
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/patientsApi.js
│   │   ├── components/      # Header, StatsBar, FilterBar, PatientTable, Modals
│   │   ├── constants/options.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── Procfile
├── render.yaml
└── README.md
```

---

## Steps to Run Locally

### 1. Start the Backend (Python FastAPI)

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- API base URL: `http://localhost:8000`
- Interactive Swagger docs: `http://localhost:8000/docs`
- Local SQLite database is automatically created at `backend/patients.db` and persists across server restarts.

### 2. Start the Frontend (React.js)

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

- Frontend URL: `http://localhost:5173`
- Vite automatically proxies `/api/*` requests to `http://127.0.0.1:8000`.

---

## Running Automated Backend Tests

From the project root:

```bash
python -m unittest discover -s backend/tests -v
```

---

## Deploying to Get a Live Link (Render Blueprint)

1. Push this repository to a **public GitHub repository** (ensure no `.env` or secret keys are committed).
2. On [Render](https://render.com), click **New +** -> **Blueprint** and connect your GitHub repository.
3. Render reads `render.yaml`, provisions a free PostgreSQL database (`patient-admission-db`), builds the React frontend (`frontend/dist`), and runs the FastAPI server (`SERVE_STATIC=true`) serving both the API and UI on a single live URL.
4. Copy the live URL and update the **Live Demo** link at the top of this `README.md` along with screenshots before submitting.

---

## Screenshots

> Add screenshots of the running application (desktop view, add/edit modal, and mobile view) into a `screenshots/` folder and link them here before final submission.

```markdown
![Desktop Dashboard](./screenshots/desktop-dashboard.png)
![Add Patient Modal](./screenshots/add-patient-modal.png)
![Mobile View](./screenshots/mobile-view.png)
```
