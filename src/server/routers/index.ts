import { createTRPCRouter } from "../trpc";
import { userRouter } from "./user";
import { companyRouter } from "./company";
import { competitionRouter } from "./competition";
import { predictionRouter } from "./prediction";
import { leaderboardRouter } from "./leaderboard";
import { adminRouter } from "./admin";
import { followRouter } from "./follow";

export const appRouter = createTRPCRouter({
  user: userRouter,
  company: companyRouter,
  competition: competitionRouter,
  prediction: predictionRouter,
  leaderboard: leaderboardRouter,
  admin: adminRouter,
  follow: followRouter,
});

export type AppRouter = typeof appRouter;
