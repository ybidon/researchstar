"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompetitionCard } from "@/components/competition/competition-card";
import { Trophy, Target, TrendingUp, Medal, ArrowRight, Loader2, Calendar, Clock } from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: user } = trpc.user.getMe.useQuery();
  const { data: activeCompetitions, isLoading: loadingCompetitions } =
    trpc.competition.getActive.useQuery();
  const { data: recentCompletedData } = trpc.competition.getRecent.useQuery({ limit: 3 });
  const { data: myPredictionsData, isLoading: loadingPredictions } =
    trpc.user.getPredictionHistory.useQuery(
      { username: session?.user?.username ?? "", limit: 5 },
      { enabled: !!session?.user?.username }
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s an overview of your prediction performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Predictions
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.totalPredictions ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wins</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.totalWins ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.averageScore
                ? `${formatNumber(user.averageScore, 1)}%`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Lower is better
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.globalRank ? `#${user.globalRank}` : "Unranked"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Competitions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Active Competitions</h2>
          <Link href="/competitions">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loadingCompetitions ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activeCompetitions && activeCompetitions.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeCompetitions.slice(0, 3).map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No active competitions at the moment.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later for new competitions!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Your Recent Predictions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Recent Predictions</CardTitle>
                <CardDescription>Your latest prediction activity</CardDescription>
              </div>
              <Link href={`/users/${session?.user?.username}`}>
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loadingPredictions ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : myPredictionsData?.predictions && myPredictionsData.predictions.length > 0 ? (
              <div className="space-y-3">
                {myPredictionsData.predictions.map((prediction) => (
                  <Link
                    key={prediction.id}
                    href={`/competitions/${prediction.competition.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {prediction.competition.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {prediction.competition.company.ticker} • {formatDate(prediction.submittedAt)}
                      </p>
                    </div>
                    <div className="ml-4">
                      {prediction.rank ? (
                        <Badge
                          variant={prediction.rank <= 3 ? "default" : "outline"}
                          className={
                            prediction.rank === 1
                              ? "bg-yellow-500"
                              : prediction.rank === 2
                              ? "bg-gray-400"
                              : prediction.rank === 3
                              ? "bg-amber-600"
                              : ""
                          }
                        >
                          #{prediction.rank}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Target className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No predictions yet</p>
                <Link href="/competitions">
                  <Button className="mt-3" size="sm">
                    Make Your First Prediction
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Completed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recently Completed</CardTitle>
                <CardDescription>Check out the results</CardDescription>
              </div>
              <Link href="/competitions">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentCompletedData && recentCompletedData.length > 0 ? (
              <div className="space-y-3">
                {recentCompletedData.map((competition) => (
                  <Link
                    key={competition.id}
                    href={`/competitions/${competition.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{competition.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {competition.company.ticker} • {competition._count.predictions} participants
                      </p>
                    </div>
                    <div className="ml-4">
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(competition.earningsDate)}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No completed competitions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/competitions">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <Trophy className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Browse Competitions</h3>
                <p className="text-sm text-muted-foreground">
                  Find active competitions to participate in
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/leaderboard">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <Medal className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">View Leaderboard</h3>
                <p className="text-sm text-muted-foreground">
                  See how you rank against other predictors
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/users/${session?.user?.username}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <Target className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  View your prediction history and stats
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
