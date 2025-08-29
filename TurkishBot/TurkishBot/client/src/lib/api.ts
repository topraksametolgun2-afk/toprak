import { authManager } from "./auth";

export class ApiError extends Error {
  constructor(public status: number, message: string, public errors?: any[]) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const config: RequestInit = {
    ...options,
    headers: {
      ...authManager.getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, errorData.message, errorData.errors);
  }

  return response;
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await apiRequest(url);
  return response.json();
}

export async function apiPost<T>(url: string, data: any): Promise<T> {
  const response = await apiRequest(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function apiPut<T>(url: string, data: any): Promise<T> {
  const response = await apiRequest(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiRequest(url, {
    method: "DELETE",
  });
  return response.json();
}
