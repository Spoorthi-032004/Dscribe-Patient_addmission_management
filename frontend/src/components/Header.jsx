export default function Header({ onAddClick, totalCount }) {
  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="brand">
          <div className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1>MediDesk Admit</h1>
            <p className="brand-subtitle">
              Hospital Patient Admission &amp; Ward Management
            </p>
          </div>
        </div>

        <div className="header-actions">
          <span className="record-pill" title="Total matching patients">
            {totalCount} {totalCount === 1 ? "Patient" : "Patients"}
          </span>
          <button type="button" className="btn btn-primary" onClick={onAddClick}>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Patient
          </button>
        </div>
      </div>
    </header>
  );
}
