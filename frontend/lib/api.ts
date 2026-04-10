/**
 * API base URL.
 * - Default (unset NEXT_PUBLIC_API_URL): same-origin `/api` so Next.js can proxy to FastAPI in dev (see next.config.ts).
 * - Production: set NEXT_PUBLIC_API_URL to your backend origin, e.g. https://api.example.com
 */
function getApiBase(): string {
  const u = process.env.NEXT_PUBLIC_API_URL;
  if (u != null && u.trim() !== "") {
    return u.replace(/\/$/, "");
  }
  return "";
}

const API_BASE = getApiBase();

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

const NETWORK_HINT =
  "Cannot reach the API. Start the backend: cd backend && source .venv/bin/activate && uvicorn app.main:app --reload (must listen on port 8000).";

function parseFastApiDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((x) =>
        typeof x === "object" && x !== null && "msg" in x ? String((x as { msg: string }).msg) : JSON.stringify(x)
      )
      .join("; ");
  }
  return "";
}

async function readApiErrorBody(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { detail?: unknown; message?: string };
    const d = parseFastApiDetail(j.detail);
    if (d) return d;
    if (j.message) return String(j.message);
  } catch {
    /* not JSON */
  }
  return text.trim().slice(0, 240) || res.statusText;
}

async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const url = `${API_BASE}${path}`;
  try {
    return await fetch(url, { ...options, headers });
  } catch {
    throw new Error(NETWORK_HINT);
  }
}

async function throwIfNotOk(res: Response, context: string): Promise<void> {
  if (res.ok) return;
  const body = await readApiErrorBody(res);
  throw new Error(`${context} (${res.status}): ${body}`);
}

// auth
export async function register(email: string, password: string, fullName?: string) {
  const res = await fetchWithAuth("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
  await throwIfNotOk(res, "Register failed");
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetchWithAuth("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await throwIfNotOk(res, "Login failed");
  return res.json();
}

export async function getMe() {
  const res = await fetchWithAuth("/api/auth/me");
  await throwIfNotOk(res, "Session check failed");
  return res.json();
}

// itineraries
export type ItineraryListItem = {
  id: number;
  title: string | null;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  budget_total: number | null;
  estimated_cost: number | null;
  created_at: string;
};

export type ItineraryDetail = ItineraryListItem & {
  raw_query: string | null;
  payload: Record<string, unknown> | null;
  updated_at: string;
};

export async function listItineraries(): Promise<ItineraryListItem[]> {
  const res = await fetchWithAuth("/api/itineraries");
  await throwIfNotOk(res, "Could not load itineraries");
  try {
    return await res.json();
  } catch {
    throw new Error("Could not load itineraries: server returned invalid JSON.");
  }
}

export async function getItinerary(id: number): Promise<ItineraryDetail> {
  const res = await fetchWithAuth(`/api/itineraries/${id}`);
  await throwIfNotOk(res, "Could not load itinerary");
  return res.json();
}

export async function createItinerary(query: string): Promise<ItineraryDetail> {
  const res = await fetchWithAuth("/api/itineraries", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
  await throwIfNotOk(res, "Could not create itinerary");
  return res.json();
}
