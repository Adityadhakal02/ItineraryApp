"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { listItineraries, createItinerary, type ItineraryListItem } from "@/lib/api";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
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
    setLoading(true);
    (async () => {
      try {
        const data = await listItineraries();
        setList(data);
      } catch {
        setError("Could not load itineraries");
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-800 dark:text-white">
            Travel Itinerary AI
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">{user.email}</span>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="text-sm text-slate-600 dark:text-slate-400 hover:underline"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">New itinerary</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Describe your trip (e.g. &quot;Paris art weekend&quot; or &quot;Tokyo 3 days&quot;). Right now this uses a simple stub—full AI parsing and APIs coming next.
        </p>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Paris art weekend"
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
            disabled={creating}
          />
          <button
            type="submit"
            disabled={creating || !query.trim()}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </form>
        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
            {error}
          </p>
        )}

        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Your itineraries</h2>
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-slate-500">No itineraries yet. Create one above.</p>
        ) : (
          <ul className="space-y-3">
            {list.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/dashboard/${item.id}`}
                  className="block p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500"
                >
                  <div className="font-medium text-slate-800 dark:text-white">
                    {item.title || item.destination || "Trip #" + item.id}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
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
      </main>
    </div>
  );
}
