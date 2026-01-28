"use client";

import { use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CountdownTimer } from "@/components/competition/countdown-timer";
import { PredictionForm } from "@/components/competition/prediction-form";
import { CompetitionLeaderboard } from "@/components/leaderboard/competition-leaderboard";
import { formatDate, formatDateTime, formatPercentage } from "@/lib/utils";
import { Calendar, Users, Trophy, ArrowLeft, Loader2 } from "lucide-react";

export default function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();

  const { data, isLoading } = trpc.competition.getWithMyPrediction.useQuery(
    { id },
    { enabled: !!session }
  );

  const { data: publicCompetition, isLoading: loadingPublic } =
    trpc.competition.getById.useQuery({ id }, { enabled: !session });

  const competition = session ? data?.competition : publicCompetition;
  const myPrediction = data?.myPrediction;

  if (isLoading || loadingPublic) {
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

  const isOpen = competition.status === "OPEN";
  const isCompleted = competition.status === "COMPLETED";
  const isDeadlinePassed = new Date() > new Date(competition.submissionClose);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/competitions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {competition.title}
            </h1>
            <Badge
              variant={
                isOpen ? "default" : isCompleted ? "outline" : "secondary"
              }
            >
              {competition.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {competition.company.name} ({competition.company.ticker})
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Earnings Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatDate(competition.earningsDate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {competition._count.predictions}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isOpen && !isDeadlinePassed ? (
              <CountdownTimer deadline={competition.submissionClose} />
            ) : (
              <p className="text-lg font-medium">
                {formatDateTime(competition.submissionClose)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {competition.description && (
        <Card>
          <CardHeader>
            <CardTitle>About this Competition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{competition.description}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={isOpen && session ? "predict" : isCompleted ? "leaderboard" : "details"}>
        <TabsList>
          {isOpen && session && <TabsTrigger value="predict">Predict</TabsTrigger>}
          <TabsTrigger value="details">Metrics</TabsTrigger>
          {isCompleted && <TabsTrigger value="results">Results</TabsTrigger>}
          {isCompleted && <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>}
        </TabsList>

        {isOpen && session && (
          <TabsContent value="predict" className="mt-6">
            <div className="max-w-2xl">
              <PredictionForm
                competitionId={competition.id}
                metrics={competition.metrics}
                existingPrediction={myPrediction}
                isDeadlinePassed={isDeadlinePassed}
              />
            </div>
          </TabsContent>
        )}

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Metrics to Predict</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competition.metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      {metric.description && (
                        <p className="text-sm text-muted-foreground">
                          {metric.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">
                      Weight: {formatPercentage(metric.weight * 100, 0)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isCompleted && competition.results && (
          <TabsContent value="results" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Actual Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competition.metrics.map((metric) => {
                    const result = competition.results?.metricResults.find(
                      (r) => r.metricId === metric.id
                    );
                    return (
                      <div
                        key={metric.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{metric.name}</p>
                          {metric.unit && (
                            <p className="text-sm text-muted-foreground">
                              Unit: {metric.unit}
                            </p>
                          )}
                        </div>
                        <p className="text-xl font-bold">
                          {result ? result.actualValue.toLocaleString() : "N/A"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

          </TabsContent>
        )}

        {isCompleted && (
          <TabsContent value="leaderboard" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Competition Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CompetitionLeaderboard
                  competitionId={competition.id}
                  highlightUserId={session?.user?.id}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {!session && isOpen && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Sign in to submit your prediction
            </p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
