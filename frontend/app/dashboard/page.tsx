"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-neutral-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-yellow-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-neutral-900">
            <Image src="/logo-mark.svg" alt="" width={36} height={36} className="shrink-0" unoptimized />
            <span>Travel Itinerary AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">{user.email}</span>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="text-sm text-yellow-800 hover:underline"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">New itinerary</h2>
        <p className="text-sm text-neutral-600 mb-4">
          Describe your trip (e.g. &quot;Paris art weekend&quot; or &quot;Tokyo 3 days&quot;).
        </p>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Paris art weekend"
            className="flex-1 px-4 py-2 rounded-lg border border-yellow-100 bg-white text-neutral-900 placeholder-neutral-400 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-200 outline-none"
            disabled={creating}
          />
          <button
            type="submit"
            disabled={creating || !query.trim()}
            className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-400 disabled:opacity-50 shadow-sm"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </form>
        {error && (
          <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded">{error}</p>
        )}

        <h2 className="text-xl font-bold text-neutral-900 mb-4">Your itineraries</h2>
        {loading ? (
          <p className="text-neutral-500">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-neutral-500">No itineraries yet. Create one above.</p>
        ) : (
          <ul className="space-y-3">
            {list.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/dashboard/${item.id}`}
                  className="block p-4 rounded-lg bg-white border border-yellow-100 hover:border-yellow-300 hover:bg-yellow-50/50 transition"
                >
                  <div className="font-medium text-neutral-900">{item.title || item.destination || "Trip #" + item.id}</div>
                  <div className="text-sm text-neutral-500 mt-1">
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
