"use client";

import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";

type AppHeaderProps = {
  title?: string;
  backHref?: string;
  backLabel?: string;
};

export default function AppHeader({ title, backHref, backLabel }: AppHeaderProps) {
  return (
    <header className="border-b border-amber-100/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-stone-900 hover:opacity-80">
            <Image src="/logo-mark.svg" alt="" width={34} height={34} unoptimized />
            {title ? (
              <span className="truncate text-lg font-semibold tracking-tight">{title}</span>
            ) : (
              <span className="truncate text-lg font-semibold tracking-tight">Itinerary</span>
            )}
          </Link>
          {backHref && (
            <Link href={backHref} className="hidden text-sm text-amber-800 hover:underline sm:inline">
              {backLabel ?? "← Back"}
            </Link>
          )}
        </div>
        <SiteNav variant="bar" />
      </div>
    </header>
  );
}
