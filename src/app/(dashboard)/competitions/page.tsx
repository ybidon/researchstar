"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { CompetitionCard } from "@/components/competition/competition-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function CompetitionsPage() {
  const [activeTab, setActiveTab] = useState<string>("active");

  const { data: activeCompetitions, isLoading: loadingActive } =
    trpc.competition.getActive.useQuery(undefined, {
      enabled: activeTab === "active",
    });

  const { data: completedData, isLoading: loadingCompleted } =
    trpc.competition.list.useQuery(
      { status: "COMPLETED", limit: 20 },
      { enabled: activeTab === "completed" }
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
        <p className="text-muted-foreground mt-2">
          Browse and participate in earnings prediction competitions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {loadingActive ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : activeCompetitions && activeCompetitions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No active competitions at the moment.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later for new competitions!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {loadingCompleted ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : completedData?.competitions &&
            completedData.competitions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedData.competitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No completed competitions yet.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
