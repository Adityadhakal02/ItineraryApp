const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

// auth
export async function register(email: string, password: string, fullName?: string) {
  const res = await fetchWithAuth("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetchWithAuth("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

export async function getMe() {
  const res = await fetchWithAuth("/api/auth/me");
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || res.statusText);
  }
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
  const res = await fetchWithAuth("/api/itineraries/");
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

export async function getItinerary(id: number): Promise<ItineraryDetail> {
  const res = await fetchWithAuth(`/api/itineraries/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

export async function createItinerary(query: string): Promise<ItineraryDetail> {
  const res = await fetchWithAuth("/api/itineraries/", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}
