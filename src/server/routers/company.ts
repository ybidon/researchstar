import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const companyRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        isActive: z.boolean().optional().default(true),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const companies = await ctx.db.company.findMany({
        where: { isActive: input?.isActive ?? true },
        include: {
          _count: {
            select: { competitions: true },
          },
        },
        orderBy: { name: "asc" },
      });
      return companies;
    }),

  getByTicker: publicProcedure
    .input(z.object({ ticker: z.string() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.db.company.findUnique({
        where: { ticker: input.ticker.toUpperCase() },
        include: {
          competitions: {
            orderBy: { earningsDate: "desc" },
            take: 5,
          },
        },
      });
      return company;
    }),
});
