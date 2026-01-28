"use client";

import { use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompetitionLeaderboard } from "@/components/leaderboard/competition-leaderboard";
import { ArrowLeft, Loader2, Trophy, Users, Target } from "lucide-react";

export default function CompetitionLeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();

  const { data: competition, isLoading } = trpc.competition.getById.useQuery({
    id,
  });

  const { data: userRank } = trpc.leaderboard.userRankInCompetition.useQuery(
    { competitionId: id, userId: session?.user?.id ?? "" },
    { enabled: !!session?.user?.id }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Competition not found</h2>
        <Link href="/competitions">
          <Button variant="link">Back to competitions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/competitions/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <Badge variant="outline">{competition.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">{competition.title}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {competition._count.predictions}
            </div>
          </CardContent>
        </Card>

        {userRank?.rank && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{userRank.rank}</div>
            </CardContent>
          </Card>
        )}

        {userRank?.totalScore !== null && userRank?.totalScore !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userRank.totalScore.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Lower is better
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <CompetitionLeaderboard
            competitionId={id}
            highlightUserId={session?.user?.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
