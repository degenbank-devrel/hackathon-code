"use client";

import { MainNavbar } from "@/components/main-navbar";

export default function VaultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}