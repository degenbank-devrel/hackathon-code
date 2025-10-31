import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cirkaVariable = localFont({
  src: [
    {
      path: "../../public/fonts/Cirka-Variable.woff2",
      style: "normal",
    },
  ],
  variable: "--font-cirka",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Degen Banx",
  description: "Banking, but make it DEGEN.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cirkaVariable.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
