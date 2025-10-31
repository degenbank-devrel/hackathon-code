import { useState, useEffect } from 'react';
import { apiService, Vault } from '@/lib/api';

export interface BattleVault extends Vault {
  // Additional fields for battle display only
  managerName: string;
  color: string;
}

export const useBattleVaults = (battleId: string) => {
  const [vaults, setVaults] = useState<BattleVault[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBattleVaults = async () => {
    if (!battleId) return;

    setLoading(true);
    setError(null);

    try {
      const vaultsData = await apiService.getVaultsByBattleId(Number(battleId));
      
      // Transform API data to match frontend interface
      const transformedVaults: BattleVault[] = vaultsData.map((vault, index) => ({
        ...vault,
        // Only add computed frontend fields
        managerName: vault.manager?.manager_name || `Manager ${index + 1}`,
        color: ['#6fb7a5', '#FB605C', '#FFB800', '#9333EA'][index % 4],
      }));

      // Sort by APY descending
      transformedVaults.sort((a, b) => (b.apy || 0) - (a.apy || 0));

      setVaults(transformedVaults);
    } catch (err) {
      console.error('Failed to fetch battle vaults:', err);
      setError('Failed to load battle vaults');
    } finally {
      setLoading(false);
    }
  };

  const refreshVaults = () => {
    fetchBattleVaults();
  };

  useEffect(() => {
    fetchBattleVaults();
  }, [battleId]);

  return {
    vaults,
    loading,
    error,
    refreshVaults,
  };
};