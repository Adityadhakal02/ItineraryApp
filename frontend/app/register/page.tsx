"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SiteNav from "@/components/SiteNav";
import TravelScenery from "@/components/TravelScenery";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, fullName || undefined);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TravelScenery className="p-6">
      <SiteNav variant="floating" />
      <div className="flex min-h-screen items-center justify-center pt-10">
        <div className="w-full max-w-sm rounded-2xl border border-amber-200/70 bg-white/90 p-8 shadow-lg shadow-amber-900/5 backdrop-blur-sm">
          <div className="mb-6 flex justify-center">
            <Image src="/logo-mark.svg" alt="" width={48} height={48} unoptimized />
          </div>
          <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight text-stone-900">Sign up</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="rounded-lg border border-red-100 bg-red-50 p-2 text-sm text-red-800">{error}</p>}
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Full name (optional)</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40"
              />
              <p className="mt-1 text-xs text-stone-500">8+ characters.</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-stone-950 shadow-sm hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-amber-800 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </TravelScenery>
  );
}
