import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

export interface LeaderboardEntry {
  rank: number;
  manager: string;
  managerFullAddress: string;
  managerType: "verified" | "ecosystem";
  totalTVL: number;
  totalPnL: number;
  winRate: number;
  avgAPY: number;
  vaultCount: number;
  followers: number;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    quarterly: number;
  };
  topVault: {
    name: string;
    apy: number;
  };
}

export interface StakerEntry {
  rank: number;
  staker: string;
  stakerFullAddress: string;
  stakerType: "whale" | "regular" | "new";
  totalStaked: number;
  totalRewards: number;
  stakingPeriod: number; // in days
  avgAPY: number;
  vaultCount: number;
  joinDate: string;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    quarterly: number;
  };
  favoriteVault: {
    name: string;
    staked: number;
  };
}

export interface LeaderboardStats {
  totalManagers: number;
  totalStakers: number;
  totalTVL: number;
  totalRewards: number;
}

export const useLeaderboard = () => {
  const [managers, setManagers] = useState<LeaderboardEntry[]>([]);
  const [stakers, setStakers] = useState<StakerEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats>({
    totalManagers: 0,
    totalStakers: 0,
    totalTVL: 0,
    totalRewards: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll use vault data to generate leaderboard data
      // In the future, there should be dedicated leaderboard endpoints
      const vaultsResponse = await apiService.getAllVaults(0, 100);
      
      if (vaultsResponse.results) {
        // Generate mock leaderboard data based on vault data
        const mockManagers: LeaderboardEntry[] = vaultsResponse.results
          .slice(0, 20)
          .map((vault, index) => ({
            rank: index + 1,
            manager: vault.manager?.manager_name || `Manager ${index + 1}`,
            managerFullAddress: vault.manager?.wallet_address || `${Math.random().toString(36).substring(2, 15)}...`,
            managerType: Math.random() > 0.5 ? "verified" : "ecosystem",
            totalTVL: Math.random() * 10000000,
            totalPnL: (Math.random() - 0.5) * 1000000,
            winRate: Math.random() * 100,
            avgAPY: Math.random() * 50,
            vaultCount: Math.floor(Math.random() * 10) + 1,
            followers: Math.floor(Math.random() * 1000),
            performance: {
              daily: (Math.random() - 0.5) * 10,
              weekly: (Math.random() - 0.5) * 20,
              monthly: (Math.random() - 0.5) * 50,
              quarterly: (Math.random() - 0.5) * 100,
            },
            topVault: {
              name: vault.vault_name,
              apy: Math.random() * 30,
            },
          }));

        const mockStakers: StakerEntry[] = Array.from({ length: 50 }, (_, index) => ({
          rank: index + 1,
          staker: `Staker ${index + 1}`,
          stakerFullAddress: `${Math.random().toString(36).substring(2, 15)}...`,
          stakerType: index < 5 ? "whale" : index < 30 ? "regular" : "new",
          totalStaked: Math.random() * 1000000,
          totalRewards: Math.random() * 100000,
          stakingPeriod: Math.floor(Math.random() * 365),
          avgAPY: Math.random() * 25,
          vaultCount: Math.floor(Math.random() * 5) + 1,
          joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          performance: {
            daily: (Math.random() - 0.5) * 5,
            weekly: (Math.random() - 0.5) * 15,
            monthly: (Math.random() - 0.5) * 30,
            quarterly: (Math.random() - 0.5) * 60,
          },
          favoriteVault: {
            name: vaultsResponse.results[Math.floor(Math.random() * vaultsResponse.results.length)]?.vault_name || "Vault",
            staked: Math.random() * 100000,
          },
        }));

        setManagers(mockManagers);
        setStakers(mockStakers);
        setStats({
          totalManagers: mockManagers.length,
          totalStakers: mockStakers.length,
          totalTVL: mockManagers.reduce((sum, manager) => sum + manager.totalTVL, 0),
          totalRewards: mockStakers.reduce((sum, staker) => sum + staker.totalRewards, 0),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const refreshLeaderboard = () => {
    fetchLeaderboardData();
  };

  return {
    managers,
    stakers,
    stats,
    loading,
    error,
    refreshLeaderboard,
  };
};