"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatPercentage } from "@/lib/utils";
import { Loader2, Medal, Trophy } from "lucide-react";

interface CompetitionLeaderboardProps {
  competitionId: string;
  highlightUserId?: string;
}

export function CompetitionLeaderboard({
  competitionId,
  highlightUserId,
}: CompetitionLeaderboardProps) {
  const { data, isLoading } = trpc.leaderboard.competition.useQuery({
    competitionId,
    limit: 50,
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-500">
          <Medal className="h-3 w-3 mr-1" />
          1st
        </Badge>
      );
    if (rank === 2)
      return (
        <Badge className="bg-gray-400 hover:bg-gray-400">
          <Medal className="h-3 w-3 mr-1" />
          2nd
        </Badge>
      );
    if (rank === 3)
      return (
        <Badge className="bg-amber-600 hover:bg-amber-600">
          <Medal className="h-3 w-3 mr-1" />
          3rd
        </Badge>
      );
    return <span className="text-muted-foreground">#{rank}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.isScored) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Leaderboard will be available after the competition is scored.
        </p>
      </div>
    );
  }

  if (data.predictions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No predictions to show.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.total} participant{data.total !== 1 ? "s" : ""}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Error %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.predictions.map((prediction) => {
            const isHighlighted = prediction.user.id === highlightUserId;

            return (
              <TableRow
                key={prediction.id}
                className={isHighlighted ? "bg-primary/5" : undefined}
              >
                <TableCell className="font-medium">
                  {prediction.rank && getRankBadge(prediction.rank)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/users/${prediction.user.username}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={prediction.user.image || undefined} />
                      <AvatarFallback>
                        {prediction.user.name?.[0]?.toUpperCase() ||
                          prediction.user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {prediction.user.name || prediction.user.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{prediction.user.username}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {prediction.totalScore !== null
                    ? formatNumber(prediction.totalScore, 2)
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {prediction.totalScore !== null
                    ? formatPercentage(prediction.totalScore, 1)
                    : "N/A"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
