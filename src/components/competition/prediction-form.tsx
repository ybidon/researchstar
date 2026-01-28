"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatPercentage } from "@/lib/utils";

interface Metric {
  id: string;
  name: string;
  code: string;
  unit?: string | null;
  description?: string | null;
  weight: number;
}

interface PredictionFormProps {
  competitionId: string;
  metrics: Metric[];
  existingPrediction?: {
    values: Array<{ metricId: string; value: number }>;
    isPublic: boolean;
  } | null;
  isDeadlinePassed: boolean;
}

export function PredictionForm({
  competitionId,
  metrics,
  existingPrediction,
  isDeadlinePassed,
}: PredictionFormProps) {
  const utils = trpc.useUtils();

  const predictionSchema = z.object({
    values: z.array(
      z.object({
        metricId: z.string(),
        value: z.union([z.number(), z.literal("")]).transform((val) =>
          val === "" ? 0 : val
        ),
      })
    ),
    isPublic: z.boolean(),
  });

  type PredictionFormValues = {
    values: Array<{ metricId: string; value: number | "" }>;
    isPublic: boolean;
  };

  const defaultValues: PredictionFormValues = {
    values: metrics.map((m) => {
      const existing = existingPrediction?.values.find((v) => v.metricId === m.id);
      return {
        metricId: m.id,
        value: existing?.value ?? "",
      };
    }),
    isPublic: existingPrediction?.isPublic ?? true,
  };

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionSchema),
    defaultValues,
  });

  const { mutate: upsertPrediction, isPending } =
    trpc.prediction.upsert.useMutation({
      onSuccess: () => {
        toast.success(
          existingPrediction
            ? "Prediction updated successfully!"
            : "Prediction submitted successfully!"
        );
        utils.prediction.getMine.invalidate({ competitionId });
        utils.competition.getWithMyPrediction.invalidate({ id: competitionId });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  function onSubmit(data: PredictionFormValues) {
    upsertPrediction({
      competitionId,
      values: data.values.map((v) => ({
        metricId: v.metricId,
        value: v.value === "" ? 0 : v.value,
      })),
      isPublic: data.isPublic,
    });
  }

  const getUnitLabel = (unit: string | null | undefined) => {
    if (!unit) return "";
    if (unit === "B") return " (Billions $)";
    if (unit === "M") return " (Millions $)";
    if (unit === "$") return " ($)";
    if (unit === "%") return " (%)";
    return ` (${unit})`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {metrics.map((metric, index) => (
          <Card key={metric.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>
                  {metric.name}
                  {getUnitLabel(metric.unit)}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  Weight: {formatPercentage(metric.weight * 100, 0)}
                </span>
              </CardTitle>
              {metric.description && (
                <p className="text-sm text-muted-foreground">
                  {metric.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name={`values.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter your prediction"
                        disabled={isDeadlinePassed || isPending}
                        value={field.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? "" : parseFloat(val));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Make prediction public
                    </FormLabel>
                    <FormDescription>
                      Allow other users to see your prediction after results are
                      announced
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isDeadlinePassed || isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isDeadlinePassed || isPending}
          className="w-full"
          size="lg"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isDeadlinePassed
            ? "Deadline Passed"
            : existingPrediction
            ? "Update Prediction"
            : "Submit Prediction"}
        </Button>
      </form>
    </Form>
  );
}
