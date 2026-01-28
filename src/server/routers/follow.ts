import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const followRouter = createTRPCRouter({
  isFollowing: protectedProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const targetUser = await ctx.db.user.findUnique({
        where: { username: input.username },
      });

      if (!targetUser) {
        return false;
      }

      const follow = await ctx.db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.session.user.id,
            followingId: targetUser.id,
          },
        },
      });

      return !!follow;
    }),

  follow: protectedProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const targetUser = await ctx.db.user.findUnique({
        where: { username: input.username },
      });

      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (targetUser.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot follow yourself",
        });
      }

      const existingFollow = await ctx.db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.session.user.id,
            followingId: targetUser.id,
          },
        },
      });

      if (existingFollow) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already following this user",
        });
      }

      const follow = await ctx.db.follow.create({
        data: {
          followerId: ctx.session.user.id,
          followingId: targetUser.id,
        },
      });

      return follow;
    }),

  unfollow: protectedProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const targetUser = await ctx.db.user.findUnique({
        where: { username: input.username },
      });

      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const follow = await ctx.db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.session.user.id,
            followingId: targetUser.id,
          },
        },
      });

      if (!follow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Not following this user",
        });
      }

      await ctx.db.follow.delete({
        where: {
          followerId_followingId: {
            followerId: ctx.session.user.id,
            followingId: targetUser.id,
          },
        },
      });

      return { success: true };
    }),

  getFollowers: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().min(1).max(50).default(20),
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

      const follows = await ctx.db.follow.findMany({
        where: { followingId: user.id },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined = undefined;
      if (follows.length > input.limit) {
        const nextItem = follows.pop();
        nextCursor = nextItem!.id;
      }

      return {
        followers: follows.map((f) => f.follower),
        nextCursor,
      };
    }),

  getFollowing: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().min(1).max(50).default(20),
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

      const follows = await ctx.db.follow.findMany({
        where: { followerId: user.id },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined = undefined;
      if (follows.length > input.limit) {
        const nextItem = follows.pop();
        nextCursor = nextItem!.id;
      }

      return {
        following: follows.map((f) => f.following),
        nextCursor,
      };
    }),
});
