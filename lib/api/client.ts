import { ApiError, ApiResponse } from "./types";
import { getAuthToken } from "./token";

/**
 * Custom error class wrapping the backend ApiError contract
 */
export class ApiClientError extends Error {
  public readonly apiError: ApiError;
  public readonly status: number;
  public readonly rawResponse?: unknown;

  constructor(apiError: ApiError, status = 500, rawResponse?: unknown) {
    super(apiError.message || "An unexpected API error occurred.");
    this.name = "ApiClientError";
    this.apiError = apiError;
    this.status = status;
    this.rawResponse = rawResponse;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  requiresAuth?: boolean;
}

/**
 * Standard fetcher that serializes and deserializes ApiResponse<T>,
 * injects the JWT Authorization header, and handles ApiError cleanly.
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, params, headers, requiresAuth = true, ...restOptions } = options;

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  // Build standard headers
  const customHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Automatically attach Bearer token if present
  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      customHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  if (headers) {
    Object.assign(customHeaders, headers);
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: customHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    let payload: ApiResponse<T> | null = null;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      try {
        payload = (await response.json()) as ApiResponse<T>;
      } catch {
        payload = null;
      }
    }

    // Check for HTTP errors or logical failure in standard ApiResponse
    if (!response.ok || (payload && payload.success === false)) {
      const errorData: ApiError = payload?.error || {
        message:
          payload?.message ||
          response.statusText ||
          `Request failed with status ${response.status}`,
        status: response.status,
      };

      throw new ApiClientError(errorData, response.status, payload);
    }

    if (!payload) {
      // For empty responses (like 204 No Content)
      return {
        success: true,
        data: undefined as unknown as T,
      };
    }

    return payload;
  } catch (error: unknown) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Handle Network / CORS errors
    const fallbackError: ApiError = {
      message:
        error instanceof Error
          ? error.message
          : "Network error. Please verify the backend server is reachable.",
      code: "NETWORK_ERROR",
    };

    throw new ApiClientError(fallbackError, 0);
  }
}

/**
 * Standard HTTP helper methods
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T, B = unknown>(endpoint: string, body?: B, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "POST", body }),

  put: <T, B = unknown>(endpoint: string, body?: B, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "PUT", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
