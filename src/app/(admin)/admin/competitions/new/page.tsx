"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const competitionSchema = z.object({
  companyId: z.string().min(1, "Please select a company"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  quarter: z.number().min(1).max(4),
  fiscalYear: z.number().min(2020).max(2100),
  earningsDate: z.string().min(1, "Earnings date is required"),
  submissionOpen: z.string().min(1, "Submission open date is required"),
  submissionClose: z.string().min(1, "Submission close date is required"),
});

type CompetitionFormValues = z.infer<typeof competitionSchema>;

export default function NewCompetitionPage() {
  const router = useRouter();
  const { data: companies } = trpc.company.list.useQuery({});

  const form = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      title: "",
      description: "",
      quarter: 1,
      fiscalYear: new Date().getFullYear(),
      earningsDate: "",
      submissionOpen: "",
      submissionClose: "",
    },
  });

  const { mutate: createCompetition, isPending } =
    trpc.admin.createCompetition.useMutation({
      onSuccess: () => {
        toast.success("Competition created successfully!");
        router.push("/admin/competitions");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  function onSubmit(data: CompetitionFormValues) {
    createCompetition({
      ...data,
      earningsDate: new Date(data.earningsDate).toISOString(),
      submissionOpen: new Date(data.submissionOpen).toISOString(),
      submissionClose: new Date(data.submissionClose).toISOString(),
      metrics: [
        { name: "Revenue", code: "REVENUE", unit: "B", weight: 0.25, order: 0 },
        { name: "EPS", code: "EPS", unit: "$", weight: 0.25, order: 1 },
        { name: "Net Income", code: "NET_INCOME", unit: "B", weight: 0.2, order: 2 },
        {
          name: "Forward Revenue Guidance",
          code: "FORWARD_REVENUE_GUIDANCE",
          unit: "B",
          weight: 0.15,
          order: 3,
        },
        {
          name: "Forward EPS Guidance",
          code: "FORWARD_EPS_GUIDANCE",
          unit: "$",
          weight: 0.15,
          order: 4,
        },
      ],
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/competitions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Competition
          </h1>
          <p className="text-muted-foreground mt-1">
            Set up a new earnings prediction competition
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Competition Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.ticker})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Tesla Q1 2025 Earnings"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add details about this competition..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quarter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quarter</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(parseInt(v))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Q1</SelectItem>
                          <SelectItem value="2">Q2</SelectItem>
                          <SelectItem value="3">Q3</SelectItem>
                          <SelectItem value="4">Q4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fiscalYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiscal Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="earningsDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Earnings Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      When the earnings will be announced
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="submissionOpen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submissions Open</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      When users can start submitting predictions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="submissionClose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submissions Close</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      Deadline for predictions (1 day before earnings recommended)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Competition
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
