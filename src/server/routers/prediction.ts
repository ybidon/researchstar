import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const predictionRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        competitionId: z.string(),
        values: z.array(
          z.object({
            metricId: z.string(),
            value: z.number(),
          })
        ),
        isPublic: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const competition = await ctx.db.competition.findUnique({
        where: { id: input.competitionId },
        include: { metrics: true },
      });

      if (!competition) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Competition not found",
        });
      }

      if (competition.status !== "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Competition is not open for predictions",
        });
      }

      const now = new Date();
      if (now > competition.submissionClose) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submission deadline has passed",
        });
      }

      // Validate all metric IDs exist
      const metricIds = competition.metrics.map((m) => m.id);
      for (const value of input.values) {
        if (!metricIds.includes(value.metricId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid metric ID: ${value.metricId}`,
          });
        }
      }

      // Upsert prediction
      const prediction = await ctx.db.prediction.upsert({
        where: {
          userId_competitionId: {
            userId: ctx.session.user.id,
            competitionId: input.competitionId,
          },
        },
        create: {
          userId: ctx.session.user.id,
          competitionId: input.competitionId,
          isPublic: input.isPublic,
          values: {
            create: input.values.map((v) => ({
              metricId: v.metricId,
              value: v.value,
            })),
          },
        },
        update: {
          isPublic: input.isPublic,
          values: {
            deleteMany: {},
            create: input.values.map((v) => ({
              metricId: v.metricId,
              value: v.value,
            })),
          },
        },
        include: {
          values: true,
        },
      });

      return prediction;
    }),

  getMine: protectedProcedure
    .input(z.object({ competitionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const prediction = await ctx.db.prediction.findUnique({
        where: {
          userId_competitionId: {
            userId: ctx.session.user.id,
            competitionId: input.competitionId,
          },
        },
        include: {
          values: {
            include: {
              metric: true,
            },
          },
        },
      });

      return prediction;
    }),

  listByCompetition: publicProcedure
    .input(
      z.object({
        competitionId: z.string(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const competition = await ctx.db.competition.findUnique({
        where: { id: input.competitionId },
      });

      if (!competition) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Competition not found",
        });
      }

      // Only show predictions after competition is closed
      if (competition.status === "UPCOMING" || competition.status === "OPEN") {
        return { predictions: [], nextCursor: undefined };
      }

      const predictions = await ctx.db.prediction.findMany({
        where: {
          competitionId: input.competitionId,
          isPublic: true,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
          values: {
            include: {
              metric: true,
            },
          },
        },
        orderBy: { rank: "asc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined = undefined;
      if (predictions.length > input.limit) {
        const nextItem = predictions.pop();
        nextCursor = nextItem!.id;
      }

      return { predictions, nextCursor };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const prediction = await ctx.db.prediction.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
          competition: {
            include: {
              company: true,
            },
          },
          values: {
            include: {
              metric: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!prediction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prediction not found",
        });
      }

      if (!prediction.isPublic && ctx.session?.user?.id !== prediction.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This prediction is private",
        });
      }

      return prediction;
    }),
});
