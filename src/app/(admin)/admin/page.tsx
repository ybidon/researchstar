"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Target, Building2, ArrowRight, Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage competitions, companies, and users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Competitions
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalCompetitions ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Competitions
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeCompetitions ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Predictions
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalPredictions ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/competitions/new">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <Trophy className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Create Competition</h3>
                <p className="text-sm text-muted-foreground">
                  Set up a new earnings prediction competition
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/companies/new">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <Building2 className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Add Company</h3>
                <p className="text-sm text-muted-foreground">
                  Register a new company for competitions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">Manage Users</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage user accounts
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Management Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Competitions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage all competitions, enter results, and trigger scoring.
            </p>
            <Link href="/admin/competitions">
              <Button>
                Manage Competitions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Add and manage companies available for competitions.
            </p>
            <Link href="/admin/companies">
              <Button>
                Manage Companies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
