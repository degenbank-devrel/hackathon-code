"use client";

import { Navbar, Hero, WhatIsYieldArena, Footer } from "@/components/landing";
import ArenaCTA from "@/components/landing/arena-cta";

export function LandingPage() {
  return (
    <>
      {/* Main content with parallax effect */}
      <main className="relative z-10 bg-background min-h-screen mb-[400px] shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
        <Navbar />
        <Hero />
        <WhatIsYieldArena />
        <ArenaCTA />
      </main>
      
      {/* Fixed parallax footer */}
      <Footer />
    </>
  );
}
