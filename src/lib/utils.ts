import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelativeTime(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(value: number, notation: "standard" | "compact" = "standard") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation,
    maximumFractionDigits: notation === "compact" ? 1 : 2,
  }).format(value);
}

export function formatNumber(value: number, decimals = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number, decimals = 2) {
  return `${formatNumber(value, decimals)}%`;
}

export function generateUsername(email: string): string {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}${suffix}`;
}
