import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Trafy Intelligence: AI News & Insights",
    template: "%s: Trafy Intelligence",
  },
  description: "The AI industry, tracked daily: model releases, funding, research, and open source, curated for builders.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://trafy.ai"),
  icons: {
    icon: "/trafy-logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
