export default function FilterBar({
  filters,
  options,
  onFilterChange,
  onClearFilters,
}) {
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.ward ||
      filters.department ||
      filters.doctor ||
      filters.status
  );

  return (
    <section className="filter-panel" aria-label="Search and filters">
      <div className="filter-grid">
        <div className="filter-field filter-search">
          <label htmlFor="search-name">Search by Name</label>
          <div className="input-icon-wrap">
            <svg
              className="input-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              id="search-name"
              type="text"
              placeholder="Search patient name..."
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
            />
          </div>
        </div>

        <div className="filter-field">
          <label htmlFor="filter-ward">Ward</label>
          <select
            id="filter-ward"
            value={filters.ward}
            onChange={(e) => onFilterChange("ward", e.target.value)}
          >
            <option value="">All Wards</option>
            {options.wards.map((ward) => (
              <option key={ward} value={ward}>
                {ward}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="filter-department">Department</label>
          <select
            id="filter-department"
            value={filters.department}
            onChange={(e) => onFilterChange("department", e.target.value)}
          >
            <option value="">All Departments</option>
            {options.departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="filter-doctor">Doctor</label>
          <select
            id="filter-doctor"
            value={filters.doctor}
            onChange={(e) => onFilterChange("doctor", e.target.value)}
          >
            <option value="">All Doctors</option>
            {options.doctors.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button
            type="button"
            className="btn btn-secondary btn-clear"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </section>
  );
}
