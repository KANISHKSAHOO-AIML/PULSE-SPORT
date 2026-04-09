import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AIAssistant from "@/components/AIAssistant";
import Footer from "@/components/Footer";
import LiveTicker from "@/components/LiveTicker";
import BackToTop from "@/components/BackToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseSports | Live Cricket & Football Scores, News & Highlights",
  description: "Your ultimate real-time platform for Cricket and Football. Live scores, breaking news, video highlights, and fan debates — all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LiveTicker />
        {children}
        <Footer />
        <AIAssistant />
        <BackToTop />
      </body>
    </html>
  );
}
