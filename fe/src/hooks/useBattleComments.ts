import { useState, useEffect, useCallback } from "react";
import { apiService, BattleComment } from "@/lib/api";

export interface UseBattleCommentsReturn {
  comments: BattleComment[];
  loading: boolean;
  error: string | null;
  refreshComments: () => Promise<void>;
}

export function useBattleComments(battleId: string | number | null): UseBattleCommentsReturn {
  const [comments, setComments] = useState<BattleComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!battleId) {
      setComments([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const commentsData = await apiService.getBattleComments(battleId);
      setComments(commentsData || []);
    } catch (err) {
      console.error('Failed to fetch battle comments:', err);
      setError(err instanceof Error ? err.message : "Failed to fetch comments");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [battleId]);

  const refreshComments = useCallback(async () => {
    await fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    refreshComments,
  };
}