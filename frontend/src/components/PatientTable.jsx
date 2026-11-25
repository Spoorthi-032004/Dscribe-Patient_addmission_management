import { formatDisplayDate } from "../constants/options";

export default function PatientTable({
  patients,
  loading,
  dischargingId,
  onEdit,
  onDischarge,
  onDelete,
  onAddClick,
  hasFilters,
  onClearFilters,
}) {
  if (loading) {
    return (
      <div className="state-box" role="status">
        <div className="spinner" aria-hidden="true" />
        <p>Loading patient admissions...</p>
      </div>
    );
  }

  if (!patients.length) {
    return (
      <div className="state-box empty-state">
        <div className="empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path
              d="M9 12h6m-3-3v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3>{hasFilters ? "No matching patients found" : "No patients admitted yet"}</h3>
        <p>
          {hasFilters
            ? "Try adjusting your search term or clearing active filters."
            : "Get started by adding your first patient admission record."}
        </p>
        {hasFilters ? (
          <button type="button" className="btn btn-secondary" onClick={onClearFilters}>
            Clear All Filters
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onAddClick}>
            + Add First Patient
          </button>
        )}
      </div>
    );
  }

  return (
    <section aria-label="Patient admissions list">
      {/* Desktop Table View */}
      <div className="table-card desktop-only">
        <div className="table-responsive">
          <table className="patient-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Ward</th>
                <th>Department</th>
                <th>Doctor</th>
                <th>Admission Date</th>
                <th>Status</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => {
                const isAdmitted = patient.status === "Admitted";
                const isDischarging = dischargingId === patient.id;
                return (
                  <tr key={patient.id}>
                    <td>
                      <div className="patient-name-cell">
                        <span className="avatar-badge" aria-hidden="true">
                          {patient.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div className="patient-name">{patient.name}</div>
                          <div className="patient-id">ID #{patient.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{patient.age} yrs</td>
                    <td>{patient.gender}</td>
                    <td>
                      <span className="ward-tag">{patient.ward}</span>
                    </td>
                    <td>{patient.department}</td>
                    <td>{patient.doctor}</td>
                    <td>{formatDisplayDate(patient.admission_date)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          isAdmitted ? "status-admitted" : "status-discharged"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="actions-col">
                      <div className="row-actions">
                        {isAdmitted && (
                          <button
                            type="button"
                            className="btn-action btn-discharge"
                            disabled={isDischarging}
                            onClick={() => onDischarge(patient)}
                            title="Mark patient as Discharged"
                          >
                            {isDischarging ? "Updating..." : "Discharge"}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-action btn-edit"
                          onClick={() => onEdit(patient)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-delete"
                          onClick={() => onDelete(patient)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile & Tablet Card View */}
      <div className="cards-grid mobile-tablet-only">
        {patients.map((patient) => {
          const isAdmitted = patient.status === "Admitted";
          const isDischarging = dischargingId === patient.id;
          return (
            <article key={patient.id} className="patient-card">
              <div className="card-header">
                <div className="patient-name-cell">
                  <span className="avatar-badge" aria-hidden="true">
                    {patient.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <h3 className="patient-name">{patient.name}</h3>
                    <p className="patient-meta">
                      {patient.age} yrs &bull; {patient.gender} &bull; ID #{patient.id}
                    </p>
                  </div>
                </div>
                <span
                  className={`status-badge ${
                    isAdmitted ? "status-admitted" : "status-discharged"
                  }`}
                >
                  {patient.status}
                </span>
              </div>

              <dl className="card-details">
                <div>
                  <dt>Ward</dt>
                  <dd>{patient.ward}</dd>
                </div>
                <div>
                  <dt>Department</dt>
                  <dd>{patient.department}</dd>
                </div>
                <div>
                  <dt>Doctor</dt>
                  <dd>{patient.doctor}</dd>
                </div>
                <div>
                  <dt>Admitted On</dt>
                  <dd>{formatDisplayDate(patient.admission_date)}</dd>
                </div>
              </dl>

              <div className="card-actions">
                {isAdmitted && (
                  <button
                    type="button"
                    className="btn-action btn-discharge"
                    disabled={isDischarging}
                    onClick={() => onDischarge(patient)}
                  >
                    {isDischarging ? "Updating..." : "Mark Discharged"}
                  </button>
                )}
                <button
                  type="button"
                  className="btn-action btn-edit"
                  onClick={() => onEdit(patient)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-action btn-delete"
                  onClick={() => onDelete(patient)}
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
