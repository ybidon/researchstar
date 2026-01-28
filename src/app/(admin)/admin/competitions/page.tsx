"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { Plus, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCompetitionsPage() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.competition.list.useQuery({ limit: 50 });

  const { mutate: updateStatus } = trpc.admin.updateCompetitionStatus.useMutation({
    onSuccess: () => {
      toast.success("Competition status updated");
      utils.competition.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "default";
      case "UPCOMING":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "SCORING":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
          <p className="text-muted-foreground mt-2">
            Manage earnings prediction competitions
          </p>
        </div>
        <Link href="/admin/competitions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Competition
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Competitions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data?.competitions && data.competitions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Earnings Date</TableHead>
                  <TableHead>Predictions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.competitions.map((competition) => (
                  <TableRow key={competition.id}>
                    <TableCell className="font-medium">
                      {competition.title}
                    </TableCell>
                    <TableCell>
                      {competition.company.ticker}
                    </TableCell>
                    <TableCell>
                      {formatDate(competition.earningsDate)}
                    </TableCell>
                    <TableCell>
                      {competition._count.predictions}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(competition.status)}>
                        {competition.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/competitions/${competition.id}`}>
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/competitions/${competition.id}/results`}>
                              Enter Results
                            </Link>
                          </DropdownMenuItem>
                          {competition.status === "UPCOMING" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus({
                                  competitionId: competition.id,
                                  status: "OPEN",
                                })
                              }
                            >
                              Open for Predictions
                            </DropdownMenuItem>
                          )}
                          {competition.status === "OPEN" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatus({
                                  competitionId: competition.id,
                                  status: "CLOSED",
                                })
                              }
                            >
                              Close Predictions
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No competitions yet.</p>
              <Link href="/admin/competitions/new">
                <Button className="mt-4">Create First Competition</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
