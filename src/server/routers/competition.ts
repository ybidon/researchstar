import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { CompetitionStatus } from "@prisma/client";

export const competitionRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        status: z.nativeEnum(CompetitionStatus).optional(),
        companyId: z.string().optional(),
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const competitions = await ctx.db.competition.findMany({
        where: {
          status: input.status,
          companyId: input.companyId,
        },
        include: {
          company: true,
          _count: {
            select: { predictions: true },
          },
        },
        orderBy: { earningsDate: "asc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined = undefined;
      if (competitions.length > input.limit) {
        const nextItem = competitions.pop();
        nextCursor = nextItem!.id;
      }

      return { competitions, nextCursor };
    }),

  getActive: publicProcedure.query(async ({ ctx }) => {
    const competitions = await ctx.db.competition.findMany({
      where: {
        status: { in: ["UPCOMING", "OPEN"] },
      },
      include: {
        company: true,
        _count: {
          select: { predictions: true },
        },
      },
      orderBy: { earningsDate: "asc" },
    });

    return competitions;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const competition = await ctx.db.competition.findUnique({
        where: { id: input.id },
        include: {
          company: true,
          metrics: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { predictions: true },
          },
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

      return competition;
    }),

  getWithMyPrediction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const competition = await ctx.db.competition.findUnique({
        where: { id: input.id },
        include: {
          company: true,
          metrics: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { predictions: true },
          },
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

      const myPrediction = await ctx.db.prediction.findUnique({
        where: {
          userId_competitionId: {
            userId: ctx.session.user.id,
            competitionId: input.id,
          },
        },
        include: {
          values: true,
        },
      });

      return { competition, myPrediction };
    }),

  getRecent: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(5) }))
    .query(async ({ ctx, input }) => {
      const competitions = await ctx.db.competition.findMany({
        where: {
          status: "COMPLETED",
        },
        include: {
          company: true,
          _count: {
            select: { predictions: true },
          },
        },
        orderBy: { earningsDate: "desc" },
        take: input.limit,
      });

      return competitions;
    }),
});
