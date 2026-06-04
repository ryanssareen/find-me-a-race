import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Find Me a Race — Discover Running Races in India",
    template: "%s | Find Me a Race",
  },
  description:
    "Find upcoming running races near you across India. Search by location, distance, and date. 5K, 10K, Half Marathon, Full Marathon, Ultra and more.",
  keywords: [
    "running races India",
    "marathon India",
    "5K race",
    "10K race",
    "half marathon",
    "running events",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased bg-background`}>
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
