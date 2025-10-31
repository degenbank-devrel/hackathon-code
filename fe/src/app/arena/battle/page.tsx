"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import {
  TrophyIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { MainNavbar } from "@/components/main-navbar";
import LightRays from "@/components/ui/light-rays";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useBattlesPaginated } from "@/hooks/useBattlesPaginated";
import { getBattlePhase } from "@/utils/battleStatus";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function BattleArenaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  // Use the paginated battles hook
  const {
    battles: allArenas,
    stats: realTimeStats,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    refreshBattles,
  } = useBattlesPaginated({ limit: 10 });

  // Filter arenas based on active tab
  const arenas = useMemo(() => {
    return allArenas.filter((arena) => {
      if (activeTab === "all") return true;

      const phase = getBattlePhase(arena.battle_start, arena.battle_end);
      switch (activeTab) {
        case "stake":
          return phase === "Stake Phase";
        case "battle":
          return phase === "Battle Phase";
        case "completed":
          return phase === "Completed";
        default:
          return true;
      }
    });
  }, [allArenas, activeTab]);

  // Calculate real-time stats for filtered arenas
  const filteredStats = useMemo(() => {
    return {
      activeBattles: arenas.filter(
        (arena) =>
          getBattlePhase(arena.battle_start, arena.battle_end) !== "Completed"
      ).length,
      totalParticipants: arenas.reduce(
        (sum, arena) => sum + arena.total_participants,
        0
      ),
      totalTVL: arenas.reduce((sum, arena) => sum + arena.total_tvl, 0),
    };
  }, [arenas]);

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Stake Phase":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Battle Phase":
        return "bg-transparent text-primary border-primary/30";
      case "Registration":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Resolution Phase":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Real-time duration update
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update time remaining
      refreshBattles();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [refreshBattles]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-white">
        <MainNavbar />
        <div className="relative flex min-h-screen flex-col">
          <div className="absolute inset-0 z-0">
            <LightRays
              raysOrigin="top-center"
              raysColor="#6fb7a5"
              raysSpeed={0.6}
              lightSpread={0.6}
              rayLength={5.0}
              pulsating={true}
              fadeDistance={2.0}
              followMouse={false}
              mouseInfluence={0.0}
              noiseAmount={0.012}
              distortion={0.008}
              className="opacity-80"
            />
          </div>
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="space-y-4 text-center">
              <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
              <p className="text-white/80">Loading battle arenas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen w-full bg-black text-white">
        <MainNavbar />
        <div className="relative flex min-h-screen flex-col">
          <div className="absolute inset-0 z-0">
            <LightRays
              raysOrigin="top-center"
              raysColor="#6fb7a5"
              raysSpeed={0.6}
              lightSpread={0.6}
              rayLength={5.0}
              pulsating={true}
              fadeDistance={2.0}
              followMouse={false}
              mouseInfluence={0.0}
              noiseAmount={0.012}
              distortion={0.008}
              className="opacity-80"
            />
          </div>
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="space-y-4 text-center">
              <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-red-500" />
              <p className="text-red-500">
                Error loading battle arenas: {error}
              </p>
              <Button
                onClick={refreshBattles}
                variant="outline"
                className="rounded-none"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <MainNavbar />

      <div className="relative flex min-h-screen flex-col">
        {/* Background Light Rays */}
        <div className="absolute inset-0 z-0">
          <LightRays
            raysOrigin="top-center"
            raysColor="#6fb7a5"
            raysSpeed={0.6}
            lightSpread={0.6}
            rayLength={5.0}
            pulsating={true}
            fadeDistance={2.0}
            followMouse={false}
            mouseInfluence={0.0}
            noiseAmount={0.012}
            distortion={0.008}
            className="opacity-80"
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="font-cirka mb-6 text-4xl font-bold md:text-6xl lg:text-7xl">
              <span className="text-white">Battle </span>
              <span className="from-primary via-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                Arenas
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-3xl font-sans text-lg text-white/80 md:text-xl">
              Compete in battle arenas where vault managers fight for the
              highest returns. Join the competition and prove your strategy.
            </p>

            {/* Stats Cards */}
            <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
              <Badge
                variant="outline"
                className="border-primary text-primary rounded-none px-4 py-2"
              >
                <TrophyIcon className="mr-2 h-4 w-4" />
                {filteredStats.activeBattles} Active Battles
              </Badge>
              <Badge
                variant="outline"
                className="rounded-none border-purple-400 bg-transparent px-4 py-2 text-purple-400"
              >
                <UsersIcon className="mr-2 h-4 w-4" />
                {filteredStats.totalParticipants} Total Participants
              </Badge>
              <Badge
                variant="outline"
                className="rounded-none border-green-400 bg-transparent px-4 py-2 text-green-400"
              >
                <CurrencyDollarIcon className="mr-2 h-4 w-4" />
                {formatCurrency(filteredStats.totalTVL)} Total TVL
              </Badge>
            </div>

            {/* Battle Phase Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mx-auto w-full max-w-2xl"
            >
              <TabsList className="grid w-full grid-cols-4 rounded-none border border-white/10 bg-black/50">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary cursor-pointer rounded-none data-[state=active]:text-black"
                >
                  All Battles
                </TabsTrigger>
                <TabsTrigger
                  value="stake"
                  className="cursor-pointer rounded-none data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Stake Phase
                </TabsTrigger>
                <TabsTrigger
                  value="battle"
                  className="cursor-pointer rounded-none data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  Battle Phase
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="cursor-pointer rounded-none data-[state=active]:bg-gray-500 data-[state=active]:text-white"
                >
                  Completed
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Battle Table */}
          <Card className="bg-card border-border rounded-none">
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="text-muted-foreground px-4 py-4 text-left text-sm font-medium">
                        Battle
                      </th>
                      <th className="text-muted-foreground px-4 py-4 text-right text-sm font-medium">
                        Total TVL
                      </th>
                      <th className="text-muted-foreground px-4 py-4 text-center text-sm font-medium">
                        Participants
                      </th>
                      <th className="text-muted-foreground px-4 py-4 text-center text-sm font-medium">
                        Status
                      </th>
                      <th className="text-muted-foreground px-4 py-4 text-center text-sm font-medium">
                        Time Remaining
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {arenas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center">
                          <div className="space-y-4">
                            <p className="text-lg text-white/60">
                              No battles found for this phase
                            </p>
                            <Button
                              onClick={() => setActiveTab("all")}
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary rounded-none hover:text-black"
                            >
                              View All Battles
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      arenas.map((battle) => {
                        const phase = getBattlePhase(
                          battle.battle_start,
                          battle.battle_end
                        );

                        return (
                          <tr
                            key={battle.battle_id}
                            className="group border-border/50 hover:bg-primary/5 relative h-16 cursor-pointer border-b transition-all duration-300"
                            onClick={() =>
                              router.push(`/arena/battle/${battle.battle_id}`)
                            }
                          >
                            {/* Battle Column */}
                            <td className="relative px-4 py-4 text-left">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 self-start">
                                  {battle.battle_image ? (
                                    <Image
                                      src={battle.battle_image}
                                      alt={battle.battle_name || "Battle"}
                                      width={40}
                                      height={40}
                                      className="rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                                      <span className="text-xs font-medium">
                                        {battle.battle_name?.charAt(0) || "B"}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col justify-center">
                                  <div className="truncate leading-tight font-medium text-white">
                                    {battle.battle_name || "Unknown Battle"}
                                  </div>
                                  <div className="text-muted-foreground mt-1 truncate text-sm leading-tight">
                                    {formatDate(battle.battle_start)} -{" "}
                                    {formatDate(battle.battle_end)}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Total TVL */}
                            <td className="relative px-4 py-4 text-right">
                              <div className="flex h-full items-center justify-end">
                                <div className="text-sm font-medium text-green-400">
                                  {formatCurrency(battle.total_tvl)}
                                </div>
                              </div>
                            </td>

                            {/* Participants */}
                            <td className="relative px-4 py-4 text-center">
                              <div className="flex h-full items-center justify-center">
                                <div className="text-sm font-medium text-white">
                                  {battle.total_participants}
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="relative px-4 py-4 text-center">
                              <div className="flex h-full items-center justify-center">
                                <Badge
                                  variant="outline"
                                  className={`${getStatusColor(phase)} rounded-none border-none bg-transparent`}
                                >
                                  {phase}
                                </Badge>
                              </div>
                            </td>

                            {/* Time Remaining */}
                            <td className="relative px-4 py-4 text-center">
                              <div className="flex h-full items-center justify-center">
                                <div className="text-muted-foreground text-sm">
                                  {battle.timeRemaining}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Always show when there are multiple pages */}
              {totalPages > 1 && (
                <div className="border-border/50 flex items-center justify-between border-t px-6 py-4">
                  <div className="text-muted-foreground text-sm">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, totalItems)} of {totalItems}{" "}
                    battles
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    itemsPerPage={10}
                    totalItems={totalItems}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
