import type { ContentPayload } from "@/types/content";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Envelope<T> = { data: T };

export async function fetchContent(): Promise<ContentPayload> {
  const res = await fetch(`${API_URL}/api/v1/content`, {
    next: { revalidate: 60, tags: ["content"] },
  });
  if (!res.ok) {
    throw new Error(`Failed to load content: ${res.status}`);
  }
  const json = (await res.json()) as Envelope<ContentPayload>;
  return json.data;
}

// ---- Admin browser client (signed requests) ----

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export interface ApiClientOptions {
  token: string;
}

export class AdminApi {
  constructor(private opts: ApiClientOptions) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
        Authorization: `Bearer ${this.opts.token}`,
      },
    });
    if (res.status === 204) return undefined as T;
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = (body as { error?: { code?: string; message?: string } }).error;
      throw new ApiError(res.status, err?.message ?? `Request failed (${res.status})`, err?.code);
    }
    return (body as Envelope<T>).data;
  }

  get<T>(path: string) { return this.request<T>(path); }
  post<T>(path: string, body: unknown) { return this.request<T>(path, { method: "POST", body: JSON.stringify(body) }); }
  put<T>(path: string, body: unknown) { return this.request<T>(path, { method: "PUT", body: JSON.stringify(body) }); }
  del(path: string) { return this.request<void>(path, { method: "DELETE" }); }
}
