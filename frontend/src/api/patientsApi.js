const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status = 500, fieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.detail ||
      `Request failed with status ${response.status}.`;
    const fieldErrors = data?.errors || {};
    throw new ApiError(message, response.status, fieldErrors);
  }

  return data;
}

export function fetchOptions() {
  return request("/api/options");
}

export function fetchPatients(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.ward) params.set("ward", filters.ward);
  if (filters.department) params.set("department", filters.department);
  if (filters.doctor) params.set("doctor", filters.doctor);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  return request(`/api/patients${query ? `?${query}` : ""}`);
}

export function createPatient(payload) {
  return request("/api/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePatient(id, payload) {
  return request(`/api/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function dischargePatient(id) {
  return request(`/api/patients/${id}/discharge`, {
    method: "PATCH",
  });
}

export function deletePatient(id) {
  return request(`/api/patients/${id}`, {
    method: "DELETE",
  });
}
