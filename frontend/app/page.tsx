"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-lg rounded-2xl border border-yellow-100 bg-yellow-50/40 px-6 py-10 sm:px-10 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image
            src="/hero-travel.svg"
            alt="Stylized globe, plane, and map pin suggesting travel planning"
            width={480}
            height={300}
            className="h-auto w-full max-w-md rounded-xl"
            priority
            unoptimized
          />
        </div>
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Travel Itinerary AI</h1>
        <p className="text-neutral-600 mb-8 max-w-md mx-auto">
          Generate optimized itineraries from natural language. Events, dining, hotels, and routes in one place.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-lg border border-yellow-200 bg-white text-neutral-800 hover:bg-yellow-50 transition"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-400 transition shadow-sm"
          >
            Sign up
          </Link>
        </div>
        <p className="mt-6 text-sm text-neutral-500">
          <Link href="/dashboard" className="text-yellow-700 font-medium hover:underline">
            Dashboard
          </Link>{" "}
          (requires login).
        </p>
      </div>
    </div>
  );
}
