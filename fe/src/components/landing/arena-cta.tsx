"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ArenaCTA() {
  return (
    <section id="vault" className="bg-black py-12 md:py-20 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Grid layout for content */}
          <div className="grid grid-cols-1 items-center gap-8 md:gap-12 lg:grid-cols-2">
            {/* Left side - Video/Visual */}
            <div className="relative overflow-hidden rounded-xl md:rounded-2xl order-2 lg:order-1">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="h-[250px] md:h-[400px] lg:h-[500px] w-full object-cover"
              >
                <source src="/assets/videos/vaults.mp4" type="video/mp4" />
              </video>
              {/* Overlay for better visual effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>

            {/* Right side - Content */}
            <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
              {/* Main Heading */}
              <h1 className="font-cirka text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight font-bold text-white">
                Welcome to the{" "}
                <span className="from-primary via-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                  Yield Arena
                </span>
              </h1>

              {/* Description */}
              <div className="space-y-3 md:space-y-4 text-base md:text-lg leading-relaxed text-white/80">
                <p>
                  Degen stands for Decentralized Generation — our belief that
                  technology should drive positive social change. Our long-term
                  vision is to help shape a world where technology is not just a
                  tool, but a catalyst for fairness, resilience, and shared
                  progress.
                </p>
                <p className="text-primary font-semibold text-sm md:text-base">
                  Every yield is a trophy. Every epoch is a war. No-loss
                  competition. Real performance. On-chain glory.
                </p>
              </div>

              {/* CTA Button */}
              <div className="pt-2 md:pt-4">
                <Link href="/arena/battle">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 hover:shadow-primary/25 w-full sm:w-auto min-w-[140px] cursor-pointer px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold text-black transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Enter the Arena
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
