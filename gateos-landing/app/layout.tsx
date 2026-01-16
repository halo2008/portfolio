import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GateOS - Industrial AI Logistics",
  description: "Automate weighbridges, ANPR cameras, and OCR documents with GateOS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${inter.variable} antialiased bg-background text-text selection:bg-primary selection:text-primary-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
