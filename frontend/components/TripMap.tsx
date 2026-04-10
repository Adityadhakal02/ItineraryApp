"use client";

import { useMemo } from "react";
import Map, { Layer, Marker, Source } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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

const kindColor: Record<string, string> = {
  event: "#ca8a04",
  restaurant: "#eab308",
  hotel: "#a16207",
};

export default function TripMap({ data }: { data: MapPayload | undefined }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const initialViewState = useMemo(() => {
    const c = data?.center;
    if (!c) {
      return { longitude: -74.006, latitude: 40.7128, zoom: 10 };
    }
    return { longitude: c.lon, latitude: c.lat, zoom: data?.zoom ?? 11 };
  }, [data]);

  const routeGeo = useMemo(() => {
    const g = data?.route?.geometry;
    if (!g || g.type !== "LineString" || !g.coordinates?.length) return null;
    return {
      type: "Feature" as const,
      properties: {},
      geometry: g,
    };
  }, [data?.route]);

  if (!token) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-neutral-800">
        <p className="font-medium text-neutral-900">Map preview</p>
        <p className="mt-1 text-neutral-700">
          Set <code className="rounded bg-white border border-yellow-100 px-1">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in{" "}
          <code className="rounded bg-white border border-yellow-100 px-1">frontend/.env.local</code> to show the interactive map.
          The itinerary still includes markers and route data in the API payload.
        </p>
      </div>
    );
  }

  if (!data?.center) {
    return null;
  }

  return (
    <div className="h-[320px] w-full overflow-hidden rounded-lg border border-yellow-100 bg-white">
      <Map
        mapboxAccessToken={token}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
      >
        {routeGeo && (
          <Source id="itinerary-route" type="geojson" data={routeGeo}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                "line-color": "#ca8a04",
                "line-width": 4,
                "line-opacity": 0.9,
              }}
            />
          </Source>
        )}
        {(data.markers ?? []).map((m, i) => (
          <Marker key={`${m.kind}-${i}`} longitude={m.lon} latitude={m.lat} anchor="bottom">
            <span
              title={m.label}
              className="inline-block h-3 w-3 rounded-full border-2 border-white shadow ring-1 ring-yellow-300"
              style={{ backgroundColor: kindColor[m.kind] ?? "#eab308" }}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
}
