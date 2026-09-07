import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PogDog — Roblox Developer Portfolio",
  description: "PogDog's editable Roblox development portfolio template.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "PogDog — Roblox Developer Portfolio",
    description: "Projects, skills, services, and case studies by PogDog.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "PogDog — Roblox Developer Portfolio",
    description: "Projects, skills, services, and case studies by PogDog.",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "PogDog",
    jobTitle: "Roblox Developer",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    knowsAbout: ["Luau", "Roblox gameplay systems", "Production debugging", "A-Chassis", "Performance optimization"],
  };
  return <html lang="en"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body></html>;
}
