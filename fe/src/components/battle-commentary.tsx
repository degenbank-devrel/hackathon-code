"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Clock } from "lucide-react";
import { BattleComment } from "@/lib/api";

interface BattleCommentaryProps {
  comments?: BattleComment[];
  loading: boolean;
  error: string | null;
}

export function BattleCommentary({
  comments = [],
  loading,
  error,
}: BattleCommentaryProps) {
  // Ensure comments is always a valid array
  const validComments = Array.isArray(comments) ? comments : [];

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } catch {
      return "Unknown time";
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 rounded-none bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5" />
            AI Battle Commentary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
            <span className="ml-2 text-white/80">Loading commentary...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border/50 rounded-none bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5" />
            AI Battle Commentary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-red-400">Failed to load commentary</p>
            <p className="text-sm text-white/60">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 rounded-none bg-black/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageSquare className="h-5 w-5" />
          AI Battle Commentary
          <Badge
            variant="outline"
            className="border-primary text-primary border-non ml-auto rounded-none border-0"
          >
            {validComments.length} Comments
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {validComments.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-white/40" />
            <p className="mt-2 text-white/60">No commentary available yet</p>
            <p className="text-sm text-white/40">
              AI commentary will appear as the battle progresses
            </p>
          </div>
        ) : (
          <div className="custom-scrollbar h-96 w-full overflow-y-auto pr-2">
            <div className="space-y-4">
              {validComments.map((comment) => (
                <div
                  key={comment.comment_id}
                  className="border-border/30 border bg-black/20 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-blue-400 text-blue-400"
                      >
                        {/* {comment.commentator} */}
                        AI
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(comment.comment_at)}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">
                    {comment.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
