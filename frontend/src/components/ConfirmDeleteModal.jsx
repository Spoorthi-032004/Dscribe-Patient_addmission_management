import { useEffect } from "react";

export default function ConfirmDeleteModal({
  patient,
  deleting,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!patient) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !deleting) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [patient, deleting, onCancel]);

  if (!patient) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onCancel();
      }}
    >
      <div className="modal-card modal-compact">
        <div className="modal-header">
          <h2 id="delete-modal-title">Delete Patient Record</h2>
          <button
            type="button"
            className="icon-close-btn"
            onClick={onCancel}
            disabled={deleting}
            aria-label="Close confirmation"
          >
            &times;
          </button>
        </div>

        <div className="delete-body">
          <p>
            Are you sure you want to permanently delete{" "}
            <strong>{patient.name}</strong> (ID #{patient.id}, {patient.ward})?
          </p>
          <p className="delete-warning">This action cannot be undone.</p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Patient"}
          </button>
        </div>
      </div>
    </div>
  );
}
