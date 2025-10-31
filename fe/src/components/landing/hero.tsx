"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export function Hero() {
  const { login, ready } = useAuth();

  return (
    <section className="min-h-screen bg-black text-white">
      {/* Text Content Section */}
      <div className="container mx-auto px-4 pt-24 pb-8 text-center md:pt-20">
        <div className="mx-auto max-w-6xl">
          {/* Main Heading with Cirka Font */}
          <h1 className="font-cirka mb-6 text-4xl leading-tight font-bold tracking-tight text-white md:mb-8 md:text-6xl lg:text-8xl">
            Degen Banx
            <br />
            <span className="from-primary via-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
              Bank for Degen
            </span>
          </h1>

          {/* Description with Geist Font */}
          <p className="mx-auto mb-8 max-w-4xl px-4 font-sans text-base leading-relaxed text-white/90 md:mb-12 md:text-lg">
            Where capital becomes a weapon. Low risk. High chaos. Real yield.
            <br />
            Every epoch’s a battlefield, every gain, a trophy.
          </p>

          {/* CTA Buttons */}
          <div className="relative z-10 mb-8 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link href="/arena/battle">
              <Button className="bg-primary hover:bg-primary/90 hover:shadow-primary/25 min-w-[140px] cursor-pointer px-6 py-3 text-base font-bold text-black transition-all duration-300 hover:scale-105 hover:shadow-lg md:px-8 md:py-4 md:text-lg">
                Go to Arena
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="container mx-auto -mt-20 px-4 pb-12 md:-mt-36 md:pb-20">
        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-xl shadow-2xl md:rounded-2xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-auto w-full"
              poster="/assets/videos/vault-poster.jpg"
            >
              <source src="/assets/videos/vault.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="flex justify-center pb-8">
        <div className="animate-bounce">
          <div className="border-primary flex h-8 w-5 justify-center rounded-full border-2 md:h-10 md:w-6">
            <div className="bg-primary mt-2 h-2 w-1 animate-pulse rounded-full md:h-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
