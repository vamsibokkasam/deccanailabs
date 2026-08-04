import { getApiBaseUrl } from "../config/api.js";

const API_URL = getApiBaseUrl();
const REQUEST_TIMEOUT_MS = 90_000;

class ApiError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.errors = errors;
  }
}

async function parseJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new ApiError(
      response.ok
        ? "Invalid response from server"
        : `Request failed (${response.status}). The server may be waking up — try again in a minute.`
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError("Invalid response from server");
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError(
        "Request timed out. The server may be waking up — please wait a moment and try again."
      );
    }

    throw new ApiError("Network error. Check your connection and try again.");
  } finally {
    clearTimeout(timeoutId);
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
  const response = await fetchWithTimeout(`${API_URL}/applications/with-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);

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

export function completeApplication(id, adminKey) {
  return request(`/applications/${id}/complete`, {
    method: "PATCH",
    headers: adminHeaders(adminKey),
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

export function getAdminBatches(adminKey, { programId } = {}) {
  const query = programId ? `?programId=${encodeURIComponent(programId)}` : "";
  return request(`/admin/batches${query}`, {
    headers: adminHeaders(adminKey),
  });
}

export function createBatch(data, adminKey) {
  return request("/admin/batches", {
    method: "POST",
    headers: adminHeaders(adminKey),
    body: JSON.stringify(data),
  });
}

export function updateBatch(id, data, adminKey) {
  return request(`/admin/batches/${id}`, {
    method: "PUT",
    headers: adminHeaders(adminKey),
    body: JSON.stringify(data),
  });
}

export function deleteBatch(id, adminKey) {
  return request(`/admin/batches/${id}`, {
    method: "DELETE",
    headers: adminHeaders(adminKey),
  });
}

export function getBatchUnassignedApplications(batchId, adminKey) {
  return request(`/admin/batches/${batchId}/unassigned`, {
    headers: adminHeaders(adminKey),
  });
}

export function assignApplicationsToBatch(batchId, applicationIds, adminKey) {
  return request(`/admin/batches/${batchId}/assign`, {
    method: "POST",
    headers: adminHeaders(adminKey),
    body: JSON.stringify({ applicationIds }),
  });
}

export function verifyCertificate(certNo) {
  return request(`/certificates/verify/${certificatePath(certNo)}`);
}

export function searchCertificates(query) {
  return request(`/certificates/search?q=${encodeURIComponent(query.trim())}`);
}

/** Keep slashes in the path so Express wildcard routes match (avoid %2F). */
function certificatePath(certNo) {
  return String(certNo || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
}

async function fetchCertificatePdfBlob(endpoint, adminKey) {
  const headers = adminKey ? adminHeaders(adminKey) : {};
  const response = await fetchWithTimeout(`${API_URL}${endpoint}`, { headers });
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.message || `Request failed (${response.status})`);
    }
    throw new ApiError(`Failed to fetch certificate PDF (${response.status})`);
  }

  return response.blob();
}

/** Admin preview/render of any certificate PDF. */
export function fetchCertificatePdf(certNo, adminKey, { download = false } = {}) {
  const query = download ? "?download=1" : "";
  return fetchCertificatePdfBlob(
    `/certificates/render/${certificatePath(certNo)}${query}`,
    adminKey
  );
}

/** Public PNG URL for embedding the certificate as an image. */
export function getPublicCertificateImageUrl(certNo) {
  return `${API_URL}/certificates/image/${certificatePath(certNo)}`;
}

/** Public PDF download for valid certificates (QR / website). */
export function downloadPublicCertificatePdf(certNo, { download = true } = {}) {
  const query = download ? "?download=1" : "?download=0";
  return fetchCertificatePdfBlob(`/certificates/pdf/${certificatePath(certNo)}${query}`);
}

export function openCertificatePdfBlob(blob, { download = false, filename = "certificate.pdf" } = {}) {
  const url = URL.createObjectURL(blob);

  if (download) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return url;
}

export { ApiError };
