"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/hooks/useAuth";
import { useUserVaultPositions } from "@/hooks/useUserVaultPositions";
import { UserVaultPosition } from "@/lib/api";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { Eye } from "lucide-react";
import Image from "next/image";
import {
  getBattlePhase,
  isWithdrawAllowed as utilIsWithdrawAllowed,
} from "@/utils/battleStatus";
import { useBattles } from "@/hooks/useBattles";

// Helper functions
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatPercentage = (percentage: number) => {
  return `${percentage.toFixed(1)}%`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function PositionsPage() {
  const { user, authenticated, login } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
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
  const itemsPerPage = 10;

  // Use battles hook to fetch battle data
  const { getBattleById } = useBattles();

  // Use the hook to fetch user vault positions
  const {
    positions,
    loading: positionsLoading,
    hasMore,
    loadMore,
  } = useUserVaultPositions({
    userId: user?.userId || null,
    limit: itemsPerPage,
  });

  // Calculate pagination based on current positions
  const totalItems = positions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedPositions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return positions.slice(startIndex, endIndex);
  }, [positions, currentPage]);

  // Load more data when page changes and we need more data
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    if (startIndex >= positions.length && hasMore && !positionsLoading) {
      loadMore();
    }
  }, [currentPage, positions.length, hasMore, positionsLoading, loadMore]);

  // Fetch battle data for positions that have battle_id
  useEffect(() => {
    const fetchBattleData = async () => {
      const battleIds = positions
        .filter(
          (pos) =>
            pos.vault?.battle_id &&
            !battleDataMap[pos.vault.battle_id.toString()]
        )
        .map((pos) => pos.vault!.battle_id!.toString());

      if (battleIds.length > 0) {
        const newBattleData: Record<
          string,
          {
            battle_start: string;
            battle_end: string;
            winner_vault_id: string | null;
          }
        > = {};

        await Promise.all(
          battleIds.map(async (battleId) => {
            try {
              const battle = await getBattleById(battleId);
              if (battle) {
                newBattleData[battleId] = {
                  battle_start: battle.battle_start,
                  battle_end: battle.battle_end,
                  winner_vault_id: battle.winner_vault_id,
                };
              }
            } catch (error) {
              console.error(`Failed to fetch battle ${battleId}:`, error);
            }
          })
        );

        setBattleDataMap((prev) => ({ ...prev, ...newBattleData }));
      }
    };

    if (positions.length > 0) {
      fetchBattleData();
    }
  }, [positions, getBattleById, battleDataMap]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Check if withdraw is allowed based on battle status
  const isWithdrawAllowed = (position: UserVaultPosition) => {
    // If vault has no battle_id, allow withdrawal
    if (!position.vault?.battle_id) {
      return true;
    }

    // Get battle data for this position
    const battleData = battleDataMap[position.vault.battle_id.toString()];
    if (!battleData) {
      // If battle data not loaded yet, assume not allowed
      return false;
    }

    // Use utility function to check if withdrawal is allowed
    return utilIsWithdrawAllowed(
      battleData.battle_start,
      battleData.battle_end
    );
  };

  // Get display status for the vault
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

  // Get text color class based on status
  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "Stake Phase":
        return "text-blue-400";
      case "Battle Phase":
        return "text-purple-400";
      case "Winner":
        return "text-primary";
      case "Lose":
        return "text-red-400";
      case "Completed":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                You need to connect your wallet to view your positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={login}
                className="bg-primary hover:bg-primary/90 w-full text-black"
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Positions</h1>
          <p className="text-muted-foreground">
            Manage and monitor your vault positions
          </p>
        </div>
        <Link href="/overview">
          <Button variant="outline" className="cursor-pointer">
            Back to Overview
          </Button>
        </Link>
      </div>

      {/* Positions Table */}
      <Card className="bg-card border-border rounded-none">
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                    Vault
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-sm font-medium">
                    Current Value
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-sm font-medium">
                    PnL
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-sm font-medium">
                    APY
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-center text-sm font-medium">
                    Status
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-center text-sm font-medium">
                    Deposit Date
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-center text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedPositions.map((position) => {
                  const pnl = calculatePnL(
                    position.current_value,
                    position.cumulative_deposits
                  );
                  const pnlPercentage = calculatePnLPercentage(
                    position.current_value,
                    position.cumulative_deposits
                  );
                  const displayStatus = getVaultDisplayStatus(position);

                  return (
                    <tr
                      key={position.position_id}
                      className="border-border/50 hover:bg-muted/5 border-b"
                    >
                      {/* Vault Column */}
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {position.vault?.vault_image ? (
                              <Image
                                src={position.vault.vault_image}
                                alt={position.vault.vault_name || "Vault"}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                                <span className="text-xs font-medium">
                                  {position.vault?.vault_name?.charAt(0) || "V"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-white">
                              {position.vault?.vault_name || "Unknown Vault"}
                            </div>
                            <div className="text-muted-foreground truncate text-sm">
                              {position.vault?.vault_type || "Unknown Type"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Current Value */}
                      <td className="px-4 py-4 text-right">
                        <div className="text-sm font-medium text-white">
                          {formatCurrency(parseFloat(position.current_value))}
                        </div>
                      </td>

                      {/* PnL */}
                      <td className="px-4 py-4 text-right">
                        {displayStatus === "Stake Phase" ? (
                          <div className="text-sm font-medium text-muted-foreground">
                            -
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-end space-x-1">
                              <div
                                className={`flex items-center text-sm whitespace-nowrap ${
                                  pnl >= 0 ? "text-profit" : "text-loss"
                                }`}
                              >
                                {pnl >= 0 ? (
                                  <ArrowUpIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                                ) : (
                                  <ArrowDownIcon className="mr-1 h-4 w-4 flex-shrink-0" />
                                )}
                                <span className="font-medium">
                                  {formatCurrency(Math.abs(pnl))}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`text-right text-sm whitespace-nowrap ${
                                pnl >= 0 ? "text-profit" : "text-loss"
                              }`}
                            >
                              {formatPercentage(pnlPercentage)}
                            </div>
                          </>
                        )}
                      </td>

                      {/* APY */}
                      <td className="px-4 py-4 text-right">
                        {displayStatus === "Stake Phase" ? (
                          <div className="text-sm font-medium text-muted-foreground">
                            -
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-green-400">
                            {formatPercentage(position.vault?.apy || 0)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`text-sm font-medium ${getStatusTextColor(displayStatus)}`}
                        >
                          {displayStatus}
                        </span>
                      </td>

                      {/* Deposit Date */}
                      <td className="px-4 py-4 text-center">
                        <div className="text-muted-foreground text-sm">
                          {formatDate(position.first_deposit_at)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-center">
                        <Link
                          href={`/vaults/strategy-vaults/${position.vault?.vault_id}?tab=your-performance&from=positions`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 px-4 pb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
