import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content-store";
import "./globals.css";

export function generateMetadata(): Metadata {
  const { settings } = getSiteContent();
  return {
    title: settings.seoTitle,
    description: settings.seoDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    alternates: { canonical: "/" },
    openGraph: { title: settings.seoTitle, description: settings.seoDescription, type: "website", url: "/" },
    twitter: { card: "summary", title: settings.seoTitle, description: settings.seoDescription },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  };
}

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
