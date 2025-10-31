"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrophyIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  FireIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import Particles from "@/components/ui/particles";

import { useVaults, VaultWithMetrics } from "@/hooks/useVaults";
import { useVaultsPerformance } from "@/hooks/useVaultsPerformance";
import { getVaultStatus, getStatusBadgeClass } from "@/utils/battleStatus";
import { Loader2 } from "lucide-react";

export default function StrategyVaultsPage() {
  const { vaults, stats, loading, error, refreshVaults } = useVaults();

  // Memoize vault IDs to prevent infinite API calls
  const vaultIds = useMemo(
    () => vaults.map((vault) => vault.vault_id),
    [vaults]
  );
  const { getVaultPerformance, loading: performanceLoading } =
    useVaultsPerformance(vaultIds);

  const formatCurrency = (amount: number | null | undefined) => {
    // Convert to number and handle null/undefined/invalid values
    const numericAmount = Number(amount) || 0;

    if (numericAmount >= 1000000) {
      return `$${(numericAmount / 1000000).toFixed(1)}M`;
    }
    if (numericAmount >= 1000) {
      return `$${(numericAmount / 1000).toFixed(1)}K`;
    }
    return `$${numericAmount.toFixed(0)}`;
  };

  const formatAPY = (apy: number | null | undefined) => {
    // Convert to number and handle null/undefined/invalid values
    const numericAPY = Number(apy) || 0;
    return `${numericAPY.toFixed(1)}%`;
  };

  const formatPerformance = (roi: number | null | undefined) => {
    if (roi === null || roi === undefined) {
      return { value: "N/A", className: "text-white" };
    }

    const numericROI = Number(roi);
    const isPositive = numericROI >= 0;

    return {
      value: `${isPositive ? "+" : ""}${numericROI.toFixed(2)}%`,
      className: isPositive ? "text-profit" : "text-loss",
    };
  };

  const getBattleStatusBadge = (vault: VaultWithMetrics) => {
    // TODO: Replace with actual vault status check from backend
    // if (vault.status === 'disqualified') {
    //   return (
    //     <Badge
    //       variant="secondary"
    //       className="bg-loss/10 text-loss hover:bg-loss/20 rounded-none border-none"
    //     >
    //       <ExclamationTriangleIcon className="mr-1 h-3 w-3" />
    //       Disqualified
    //     </Badge>
    //   );
    // }

    // Only show status badge if vault has battle association (locked_start and locked_end)
    if (vault.locked_start && vault.locked_end) {
      const status = getVaultStatus(vault.locked_start, vault.locked_end);

      if (status === "In Battle") {
        return (
          <Badge
            variant="secondary"
            className={`rounded-none border-none ${getStatusBadgeClass(status)}`}
          >
            <FireIcon className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
      } else if (status === "Stake Phase") {
        return (
          <Badge
            variant="secondary"
            className={`rounded-none border-none ${getStatusBadgeClass(status)}`}
          >
            <ClockIcon className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
      } else if (status === "Completed") {
        return (
          <Badge
            variant="secondary"
            className={`rounded-none border-none ${getStatusBadgeClass(status)}`}
          >
            <TrophyIcon className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
      }
    }

    return null;
  };

  // Show all vaults without filtering

  const totalTVL = stats.totalTVL;
  const totalPnL = stats.totalPnL;

  // Loading state
  if (loading) {
    return (
      <div className="bg-background text-foreground relative min-h-screen p-6">
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
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="space-y-4 text-center">
            <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading vaults...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-background text-foreground relative min-h-screen p-6">
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
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="space-y-4 text-center">
            <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-red-500" />
            <p className="text-red-500">Error loading vaults: {error}</p>
            <Button
              onClick={refreshVaults}
              variant="outline"
              className="rounded-none"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground relative min-h-screen p-6">
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

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="font-cirka text-4xl font-bold text-white md:text-5xl">
            Strategy Vaults
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Back the pros, ape the best vaults built by verified strategists and
            battle-tested partners.
          </p>
        </div>

        {/* Redesigned Stats Overview */}
        {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="border-border space-y-4 rounded-none border bg-black/80 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-none p-2">
                  <VaultIcon className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-muted-foreground text-sm font-medium">
                    Total Value Locked
                  </h3>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(totalTVL)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground text-xs">24h Change</div>
                <div className="text-profit flex items-center text-sm font-medium">
                  <ArrowUpIcon className="mr-1 h-4 w-4" />
                  +2.4%
                </div>
              </div>
            </div>
            <div className="bg-muted h-1 rounded-none">
              <div className="bg-primary h-full w-3/4 rounded-none"></div>
            </div>
          </div>

          <div className="border-border space-y-4 rounded-none border bg-black/80 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-none p-2">
                  <ChartArea className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-muted-foreground text-sm font-medium">
                    Total P&L
                  </h3>
                  <p
                    className={`text-2xl font-bold ${totalPnL >= 0 ? "text-profit" : "text-loss"}`}
                  >
                    {totalPnL >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(totalPnL))}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground text-xs">Performance</div>
                <div
                  className={`flex items-center text-sm font-medium ${totalPnL >= 0 ? "text-profit" : "text-loss"}`}
                >
                  {totalPnL >= 0 ? (
                    <ArrowUpIcon className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="mr-1 h-4 w-4" />
                  )}
                  {totalPnL >= 0 ? "+12.8%" : "-5.2%"}
                </div>
              </div>
            </div>
            <div className="bg-muted h-1 rounded-none">
              <div
                className={`h-full w-2/3 rounded-none ${totalPnL >= 0 ? "bg-profit" : "bg-loss"}`}
              ></div>
            </div>
          </div>
        </div> */}

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="default" className="cursor-pointer rounded-none">
            All Vaults ({vaults.length})
          </Button>
        </div>

        {/* Vaults Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vaults.map((vault) => (
            <Card
              key={vault.vault_id}
              className="border-border hover:border-primary/50 rounded-none bg-black/70 transition-all duration-200 hover:bg-black/90"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Image
                      src={vault.vault_image || "/placeholder.svg"}
                      alt={`${vault.vault_name} symbol`}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="space-y-2">
                      <CardTitle className="text-lg">
                        {vault.vault_name}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        {getBattleStatusBadge(vault)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground text-sm">30D APY</div>
                    <div className="text-primary text-lg font-bold">
                      {formatAPY(vault.apy)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm">TVL</div>
                    <div className="text-primary text-lg font-bold">
                      {/* TODO: Replace with actual TVL from backend */}$ 0.0
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-3">
                  <div className="text-muted-foreground text-sm font-medium">
                    Performance
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground">14D</div>
                      <div
                        className={`font-bold ${formatPerformance(getVaultPerformance(vault.vault_id).performance14D).className}`}
                      >
                        {
                          formatPerformance(
                            getVaultPerformance(vault.vault_id).performance14D
                          ).value
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">30D</div>
                      <div
                        className={`font-bold ${formatPerformance(getVaultPerformance(vault.vault_id).performance30D).className}`}
                      >
                        {
                          formatPerformance(
                            getVaultPerformance(vault.vault_id).performance30D
                          ).value
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Deposit Asset</div>
                    <div className="font-medium text-white">
                      {vault.deposit_asset}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Min. Deposit</div>
                    <div className="font-medium text-white">
                      {formatCurrency(vault.min_deposit)}
                    </div>
                  </div>
                </div>

                <Link href={`/vaults/strategy-vaults/${vault.vault_id}`}>
                  <Button
                    className="w-full cursor-pointer rounded-none"
                    variant="outline"
                  >
                    <EyeIcon className="mr-2 h-4 w-4" />
                    View Vault Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leaderboard CTA */}
        <Card className="bg-primary border-primary/20 rounded-none">
          <CardContent className="space-y-4 p-8 text-center">
            <div className="space-y-2">
              <h3 className="font-cirka text-2xl font-bold text-black">
                Compete on the Leaderboard
              </h3>
              <p className="mx-auto max-w-2xl text-gray-700">
                Join the ultimate vault manager competition. Showcase your
                strategy, climb the rankings, and earn recognition in the DeFi
                community.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/arena/leaderboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="cursor-pointer rounded-none hover:bg-gray-900 hover:text-white"
                >
                  <TrophyIcon className="mr-2 h-5 w-5" />
                  View Leaderboard
                </Button>
              </Link>
              <Link href="/arena/battle">
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer rounded-none hover:bg-gray-900 hover:text-white"
                >
                  Go to Arena
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
