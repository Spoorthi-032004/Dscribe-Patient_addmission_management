"""API routes for patient admission management."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case
from sqlalchemy.orm import Session

from .constants import (
    ALLOWED_DEPARTMENTS,
    ALLOWED_DOCTORS,
    ALLOWED_GENDERS,
    ALLOWED_STATUSES,
    ALLOWED_WARDS,
)
from .database import check_db_connection, current_ist_date, get_db
from .models import Patient
from .schemas import OptionsResponse, PatientCreate, PatientResponse, PatientUpdate

router = APIRouter(prefix="/api", tags=["Patients"])


@router.get("/health")
def health_check():
    """Health endpoint verifying API and database readiness."""
    check_db_connection()
    return {"status": "ok", "database": "connected", "today": current_ist_date().isoformat()}


@router.get("/options", response_model=OptionsResponse)
def get_options():
    """Return allowed list values and current IST date."""
    return OptionsResponse(
        genders=list(ALLOWED_GENDERS),
        wards=list(ALLOWED_WARDS),
        departments=list(ALLOWED_DEPARTMENTS),
        doctors=list(ALLOWED_DOCTORS),
        statuses=list(ALLOWED_STATUSES),
        today=current_ist_date().isoformat(),
    )


@router.get("/patients", response_model=list[PatientResponse])
def list_patients(
    search: Optional[str] = Query(default=None, description="Search patients by name"),
    ward: Optional[str] = Query(default=None, description="Filter by Ward"),
    department: Optional[str] = Query(default=None, description="Filter by Department"),
    doctor: Optional[str] = Query(default=None, description="Filter by Doctor"),
    patient_status: Optional[str] = Query(
        default=None, alias="status", description="Filter by Status"
    ),
    db: Session = Depends(get_db),
):
    """Retrieve all patients with optional name search and attribute filters."""
    query = db.query(Patient)

    if search and search.strip():
        pattern = f"%{search.strip()}%"
        query = query.filter(Patient.name.ilike(pattern))

    if ward and ward.strip():
        query = query.filter(Patient.ward == ward.strip())

    if department and department.strip():
        query = query.filter(Patient.department == department.strip())

    if doctor and doctor.strip():
        query = query.filter(Patient.doctor == doctor.strip())

    if patient_status and patient_status.strip():
        query = query.filter(Patient.status == patient_status.strip())

    # Show currently Admitted patients first, then newest admission date & latest ID
    status_order = case((Patient.status == "Admitted", 0), else_=1)
    patients = query.order_by(
        status_order.asc(), Patient.admission_date.desc(), Patient.id.desc()
    ).all()
    return patients


@router.post(
    "/patients",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient admission after full backend validation."""
    patient = Patient(
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        ward=payload.ward,
        department=payload.department,
        doctor=payload.doctor,
        admission_date=payload.admission_date,
        status=payload.status,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/patients/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    """Retrieve a single patient by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with id {patient_id} was not found.",
        )
    return patient


@router.put("/patients/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int, payload: PatientUpdate, db: Session = Depends(get_db)
):
    """Update an existing patient's details after full backend validation."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with id {patient_id} was not found.",
        )

    patient.name = payload.name
    patient.age = payload.age
    patient.gender = payload.gender
    patient.ward = payload.ward
    patient.department = payload.department
    patient.doctor = payload.doctor
    patient.admission_date = payload.admission_date
    patient.status = payload.status

    db.commit()
    db.refresh(patient)
    return patient


@router.patch("/patients/{patient_id}/discharge", response_model=PatientResponse)
def discharge_patient(patient_id: int, db: Session = Depends(get_db)):
    """Mark an admitted patient as Discharged."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with id {patient_id} was not found.",
        )

    if patient.status == "Discharged":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient is already marked as Discharged.",
        )

    patient.status = "Discharged"
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/patients/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    """Delete a patient record permanently."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with id {patient_id} was not found.",
        )

    deleted_name = patient.name
    db.delete(patient)
    db.commit()
    return {
        "message": f"Patient '{deleted_name}' deleted successfully.",
        "deleted_id": patient_id,
    }
