import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ResearchStar - Earnings Prediction Competition",
    template: "%s | ResearchStar",
  },
  description:
    "Compete to predict company earnings and prove your market insight. Join the community of analysts and win.",
  keywords: [
    "earnings prediction",
    "stock market",
    "competition",
    "Tesla",
    "financial analysis",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
