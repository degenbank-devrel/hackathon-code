"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrophyIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { MainNavbar } from "@/components/main-navbar";
import Particles from "@/components/ui/particles";
import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <div className="bg-background relative min-h-screen">
      <MainNavbar />

      {/* Particles Background */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleColors={["#ffffff", "#ffffff", "#ffffff"]}
          particleCount={150}
          particleSpread={8}
          speed={0.05}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
          className="h-full w-full"
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6">
        <div className="mx-auto max-w-2xl text-center">
          <Card className="bg-card/80 border-border backdrop-blur-sm rounded-none">
            <CardContent className="space-y-8 p-12">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="bg-primary/10 border-primary/20 flex h-24 w-24 items-center justify-center rounded-full border">
                  <TrophyIcon className="text-primary h-12 w-12" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-4">
                <h1 className="font-cirka text-4xl font-bold text-white sm:text-5xl">
                  Leaderboard
                </h1>
                <h2 className="text-primary text-2xl font-semibold sm:text-3xl">
                  Coming Soon
                </h2>
              </div>

              {/* Description */}
               <div className="space-y-4">
                 <p className="text-muted-foreground text-lg leading-relaxed">
                   We&apos;re building an epic leaderboard where vault managers and stakers 
                   can compete, showcase their strategies, and climb the rankings.
                 </p>
                 <div className="bg-muted/20 border-muted/40 flex items-center justify-center space-x-2 rounded-lg border p-4">
                   <ClockIcon className="text-primary h-5 w-5" />
                   <span className="text-muted-foreground text-sm">
                     Feature in development - Stay tuned!
                   </span>
                 </div>
               </div>

               {/* Features Preview */}
               <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-white">
                   What&apos;s Coming:
                 </h3>
                <div className="grid gap-3 text-left sm:grid-cols-2">
                  <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                    <div className="bg-primary h-2 w-2 rounded-full"></div>
                    <span>Manager Rankings</span>
                  </div>
                  <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                    <div className="bg-primary h-2 w-2 rounded-full"></div>
                    <span>Staker Competitions</span>
                  </div>
                  <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                    <div className="bg-primary h-2 w-2 rounded-full"></div>
                    <span>Performance Metrics</span>
                  </div>
                  <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                    <div className="bg-primary h-2 w-2 rounded-full"></div>
                    <span>Rewards & Recognition</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                <Link href="/vaults/strategy-vaults">
                  <Button
                    variant="default"
                    size="lg"
                    className="cursor-pointer rounded-none"
                  >
                    <TrophyIcon className="mr-2 h-5 w-5" />
                    Explore Vaults
                  </Button>
                </Link>
                <Link href="/arena/battle">
                  <Button
                    variant="outline"
                    size="lg"
                    className="cursor-pointer rounded-none border-gray-400 bg-transparent text-white hover:bg-primary hover:text-black"
                  >
                    Join Battle Arena
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
