"use client";

import dynamic from "next/dynamic";

const TripMapOsm = dynamic(() => import("./TripMapOsm"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-500">
      Loading map…
    </div>
  ),
});

export type MapPayload = {
  center?: { lat: number; lon: number };
  zoom?: number;
  markers?: Array<{ lat: number; lon: number; label: string; kind: string }>;
  route?: {
    geometry?: { type: string; coordinates: number[][] };
    duration_seconds?: number;
    distance_meters?: number;
  } | null;
};

export default function TripMap({ data }: { data: MapPayload | undefined }) {
  if (!data?.center) {
    return null;
  }
  return <TripMapOsm data={data} />;
}
