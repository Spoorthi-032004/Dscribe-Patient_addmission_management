"""SQLAlchemy ORM models for patients and app metadata."""

from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, Integer, String

from .database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Patient(Base):
    """Represents a hospital patient admission record."""

    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    ward = Column(String(60), nullable=False, index=True)
    department = Column(String(60), nullable=False, index=True)
    doctor = Column(String(80), nullable=False, index=True)
    admission_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="Admitted", index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )


class AppMetadata(Base):
    """Stores one-time setup flags (such as initial seed completion)."""

    __tablename__ = "app_metadata"

    key = Column(String(64), primary_key=True)
    value = Column(String(255), nullable=False)
