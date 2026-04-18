"use client";

import type { ItineraryDetail } from "@/lib/api";
import TripMap, { type MapPayload } from "@/components/TripMap";

type DayEvent = { name?: string; venue?: string; time?: string };
type DayDining = { name?: string; price?: string };
type DayBlock = { day: number; date: string; events?: unknown[]; dining?: unknown[]; notes?: string };
type ListEvent = { name?: string; venue?: string; price_min?: number; price_max?: number };
type ListRestaurant = { name?: string; rating?: number; price?: string };
type ListHotel = { name?: string };

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function formatDayDate(iso: string): { weekday: string; short: string } {
  try {
    const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return { weekday: "", short: iso };
    const weekday = new Intl.DateTimeFormat("en", { weekday: "long" }).format(d);
    const short = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(d);
    return { weekday, short };
  } catch {
    return { weekday: "", short: iso };
  }
}

function formatPriceRange(min?: number, max?: number): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `$${min}–${max}`;
  if (min != null) return `from $${min}`;
  return `up to $${max}`;
}

const EVENT_WHISPERS = [
  "Leave a little slack before your next stop — cities rarely run on schedule.",
  "Worth double-checking hours; weekends can shift everything.",
  "If energy is high, this is the kind of anchor that frames the whole day.",
] as const;

const DINE_WHISPERS = [
  "A practical pick between sights — save the long dinner for another night.",
  "Good when you want flavor without a full production.",
  "Handy if you're walking hungry and don't want to overthink it.",
] as const;

const STAY_WHISPERS = [
  "Compare nightly rate with your budget bar before you lock it in.",
  "Location first — then read recent reviews for noise and check-in quirks.",
  "Worth peeking at transit time to your Day 1 first stop.",
] as const;

const DAY_DINING_CLOSERS = [
  "Choose a couple that line up with your route — the rest are backups if plans shift.",
  "You do not need every name on one trip; star two and let the day decide.",
  "Good mix of quick fuel and one slower meal if the schedule allows.",
] as const;

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconTicket({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v1.5a1.5 1.5 0 010 3V15a2 2 0 01-2 2H5a2 2 0 01-2-2v-1.5a1.5 1.5 0 010-3V9z" strokeLinejoin="round" />
      <path d="M9 7v10" strokeDasharray="2 2" />
    </svg>
  );
}

function IconUtensils({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6 3v9M6 12v9M10 3v5a2 2 0 002 2M18 3v18" strokeLinecap="round" />
    </svg>
  );
}

