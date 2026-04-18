"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getItinerary, type ItineraryDetail } from "@/lib/api";
import type { MapPayload } from "@/components/TripMap";
import AppHeader from "@/components/AppHeader";
import TravelScenery from "@/components/TravelScenery";
import TripItineraryContent from "@/components/trip/TripItineraryContent";

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
      <TravelScenery>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-stone-600">Loading…</p>
        </div>
      </TravelScenery>
    );
  }

  if (loading || !itinerary) {
    return (
      <TravelScenery>
        <div className="flex min-h-screen flex-col items-center justify-center gap-3">
          {error ? (
            <p className="text-red-700">{error}</p>
          ) : (
            <>
              <span className="h-10 w-10 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600" />
              <p className="text-sm text-stone-600">Loading trip…</p>
            </>
          )}
        </div>
      </TravelScenery>
    );
  }

  const p = itinerary.payload ?? {};
  const days = ((p as Record<string, unknown>).days ?? []) as Array<{ day: number; date: string; events?: unknown[]; dining?: unknown[]; notes?: string }>;
  const events = ((p as Record<string, unknown>).events ?? []) as Array<{ name?: string; venue?: string; price_min?: number; price_max?: number }>;
  const restaurants = ((p as Record<string, unknown>).restaurants ?? []) as Array<{ name?: string; rating?: number; price?: string }>;
  const hotels = ((p as Record<string, unknown>).hotels ?? []) as Array<{ name?: string }>;
  const mapData = (p as Record<string, unknown>).map as MapPayload | undefined;

  return (
    <TravelScenery>
      <AppHeader title="Trip" backHref="/dashboard" backLabel="← Dashboard" />
      <TripItineraryContent itinerary={itinerary} days={days} events={events} restaurants={restaurants} hotels={hotels} mapData={mapData} />
    </TravelScenery>
  );
}
