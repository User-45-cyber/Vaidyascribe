/**
 * VaidyaScribe — API Client
 * HTTP wrapper with auth header injection, error handling, and base URL config.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeaders() {
  const token = localStorage.getItem('vs_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { detail: res.statusText };
    }
    const msg = typeof error.detail === 'string' ? error.detail : error.detail?.message || 'Request failed';
    throw new Error(msg);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/pdf')) {
    return res.blob();
  }
  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiPostForm(path, formData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  return handleResponse(res);
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}
