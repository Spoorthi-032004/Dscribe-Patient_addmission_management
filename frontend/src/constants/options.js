export const DEFAULT_OPTIONS = {
  genders: ["Male", "Female", "Other"],
  wards: [
    "General Ward",
    "ICU",
    "Emergency",
    "Pediatric Ward",
    "Maternity Ward",
    "Surgical Ward",
  ],
  departments: [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "General Medicine",
    "Oncology",
    "Emergency Medicine",
  ],
  doctors: [
    "Dr. Ananya Sharma",
    "Dr. Rajesh Verma",
    "Dr. Priya Nair",
    "Dr. Vikram Patel",
    "Dr. Meera Iyer",
    "Dr. Arjun Rao",
  ],
  statuses: ["Admitted", "Discharged"],
};

const NAME_REGEX = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;

export function getTodayIST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatDisplayDate(isoDate) {
  if (!isoDate) return "-";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  return dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function validatePatientForm(values, options = DEFAULT_OPTIONS) {
  const errors = {};
  const today = options.today || getTodayIST();

  const trimmedName = (values.name || "").trim().replace(/\s+/g, " ");
  if (!trimmedName) {
    errors.name = "Name is required.";
  } else if (trimmedName.length > 100) {
    errors.name = "Name must be 100 characters or fewer.";
  } else if (!NAME_REGEX.test(trimmedName)) {
    errors.name = "Name must contain letters only (no numbers or special characters).";
  }

  const rawAge = values.age === 0 ? "0" : String(values.age ?? "").trim();
  if (rawAge === "") {
    errors.age = "Age is required.";
  } else if (!/^-?\d+$/.test(rawAge)) {
    errors.age = "Age must be a whole number between 0 and 120.";
  } else {
    const numAge = Number(rawAge);
    if (numAge < 0 || numAge > 120) {
      errors.age = "Age must be between 0 and 120.";
    }
  }

  if (!values.gender || !options.genders.includes(values.gender)) {
    errors.gender = "Please select a gender from the list.";
  }

  if (!values.ward || !options.wards.includes(values.ward)) {
    errors.ward = "Please select a ward from the list.";
  }

  if (!values.department || !options.departments.includes(values.department)) {
    errors.department = "Please select a department from the list.";
  }

  if (!values.doctor || !options.doctors.includes(values.doctor)) {
    errors.doctor = "Please select a doctor from the list.";
  }

  if (!values.admission_date) {
    errors.admission_date = "Admission Date is required.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.admission_date)) {
    errors.admission_date = "Please enter a valid date.";
  } else if (values.admission_date > today) {
    errors.admission_date = "Admission Date cannot be a future date.";
  }

  if (values.status && !options.statuses.includes(values.status)) {
    errors.status = "Please select a valid status.";
  }

  return errors;
}
