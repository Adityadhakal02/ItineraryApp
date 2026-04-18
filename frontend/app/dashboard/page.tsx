"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { listItineraries, createItinerary, type ItineraryListItem } from "@/lib/api";
import AppHeader from "@/components/AppHeader";
import TravelScenery from "@/components/TravelScenery";

const PENDING_KEY = "pendingTripQuery";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [list, setList] = useState<ItineraryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    try {
      const pending = sessionStorage.getItem(PENDING_KEY);
      if (pending) {
        sessionStorage.removeItem(PENDING_KEY);
        setQuery(pending);
      }
    } catch {
      void 0;
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      try {
        const data = await listItineraries();
        setList(data);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load itineraries");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setError("");
    setCreating(true);
    try {
      const created = await createItinerary(query.trim());
      router.push(`/dashboard/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  if (authLoading || !user) {
    return (
      <TravelScenery>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-stone-600">Loading…</p>
        </div>
      </TravelScenery>
    );
  }

  return (
    <TravelScenery>
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-10">
        <section id="new-trip" className="mb-12 scroll-mt-24">
          <h2 className="mb-1 text-xl font-semibold text-stone-900">New itinerary</h2>
          <p className="mb-4 text-sm text-stone-600">One message — include dates, budget, and what you care about.</p>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything…"
              maxLength={4000}
              className="min-h-[2.75rem] flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900 placeholder:text-stone-400 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/50 disabled:opacity-50"
              disabled={creating}
              aria-label="Trip description"
            />
            <button
              type="submit"
              disabled={creating || !query.trim()}
              className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-stone-950 shadow-sm hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {creating ? "Working…" : "Create"}
            </button>
          </form>
          {creating && (
            <p className="mt-3 flex items-center gap-2 text-sm text-stone-600">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-400/40 border-t-amber-600" />
              Building itinerary…
            </p>
          )}
          {error && <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        </section>

        <section id="trips" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-semibold text-stone-900">Your trips</h2>
          {loading ? (
            <p className="text-stone-500">Loading…</p>
          ) : list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-200 bg-white px-4 py-8 text-center text-sm text-stone-500">
              Nothing here yet. Add one above.
            </p>
          ) : (
            <ul className="space-y-3">
              {list.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/dashboard/${item.id}`}
                    className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-amber-200 hover:shadow-md"
                  >
                    <div className="font-medium text-stone-900">{item.title || item.destination || "Trip #" + item.id}</div>
                    <div className="mt-1 text-sm text-stone-500">
                      {item.destination}
                      {item.start_date && " · " + item.start_date}
                      {item.end_date && " – " + item.end_date}
                      {item.estimated_cost != null && " · ~$" + item.estimated_cost}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </TravelScenery>
  );
}
