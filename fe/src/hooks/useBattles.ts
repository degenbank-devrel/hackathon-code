import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/lib/api";
import { Battle } from "@/lib/api";
import { formatTimeRemaining } from "@/utils/battleStatus";

// Extended interface for frontend display - using backend data with computed fields
export interface BattleWithMetrics extends Battle {
  // Computed frontend-specific fields only
  timeRemaining: string; // computed from battle_end
  total_tvl: number; // computed from vaults data
  active_vaults: number; // computed from vaults data
  total_participants: number; // computed from vaults data
  cubePosition: { row: number; col: number }; // for UI positioning
}

interface BattleStats {
  totalActiveBattles: number;
  totalPrizePool: number;
  totalParticipants: number;
  totalTVL: number;
}

export function useBattles() {
  const [battles, setBattles] = useState<BattleWithMetrics[]>([]);
  const [stats, setStats] = useState<BattleStats>({
    totalActiveBattles: 0,
    totalPrizePool: 0,
    totalParticipants: 0,
    totalTVL: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBattles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch battles from API
      const response = await apiService.getAllBattles(0, 100);

      if (response.results) {
        // Transform API data to match frontend interface
        const transformedBattles: BattleWithMetrics[] = response.results.map(
          (battle: Battle, index: number) => ({
            ...battle,
            // Only add computed frontend fields
            timeRemaining: formatTimeRemaining(battle.battle_end),
            // Calculate from vaults data or use defaults if no vaults
            total_tvl: battle.total_tvl || 0,
            active_vaults: battle.vaults?.length || 0,
            total_participants: battle.total_participants || 0,
            cubePosition: {
              row: Math.floor(index / 2),
              col: index % 2,
            },
          })
        );

        setBattles(transformedBattles);

        // Calculate stats from real data
        const totalActiveBattles = transformedBattles.filter(
          (b) => b.status === "open_deposit" || b.status === "ongoing_battle"
        ).length;
        const totalPrizePool = transformedBattles.reduce(
          (sum, b) => sum + b.prize_pool,
          0
        );
        const totalParticipants = transformedBattles.reduce(
          (sum, b) => sum + b.total_participants,
          0
        );
        const totalTVL = transformedBattles.reduce(
          (sum, b) => sum + b.total_tvl,
          0
        );

        setStats({
          totalActiveBattles,
          totalPrizePool,
          totalParticipants,
          totalTVL,
        });
      }
    } catch (err) {
      console.error("Error fetching battles:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch battles");
    } finally {
      setLoading(false);
    }
  };

  const getBattleById = useCallback(
    async (battleId: string): Promise<BattleWithMetrics | null> => {
      try {
        const battle = await apiService.getBattle(battleId);

        if (battle) {
          return {
            ...battle,
            // Only add computed frontend fields
            timeRemaining: formatTimeRemaining(battle.battle_end),
            // Calculate from vaults data or use defaults if no vaults
            total_tvl: battle.total_tvl || 0, // TODO: Get from separate API endpoint
            active_vaults: battle.vaults?.length || 0,
            total_participants: battle.total_participants || 0, // TODO: Get from separate API endpoint
            cubePosition: { row: 0, col: 0 },
          };
        }

        return null;
      } catch (err) {
        console.error("Error fetching battle:", err);
        throw err;
      }
    },
    []
  ); // Empty dependency array since this function doesn't depend on any state

  const refreshBattles = () => {
    fetchBattles();
  };

  useEffect(() => {
    fetchBattles();
  }, []);

  return {
    battles,
    stats,
    loading,
    error,
    refreshBattles,
    getBattleById,
  };
}
