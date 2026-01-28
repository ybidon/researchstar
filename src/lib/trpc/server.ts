import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { createTRPCContext } from "@/server/trpc";
import { createCallerFactory } from "@/server/trpc";
import { appRouter } from "@/server/routers";

const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const createCaller = createCallerFactory(appRouter);

export const api = async () => createCaller(await createContext());
