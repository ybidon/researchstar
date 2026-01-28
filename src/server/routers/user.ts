import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          bio: true,
          totalPredictions: true,
          totalWins: true,
          averageScore: true,
          globalRank: true,
          createdAt: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),

  getMe: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        totalPredictions: true,
        totalWins: true,
        averageScore: true,
        globalRank: true,
        createdAt: true,
      },
    });

    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(50).optional(),
        bio: z.string().max(500).optional(),
        username: z
          .string()
          .min(3)
          .max(20)
          .regex(/^[a-zA-Z0-9_]+$/)
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.username) {
        const existing = await ctx.db.user.findUnique({
          where: { username: input.username },
        });
        if (existing && existing.id !== ctx.session.user.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already taken",
          });
        }
      }

      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          bio: input.bio,
          username: input.username?.toLowerCase(),
        },
      });

      return user;
    }),

  getPredictionHistory: publicProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const predictions = await ctx.db.prediction.findMany({
        where: {
          userId: user.id,
          isPublic: true,
        },
        include: {
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
        },
        orderBy: { submittedAt: "desc" },
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
});
