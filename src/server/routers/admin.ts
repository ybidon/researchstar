import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { MetricCode } from "@prisma/client";
import { scoreCompetition, DEFAULT_METRIC_WEIGHTS } from "@/lib/scoring/calculator";

export const adminRouter = createTRPCRouter({
  createCompany: adminProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        logoUrl: z.string().url().optional(),
        sector: z.string().optional(),
        industry: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.company.findUnique({
        where: { ticker: input.ticker.toUpperCase() },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Company with this ticker already exists",
        });
      }

      const company = await ctx.db.company.create({
        data: {
          ticker: input.ticker.toUpperCase(),
          name: input.name,
          description: input.description,
          logoUrl: input.logoUrl,
          sector: input.sector,
          industry: input.industry,
        },
      });

      return company;
    }),

  createCompetition: adminProcedure
    .input(
      z.object({
        companyId: z.string(),
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        quarter: z.number().min(1).max(4),
        fiscalYear: z.number().min(2020).max(2100),
        earningsDate: z.string().datetime(),
        submissionOpen: z.string().datetime(),
        submissionClose: z.string().datetime(),
        metrics: z
          .array(
            z.object({
              name: z.string(),
              code: z.nativeEnum(MetricCode),
              description: z.string().optional(),
              unit: z.string().optional(),
              weight: z.number().min(0).max(1).default(1),
              order: z.number().default(0),
            })
          )
          .min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.company.findUnique({
        where: { id: input.companyId },
      });

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      const existing = await ctx.db.competition.findUnique({
        where: {
          companyId_quarter_fiscalYear: {
            companyId: input.companyId,
            quarter: input.quarter,
            fiscalYear: input.fiscalYear,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Competition for this quarter already exists",
        });
      }

      const competition = await ctx.db.competition.create({
        data: {
          companyId: input.companyId,
          title: input.title,
          description: input.description,
          quarter: input.quarter,
          fiscalYear: input.fiscalYear,
          earningsDate: new Date(input.earningsDate),
          submissionOpen: new Date(input.submissionOpen),
          submissionClose: new Date(input.submissionClose),
          status: "UPCOMING",
          metrics: {
            create: input.metrics.map((m, index) => ({
              name: m.name,
              code: m.code,
              description: m.description,
              unit: m.unit,
              weight: m.weight || DEFAULT_METRIC_WEIGHTS[m.code] || 1,
              order: m.order || index,
            })),
          },
        },
        include: {
          metrics: true,
        },
      });

      return competition;
    }),

  updateCompetitionStatus: adminProcedure
    .input(
      z.object({
        competitionId: z.string(),
        status: z.enum(["UPCOMING", "OPEN", "CLOSED", "SCORING", "COMPLETED", "CANCELLED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const competition = await ctx.db.competition.update({
        where: { id: input.competitionId },
        data: { status: input.status },
      });

      return competition;
    }),

  submitResults: adminProcedure
    .input(
      z.object({
        competitionId: z.string(),
        results: z.array(
          z.object({
            metricId: z.string(),
            actualValue: z.number(),
            source: z.string().optional(),
          })
        ),
        notes: z.string().optional(),
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

      if (competition.status === "UPCOMING" || competition.status === "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot submit results before competition is closed",
        });
      }

      // Validate metric IDs
      const metricIds = competition.metrics.map((m) => m.id);
      for (const result of input.results) {
        if (!metricIds.includes(result.metricId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid metric ID: ${result.metricId}`,
          });
        }
      }

      // Create or update results
      const competitionResult = await ctx.db.competitionResult.upsert({
        where: { competitionId: input.competitionId },
        create: {
          competitionId: input.competitionId,
          enteredById: ctx.session.user.id,
          notes: input.notes,
          metricResults: {
            create: input.results.map((r) => ({
              metricId: r.metricId,
              actualValue: r.actualValue,
              source: r.source,
            })),
          },
        },
        update: {
          enteredById: ctx.session.user.id,
          notes: input.notes,
          metricResults: {
            deleteMany: {},
            create: input.results.map((r) => ({
              metricId: r.metricId,
              actualValue: r.actualValue,
              source: r.source,
            })),
          },
        },
        include: {
          metricResults: true,
        },
      });

      // Update competition status to SCORING
      await ctx.db.competition.update({
        where: { id: input.competitionId },
        data: { status: "SCORING" },
      });

      return competitionResult;
    }),

  triggerScoring: adminProcedure
    .input(z.object({ competitionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const competition = await ctx.db.competition.findUnique({
        where: { id: input.competitionId },
        include: {
          metrics: true,
          results: {
            include: {
              metricResults: true,
            },
          },
        },
      });

      if (!competition) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Competition not found",
        });
      }

      if (!competition.results) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Results must be submitted before scoring",
        });
      }

      // Get all predictions with their values
      const predictions = await ctx.db.prediction.findMany({
        where: { competitionId: input.competitionId },
        include: {
          values: {
            include: {
              metric: true,
            },
          },
        },
      });

      // Build actual results map
      const actualResults: Record<string, { actualValue: number }> = {};
      for (const mr of competition.results.metricResults) {
        actualResults[mr.metricId] = { actualValue: mr.actualValue };
      }

      // Calculate scores
      const scores = scoreCompetition(predictions, actualResults);

      // Update predictions with scores and ranks
      for (const score of scores) {
        await ctx.db.prediction.update({
          where: { id: score.predictionId },
          data: {
            totalScore: score.totalWeightedError,
            rank: score.rank,
          },
        });

        // Update individual metric errors
        for (const ms of score.metricScores) {
          await ctx.db.predictionValue.updateMany({
            where: {
              predictionId: score.predictionId,
              metricId: ms.metricId,
            },
            data: {
              error: ms.percentageError,
            },
          });
        }
      }

      // Update user stats for winners (top 3)
      const winners = scores.filter((s) => s.rank && s.rank <= 3);
      for (const winner of winners) {
        if (winner.rank === 1) {
          await ctx.db.user.update({
            where: { id: winner.userId },
            data: {
              totalWins: { increment: 1 },
            },
          });
        }
      }

      // Update all participating users' prediction count and average score
      for (const score of scores) {
        const user = await ctx.db.user.findUnique({
          where: { id: score.userId },
        });

        if (user) {
          const newTotal = user.totalPredictions + 1;
          const currentAvg = user.averageScore || 0;
          const newAvg =
            (currentAvg * user.totalPredictions + score.totalWeightedError) /
            newTotal;

          await ctx.db.user.update({
            where: { id: score.userId },
            data: {
              totalPredictions: newTotal,
              averageScore: newAvg,
            },
          });
        }
      }

      // Update competition result with scored timestamp
      await ctx.db.competitionResult.update({
        where: { competitionId: input.competitionId },
        data: { scoredAt: new Date() },
      });

      // Update competition status to COMPLETED
      await ctx.db.competition.update({
        where: { id: input.competitionId },
        data: { status: "COMPLETED" },
      });

      return { scored: scores.length };
    }),

  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalUsers,
      totalCompetitions,
      totalPredictions,
      activeCompetitions,
    ] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.competition.count(),
      ctx.db.prediction.count(),
      ctx.db.competition.count({
        where: { status: { in: ["UPCOMING", "OPEN"] } },
      }),
    ]);

    return {
      totalUsers,
      totalCompetitions,
      totalPredictions,
      activeCompetitions,
    };
  }),

  listUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = input.search
        ? {
            OR: [
              { username: { contains: input.search, mode: "insensitive" as const } },
              { email: { contains: input.search, mode: "insensitive" as const } },
              { name: { contains: input.search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            image: true,
            role: true,
            totalPredictions: true,
            totalWins: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.db.user.count({ where }),
      ]);

      return { users, total };
    }),

  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["USER", "ADMIN"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change your own role",
        });
      }

      const user = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });

      return user;
    }),
});
