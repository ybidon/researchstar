"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export default function CompetitionResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: competition, isLoading } = trpc.competition.getById.useQuery({
    id,
  });

  const [results, setResults] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  const { mutate: submitResults, isPending: isSubmitting } =
    trpc.admin.submitResults.useMutation({
      onSuccess: () => {
        toast.success("Results submitted successfully!");
        utils.competition.getById.invalidate({ id });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: triggerScoring, isPending: isScoring } =
    trpc.admin.triggerScoring.useMutation({
      onSuccess: (data) => {
        toast.success(`Scored ${data.scored} predictions!`);
        router.push("/admin/competitions");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

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
        <p className="text-muted-foreground">Competition not found</p>
        <Link href="/admin/competitions">
          <Button variant="link">Back to competitions</Button>
        </Link>
      </div>
    );
  }

  const hasResults = !!competition.results;
  const isScored = competition.status === "COMPLETED";

  const handleSubmitResults = () => {
    const resultValues = competition.metrics.map((metric) => ({
      metricId: metric.id,
      actualValue: results[metric.id] || 0,
    }));

    submitResults({
      competitionId: id,
      results: resultValues,
      notes,
    });
  };

  const handleTriggerScoring = () => {
    triggerScoring({ competitionId: id });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/competitions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Enter Results</h1>
            <Badge>{competition.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">{competition.title}</p>
        </div>
      </div>

      {competition.status === "OPEN" || competition.status === "UPCOMING" ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              The competition must be closed before entering results.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Current status: {competition.status}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Actual Earnings Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {competition.metrics.map((metric) => {
                const existingResult = competition.results?.metricResults.find(
                  (r) => r.metricId === metric.id
                );

                return (
                  <div key={metric.id} className="space-y-2">
                    <Label htmlFor={metric.id}>
                      {metric.name}{" "}
                      {metric.unit && (
                        <span className="text-muted-foreground">
                          ({metric.unit})
                        </span>
                      )}
                    </Label>
                    <Input
                      id={metric.id}
                      type="number"
                      step="any"
                      placeholder="Enter actual value"
                      defaultValue={existingResult?.actualValue ?? ""}
                      onChange={(e) =>
                        setResults((prev) => ({
                          ...prev,
                          [metric.id]: parseFloat(e.target.value) || 0,
                        }))
                      }
                      disabled={isScored}
                    />
                    {metric.description && (
                      <p className="text-sm text-muted-foreground">
                        {metric.description}
                      </p>
                    )}
                  </div>
                );
              })}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about these results..."
                  defaultValue={competition.results?.notes ?? ""}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isScored}
                />
              </div>

              {!isScored && (
                <Button
                  onClick={handleSubmitResults}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {hasResults ? "Update Results" : "Submit Results"}
                </Button>
              )}
            </CardContent>
          </Card>

          {hasResults && !isScored && (
            <Card>
              <CardHeader>
                <CardTitle>Calculate Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Results have been entered. You can now trigger scoring to
                  calculate rankings for all predictions.
                </p>
                <Button
                  onClick={handleTriggerScoring}
                  disabled={isScoring}
                  className="w-full"
                >
                  {isScoring && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Calculate Scores & Finalize
                </Button>
              </CardContent>
            </Card>
          )}

          {isScored && (
            <Card className="bg-green-50 dark:bg-green-950">
              <CardContent className="py-6 text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="font-medium text-green-800 dark:text-green-200">
                  This competition has been scored and completed!
                </p>
                <Link href={`/competitions/${id}`}>
                  <Button variant="link" className="mt-2">
                    View Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
