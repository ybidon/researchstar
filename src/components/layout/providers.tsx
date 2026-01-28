"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import { Toaster } from "sonner";
import { TRPCProvider } from "@/lib/trpc/provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TRPCProvider>
        {children}
        <Toaster position="top-right" richColors />
      </TRPCProvider>
    </SessionProvider>
  );
}
