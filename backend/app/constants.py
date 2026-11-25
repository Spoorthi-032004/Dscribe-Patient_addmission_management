"""Predefined allowed option lists for patient admission fields."""

ALLOWED_GENDERS = ("Male", "Female", "Other")

ALLOWED_WARDS = (
    "General Ward",
    "ICU",
    "Emergency",
    "Pediatric Ward",
    "Maternity Ward",
    "Surgical Ward",
)

ALLOWED_DEPARTMENTS = (
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "General Medicine",
    "Oncology",
    "Emergency Medicine",
)

ALLOWED_DOCTORS = (
    "Dr. Ananya Sharma",
    "Dr. Rajesh Verma",
    "Dr. Priya Nair",
    "Dr. Vikram Patel",
    "Dr. Meera Iyer",
    "Dr. Arjun Rao",
)

ALLOWED_STATUSES = ("Admitted", "Discharged")
