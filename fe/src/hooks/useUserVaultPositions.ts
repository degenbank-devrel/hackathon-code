import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService, UserVaultPosition } from '@/lib/api';

interface UseUserVaultPositionsProps {
  userId: string | null;
  skip?: number;
  limit?: number;
  token?: string;
}

interface UseUserVaultPositionsReturn {
  positions: UserVaultPosition[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  totalLoaded: number;
}

export const useUserVaultPositions = ({
  userId,
  skip = 0,
  limit = 10,
  token,
}: UseUserVaultPositionsProps): UseUserVaultPositionsReturn => {
  const [positions, setPositions] = useState<UserVaultPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSkip, setCurrentSkip] = useState(skip);
  const [hasMore, setHasMore] = useState(true);

  const memoizedUserId = useMemo(() => userId, [userId]);
  const memoizedToken = useMemo(() => token, [token]);

  const fetchPositions = useCallback(
    async (skipValue: number = 0, append: boolean = false) => {
      if (!memoizedUserId) {
        setPositions([]);
        setError(null);
        setHasMore(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getUserVaultPositions(
          memoizedUserId,
          skipValue,
          limit,
          memoizedToken
        );

        if (append) {
          setPositions((prev) => [...prev, ...data]);
        } else {
          setPositions(data);
        }

        // Check if we have more data
        setHasMore(data.length === limit);
        setCurrentSkip(skipValue + data.length);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user vault positions';
        setError(errorMessage);
        if (!append) {
          setPositions([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [memoizedUserId, limit, memoizedToken]
  );

  const refetch = useCallback(async () => {
    setCurrentSkip(0);
    await fetchPositions(0, false);
  }, [fetchPositions]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchPositions(currentSkip, true);
    }
  }, [fetchPositions, currentSkip, hasMore, loading]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    positions,
    loading,
    error,
    refetch,
    hasMore,
    loadMore,
    totalLoaded: positions.length,
  };
};