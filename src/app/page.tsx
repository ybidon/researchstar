import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TrendingUp, Trophy, Users, Target, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Predict Earnings.
                <br />
                <span className="text-primary">Prove Your Insight.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Compete against other analysts to predict company earnings. Submit your
                predictions before earnings reports and climb the leaderboard.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/competitions">View Competitions</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20 dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),transparent)]" />
        </section>

        {/* How It Works */}
        <section className="border-t py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-muted-foreground">
                Three simple steps to start competing
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">1. Choose a Competition</CardTitle>
                  <CardDescription>
                    Browse active competitions for companies like Tesla. Each competition
                    focuses on upcoming earnings reports.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">2. Submit Predictions</CardTitle>
                  <CardDescription>
                    Enter your predictions for key metrics like Revenue, EPS, and Net
                    Income before the deadline.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">3. Compete & Win</CardTitle>
                  <CardDescription>
                    After earnings are announced, scores are calculated. The most accurate
                    predictions win and climb the leaderboard.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/50 py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Why ResearchStar?
              </h2>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Fair Competition</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Weighted scoring ensures all metrics matter equally
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Social Features</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Follow top analysts and learn from the best
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Multiple Metrics</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Predict Revenue, EPS, Net Income, and guidance
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Track Progress</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  View your history and improve over time
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Test Your Predictions?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Join thousands of analysts competing to make the most accurate earnings
                predictions.
              </p>
              <div className="mt-10">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
