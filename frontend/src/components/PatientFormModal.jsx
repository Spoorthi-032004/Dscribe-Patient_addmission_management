import { useEffect, useState } from "react";
import { getTodayIST, validatePatientForm } from "../constants/options";

const EMPTY_FORM = {
  name: "",
  age: "",
  gender: "",
  ward: "",
  department: "",
  doctor: "",
  admission_date: getTodayIST(),
  status: "Admitted",
};

export default function PatientFormModal({
  isOpen,
  initialPatient,
  options,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(initialPatient);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverBanner, setServerBanner] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialPatient) {
      setFormData({
        name: initialPatient.name ?? "",
        age: initialPatient.age !== undefined ? String(initialPatient.age) : "",
        gender: initialPatient.gender ?? "",
        ward: initialPatient.ward ?? "",
        department: initialPatient.department ?? "",
        doctor: initialPatient.doctor ?? "",
        admission_date: initialPatient.admission_date ?? getTodayIST(),
        status: initialPatient.status ?? "Admitted",
      });
    } else {
      setFormData({
        ...EMPTY_FORM,
        admission_date: options.today || getTodayIST(),
      });
    }
    setErrors({});
    setServerBanner("");
    setSubmitting(false);
  }, [isOpen, initialPatient, options.today]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const maxDate = options.today || getTodayIST();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverBanner) setServerBanner("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validatePatientForm(formData, options);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setServerBanner("Please fix the highlighted validation errors.");
      return;
    }

    setSubmitting(true);
    setServerBanner("");

    const payload = {
      name: formData.name.trim().replace(/\s+/g, " "),
      age: Number(formData.age),
      gender: formData.gender,
      ward: formData.ward,
      department: formData.department,
      doctor: formData.doctor,
      admission_date: formData.admission_date,
      status: isEditing ? formData.status : "Admitted",
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      if (err?.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors);
      }
      setServerBanner(err?.message || "Failed to save patient record.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2 id="patient-modal-title">
              {isEditing ? "Edit Patient Admission" : "Admit New Patient"}
            </h2>
            <p className="modal-subtitle">
              All fields are validated before saving to the hospital registry.
            </p>
          </div>
          <button
            type="button"
            className="icon-close-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="modal-form">
          {serverBanner && (
            <div className="form-alert" role="alert">
              {serverBanner}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group form-span-2">
              <label htmlFor="patient-name">
                Patient Name <span className="req">*</span>
              </label>
              <input
                id="patient-name"
                type="text"
                placeholder="e.g., Aarav Sharma"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "is-invalid" : ""}
                autoFocus
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="patient-age">
                Age (0–120) <span className="req">*</span>
              </label>
              <input
                id="patient-age"
                type="number"
                min="0"
                max="120"
                step="1"
                placeholder="e.g., 42"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                className={errors.age ? "is-invalid" : ""}
              />
              {errors.age && <span className="field-error">{errors.age}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="patient-gender">
                Gender <span className="req">*</span>
              </label>
              <select
                id="patient-gender"
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className={errors.gender ? "is-invalid" : ""}
              >
                <option value="">Select gender...</option>
                {options.genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.gender && <span className="field-error">{errors.gender}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="patient-ward">
                Ward <span className="req">*</span>
              </label>
              <select
                id="patient-ward"
                value={formData.ward}
                onChange={(e) => handleChange("ward", e.target.value)}
                className={errors.ward ? "is-invalid" : ""}
              >
                <option value="">Select ward...</option>
                {options.wards.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              {errors.ward && <span className="field-error">{errors.ward}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="patient-department">
                Department <span className="req">*</span>
              </label>
              <select
                id="patient-department"
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                className={errors.department ? "is-invalid" : ""}
              >
                <option value="">Select department...</option>
                {options.departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.department && (
                <span className="field-error">{errors.department}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="patient-doctor">
                Assigned Doctor <span className="req">*</span>
              </label>
              <select
                id="patient-doctor"
                value={formData.doctor}
                onChange={(e) => handleChange("doctor", e.target.value)}
                className={errors.doctor ? "is-invalid" : ""}
              >
                <option value="">Select doctor...</option>
                {options.doctors.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
              {errors.doctor && <span className="field-error">{errors.doctor}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="patient-date">
                Admission Date <span className="req">*</span>
              </label>
              <input
                id="patient-date"
                type="date"
                max={maxDate}
                value={formData.admission_date}
                onChange={(e) => handleChange("admission_date", e.target.value)}
                className={errors.admission_date ? "is-invalid" : ""}
              />
              {errors.admission_date && (
                <span className="field-error">{errors.admission_date}</span>
              )}
            </div>

            {isEditing && (
              <div className="form-group form-span-2">
                <label htmlFor="patient-status">
                  Admission Status <span className="req">*</span>
                </label>
                <select
                  id="patient-status"
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className={errors.status ? "is-invalid" : ""}
                >
                  {options.statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {errors.status && <span className="field-error">{errors.status}</span>}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Admit Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
