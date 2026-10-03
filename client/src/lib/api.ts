export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    units: number;
  };
}

export type UnitStatus = "VACANT" | "OCCUPIED" | "MAINTENANCE";

export interface Unit {
  id: string;
  unitNumber: string;
  rentAmount: number;
  status: UnitStatus;
  propertyId: string;
  createdAt?: string;
  updatedAt?: string;
  property?: {
    id: string;
    name: string;
    address: string;
  };
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

/**
 * Property API methods
 */
export const propertyApi = {
  list: () =>
    apiRequest<{ properties: Property[] }>("/api/properties", {
      method: "GET",
    }),

  getById: (id: string) =>
    apiRequest<{ property: Property }>(`/api/properties/${id}`, {
      method: "GET",
    }),

  create: (data: { name: string; address: string }) =>
    apiRequest<{ property: Property }>("/api/properties", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; address?: string }) =>
    apiRequest<{ property: Property }>(`/api/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<MessageResponse>(`/api/properties/${id}`, {
      method: "DELETE",
    }),
};

/**
 * Unit API methods
 */
export const unitApi = {
  list: (propertyId?: string) => {
    const query = propertyId ? `?propertyId=${encodeURIComponent(propertyId)}` : "";
    return apiRequest<{ units: Unit[] }>(`/api/units${query}`, {
      method: "GET",
    });
  },

  getById: (id: string) =>
    apiRequest<{ unit: Unit }>(`/api/units/${id}`, {
      method: "GET",
    }),

  create: (data: {
    propertyId: string;
    unitNumber: string;
    rentAmount: number;
    status?: UnitStatus;
  }) =>
    apiRequest<{ unit: Unit }>("/api/units", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: {
      unitNumber?: string;
      rentAmount?: number;
      status?: UnitStatus;
    }
  ) =>
    apiRequest<{ unit: Unit }>(`/api/units/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<MessageResponse>(`/api/units/${id}`, {
      method: "DELETE",
    }),
};
