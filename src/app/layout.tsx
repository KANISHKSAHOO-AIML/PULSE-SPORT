import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AIAssistant from "@/components/AIAssistant";
import Footer from "@/components/Footer";
import LiveTicker from "@/components/LiveTicker";
import BackToTop from "@/components/BackToTop";
import CinematicOverlay from "@/components/CinematicOverlay";

import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "PulseSports | Live Cricket & Football Scores, News & Highlights",
  description: "Your ultimate real-time platform for Cricket and Football. Live scores, breaking news, video highlights, and fan debates — all in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PulseSports",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "PulseSports | Live Cricket & Football Scores",
    description: "Real-time scores, AI-powered analytics, fan debates, and predictions — the next generation of sports.",
    siteName: "PulseSports",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PulseSports | Live Sports",
    description: "Real-time scores, AI analytics, fan debates — next-gen sports platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "PulseSports",
              "url": "https://pulsesports.live",
              "description": "Next-generation sports platform with live scores, AI analytics, and fan engagement.",
              "applicationCategory": "SportsApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <CinematicOverlay />
        <LiveTicker />
        {children}
        <Footer />
        <AIAssistant />
        <BackToTop />
        <PWAInstallPrompt />
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
