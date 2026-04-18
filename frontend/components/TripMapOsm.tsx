"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { MapPayload } from "./TripMap";

const kindColor: Record<string, string> = {
  event: "#ca8a04",
  restaurant: "#eab308",
  hotel: "#a16207",
};

function FitBounds({ data }: { data: MapPayload }) {
  const map = useMap();
  useEffect(() => {
    const pts: L.LatLngExpression[] = [];
    const c = data.center;
    if (c) pts.push([c.lat, c.lon]);
    for (const m of data.markers ?? []) pts.push([m.lat, m.lon]);
    const coords = data.route?.geometry?.coordinates;
    if (Array.isArray(coords)) {
      for (const p of coords) {
        if (Array.isArray(p) && p.length >= 2) {
          const lat = Number(p[1]);
          const lng = Number(p[0]);
          if (!Number.isNaN(lat) && !Number.isNaN(lng)) pts.push([lat, lng]);
        }
      }
    }
    if (pts.length === 0) return;
    const b = L.latLngBounds(pts);
    map.fitBounds(b, { padding: [28, 28], maxZoom: 14 });
  }, [map, data]);
  return null;
}

export default function TripMapOsm({ data }: { data: MapPayload }) {
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    setMapReady(true);
    return () => setMapReady(false);
  }, []);

  const c = data.center!;
  const routeLatLngs = useMemo(() => {
    const g = data.route?.geometry;
    if (!g || g.type !== "LineString" || !g.coordinates?.length) return [] as [number, number][];
    return g.coordinates.map((p) => [Number(p[1]), Number(p[0])] as [number, number]);
  }, [data.route]);

  const mapKey = useMemo(() => {
    const n = (data.markers ?? []).length;
    return `${c.lat.toFixed(5)}-${c.lon.toFixed(5)}-${routeLatLngs.length}-${n}`;
  }, [c.lat, c.lon, routeLatLngs.length, data.markers]);

  const shellClass =
    "h-[320px] w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-xl";

  if (!mapReady) {
    return (
      <div className={`${shellClass} flex items-center justify-center bg-stone-50 text-sm text-stone-500`}>
        Loading map…
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <MapContainer
        key={mapKey}
        center={[c.lat, c.lon]}
        zoom={data.zoom ?? 12}
        scrollWheelZoom
        className="h-full min-h-[320px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds data={data} />
        {routeLatLngs.length >= 2 && (
          <Polyline positions={routeLatLngs} pathOptions={{ color: "#ca8a04", weight: 5, opacity: 0.9 }} />
        )}
        {(data.markers ?? []).map((m, i) => (
          <CircleMarker
            key={`${m.kind}-${i}`}
            center={[m.lat, m.lon]}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: kindColor[m.kind] ?? "#eab308",
              fillOpacity: 1,
            }}
          >
            <Popup>{m.label}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
