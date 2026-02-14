import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NameWise — Pronounce Every Name with Confidence",
  description: "AI-powered name pronunciation and cultural etiquette guide. Enter any name and instantly hear how to pronounce it correctly.",
  openGraph: {
    title: "NameWise — Pronounce Every Name with Confidence",
    description: "AI-powered name pronunciation and cultural etiquette guide. Enter any name and instantly hear how to pronounce it correctly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
