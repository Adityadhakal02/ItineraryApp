"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getItinerary, type ItineraryDetail } from "@/lib/api";
import TripMap, { type MapPayload } from "@/components/TripMap";

export default function ItineraryDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const [itinerary, setItinerary] = useState<ItineraryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !id) return;
    setLoading(true);
    (async () => {
      try {
        const data = await getItinerary(id);
        setItinerary(data);
      } catch {
        setError("Could not load itinerary");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, id]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-neutral-500">Loading…</p>
      </div>
    );
  }

  if (loading || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {error ? <p className="text-red-600">{error}</p> : <p className="text-neutral-500">Loading…</p>}
      </div>
    );
  }

  const p = itinerary.payload ?? {};
  const days = ((p as Record<string, unknown>).days ?? []) as Array<{ day: number; date: string; events?: unknown[]; dining?: unknown[]; notes?: string }>;
  const events = ((p as Record<string, unknown>).events ?? []) as Array<{ name?: string; venue?: string; price_min?: number; price_max?: number }>;
  const restaurants = ((p as Record<string, unknown>).restaurants ?? []) as Array<{ name?: string; rating?: number; price?: string }>;
  const hotels = ((p as Record<string, unknown>).hotels ?? []) as Array<{ name?: string }>;
  const mapData = (p as Record<string, unknown>).map as MapPayload | undefined;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-yellow-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-mark.svg" alt="" width={32} height={32} className="shrink-0" unoptimized />
            <Link href="/dashboard" className="text-yellow-700 font-medium hover:underline">
              ← Dashboard
            </Link>
          </div>
          <span className="text-sm text-neutral-600">{user.email}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          {itinerary.title || itinerary.destination || `Trip #${itinerary.id}`}
        </h1>
        {itinerary.raw_query && <p className="text-neutral-500 text-sm mb-4">&quot;{itinerary.raw_query}&quot;</p>}
        <div className="flex flex-wrap gap-3 mb-6 text-sm text-neutral-800">
          {itinerary.destination && (
            <span className="px-2 py-1 rounded-md bg-yellow-50 border border-yellow-100 text-neutral-900">{itinerary.destination}</span>
          )}
          {itinerary.start_date && <span>{itinerary.start_date}</span>}
          {itinerary.end_date && <span>– {itinerary.end_date}</span>}
          {itinerary.estimated_cost != null && (
            <span className="font-medium">
              Est. ${itinerary.estimated_cost}
              {itinerary.budget_total != null && <span className="text-neutral-500"> / ${itinerary.budget_total} budget</span>}
            </span>
          )}
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">Map & route</h2>
          <TripMap data={mapData} />
        </section>

        {days.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Day by day</h2>
            <div className="space-y-4">
              {days.map((day) => {
                const dayEvents = (day.events ?? []) as Array<{ name?: string; venue?: string; time?: string }>;
                const dayDining = (day.dining ?? []) as Array<{ name?: string; price?: string }>;
                const eventsStr = dayEvents.map((e) => e?.name + (e?.venue ? " @ " + e.venue : "") + (e?.time ? " (" + e.time + ")" : "")).join("; ");
                const diningStr = dayDining.map((d) => (d?.name || "") + " " + (d?.price || "")).join("; ");
                return (
                  <div key={day.day} className="p-4 rounded-lg bg-white border border-yellow-100 shadow-sm">
                    <h3 className="font-medium text-neutral-900 mb-2">
                      Day {day.day} — {day.date}
                    </h3>
                    <div className="text-sm space-y-1 text-neutral-600">
                      {eventsStr && (
                        <p>
                          <span className="font-medium text-yellow-800">Events: </span>
                          {eventsStr}
                        </p>
                      )}
                      {diningStr && (
                        <p>
                          <span className="font-medium text-yellow-800">Dining: </span>
                          {diningStr}
                        </p>
                      )}
                      {day.notes && <p>{day.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {(events.length > 0 || restaurants.length > 0 || hotels.length > 0) && (
          <section>
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Details</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {events.length > 0 && (
                <div className="p-4 rounded-lg bg-white border border-yellow-100 shadow-sm">
                  <h4 className="font-medium text-yellow-700 mb-2">Events</h4>
                  <ul className="text-sm space-y-1 text-neutral-700">
                    {events.map((e, i) => (
                      <li key={i}>
                        {e.name} {e.venue && `— ${e.venue}`}
                        {(e.price_min != null || e.price_max != null) && (
                          <span className="text-neutral-500">
                            {" "}
                            ${e.price_min ?? "?"}–{e.price_max ?? "?"}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {restaurants.length > 0 && (
                <div className="p-4 rounded-lg bg-white border border-yellow-100 shadow-sm">
                  <h4 className="font-medium text-yellow-700 mb-2">Dining</h4>
                  <ul className="text-sm space-y-1 text-neutral-700">
                    {restaurants.map((r, i) => (
                      <li key={i}>
                        {r.name} {r.rating != null && `★ ${r.rating}`} {r.price}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hotels.length > 0 && (
                <div className="p-4 rounded-lg bg-white border border-yellow-100 shadow-sm">
                  <h4 className="font-medium text-yellow-700 mb-2">Hotels</h4>
                  <ul className="text-sm space-y-1 text-neutral-700">
                    {hotels.map((h, i) => (
                      <li key={i}>{h.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
