import { useState, useEffect, useCallback } from 'react';
import { apiService, VaultPerformanceResponse } from '@/lib/api';

export interface PerformanceDataPoint {
  date: string;
  value: number;
  roi: number;
  sharePrice: number;
  vaultBalance: number;
}

export interface PerformanceSummary {
  totalReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export const useVaultPerformance = (vaultId: string) => {
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformanceData = useCallback(async (period: '14D' | '30D' = '30D') => {
    if (!vaultId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getVaultPerformance(vaultId, period);
      
      // Transform API response to match chart data format
      const transformedData: PerformanceDataPoint[] = response.data.map((item) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit' 
        }),
        value: item.value,
        roi: item.roi,
        sharePrice: item.sharePrice,
        vaultBalance: item.vaultBalance,
      }));

      setPerformanceData(transformedData);
      setSummary(response.summary);
    } catch (err) {
      console.error('Failed to fetch vault performance:', err);
      setError('Failed to load performance data');
      
      // Fallback to mock data if API fails
      const mockData = generateMockData(period);
      setPerformanceData(mockData);
      setSummary(generateMockSummary());
    } finally {
      setLoading(false);
    }
  }, [vaultId]);

  // Generate mock data as fallback
  const generateMockData = (period: '14D' | '30D'): PerformanceDataPoint[] => {
    const days = period === '14D' ? 14 : 30;
    const data: PerformanceDataPoint[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const roi = Math.random() * 40 - 5; // Random ROI between -5% and 35%
      const value = 1000 + (roi * 10); // Base value with ROI impact
      const sharePrice = 1 + (roi / 100);
      const vaultBalance = 5500000 + (roi * 50000);

      data.push({
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit' 
        }),
        value,
        roi,
        sharePrice,
        vaultBalance,
      });
    }

    return data;
  };

  // Generate mock summary data
  const generateMockSummary = (): PerformanceSummary => ({
    totalReturn: Math.random() * 10 + 2, // 2-12%
    volatility: Math.random() * 5 + 8, // 8-13%
    sharpeRatio: Math.random() * 1 + 1, // 1-2
    maxDrawdown: -(Math.random() * 3 + 1), // -1% to -4%
  });

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  return {
    performanceData,
    summary,
    loading,
    error,
    refetch: fetchPerformanceData,
  };
};