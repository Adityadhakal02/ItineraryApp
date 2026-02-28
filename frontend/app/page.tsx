"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        Travel Itinerary AI
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
        Generate optimized itineraries from natural language. Events, dining, hotels, and routes in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="px-5 py-2.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition"
        >
          Sign up
        </Link>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        <Link href="/dashboard" className="text-sky-600 dark:text-sky-400 underline">
          Dashboard
        </Link>{" "}
        (placeholder until Weeks 7–8; requires login).
      </p>
    </div>
  );
}
