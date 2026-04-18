"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createItinerary } from "@/lib/api";
import SiteNav from "@/components/SiteNav";
import TravelScenery from "@/components/TravelScenery";

const PENDING_KEY = "pendingTripQuery";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError("");

    if (!user) {
      try {
        sessionStorage.setItem(PENDING_KEY, q);
      } catch {
        void 0;
      }
      router.push("/login");
      return;
    }

    setCreating(true);
    try {
      const created = await createItinerary(q);
      router.push(`/dashboard/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  return (
    <TravelScenery>
      <SiteNav variant="floating" />

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pb-20 pt-24">
        <h1 className="mb-2 text-center text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Plan your trip in one line</h1>
        <p className="mb-10 max-w-md text-center text-sm text-stone-600">Dates, budget, vibe — the agent builds the itinerary.</p>

        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
          <label htmlFor="trip-query" className="sr-only">
            Trip request
          </label>
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/90 bg-white/85 p-2 shadow-lg shadow-amber-900/5 backdrop-blur-sm sm:flex-row sm:items-stretch sm:p-2">
            <input
              id="trip-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything…"
              maxLength={4000}
              disabled={creating}
              className="min-h-[3.25rem] flex-1 rounded-xl border border-stone-200/80 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:opacity-60"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={creating || !query.trim()}
              className="shrink-0 rounded-xl bg-amber-500 px-8 py-3 text-sm font-semibold text-stone-950 shadow-sm transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {creating ? "…" : "Plan"}
            </button>
          </div>
          {error && <p className="mt-3 text-center text-sm text-red-700">{error}</p>}
          {!loading && !user && (
            <p className="mt-4 text-center text-xs text-stone-500">Sign in after &quot;Plan&quot; to run the agent — or use the menu.</p>
          )}
        </form>
      </main>

      {creating && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
          <div className="h-12 w-12 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin" aria-hidden />
          <p className="mt-6 text-sm font-medium text-stone-800">Building your itinerary…</p>
          <p className="mt-1 text-xs text-stone-500">Parsing, maps, and providers</p>
        </div>
      )}
    </TravelScenery>
  );
}
