"use client";

import Link from "next/link";
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
import { formatNumber } from "@/lib/utils";
import { Medal } from "lucide-react";

interface User {
  id: string;
  username: string;
  name?: string | null;
  image?: string | null;
  totalPredictions: number;
  totalWins: number;
  averageScore?: number | null;
  globalRank?: number | null;
}

interface LeaderboardTableProps {
  users: User[];
  startRank?: number;
  highlightUserId?: string;
}

export function LeaderboardTable({
  users,
  startRank = 1,
  highlightUserId,
}: LeaderboardTableProps) {
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Rank</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="text-right">Predictions</TableHead>
          <TableHead className="text-right">Wins</TableHead>
          <TableHead className="text-right">Avg. Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user, index) => {
          const rank = user.globalRank || startRank + index;
          const isHighlighted = user.id === highlightUserId;

          return (
            <TableRow
              key={user.id}
              className={isHighlighted ? "bg-primary/5" : undefined}
            >
              <TableCell className="font-medium">
                {getRankBadge(rank)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/users/${user.username}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback>
                      {user.name?.[0]?.toUpperCase() ||
                        user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name || user.username}</p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-right">
                {user.totalPredictions}
              </TableCell>
              <TableCell className="text-right">{user.totalWins}</TableCell>
              <TableCell className="text-right">
                {user.averageScore
                  ? `${formatNumber(user.averageScore, 1)}%`
                  : "N/A"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
