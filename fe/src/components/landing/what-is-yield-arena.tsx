"use client";

import Image from "next/image";
import {
  CurrencyDollarIcon,
  FireIcon,
  TrophyIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HowItWorks } from "./how-it-works";

const data = [
  {
    title: "Stake & Lock",
    content: (
      <div>
        <div className="mb-8">
          <div className="relative mx-auto mb-6 h-64 w-full overflow-hidden">
            <Image
              src="/assets/works/1.png"
              alt="User Stake"
              fill
              className="object-cover"
            />
          </div>
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 p-3">
              <CurrencyDollarIcon className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-foreground font-cirka text-2xl font-bold">
              Choose Your Vault & Lock Funds
            </h3>
          </div>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            Browse through available vaults and pick your favorite strategy.
            Once the arena starts, all deposits are locked and the battle phase
            begins. Your funds are now actively competing against other vaults
            in real-time.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-primary/20 rounded-none p-4">
              <div className="mb-2 flex items-center gap-2">
                <ChartBarIcon className="text-primary h-4 w-4" />
                <span className="text-sm font-semibold">
                  Conservative Vault
                </span>
              </div>
              <CardContent>
                <p className="text-muted-foreground text-xs">
                  Low risk, steady returns
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  5-8% APY
                </Badge>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/50 rounded-none p-4">
              <div className="mb-2 flex items-center gap-2">
                <ClockIcon className="text-primary h-4 w-4" />
                <span className="text-sm font-semibold">
                  Lock Period: 7 Days
                </span>
              </div>
              <CardContent>
                <p className="text-muted-foreground text-xs">
                  No withdrawals allowed during battle phase. Your vault manager
                  deploys the strategy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Battle & Resolution",
    content: (
      <div>
        <div className="mb-8">
          <div className="relative mx-auto mb-6 h-64 w-full overflow-hidden">
            <Image
              src="/assets/works/2.png"
              alt="Vaults Compete"
              fill
              className="object-cover"
            />
          </div>
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 p-3">
              <FireIcon className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-foreground font-cirka text-2xl font-bold">
              Real-Time Competition & Winner Takes All
            </h3>
          </div>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            Watch as vault managers execute their strategies. ROI updates in
            real-time on the leaderboard. The vault with the highest ROI wins!
            Yield from losing vaults is redistributed to the winning vault
            participants.
          </p>
          <div className="space-y-3">
            <div className="border-primary/20 bg-primary/10 flex items-center justify-between border p-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary h-2 w-2"></div>
                <span className="text-sm font-medium">Vault Alpha</span>
              </div>
              <Badge className="bg-primary rounded-none text-black">
                +12.5% ROI
              </Badge>
            </div>
            <div className="border-border bg-card/50 flex items-center justify-between border p-3">
              <div className="flex items-center gap-2">
                <div className="bg-muted-foreground h-2 w-2"></div>
                <span className="text-sm font-medium">Vault Beta</span>
              </div>
              <Badge variant="secondary" className="rounded-none">
                +8.2% ROI
              </Badge>
            </div>
            <Card className="border-border bg-card/50 rounded-none border p-4">
              <div className="mb-3 flex items-center gap-2">
                <TrophyIcon className="text-primary h-5 w-5" />
                <span className="text-sm font-semibold">
                  Victory Distribution
                </span>
              </div>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Winner&apos;s Original Yield:
                    </span>
                    <span className="text-primary font-medium">+12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Redistributed Yield:
                    </span>
                    <span className="text-primary font-medium">+5.8%</span>
                  </div>
                  <div className="border-border flex justify-between border-t pt-2 font-semibold">
                    <span>Total Yield:</span>
                    <span className="text-primary">+18.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Withdraw",
    content: (
      <div>
        <div className="mb-8">
          <div className="relative mx-auto mb-6 h-64 w-full overflow-hidden">
            <Image
              src="/assets/works/3.png"
              alt="Best ROI Wins"
              fill
              className="object-cover"
            />
          </div>
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 p-3">
              <ArrowDownTrayIcon className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-foreground font-cirka text-2xl font-bold">
              Claim Your Rewards
            </h3>
          </div>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            Arena is complete! Withdraw your principal plus any yield earned.
            Winners get extra yield from losing vaults, while losers keep their
            principal safe.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-primary/20 rounded-none p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrophyIcon className="text-primary h-4 w-4" />
                <span className="text-primary text-sm font-semibold">
                  Winners
                </span>
              </div>
              <CardContent>
                <p className="text-muted-foreground mb-2 text-xs">
                  Get your principal + your vault&apos;s yield + redistributed
                  yield
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Principal:</span>
                    <span>$1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Yield:</span>
                    <span className="text-primary">+$183</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/50 rounded-none p-4">
              <div className="mb-2 flex items-center gap-2">
                <UsersIcon className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm font-semibold">
                  Others
                </span>
              </div>
              <CardContent>
                <p className="text-muted-foreground mb-2 text-xs">
                  Keep your principal safe, yield goes to winners
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Principal:</span>
                    <span>$1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yield:</span>
                    <span className="text-muted-foreground">$0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    ),
  },
];

export function WhatIsYieldArena() {
  return (
    <section id="how-it-works" className="bg-black py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center md:mb-16">
            <h2 className="font-cirka mb-4 text-3xl font-bold md:mb-6 md:text-4xl lg:text-6xl xl:text-7xl">
              What is Yield Arena?
            </h2>
            <p className="mx-auto max-w-4xl px-2 text-sm leading-relaxed text-white/80 md:text-base lg:text-lg">
              Competitive DeFi vaults with no-loss structure. Real yield,
              on-chain metrics.
              <br className="hidden sm:block" />
              Where vault managers battle with strategy and users stake with
              conviction.
            </p>
          </div>

          {/* Flow Diagram */}
          <div className="mb-20 md:mb-40">
            {/* Three Main Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:mb-12 md:grid-cols-3 md:gap-8">
              {/* Card 1: User Stake */}
              <div className="text-center">
                <div className="relative mx-auto mb-4 h-48 w-full overflow-hidden rounded-lg md:mb-6 md:h-80">
                  <Image
                    src="/assets/works/1.png"
                    alt="User Stake"
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-cirka mb-2 text-xl font-bold md:mb-3 md:text-2xl">
                  1. User Stake
                </h4>
                <p className="px-2 text-sm leading-relaxed text-white/70 md:text-base">
                  Users choose and stake into competing vaults based on manager
                  reputation and strategy
                </p>
              </div>

              {/* Card 2: Vaults Compete */}
              <div className="text-center">
                <div className="relative mx-auto mb-4 h-48 w-full overflow-hidden rounded-lg md:mb-6 md:h-80">
                  <Image
                    src="/assets/works/2.png"
                    alt="Vaults Compete"
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-cirka mb-2 text-xl font-bold md:mb-3 md:text-2xl">
                  2. Vaults Compete
                </h4>
                <p className="px-2 text-sm leading-relaxed text-white/70 md:text-base">
                  Managers deploy strategies and battle for highest ROI during
                  the competition period
                </p>
              </div>

              {/* Card 3: Best ROI Wins */}
              <div className="text-center">
                <div className="relative mx-auto mb-4 h-48 w-full overflow-hidden rounded-lg md:mb-6 md:h-80">
                  <Image
                    src="/assets/works/3.png"
                    alt="Best ROI Wins"
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-cirka mb-2 text-xl font-bold md:mb-3 md:text-2xl">
                  3. Best ROI Wins
                </h4>
                <p className="px-2 text-sm leading-relaxed text-white/70 md:text-base">
                  Highest performing vault takes the crown and all accumulated
                  yield
                </p>
              </div>
            </div>
          </div>

          <h3 className="font-cirka mb-8 text-center text-3xl font-bold md:mb-12 md:text-4xl lg:text-5xl">
            How It Works
          </h3>

          <HowItWorks data={data} />
        </div>
      </div>
    </section>
  );
}
