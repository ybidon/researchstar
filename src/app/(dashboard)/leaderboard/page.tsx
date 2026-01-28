"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Loader2, Trophy } from "lucide-react";

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const { data, isLoading } = trpc.leaderboard.global.useQuery({
    limit: 50,
    offset: 0,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Leaderboard</h1>
        <p className="text-muted-foreground mt-2">
          Top predictors ranked by wins and average accuracy
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data?.users && data.users.length > 0 ? (
            <LeaderboardTable
              users={data.users}
              highlightUserId={session?.user?.id}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No rankings yet. Be the first to make a prediction!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
