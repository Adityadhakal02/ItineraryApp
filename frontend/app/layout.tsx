import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Itinerary",
  description: "Natural-language trip planning with maps and structured days.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} font-sans antialiased min-h-screen bg-gradient-to-b from-amber-50/90 via-white to-[#fffbeb] text-neutral-900`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
