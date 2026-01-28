"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "./countdown-timer";
import { formatDate } from "@/lib/utils";
import { Calendar, Users } from "lucide-react";

interface CompetitionCardProps {
  competition: {
    id: string;
    title: string;
    company: { name: string; ticker: string; logoUrl?: string | null };
    status: string;
    submissionClose: Date;
    earningsDate: Date;
    _count: { predictions: number };
  };
  userHasPrediction?: boolean;
}

export function CompetitionCard({
  competition,
  userHasPrediction,
}: CompetitionCardProps) {
  const isOpen = competition.status === "OPEN";
  const isUpcoming = competition.status === "UPCOMING";
  const isCompleted = competition.status === "COMPLETED";

  const getStatusVariant = () => {
    switch (competition.status) {
      case "OPEN":
        return "default";
      case "UPCOMING":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "CLOSED":
      case "SCORING":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted font-bold text-lg">
          {competition.company.ticker.slice(0, 2)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{competition.title}</h3>
            <Badge variant={getStatusVariant()}>{competition.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {competition.company.name} ({competition.company.ticker})
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Earnings Date</p>
              <p className="font-medium">{formatDate(competition.earningsDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Predictions</p>
              <p className="font-medium">{competition._count.predictions}</p>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Deadline</p>
            <CountdownTimer deadline={competition.submissionClose} />
          </div>
        )}

        {isUpcoming && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Opens {formatDate(competition.submissionClose)}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/competitions/${competition.id}`} className="w-full">
          <Button
            className="w-full"
            variant={isOpen ? "default" : "outline"}
          >
            {isOpen
              ? userHasPrediction
                ? "Edit Prediction"
                : "Make Prediction"
              : isCompleted
              ? "View Results"
              : "View Details"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
