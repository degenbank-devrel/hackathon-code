"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserVaultPositions } from "@/hooks/useUserVaultPositions";
import { useVaults } from "@/hooks/useVaults";
import { useBattles } from "@/hooks/useBattles";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useMemo } from "react";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import Image from "next/image";
import { Swords, Vault, Loader2 } from "lucide-react";
import { UserVaultPosition } from "@/lib/api";
import { getBattlePhase } from "@/utils/battleStatus";

// Dummy data for charts
// Simple dummy data for P&L chart - to be replaced with real historical data
const totalPnLData = [
  { date: "15 Oct 2024", cumulativePnl: 0 },
  { date: "16 Oct 2024", cumulativePnl: 150.25 },
  { date: "17 Oct 2024", cumulativePnl: -320.5 },
  { date: "18 Oct 2024", cumulativePnl: 280.75 },
  { date: "19 Oct 2024", cumulativePnl: 450.3 },
  { date: "20 Oct 2024", cumulativePnl: 1250.34 },
];

const formatTVL = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount}`;
};

const getBattleStatusColor = (status: string) => {
  switch (status) {
    case "open_deposit":
      return "text-blue-400";
    case "ongoing_battle":
      return "text-purple-400";
    case "completed":
      return "text-primary";
    default:
      return "text-gray-200";
  }
};

export default function OverviewPage() {
  const { user, authenticated, login } = useAuth();
  const [battleDataMap, setBattleDataMap] = useState<
    Record<
      string,
      {
        battle_start: string;
        battle_end: string;
        winner_vault_id: string | null;
      }
    >
  >({});
  const [activeTab, setActiveTab] = useState("overview");

  // API hooks for data fetching
  const { vaults, loading: vaultsLoading, error: vaultsError } = useVaults();
  const {
    battles,
    loading: battlesLoading,
    error: battlesError,
    getBattleById,
  } = useBattles();
  const {
    positions,
    loading: positionsLoading,
    error: positionsError,
  } = useUserVaultPositions({
    userId: user?.userId || null,
    limit: 10,
  });

  // Filter available vaults (exclude vaults that user already has positions in)
  const availableVaults = useMemo(() => {
    if (!vaults || !positions) return [];

    const userVaultIds = new Set(
      positions.map((p) => p.vault?.vault_id).filter(Boolean)
    );
    return vaults.filter((vault) => !userVaultIds.has(vault.vault_id));
  }, [vaults, positions]);

  // Transform battles data for display
  const battleArenas = useMemo(() => {
    if (!battles) return [];

    return battles.map((battle) => ({
      id: battle.battle_id,
      name: battle.battle_name,
      status: battle.status,
      phase: getBattlePhase(battle.battle_start, battle.battle_end),
      timeRemaining: battle.timeRemaining || "N/A",
      totalTVL: battle.total_tvl || 0,
      participants: 0, // Placeholder since participants property doesn't exist
    }));
  }, [battles]);

  // Fetch battle data for positions that have battle_id
  useEffect(() => {
    const fetchBattleData = async () => {
      const newBattleDataMap: Record<
        string,
        {
          battle_start: string;
          battle_end: string;
          winner_vault_id: string | null;
        }
      > = { ...battleDataMap };
      let hasNewData = false;

      for (const position of positions) {
        if (
          position.vault?.battle_id &&
          !battleDataMap[position.vault.battle_id.toString()]
        ) {
          try {
            const battleData = await getBattleById(
              position.vault.battle_id.toString()
            );
            if (battleData) {
              newBattleDataMap[position.vault.battle_id.toString()] = {
                battle_start: battleData.battle_start,
                battle_end: battleData.battle_end,
                winner_vault_id: battleData.winner_vault_id,
              };
              hasNewData = true;
            }
          } catch (error) {
            console.error("Error fetching battle data:", error);
          }
        }
      }

      if (hasNewData) {
        setBattleDataMap(newBattleDataMap);
      }
    };

    if (positions.length > 0) {
      fetchBattleData();
    }
  }, [positions, getBattleById, battleDataMap]);

  // Get display status for the vault (same logic as positions page)
  const getVaultDisplayStatus = (position: UserVaultPosition) => {
    // If vault has no battle_id, it's available for withdrawal
    if (!position.vault?.battle_id) {
      return "Completed";
    }

    // Get battle data for this position
    const battleData = battleDataMap[position.vault.battle_id.toString()];
    if (!battleData) {
      // If battle data not loaded yet, show loading state
      return "Loading...";
    }

    // Use utility function to get battle phase
    const phase = getBattlePhase(
      battleData.battle_start,
      battleData.battle_end
    );

    // Map battle phases to display text and check for winner/loser
    switch (phase) {
      case "Stake Phase":
        return "Stake Phase";
      case "Battle Phase":
        return "Battle Phase";
      case "Completed":
        // Check if this vault is the winner
        if (battleData.winner_vault_id) {
          if (battleData.winner_vault_id === position.vault?.vault_id) {
            return "Winner";
          } else {
            return "Lose";
          }
        }
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Fix formatPercentage to match positions page (no double plus signs)
  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  // Calculate PnL and PnL percentage (same logic as positions page)
  const calculatePnL = (currentValue: string, deposits: string) => {
    const current = parseFloat(currentValue);
    const deposited = parseFloat(deposits);
    return current - deposited;
  };

  const calculatePnLPercentage = (currentValue: string, deposits: string) => {
    const current = parseFloat(currentValue);
    const deposited = parseFloat(deposits);
    if (deposited === 0) return 0;
    return ((current - deposited) / deposited) * 100;
  };

  const formatPnL = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      signDisplay: "always",
    }).format(value);
  };

  // Calculate portfolio metrics from actual positions data
  const portfolioMetrics = useMemo(() => {
    if (!positions.length) {
      return {
        totalValue: 0,
        totalPnL: 0,
        totalPnLPercentage: 0,
        totalDeposits: 0,
      };
    }

    const totalValue = positions.reduce((sum, position) => {
      return sum + parseFloat(position.current_value || "0");
    }, 0);

    const totalDeposits = positions.reduce((sum, position) => {
      return sum + parseFloat(position.cumulative_deposits || "0");
    }, 0);

    const totalPnL = totalValue - totalDeposits;
    const totalPnLPercentage =
      totalDeposits > 0 ? (totalPnL / totalDeposits) * 100 : 0;

    return {
      totalValue,
      totalPnL,
      totalPnLPercentage,
      totalDeposits,
    };
  }, [positions]);

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                You need to connect your wallet to view your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={login}
                className="bg-primary hover:bg-primary/90 w-full cursor-pointer text-black"
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Portfolio Value */}
        <Card className="bg-card border-border rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Portfolio Value</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(portfolioMetrics.totalValue)}
                </p>
              </div>
              <div className="text-primary">
                <ArrowUpIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Time PnL */}
        <Card className="bg-card border-border rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">All Time PnL</p>
                <p
                  className={`text-2xl font-bold ${
                    portfolioMetrics.totalPnL >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {portfolioMetrics.totalPnL >= 0 ? "+" : ""}
                  {formatCurrency(Math.abs(portfolioMetrics.totalPnL))}
                </p>
              </div>
              <div
                className={
                  portfolioMetrics.totalPnL >= 0 ? "text-profit" : "text-loss"
                }
              >
                {portfolioMetrics.totalPnL >= 0 ? (
                  <ArrowUpIcon className="h-6 w-6" />
                ) : (
                  <ArrowDownIcon className="h-6 w-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Positions */}
        <Card className="bg-card border-border rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">
                  Active Positions
                </p>
                <p className="text-2xl font-bold text-white">
                  {positions.length}
                </p>
              </div>
              <div className="text-primary">
                <ArrowUpIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Menu Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === "overview" ? "default" : "outline"}
          onClick={() => setActiveTab("overview")}
          className={`hover:bg-primary cursor-pointer border-gray-400 bg-transparent hover:text-black ${
            activeTab === "overview" ? "bg-primary text-black" : "text-white"
          }`}
        >
          Overview
        </Button>
        <Link href="/overview/positions">
          <Button
            variant="outline"
            className="hover:bg-primary cursor-pointer border-gray-400 bg-transparent text-white hover:text-black"
          >
            Positions
          </Button>
        </Link>
        <Link href="/overview/history">
          <Button
            variant="outline"
            className="hover:bg-primary cursor-pointer border-gray-400 bg-transparent text-white hover:text-black"
          >
            History
          </Button>
        </Link>
      </div>

      {/* Positions Table */}
      <Card className="bg-card border-border rounded-none">
        <CardHeader>
          <CardTitle className="text-sm">Positions</CardTitle>
          <CardDescription className="text-xs">
            Current vault positions and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground px-1 py-2 text-left text-xs font-medium">
                    Vault
                  </th>
                  <th className="text-muted-foreground px-1 py-2 text-right text-xs font-medium">
                    Amount
                  </th>
                  <th className="text-muted-foreground px-1 py-2 text-center text-xs font-medium">
                    Status
                  </th>
                  <th className="text-muted-foreground px-1 py-2 text-right text-xs font-medium">
                    PnL
                  </th>
                  <th className="text-muted-foreground px-1 py-2 text-right text-xs font-medium">
                    APY
                  </th>
                </tr>
              </thead>
              <tbody>
                {positionsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-1 py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-muted-foreground text-xs">
                          Loading positions...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : positions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-1 py-8 text-center">
                      <span className="text-muted-foreground text-xs">
                        No positions found
                      </span>
                    </td>
                  </tr>
                ) : (
                  positions.slice(0, 6).map((position) => {
                    // Calculate PnL and APY from position data (same as positions page)
                    const currentValue = parseFloat(position.current_value);
                    const cumulativeDeposits = parseFloat(
                      position.cumulative_deposits
                    );
                    const pnl = calculatePnL(
                      position.current_value,
                      position.cumulative_deposits
                    );
                    const pnlPercentage = calculatePnLPercentage(
                      position.current_value,
                      position.cumulative_deposits
                    );
                    const apy = position.vault?.apy || 0;

                    // Get display status using the same logic as positions page
                    const displayStatus = getVaultDisplayStatus(position);

                    return (
                      <tr
                        key={position.position_id}
                        className="border-border/50 hover:bg-primary/10 cursor-pointer border-b"
                        onClick={() =>
                          (window.location.href = `/vaults/strategy-vaults/${position.vault_id}?tab=your-performance&from=overview`)
                        }
                      >
                        <td className="px-1 py-2">
                          <div className="flex items-center space-x-2">
                            <Image
                              src={
                                position.vault?.vault_image ||
                                "https://cdn.degenbank.cc/bonk.png"
                              }
                              alt={position.vault?.vault_name || "Vault"}
                              width={24}
                              height={24}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                            <div className="text-xs font-medium text-white">
                              {position.vault?.vault_name || "Unknown Vault"}
                            </div>
                          </div>
                        </td>
                        <td className="px-1 py-2 text-right">
                          <div className="text-xs text-white">
                            {formatCurrency(cumulativeDeposits)}
                          </div>
                        </td>
                        <td className="px-1 py-2 text-center">
                          <div
                            className={`inline-block px-2 py-1 text-xs ${
                              displayStatus === "Stake Phase"
                                ? "bg-blue-500/10 text-blue-400"
                                : displayStatus === "Battle Phase"
                                  ? "bg-purple-500/10 text-purple-400"
                                  : displayStatus === "Winner"
                                    ? "text-primary bg-green-500/10"
                                    : displayStatus === "Lose"
                                      ? "bg-red-500/10 text-red-400"
                                      : displayStatus === "Completed"
                                        ? "bg-gray-500/10 text-gray-400"
                                        : "bg-gray-500/10 text-gray-400"
                            }`}
                          >
                            {displayStatus}
                          </div>
                        </td>
                        <td className="px-1 py-2 text-right">
                          {displayStatus === "Stake Phase" ? (
                            <div className="text-muted-foreground text-xs">
                              -
                            </div>
                          ) : (
                            <>
                              <div
                                className={`text-xs ${
                                  pnl >= 0 ? "text-profit" : "text-loss"
                                }`}
                              >
                                {pnl >= 0 ? "+" : ""}
                                {formatCurrency(Math.abs(pnl))}
                              </div>
                              <div
                                className={`text-xs ${
                                  pnlPercentage >= 0
                                    ? "text-profit"
                                    : "text-loss"
                                }`}
                              >
                                {pnlPercentage >= 0 ? "+" : ""}
                                {formatPercentage(Math.abs(pnlPercentage))}
                              </div>
                            </>
                          )}
                        </td>
                        <td className="px-1 py-2 text-right">
                          {displayStatus === "Stake Phase" ? (
                            <div className="text-muted-foreground text-xs">
                              -
                            </div>
                          ) : (
                            <div className="text-xs text-green-400">
                              {formatPercentage(apy)}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="mt-2 text-center">
              <Link href="/overview/positions">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer text-xs"
                >
                  View All Positions
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Vaults and Battle Arenas - Table Format */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Available Vaults Table */}
        <Card className="bg-card border-border rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Vault className="h-4 w-4" />
              <span>Available Vaults</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Open vaults ready for deposits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-muted-foreground px-1 py-2 text-left text-xs font-medium">
                      Vault
                    </th>
                    <th className="text-muted-foreground px-1 py-2 text-right text-xs font-medium">
                      APY
                    </th>
                    <th className="text-muted-foreground px-1 py-2 text-right text-xs font-medium">
                      TVL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {availableVaults.slice(0, 6).map((vault) => (
                    <tr
                      key={vault.vault_id}
                      className="border-border/50 hover:bg-primary/10 cursor-pointer border-b"
                      onClick={() =>
                        (window.location.href = `/vaults/${vault.vault_id}`)
                      }
                    >
                      <td className="px-1 py-2">
                        <div className="flex items-center space-x-2">
                          <Image
                            src={
                              vault.vault_image ||
                              "https://cdn.degenbank.cc/bonk.png"
                            }
                            alt={vault.vault_name}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <div>
                            <div className="text-xs font-medium text-white">
                              {vault.vault_name}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {vault.deposit_asset}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-right">
                        <div className="text-primary text-xs font-medium">
                          {vault.apy?.toFixed(1) || "0.0"}%
                        </div>
                      </td>
                      <td className="px-1 py-2 text-right">
                        <div className="text-xs text-white">
                          {formatTVL(vault.min_deposit * 1000)}{" "}
                          {/* Placeholder TVL calculation */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-center">
                <Link href="/vaults/strategy-vaults">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-xs"
                  >
                    View All Vaults
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Battle Arenas Table */}
        <Card className="bg-card border-border rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Swords className="h-4 w-4" />
              <span>Battle Arenas</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Active and upcoming battle arenas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-muted-foreground px-1 py-2 text-left text-xs font-medium">
                      Arena
                    </th>
                    <th className="text-muted-foreground px-1 py-2 text-right text-xs font-medium">
                      TVL
                    </th>
                    <th className="text-muted-foreground px-1 py-2 text-center text-xs font-medium">
                      Status
                    </th>
                    <th className="text-muted-foreground px-1 py-2 text-center text-xs font-medium">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {battleArenas.slice(0, 6).map((arena) => (
                    <tr
                      key={arena.id}
                      className="border-border/50 hover:bg-primary/10 cursor-pointer border-b"
                      onClick={() =>
                        (window.location.href = `/battle/arena/${arena.id}`)
                      }
                    >
                      <td className="px-1 py-2">
                        <div className="text-xs font-medium text-white">
                          {arena.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {arena.participants} participants
                        </div>
                      </td>
                      <td className="px-1 py-2 text-right">
                        <div className="text-xs text-white">
                          {formatTVL(arena.totalTVL)}
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium ${getBattleStatusColor(arena.status)}`}
                        >
                          {arena.phase}
                        </span>
                      </td>
                      <td className="px-1 py-2 text-center">
                        <div className="text-muted-foreground text-xs">
                          {arena.timeRemaining}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-center">
                <Link href="/arena/battle">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-xs"
                  >
                    View All Battles
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
