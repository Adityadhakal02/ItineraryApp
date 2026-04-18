"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

const CITY_MARKS = ["Lisbon", "Kyoto", "Istanbul", "Havana", "Sydney", "Mumbai", "Cairo", "Québec", "Barcelona", "Reykjavík"];

const MOODS = {
  dawn: "from-amber-100/85 via-white to-[#fffbeb]",
  noon: "from-yellow-50 via-white to-amber-50/80",
  dusk: "from-[#fff7ed] via-white to-amber-100/75",
} as const;

function moodFromPath(path: string | null): keyof typeof MOODS {
  if (!path) return "dawn";
  if (path === "/") return "noon";
  if (path === "/login") return "dawn";
  if (path === "/register") return "dusk";
  if (path === "/dashboard") return "dawn";
  if (path.startsWith("/dashboard/")) return "dusk";
  return "noon";
}

function cityOrder(path: string | null): string[] {
  const seed = (path ?? "").split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const o = seed % CITY_MARKS.length;
  return [...CITY_MARKS.slice(o), ...CITY_MARKS.slice(0, o)].slice(0, 5);
}

function seedFromPath(path: string | null): number {
  return (path ?? "").length % 5;
}

function WatermarkLayer({ path }: { path: string | null }) {
  const cities = cityOrder(path);
  const rot = (path ?? "").length % 3;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-1/4 top-0 h-[55%] w-[70%] rounded-full bg-amber-200/15 blur-3xl" />
      <div className="absolute -right-1/4 bottom-0 h-[45%] w-[65%] rounded-full bg-yellow-200/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,250,249,0)_0%,rgba(255,251,235,0.35)_100%)]" />

      <svg className="absolute -bottom-2 left-1/2 w-[min(140%,1200px)] -translate-x-1/2 text-amber-300/[0.18]" viewBox="0 0 1200 220" fill="currentColor">
        <title>Skyline</title>
        <path d="M0 220V140h45v25h30V95h38v125H0zm178 0V70h52l18 55h8l22-55h55v150H178zm395 0V115h42l28 105h-40l-6-28h-26l-6 28h-38zm118 0V60h48v60h36c28 0 48 20 48 48v52H691zm172 0V100h44v120h-44zm76 0V75h40l34 85 34-85h40v145H939zm261 0V120h32v100h-32zm-861-95h26v95h-26zm-26 55h26v40h-26z" />
        <path d="M1020 220V40h36l24 72 24-72h36v180h-36V130h-12l-12 90h-24l-12-90h-12v90h-24z" opacity="0.85" />
        <ellipse cx="600" cy="198" rx="520" ry="14" fill="currentColor" opacity="0.12" />
      </svg>

      <svg
        className="absolute right-[6%] top-[12%] h-24 w-24 text-amber-400/20"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <circle cx="50" cy="50" r="28" />
        <path d="M50 22v56M22 50h56" strokeLinecap="round" />
        <path d="M36 36l28 28M64 36L36 64" strokeLinecap="round" opacity="0.6" />
      </svg>

      <svg className="absolute left-[8%] top-[22%] w-32 text-amber-300/25" viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M8 28c18-10 38-10 56 0s38 10 56 0" opacity="0.7" />
        <path d="M20 22 L60 12 100 22" />
        <circle cx="60" cy="12" r="3" fill="currentColor" stroke="none" opacity="0.5" />
      </svg>

      {cities.map((city, i) => {
        const positions = [
          "left-[4%] top-[8%] -rotate-12",
          "right-[8%] top-[38%] rotate-6",
          "left-[10%] bottom-[32%] -rotate-6",
          "right-[14%] bottom-[40%] rotate-12",
          "left-[22%] top-[48%] -rotate-3",
        ];
        const sizes = ["text-[4.5rem]", "text-[3.75rem]", "text-[4rem]", "text-[3.25rem]", "text-[3.5rem]"];
        const cls = positions[(i + rot) % positions.length];
        const sz = sizes[(i + seedFromPath(path)) % sizes.length];
        return (
          <span
            key={`${city}-${i}`}
            className={`absolute select-none font-semibold tracking-tight text-amber-200/50 ${sz} ${cls}`}
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            {city}
          </span>
        );
      })}
    </div>
  );
}

type TravelSceneryProps = {
  children: ReactNode;
  className?: string;
  /** Override auto mood from pathname */
  mood?: keyof typeof MOODS;
};

export default function TravelScenery({ children, className = "", mood: moodProp }: TravelSceneryProps) {
  const pathname = usePathname();
  const mood = moodProp ?? moodFromPath(pathname);
  const grad = MOODS[mood];

  return (
    <div className={`relative min-h-screen w-full bg-gradient-to-b ${grad} text-stone-900 ${className}`}>
      <WatermarkLayer path={pathname} />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
