import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService, UserTxHistory, GetUserTxHistoryResponse } from '@/lib/api';

interface UseUserTxHistoryProps {
  userId: string | null;
  skip?: number;
  limit?: number;
  token?: string;
}

interface UseUserTxHistoryReturn {
  history: UserTxHistory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  totalLoaded: number;
  total: number;
}

export const useUserTxHistory = ({
  userId,
  skip = 0,
  limit = 10,
  token,
}: UseUserTxHistoryProps): UseUserTxHistoryReturn => {
  const [history, setHistory] = useState<UserTxHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSkip, setCurrentSkip] = useState(skip);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const memoizedUserId = useMemo(() => userId, [userId]);
  const memoizedToken = useMemo(() => token, [token]);

  const fetchHistory = useCallback(
    async (skipValue: number = 0, append: boolean = false) => {
      if (!memoizedUserId) {
        setHistory([]);
        setError(null);
        setHasMore(false);
        setTotal(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response: GetUserTxHistoryResponse = await apiService.getUserTxHistory(
          memoizedUserId,
          skipValue,
          limit,
          memoizedToken
        );

        if (append) {
          setHistory((prev) => [...prev, ...response.results]);
        } else {
          setHistory(response.results);
        }

        setTotal(response.total);
        // Check if we have more data
        setHasMore(response.results.length === limit && (skipValue + response.results.length) < response.total);
        setCurrentSkip(skipValue + response.results.length);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transaction history';
        setError(errorMessage);
        if (!append) {
          setHistory([]);
          setTotal(0);
        }
      } finally {
        setLoading(false);
      }
    },
    [memoizedUserId, limit, memoizedToken]
  );

  const refetch = useCallback(async () => {
    setCurrentSkip(0);
    await fetchHistory(0, false);
  }, [fetchHistory]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchHistory(currentSkip, true);
    }
  }, [fetchHistory, currentSkip, hasMore, loading]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    history,
    loading,
    error,
    refetch,
    hasMore,
    loadMore,
    totalLoaded: history.length,
    total,
  };
};