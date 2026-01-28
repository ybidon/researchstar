"use client";

import { use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatNumber } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Medal,
  Target,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { data: session } = useSession();

  const { data: user, isLoading } = trpc.user.getByUsername.useQuery({
    username,
  });

  const { data: predictionsData, isLoading: loadingPredictions } =
    trpc.user.getPredictionHistory.useQuery({
      username,
      limit: 10,
    });

  const isOwnProfile = session?.user?.username === username;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">User not found</h2>
        <Link href="/leaderboard">
          <Button variant="link">View Leaderboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/leaderboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-2xl">
                {user.name?.[0]?.toUpperCase() ||
                  user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {user.name || user.username}
                </h2>
                {user.globalRank && user.globalRank <= 3 && (
                  <Badge className="bg-yellow-500">
                    <Medal className="h-3 w-3 mr-1" />
                    Top {user.globalRank}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{user.username}</p>
              {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(user.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {user._count.followers} followers
                </span>
                <span>{user._count.following} following</span>
              </div>
            </div>

            {isOwnProfile ? (
              <Link href="/profile/settings">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            ) : (
              session && <FollowButton username={username} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.globalRank ? `#${user.globalRank}` : "Unranked"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalPredictions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wins</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalWins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.averageScore ? `${formatNumber(user.averageScore, 1)}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Lower is better</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for History */}
      <Tabs defaultValue="predictions">
        <TabsList>
          <TabsTrigger value="predictions">Prediction History</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPredictions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : predictionsData?.predictions &&
                predictionsData.predictions.length > 0 ? (
                <div className="space-y-4">
                  {predictionsData.predictions.map((prediction) => (
                    <div
                      key={prediction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <Link
                          href={`/competitions/${prediction.competition.id}`}
                          className="font-medium hover:underline"
                        >
                          {prediction.competition.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {prediction.competition.company.ticker} •{" "}
                          {formatDate(prediction.submittedAt)}
                        </p>
                      </div>
                      <div className="text-right">
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
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {prediction.totalScore !== null && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Score: {formatNumber(prediction.totalScore, 2)}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {isOwnProfile
                      ? "You haven't made any public predictions yet."
                      : "No public predictions to show."}
                  </p>
                  {isOwnProfile && (
                    <Link href="/competitions">
                      <Button className="mt-4">Make a Prediction</Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FollowButton({ username }: { username: string }) {
  const utils = trpc.useUtils();

  const { data: isFollowing, isLoading } = trpc.follow.isFollowing.useQuery({
    username,
  });

  const { mutate: follow, isPending: isFollowPending } =
    trpc.follow.follow.useMutation({
      onSuccess: () => {
        utils.follow.isFollowing.invalidate({ username });
        utils.user.getByUsername.invalidate({ username });
      },
    });

  const { mutate: unfollow, isPending: isUnfollowPending } =
    trpc.follow.unfollow.useMutation({
      onSuccess: () => {
        utils.follow.isFollowing.invalidate({ username });
        utils.user.getByUsername.invalidate({ username });
      },
    });

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  const isPending = isFollowPending || isUnfollowPending;

  if (isFollowing) {
    return (
      <Button
        variant="outline"
        onClick={() => unfollow({ username })}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unfollow"}
      </Button>
    );
  }

  return (
    <Button onClick={() => follow({ username })} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Follow"}
    </Button>
  );
}
