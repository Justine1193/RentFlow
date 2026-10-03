export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export class ApiError extends Error {
  public status: number;
  public data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Generic fetch wrapper that sends requests with credentials (cookies)
 * and safely parses JSON responses with strong TypeScript typing.
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Required for HTTP-only JWT cookies
  });

  let data: unknown;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
    ) {
      errorMessage = (data as { message: string }).message;
    }
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

/**
 * Authentication API methods
 */
export const authApi = {
  register: (payload: RegisterPayload) =>
    apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest<MessageResponse>("/api/auth/logout", {
      method: "POST",
    }),

  getCurrentUser: () =>
    apiRequest<AuthResponse>("/api/auth/me", {
      method: "GET",
    }),
};
