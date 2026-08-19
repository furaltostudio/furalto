import { siteConfig } from "@/config/site";
import type { ApiErrorPayload } from "@/types";

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
  auth?: boolean;
  _retry?: boolean;
};

class ApiClientError extends Error {
  statusCode: number;
  errors: ApiErrorPayload["errors"];

  constructor(message: string, statusCode: number, errors?: ApiErrorPayload["errors"]) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;

    if (typeof window !== "undefined") {
      this.accessToken = window.localStorage.getItem("furalto-access-token");
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;

    if (typeof window === "undefined") {
      return;
    }

    if (token) {
      window.localStorage.setItem("furalto-access-token", token);
    } else {
      window.localStorage.removeItem("furalto-access-token");
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (typeof window === "undefined") {
      return false;
    }

    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const response = await fetch(new URL("/api/v1/auth/refresh", this.baseUrl).toString(), {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });

          const payload = await response.json().catch(() => null);

          if (!response.ok || !payload?.data?.accessToken) {
            this.setAccessToken(null);
            return false;
          }

          this.setAccessToken(payload.data.accessToken);
          return true;
        } catch {
          this.setAccessToken(null);
          return false;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }

    return this.refreshPromise;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>) {
    const url = new URL(endpoint, this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, auth = true, _retry = false, ...rest } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...rest,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(auth && this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        ...headers,
      },
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && auth && !_retry) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, { ...options, _retry: true });
        }
      }

      throw new ApiClientError(
        payload?.message || `API Error: ${response.status} ${response.statusText}`,
        payload?.statusCode || response.status,
        payload?.errors
      );
    }

    return payload as T;
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
    const { params, headers, auth = true, _retry = false, ...rest } = options || {};
    const url = this.buildUrl(endpoint, params);

    return fetch(url, {
      ...rest,
      method: "POST",
      credentials: "include",
      headers: {
        ...(auth && this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        ...headers,
      },
      body: formData,
    }).then(async (response) => {
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401 && auth && !_retry) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return this.upload<T>(endpoint, formData, { ...options, _retry: true });
          }
        }

        throw new ApiClientError(
          payload?.message || `API Error: ${response.status} ${response.statusText}`,
          payload?.statusCode || response.status,
          payload?.errors
        );
      }

      return payload as T;
    });
  }
}

export const apiClient = new ApiClient(siteConfig.apiUrl);
export { ApiClientError };
