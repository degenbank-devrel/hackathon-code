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
}

interface BattleStats {
  totalActiveBattles: number;
  totalPrizePool: number;
  totalParticipants: number;
  totalTVL: number;
}

interface UseBattlesPaginatedOptions {
  limit?: number;
  initialPage?: number;
}

export function useBattlesPaginated(options: UseBattlesPaginatedOptions = {}) {
  const { limit = 10, initialPage = 1 } = options;
  
  const [battles, setBattles] = useState<BattleWithMetrics[]>([]);
  const [stats, setStats] = useState<BattleStats>({
    totalActiveBattles: 0,
    totalPrizePool: 0,
    totalParticipants: 0,
    totalTVL: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBattles = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const skip = (page - 1) * limit;
      
      // Fetch battles from API with pagination
      const response = await apiService.getAllBattles(skip, limit);

      if (response.results) {
        // Transform API data to match frontend interface
        const transformedBattles: BattleWithMetrics[] = response.results.map(
          (battle: Battle) => ({
            ...battle,
            // Only add computed frontend fields
            timeRemaining: formatTimeRemaining(battle.battle_end),
            // Calculate from vaults data or use defaults if no vaults
            total_tvl: battle.total_tvl || 0,
            active_vaults: battle.vaults?.length || 0,
            total_participants: battle.total_participants || 0,
          })
        );

        setBattles(transformedBattles);
        setTotalItems(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / limit));

        // Calculate stats from current page data
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
  }, [currentPage, limit]);

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
            total_tvl: battle.total_tvl || 0,
            active_vaults: battle.vaults?.length || 0,
            total_participants: battle.total_participants || 0,
          };
        }

        return null;
      } catch (err) {
        console.error("Error fetching battle:", err);
        throw err;
      }
    },
    []
  );

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const refreshBattles = useCallback(() => {
    fetchBattles(currentPage);
  }, [fetchBattles, currentPage]);

  useEffect(() => {
    fetchBattles(currentPage);
  }, [currentPage, fetchBattles]);

  return {
    battles,
    stats,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    refreshBattles,
    getBattleById,
  };
}