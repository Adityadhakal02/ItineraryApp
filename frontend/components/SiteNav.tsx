"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard#new-trip", label: "New trip" },
  { href: "/dashboard#trips", label: "Your trips" },
] as const;

type SiteNavProps = {
  variant?: "floating" | "bar";
};

export default function SiteNav({ variant = "bar" }: SiteNavProps) {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const wrap =
    variant === "floating"
      ? "fixed right-4 top-4 z-[60]"
      : "relative flex shrink-0 items-center gap-3";

  const panel =
    variant === "floating"
      ? "absolute right-0 top-full mt-2 min-w-[12rem] rounded-xl border border-amber-200/90 bg-white/95 py-1 shadow-lg shadow-amber-900/10 backdrop-blur-md"
      : "absolute right-0 top-full mt-2 min-w-[12rem] rounded-xl border border-stone-200 bg-white py-1 shadow-lg";

  const itemClass =
    variant === "floating"
      ? "block px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-stone-900"
      : "block px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-stone-900";

  const triggerClass =
    variant === "floating"
      ? "flex items-center gap-2 rounded-lg border border-amber-200/90 bg-white/90 px-3 py-2 text-sm text-stone-800 shadow-md shadow-amber-900/5 backdrop-blur-sm hover:border-amber-300 hover:bg-white"
      : "flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 shadow-sm hover:border-amber-200 hover:bg-amber-50/50";

  function navHref(href: string) {
    if (href.startsWith("/dashboard") && !user) return "/login";
    return href;
  }

  return (
    <div className={wrap} ref={menuRef}>
      <button type="button" className={triggerClass} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="true">
        <Image src="/logo-mark.svg" alt="" width={22} height={22} className="shrink-0 opacity-90" unoptimized />
        <span className="font-medium">Menu</span>
        <span className="text-xs opacity-70" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <div className={panel} role="menu">
          {LINKS.map(({ href, label }) => {
            if (href !== "/" && href.startsWith("/dashboard") && !user) return null;
            return (
              <Link
                key={href + label}
                href={navHref(href)}
                role="menuitem"
                className={itemClass + (pathname === href.split("#")[0] ? " font-medium text-amber-600" : "")}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
          <div className={variant === "floating" ? "my-1 border-t border-amber-100" : "my-1 border-t border-stone-100"} />
          {!loading && !user && (
            <>
              <Link href="/login" className={itemClass} role="menuitem" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link href="/register" className={itemClass} role="menuitem" onClick={() => setOpen(false)}>
                Sign up
              </Link>
            </>
          )}
          {!loading && user && (
            <>
              <div className={variant === "floating" ? "px-4 py-2 text-xs text-stone-500" : "px-4 py-2 text-xs text-stone-500"}>
                {user.email}
              </div>
              <button
                type="button"
                className={itemClass + " w-full text-left"}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  logout();
                  router.push("/");
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
