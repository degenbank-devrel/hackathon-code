import { useState, useEffect, useCallback, useMemo } from "react";
import { apiService } from "@/lib/api";

export interface VaultPerformanceMetrics {
  vaultId: string;
  performance14D: number | null; // ROI percentage for 14 days
  performance30D: number | null; // ROI percentage for 30 days
  loading: boolean;
  error: string | null;
}

export interface VaultsPerformanceState {
  [vaultId: string]: VaultPerformanceMetrics;
}

export const useVaultsPerformance = (vaultIds: string[]) => {
  const [performanceData, setPerformanceData] = useState<VaultsPerformanceState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize vaultIds to prevent unnecessary re-renders
  const memoizedVaultIds = useMemo(() => vaultIds, [vaultIds.join(',')]);

  const fetchVaultPerformance = useCallback(async (vaultId: string) => {
    try {
      // Set loading state for this specific vault
      setPerformanceData(prev => ({
        ...prev,
        [vaultId]: {
          ...prev[vaultId],
          vaultId,
          loading: true,
          error: null,
          performance14D: prev[vaultId]?.performance14D || null,
          performance30D: prev[vaultId]?.performance30D || null,
        }
      }));

      // Fetch both 14D and 30D performance data
      const [performance14D, performance30D] = await Promise.all([
        apiService.getVaultPerformance(vaultId, "14D"),
        apiService.getVaultPerformance(vaultId, "30D")
      ]);

      // Calculate the latest ROI from the performance data
      const roi14D = performance14D.data && performance14D.data.length > 0 
        ? performance14D.data[performance14D.data.length - 1].roi 
        : null;
      
      const roi30D = performance30D.data && performance30D.data.length > 0 
        ? performance30D.data[performance30D.data.length - 1].roi 
        : null;

      // Update state with the fetched data
      setPerformanceData(prev => ({
        ...prev,
        [vaultId]: {
          vaultId,
          performance14D: roi14D,
          performance30D: roi30D,
          loading: false,
          error: null,
        }
      }));

    } catch (err) {
      console.error(`Error fetching performance for vault ${vaultId}:`, err);
      
      setPerformanceData(prev => ({
        ...prev,
        [vaultId]: {
          vaultId,
          performance14D: null,
          performance30D: null,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to fetch performance data",
        }
      }));
    }
  }, []);

  const fetchAllVaultsPerformance = useCallback(async () => {
    if (memoizedVaultIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch performance data for all vaults in parallel
      await Promise.all(memoizedVaultIds.map(vaultId => fetchVaultPerformance(vaultId)));
    } catch (err) {
      console.error("Error fetching vaults performance:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch performance data");
    } finally {
      setLoading(false);
    }
  }, [memoizedVaultIds, fetchVaultPerformance]);

  // Fetch performance data when vault IDs change
  useEffect(() => {
    if (memoizedVaultIds.length > 0) {
      fetchAllVaultsPerformance();
    }
  }, [memoizedVaultIds, fetchAllVaultsPerformance]);

  // Helper function to get performance data for a specific vault
  const getVaultPerformance = useCallback((vaultId: string): VaultPerformanceMetrics => {
    return performanceData[vaultId] || {
      vaultId,
      performance14D: null,
      performance30D: null,
      loading: false,
      error: null,
    };
  }, [performanceData]);

  // Calculate overall loading state
  const isAnyVaultLoading = Object.values(performanceData).some(vault => vault.loading);

  return {
    performanceData,
    loading: loading || isAnyVaultLoading,
    error,
    getVaultPerformance,
    refetchVaultPerformance: fetchVaultPerformance,
    refetchAllVaultsPerformance: fetchAllVaultsPerformance,
  };
};