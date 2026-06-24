const API_URL = import.meta.env.VITE_API_URL || "/api";

class ApiError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.errors = errors;
  }
}

async function request(endpoint, options = {}) {
  const { headers: optionHeaders, ...restOptions } = options;

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...restOptions,
      headers: {
        "Content-Type": "application/json",
        ...optionHeaders,
      },
    });
  } catch {
    throw new ApiError("Network error. Check your connection and try again.");
  }

  let data = {};
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      throw new ApiError("Invalid response from server");
    }
  }

  if (!response.ok) {
    throw new ApiError(data.message || `Request failed (${response.status})`, data.errors || {});
  }

  return data;
}

function adminHeaders(adminKey) {
  return { "x-admin-key": adminKey };
}

export function submitContact(formData) {
  return request("/contacts", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export function submitApplication(formData) {
  return request("/applications", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export async function submitApplicationWithPayment(payload) {
  const response = await fetch(`${API_URL}/applications/with-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message || "Something went wrong", data.errors || {});
  }

  return data;
}

export function getPrograms() {
  return request("/programs");
}

export function verifyAdmin(adminKey) {
  return request("/admin/verify", {
    headers: adminHeaders(adminKey),
  });
}

export function getContacts(adminKey) {
  return request("/contacts", {
    headers: adminHeaders(adminKey),
  });
}

export function getApplications(adminKey) {
  return request("/applications", {
    headers: adminHeaders(adminKey),
  });
}

export function updateApplicationStatus(id, status, adminKey) {
  return request(`/applications/${id}/status`, {
    method: "PATCH",
    headers: adminHeaders(adminKey),
    body: JSON.stringify({ status }),
  });
}

export function updatePaymentStatus(id, paymentStatus, adminKey) {
  return request(`/applications/${id}/payment-status`, {
    method: "PATCH",
    headers: adminHeaders(adminKey),
    body: JSON.stringify({ paymentStatus }),
  });
}

export function deleteApplication(id, adminKey) {
  return request(`/applications/${id}`, {
    method: "DELETE",
    headers: adminHeaders(adminKey),
  });
}

export function getAdminStats(adminKey) {
  return request("/admin/stats", {
    headers: adminHeaders(adminKey),
  });
}

export function getAdminPrograms(adminKey) {
  return request("/admin/programs", {
    headers: adminHeaders(adminKey),
  });
}

export function createProgram(data, adminKey) {
  return request("/admin/programs", {
    method: "POST",
    headers: adminHeaders(adminKey),
    body: JSON.stringify(data),
  });
}

export function updateProgram(id, data, adminKey) {
  return request(`/admin/programs/${id}`, {
    method: "PUT",
    headers: adminHeaders(adminKey),
    body: JSON.stringify(data),
  });
}

export function deleteProgram(id, adminKey) {
  return request(`/admin/programs/${id}`, {
    method: "DELETE",
    headers: adminHeaders(adminKey),
  });
}

export { ApiError };
