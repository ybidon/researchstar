"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  Medal,
  User,
  Settings,
  Shield,
  Building2,
  Users,
} from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const mainItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Competitions",
    href: "/competitions",
    icon: Trophy,
  },
  {
    title: "Leaderboard",
    href: "/leaderboard",
    icon: Medal,
  },
];

const accountItems: SidebarItem[] = [
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/profile/settings",
    icon: Settings,
  },
];

const adminItems: SidebarItem[] = [
  {
    title: "Admin Dashboard",
    href: "/admin",
    icon: Shield,
    adminOnly: true,
  },
  {
    title: "Manage Competitions",
    href: "/admin/competitions",
    icon: Trophy,
    adminOnly: true,
  },
  {
    title: "Manage Companies",
    href: "/admin/companies",
    icon: Building2,
    adminOnly: true,
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: Users,
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-64 border-r bg-background md:block">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex flex-col gap-1">
          <h4 className="px-2 text-xs font-semibold uppercase text-muted-foreground">
            Main
          </h4>
          {mainItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <h4 className="px-2 text-xs font-semibold uppercase text-muted-foreground">
            Account
          </h4>
          {accountItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-1 mt-4">
            <h4 className="px-2 text-xs font-semibold uppercase text-muted-foreground">
              Admin
            </h4>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
