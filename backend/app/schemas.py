"""Pydantic schemas and strict field-level validation for patients."""

import re
from datetime import date, datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, field_validator

from .constants import (
    ALLOWED_DEPARTMENTS,
    ALLOWED_DOCTORS,
    ALLOWED_GENDERS,
    ALLOWED_STATUSES,
    ALLOWED_WARDS,
)
from .database import current_ist_date

NAME_PATTERN = re.compile(r"^[A-Za-z]+(?:\s+[A-Za-z]+)*$")


def _validate_choice(value: Any, allowed: tuple[str, ...], label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{label} is required and must be selected from the list.")
    cleaned = value.strip()
    if cleaned not in allowed:
        raise ValueError(
            f"{label} must be selected from the allowed list: {', '.join(allowed)}."
        )
    return cleaned


class PatientBase(BaseModel):
    """Shared validated patient payload for create and update requests."""

    name: Any
    age: Any
    gender: Any
    ward: Any
    department: Any
    doctor: Any
    admission_date: Any
    status: Any = "Admitted"

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, value: Any) -> str:
        if not isinstance(value, str):
            raise ValueError("Name is required and must contain letters only.")
        normalized = " ".join(value.strip().split())
        if not normalized:
            raise ValueError("Name is required.")
        if len(normalized) > 100:
            raise ValueError("Name must be 100 characters or fewer.")
        if not NAME_PATTERN.fullmatch(normalized):
            raise ValueError(
                "Name must contain letters only (no numbers or special characters)."
            )
        return normalized

    @field_validator("age", mode="before")
    @classmethod
    def validate_age(cls, value: Any) -> int:
        if value is None or isinstance(value, bool):
            raise ValueError("Age is required and must be a number between 0 and 120.")

        if isinstance(value, int):
            age_int = value
        elif isinstance(value, float):
            if not value.is_integer():
                raise ValueError("Age must be a whole number between 0 and 120.")
            age_int = int(value)
        elif isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                raise ValueError(
                    "Age is required and must be a number between 0 and 120."
                )
            if not re.fullmatch(r"-?\d+", stripped):
                raise ValueError("Age must be a whole number between 0 and 120.")
            age_int = int(stripped)
        else:
            raise ValueError("Age must be a number between 0 and 120.")

        if age_int < 0 or age_int > 120:
            raise ValueError("Age must be between 0 and 120.")
        return age_int

    @field_validator("gender", mode="before")
    @classmethod
    def validate_gender(cls, value: Any) -> str:
        return _validate_choice(value, ALLOWED_GENDERS, "Gender")

    @field_validator("ward", mode="before")
    @classmethod
    def validate_ward(cls, value: Any) -> str:
        return _validate_choice(value, ALLOWED_WARDS, "Ward")

    @field_validator("department", mode="before")
    @classmethod
    def validate_department(cls, value: Any) -> str:
        return _validate_choice(value, ALLOWED_DEPARTMENTS, "Department")

    @field_validator("doctor", mode="before")
    @classmethod
    def validate_doctor(cls, value: Any) -> str:
        return _validate_choice(value, ALLOWED_DOCTORS, "Doctor")

    @field_validator("admission_date", mode="before")
    @classmethod
    def validate_admission_date(cls, value: Any) -> date:
        if isinstance(value, datetime):
            parsed = value.date()
        elif isinstance(value, date):
            parsed = value
        elif isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                raise ValueError("Admission Date is required.")
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", stripped):
                raise ValueError("Admission Date must be in YYYY-MM-DD format.")
            try:
                parsed = date.fromisoformat(stripped)
            except ValueError as exc:
                raise ValueError("Admission Date is not a valid calendar date.") from exc
        else:
            raise ValueError("Admission Date is required.")

        if parsed > current_ist_date():
            raise ValueError("Admission Date cannot be a future date.")
        return parsed

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, value: Any) -> str:
        if value is None or (isinstance(value, str) and not value.strip()):
            return "Admitted"
        return _validate_choice(value, ALLOWED_STATUSES, "Status")


class PatientCreate(PatientBase):
    """Schema for creating a new patient admission."""

    status: Literal["Admitted", "Discharged"] = "Admitted"


class PatientUpdate(PatientBase):
    """Schema for updating an existing patient record."""

    pass


class PatientResponse(BaseModel):
    """Serialized patient record returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    age: int
    gender: str
    ward: str
    department: str
    doctor: str
    admission_date: date
    status: str
    created_at: datetime
    updated_at: datetime


class OptionsResponse(BaseModel):
    """Allowed dropdown options for frontend synchronization."""

    genders: list[str]
    wards: list[str]
    departments: list[str]
    doctors: list[str]
    statuses: list[str]
    today: Optional[str] = None
