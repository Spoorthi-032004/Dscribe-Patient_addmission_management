import { useCallback, useEffect, useState } from "react";
import {
  createPatient,
  deletePatient,
  dischargePatient,
  fetchOptions,
  fetchPatients,
  updatePatient,
} from "./api/patientsApi";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import FilterBar from "./components/FilterBar";
import Header from "./components/Header";
import PatientFormModal from "./components/PatientFormModal";
import PatientTable from "./components/PatientTable";
import StatsBar from "./components/StatsBar";
import { DEFAULT_OPTIONS } from "./constants/options";

const INITIAL_FILTERS = {
  search: "",
  ward: "",
  department: "",
  doctor: "",
  status: "",
};

export default function App() {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [toast, setToast] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [dischargingId, setDischargingId] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadData = useCallback(async (activeFilters) => {
    setLoading(true);
    setApiError("");
    try {
      const hasAnyFilter = Boolean(
        activeFilters.search?.trim() ||
          activeFilters.ward ||
          activeFilters.department ||
          activeFilters.doctor ||
          activeFilters.status
      );

      if (hasAnyFilter) {
        const [filteredList, fullList] = await Promise.all([
          fetchPatients(activeFilters),
          fetchPatients(),
        ]);
        setPatients(filteredList);
        setAllPatients(fullList);
      } else {
        const fullList = await fetchPatients();
        setPatients(fullList);
        setAllPatients(fullList);
      }
    } catch (err) {
      setApiError(
        err?.message || "Unable to connect to the backend server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions()
      .then((serverOptions) => setOptions(serverOptions))
      .catch(() => {
        // Fallback to DEFAULT_OPTIONS if /api/options is momentarily unreachable
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(filters);
    }, 150);
    return () => clearTimeout(timer);
  }, [filters, loadData]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    if (editingPatient) {
      await updatePatient(editingPatient.id, payload);
      showToast(`Updated record for ${payload.name}.`);
    } else {
      await createPatient(payload);
      showToast(`Admitted ${payload.name} successfully.`);
    }
    setIsFormOpen(false);
    setEditingPatient(null);
    await loadData(filters);
  };

  const handleDischarge = async (patient) => {
    setDischargingId(patient.id);
    try {
      await dischargePatient(patient.id);
      showToast(`${patient.name} marked as Discharged.`);
      await loadData(filters);
    } catch (err) {
      showToast(err?.message || "Failed to discharge patient.", "error");
    } finally {
      setDischargingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPatient) return;
    setDeletingBusy(true);
    try {
      await deletePatient(deletingPatient.id);
      showToast(`Deleted record for ${deletingPatient.name}.`);
      setDeletingPatient(null);
      await loadData(filters);
    } catch (err) {
      showToast(err?.message || "Failed to delete patient.", "error");
    } finally {
      setDeletingBusy(false);
    }
  };

  const hasFilters = Boolean(
    filters.search?.trim() ||
      filters.ward ||
      filters.department ||
      filters.doctor ||
      filters.status
  );

  return (
    <div className="app-shell">
      <Header onAddClick={handleOpenAdd} totalCount={patients.length} />

      <main className="container main-content">
        {toast && (
          <div className={`toast toast-${toast.type}`} role="status">
            <span>{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        )}

        <StatsBar
          patients={allPatients}
          activeStatus={filters.status}
          onStatusSelect={(status) => handleFilterChange("status", status)}
        />

        <FilterBar
          filters={filters}
          options={options}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {apiError ? (
          <div className="error-banner" role="alert">
            <div>
              <strong>Connection Error:</strong> {apiError}
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => loadData(filters)}
            >
              Retry
            </button>
          </div>
        ) : (
          <PatientTable
            patients={patients}
            loading={loading}
            dischargingId={dischargingId}
            onEdit={handleOpenEdit}
            onDischarge={handleDischarge}
            onDelete={setDeletingPatient}
            onAddClick={handleOpenAdd}
            hasFilters={hasFilters}
            onClearFilters={handleClearFilters}
          />
        )}
      </main>

      <PatientFormModal
        isOpen={isFormOpen}
        initialPatient={editingPatient}
        options={options}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPatient(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDeleteModal
        patient={deletingPatient}
        deleting={deletingBusy}
        onCancel={() => setDeletingPatient(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
