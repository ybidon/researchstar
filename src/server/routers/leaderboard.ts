import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const leaderboardRouter = createTRPCRouter({
  global: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        where: { totalPredictions: { gt: 0 } },
        orderBy: [{ totalWins: "desc" }, { averageScore: "asc" }],
        take: input.limit,
        skip: input.offset,
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          totalPredictions: true,
          totalWins: true,
          averageScore: true,
          globalRank: true,
        },
      });

      const total = await ctx.db.user.count({
        where: { totalPredictions: { gt: 0 } },
      });

      return { users, total };
    }),

  competition: publicProcedure
    .input(
      z.object({
        competitionId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
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

      // Only show leaderboard after competition is scored
      if (competition.status !== "COMPLETED" && competition.status !== "SCORING") {
        return { predictions: [], total: 0, isScored: false };
      }

      const predictions = await ctx.db.prediction.findMany({
        where: {
          competitionId: input.competitionId,
          rank: { not: null },
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
        take: input.limit,
        skip: input.offset,
      });

      const total = await ctx.db.prediction.count({
        where: {
          competitionId: input.competitionId,
          rank: { not: null },
        },
      });

      return { predictions, total, isScored: true };
    }),

  userRankInCompetition: publicProcedure
    .input(
      z.object({
        competitionId: z.string(),
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const prediction = await ctx.db.prediction.findUnique({
        where: {
          userId_competitionId: {
            userId: input.userId,
            competitionId: input.competitionId,
          },
        },
        select: {
          rank: true,
          totalScore: true,
        },
      });

      return prediction;
    }),
});
