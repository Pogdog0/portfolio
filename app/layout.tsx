import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pogdog — Roblox Gameplay Systems Engineer",
  description: "Production debugging, gameplay systems, optimization, vehicles, and live-game maintenance.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Pogdog — Roblox Gameplay Systems Engineer",
    description: "I debug live games, understand messy codebases, and ship reliable fixes without rewriting what already works.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Pogdog — Roblox Gameplay Systems Engineer",
    description: "I debug live games, understand messy codebases, and ship reliable fixes without rewriting what already works.",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Pogdog",
    jobTitle: "Roblox Gameplay Systems Engineer",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    knowsAbout: ["Luau", "Roblox gameplay systems", "Production debugging", "A-Chassis", "Performance optimization"],
  };
  return <html lang="en"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body></html>;
}
