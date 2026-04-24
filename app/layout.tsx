import type { Metadata } from "next";
import { Orbitron, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";

const bodyFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const headingFont = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CytoDex",
  description: "Atlas cytologique personnel au style retro-futuriste.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bodyFont.variable} ${geistMono.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
