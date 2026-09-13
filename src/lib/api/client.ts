"use client";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public issues?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/v1/auth/refresh", { method: "POST" })
      .then((res) => res.ok)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/** Same-origin fetch wrapper that transparently retries once after a silent token refresh on 401. */
export async function apiFetch<T>(path: string, init?: RequestInit & { retryOn401?: boolean }): Promise<T> {
  const { retryOn401 = true, ...requestInit } = init ?? {};

  const res = await fetch(`/api/v1${path}`, {
    ...requestInit,
    headers: {
      ...(requestInit.body ? { "Content-Type": "application/json" } : {}),
      ...requestInit.headers,
    },
  });

  if (res.status === 401 && retryOn401 && !path.startsWith("/auth/")) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch<T>(path, { ...init, retryOn401: false });
    }
  }

  const contentType = res.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const message = (body && typeof body === "object" && "error" in body ? String(body.error) : null) ?? "Request failed";
    throw new ApiError(res.status, message, body && typeof body === "object" ? (body as { issues?: unknown }).issues : undefined);
  }

  return body as T;
}