function IconBed({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 12V19M3 12h18M21 12V19M7 12V8a2 2 0 012-2h6a2 2 0 012 2v4M3 19h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = {
  itinerary: ItineraryDetail;
  days: DayBlock[];
  events: ListEvent[];
  restaurants: ListRestaurant[];
  hotels: ListHotel[];
  mapData: MapPayload | undefined;
};

export default function TripItineraryContent({ itinerary, days, events, restaurants, hotels, mapData }: Props) {
  const title = itinerary.title || itinerary.destination || `Trip #${itinerary.id}`;
  const place = itinerary.destination?.trim();
  const hasMap = Boolean(mapData?.center);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-5 sm:pt-8">
      <header className="relative mb-10 overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-white via-amber-50/40 to-white px-6 py-8 shadow-lg shadow-amber-900/[0.06] sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-yellow-200/20 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/70">Your itinerary</p>
        <h1 className="relative mt-2 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">{title}</h1>
        {place && (
          <p className="relative mt-3 max-w-2xl text-pretty text-base leading-relaxed text-stone-600">
            Built around <span className="font-medium text-stone-800">{place}</span>
            {itinerary.start_date && itinerary.end_date
              ? ` — ${itinerary.start_date} through ${itinerary.end_date}.`
              : itinerary.start_date
                ? ` — kicking off ${itinerary.start_date}.`
                : ". Here is how the days stack up."}
          </p>
        )}
        {!place && itinerary.start_date && (
          <p className="relative mt-3 text-stone-600">
            {itinerary.start_date}
            {itinerary.end_date && ` → ${itinerary.end_date}`}
          </p>
        )}

        <div className="relative mt-6 flex flex-wrap items-center gap-2">
          {place && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-white/80 px-3 py-1.5 text-sm font-medium text-stone-800 shadow-sm">
              <IconPin className="text-amber-600" />
              {place}
            </span>
          )}
          {(itinerary.start_date || itinerary.end_date) && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/90 bg-white/90 px-3 py-1.5 text-sm text-stone-700">
              <IconCalendar className="text-stone-500" />
              {itinerary.start_date ?? "—"}
              {itinerary.end_date && ` → ${itinerary.end_date}`}
            </span>
          )}
          {itinerary.estimated_cost != null && (
            <span className="inline-flex rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1.5 text-sm font-medium text-emerald-900">
              Est. spend ${itinerary.estimated_cost}
              {itinerary.budget_total != null && (
                <span className="font-normal text-emerald-800/80"> · budget ${itinerary.budget_total}</span>
              )}
            </span>
          )}
        </div>
      </header>

      {itinerary.raw_query && (
        <section className="mb-10 rounded-2xl border border-stone-200/80 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm sm:px-6 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">What you told us</p>
          <blockquote className="mt-2 text-pretty text-base italic leading-relaxed text-stone-700">&ldquo;{itinerary.raw_query}&rdquo;</blockquote>
          <p className="mt-3 text-sm text-stone-500">We shaped the stops below from that brief — tweak anything and regenerate when you are ready.</p>
        </section>
      )}

      <section className="mb-12">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">Route & map</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-stone-600">
              {hasMap
                ? "Your center point, markers, and rough path in one view — use it as a compass, not gospel."
                : "No coordinates shipped for this trip yet — the day-by-day list still carries the plan."}
            </p>
          </div>
        </div>
        {hasMap ? (
          <div className="overflow-hidden rounded-2xl border border-amber-200/50 bg-white shadow-md shadow-amber-900/5 ring-1 ring-stone-900/[0.04]">
            <TripMap key={itinerary.id} data={mapData} />
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-amber-200/80 bg-amber-50/30 px-6 py-12 text-center">
            <IconPin className="mb-3 h-10 w-10 text-amber-400" />
            <p className="font-medium text-stone-800">Map preview unavailable</p>
            <p className="mt-1 max-w-sm text-sm text-stone-600">The list below still has every stop — open maps on your phone when you head out.</p>
          </div>
        )}
      </section>

      {days.length > 0 && (
        <section className="mb-14">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">Day by day</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-600">
              A running order you can follow or remix — times are suggestions so the day breathes.
            </p>
          </div>

          <ol className="relative space-y-8 border-l border-amber-200/70 pl-6 sm:pl-8">
            {days.map((day, dayIdx) => {
              const dayEvents = (day.events ?? []) as DayEvent[];
              const dayDining = (day.dining ?? []) as DayDining[];
              const { weekday, short } = formatDayDate(day.date);

              return (
                <li key={day.day} className="relative scroll-mt-28">
                  <span className="absolute -left-[25px] top-1.5 flex h-3.5 w-3.5 items-center justify-center sm:-left-[29px]">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500 shadow ring-2 ring-amber-200/80" />
                  </span>

                  <article className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 shadow-md shadow-amber-900/[0.04]">
                    <div className="border-b border-amber-100/80 bg-gradient-to-r from-amber-50/90 to-white px-5 py-4 sm:px-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-900/70">Day {day.day}</p>
                      <h3 className="mt-1 text-lg font-semibold text-stone-900">
                        {weekday && <span className="text-stone-800">{weekday}</span>}
                        {weekday && <span className="mx-2 font-normal text-stone-400">·</span>}
                        <span className="text-stone-700">{short}</span>
                      </h3>
                    </div>

                    <div className="space-y-6 px-5 py-5 sm:px-6">
                      {dayEvents.length > 0 && (
                        <div>
                          <div className="mb-3 flex items-center gap-2 text-amber-950">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900">
                              <IconTicket className="h-4 w-4" />
                            </span>
                            <span className="text-sm font-semibold tracking-tight">Experiences</span>
                          </div>
                          <ul className="space-y-3">
                            {dayEvents.map((e, i) => {
                              const idx = dayIdx * 10 + i;
                              return (
                                <li
                                  key={`${e.name}-${i}`}
                                  className="rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3.5 transition hover:border-amber-200/60 hover:bg-amber-50/20"
                                >
                                  <p className="font-medium leading-snug text-stone-900">{e.name}</p>
                                  {e.venue && <p className="mt-1 text-sm text-stone-600">{e.venue}</p>}
                                  {e.time && (
                                    <p className="mt-2 inline-flex items-center rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/60">
                                      {e.time}
                                    </p>
                                  )}
                                  <p className="mt-2 text-xs leading-relaxed text-stone-500">{pick(EVENT_WHISPERS, idx)}</p>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {dayDining.length > 0 && (
                        <div>
                          <div className="mb-3 flex items-center gap-2 text-amber-950">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900">
                              <IconUtensils className="h-4 w-4" />
                            </span>
                            <span className="text-sm font-semibold tracking-tight">Eat & drink</span>
                          </div>
                          <ul className="flex flex-wrap gap-2">
                            {dayDining.map((d, i) => (
                              <li key={`${d.name}-${i}`}>
                                <span className="inline-flex max-w-full flex-col rounded-xl border border-amber-100/90 bg-gradient-to-b from-white to-amber-50/30 px-3 py-2 text-left shadow-sm">
                                  <span className="text-sm font-medium text-stone-900">{d.name}</span>
                                  {d.price && <span className="text-xs text-stone-500">{d.price}</span>}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 text-xs italic leading-relaxed text-stone-500">{pick(DAY_DINING_CLOSERS, dayIdx)}</p>
                        </div>
                      )}

                      {day.notes && (
                        <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50/60 px-4 py-3 text-sm leading-relaxed text-stone-700">{day.notes}</p>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {(events.length > 0 || restaurants.length > 0 || hotels.length > 0) && (
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">The shortlist</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-600">
              {place
                ? `Concrete names for tickets, tables, and beds in ${place} — cross-check before you pay.`
                : "Concrete names for tickets, tables, and beds — cross-check before you pay."}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {events.length > 0 && (
              <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-5 shadow-md shadow-amber-900/[0.04]">
                <div className="mb-4 flex items-center gap-2 border-b border-amber-100 pb-3">
                  <IconTicket className="text-amber-700" />
                  <h3 className="font-semibold text-stone-900">Events</h3>
                </div>
                <p className="mb-4 text-xs leading-relaxed text-stone-500">Prices are ballpark — venues update tiers often.</p>
                <ul className="flex-1 space-y-4">
                  {events.map((e, i) => {
                    const price = formatPriceRange(e.price_min, e.price_max);
                    return (
                      <li key={`${e.name}-${i}`} className="border-l-2 border-amber-300/80 pl-3">
                        <p className="font-medium leading-snug text-stone-900">{e.name}</p>
                        {e.venue && <p className="mt-0.5 text-sm text-stone-600">{e.venue}</p>}
                        {price && <p className="mt-1.5 text-xs font-medium text-amber-900/90">{price}</p>}
                        <p className="mt-2 text-xs leading-relaxed text-stone-500">{pick(EVENT_WHISPERS, i + 3)}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {restaurants.length > 0 && (
              <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-5 shadow-md shadow-amber-900/[0.04]">
                <div className="mb-4 flex items-center gap-2 border-b border-amber-100 pb-3">
                  <IconUtensils className="text-amber-700" />
                  <h3 className="font-semibold text-stone-900">Dining</h3>
                </div>
                <p className="mb-4 text-xs leading-relaxed text-stone-500">Mix quick bites with one slower meal if the trip allows.</p>
                <ul className="flex-1 space-y-3">
                  {restaurants.map((r, i) => (
                    <li key={`${r.name}-${i}`} className="rounded-lg bg-stone-50/80 px-3 py-2.5">
                      <p className="font-medium text-stone-900">{r.name}</p>
                      {(r.rating != null || r.price) && (
                        <p className="mt-0.5 text-xs text-stone-500">
                          {r.rating != null && (
                            <>★ {typeof r.rating === "number" ? r.rating.toFixed(1) : String(r.rating)}</>
                          )}
                          {r.rating != null && r.price && " · "}
                          {r.price && <span>{r.price}</span>}
                        </p>
                      )}
                      <p className="mt-2 text-[11px] leading-relaxed text-stone-500">{pick(DINE_WHISPERS, i + 7)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hotels.length > 0 && (
              <div className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-5 shadow-md shadow-amber-900/[0.04]">
                <div className="mb-4 flex items-center gap-2 border-b border-amber-100 pb-3">
                  <IconBed className="text-amber-700" />
                  <h3 className="font-semibold text-stone-900">Stays</h3>
                </div>
                <p className="mb-4 text-xs leading-relaxed text-stone-500">Hostels to hotels — pick what matches your sleep style.</p>
                <ul className="flex-1 space-y-3">
                  {hotels.map((h, i) => (
                    <li key={`${h.name}-${i}`} className="flex gap-3 rounded-lg border border-transparent px-1 py-1.5 hover:border-amber-100/80 hover:bg-amber-50/30">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100/80 text-[10px] font-bold text-amber-900">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium leading-snug text-stone-900">{h.name}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-stone-500">{pick(STAY_WHISPERS, i)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
