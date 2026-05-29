export const API_BASE_URL = "http://127.0.0.1:5000/api";

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  // Use current role from localStorage (set by AuthContext)
  const role = localStorage.getItem("rbac_role") || "Read-Only";
  
  const headers = {
    "Content-Type": "application/json",
    "X-User-Role": role,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const api = {
  get: (endpoint: string, options?: RequestInit) => fetchApi(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, data: any, options?: RequestInit) => fetchApi(endpoint, { ...options, method: "POST", body: JSON.stringify(data) }),
  put: (endpoint: string, data: any, options?: RequestInit) => fetchApi(endpoint, { ...options, method: "PUT", body: JSON.stringify(data) }),
  delete: (endpoint: string, options?: RequestInit) => fetchApi(endpoint, { ...options, method: "DELETE" }),
};
