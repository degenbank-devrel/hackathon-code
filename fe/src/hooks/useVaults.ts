import { useState, useEffect, useCallback } from "react";
import { apiService, Vault, GetVaultsResponse } from "@/lib/api";

export interface VaultWithMetrics extends Vault {
  // Frontend-specific computed fields
  age: string;
  managerType: "verified" | "ecosystem";
}

export interface VaultStats {
  totalTVL: number;
  totalPnL: number;
  verifiedManagers: number;
  ecosystemManagers: number;
}

export const useVaults = () => {
  const [vaults, setVaults] = useState<VaultWithMetrics[]>([]);
  const [stats, setStats] = useState<VaultStats>({
    totalTVL: 0,
    totalPnL: 0,
    verifiedManagers: 0,
    ecosystemManagers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVaults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch vaults from API
      const response: GetVaultsResponse = await apiService.getAllVaults(0, 100);

      if (response.results) {
        // Transform API data to add computed frontend fields
        const transformedVaults: VaultWithMetrics[] = response.results.map(
          (vault: Vault) => ({
            ...vault,
            // Age calculation removed - created_at field not available in backend
            age: "N/A",
            // Determine manager type based on manager KYB status or vault type
            managerType: vault.manager?.is_kyb || vault.vault_type === "banker" ? "verified" : "ecosystem",
          })
        );

        setVaults(transformedVaults);

        // Calculate stats - using placeholder values since fields are not available
        const totalTVL = 0; // TODO: Get from separate API endpoint
        const totalPnL = 0; // TODO: Calculate from performance data

        // Count manager types
        const verifiedCount = transformedVaults.filter(
          (v) => v.managerType === "verified"
        ).length;
        const ecosystemCount = transformedVaults.filter(
          (v) => v.managerType === "ecosystem"
        ).length;

        setStats({
          totalTVL,
          totalPnL,
          verifiedManagers: verifiedCount,
          ecosystemManagers: ecosystemCount,
        });
      } else {
        throw new Error("Failed to fetch vaults");
      }
    } catch (err) {
      console.error("Error fetching vaults:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch vaults");

      // Fallback to empty data
      setVaults([]);
      setStats({
        totalTVL: 0,
        totalPnL: 0,
        verifiedManagers: 0,
        ecosystemManagers: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getVaultById = useCallback(async (
    vaultId: string
  ): Promise<VaultWithMetrics | null> => {
    try {
      const vault = await apiService.getVault(vaultId);
      if (vault) {
        return {
          ...vault,
          // Age calculation removed - created_at field not available in backend
          age: "N/A",
          // Determine manager type based on manager KYB status or vault type
          managerType: vault.manager?.is_kyb || vault.vault_type === "banker" ? "verified" : "ecosystem",
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching vault by ID:", err);
      return null;
    }
  }, []);

  const refreshVaults = () => {
    fetchVaults();
  };

  useEffect(() => {
    fetchVaults();
  }, []);

  return {
    vaults,
    stats,
    loading,
    error,
    refreshVaults,
    getVaultById,
  };
};
