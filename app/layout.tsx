import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content-store";
import "./globals.css";

const socialImage = {
  url: "/images/social/pogdog-card-v2.png",
  width: 1200,
  height: 675,
  alt: "Pogdog - Roblox gameplay systems engineer",
};

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteContent();
  return {
    title: settings.seoTitle,
    description: settings.seoDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    alternates: { canonical: "/" },
    applicationName: "Pogdog Portfolio",
    category: "technology",
    openGraph: {
      title: settings.seoTitle,
      description: settings.seoDescription,
      siteName: "Pogdog Portfolio",
      locale: "en_US",
      type: "website",
      url: "/",
      images: [socialImage],
    },
    twitter: { card: "summary_large_image", title: settings.seoTitle, description: settings.seoDescription, images: [socialImage] },
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
