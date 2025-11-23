"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/libs/store";
import Image from "next/image";
import {
  LayoutDashboard,
  Scissors,
  Users,
  User,
  House,
  LogOut,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToogle";
import { AnimatePresence, motion } from "framer-motion";
import { MobileSidebar } from "@/components/MobileSidebar";
// ⚠️ IMPORTANT: ensure this is a PLAIN function (no hooks inside). If it uses hooks,
// convert it into a `useLogout()` hook and call that at the top level to get a callback.
import { logout } from "@/components/login";
import { useTheme } from "next-themes";

const items = [
  {
    href: "/",
    label: "Início",
    roles: ["CLIENTE", "FUNCIONARIO", "ADMIN"],
    icon: House,
  },
  {
    href: "/dashboard",
    label: "Overview",
    roles: ["CLIENTE", "FUNCIONARIO", "ADMIN"],
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/services",
    label: "Serviços",
    roles: ["ADMIN"],
    icon: Scissors,
  },
  {
    href: "/dashboard/users",
    label: "Utilizadores",
    roles: ["ADMIN"],
    icon: Users,
  },
  {
    href: "/dashboard/perfil/[id]",
    label: "Perfil",
    roles: ["CLIENTE", "FUNCIONARIO", "ADMIN"],
    icon: User,
  },
  { label: "Logout", roles: ["CLIENTE", "FUNCIONARIO", "ADMIN"], icon: LogOut },
];

export default function DashboardLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  const { user, isHydrated } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const pathname = usePathname();

  // Auth guard: effect is always called (hook order stable), but branches inside.
  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.replace("/login");
  }, [isHydrated, user, router]);

  // Build menu, resolving profile URL
  const menuItems = useMemo(() => {
    return items.map((item) =>
      item.href === "/dashboard/perfil/[id]" && user?.userId
        ? { ...item, href: `/dashboard/perfil/${user.userId}` }
        : item
    );
  }, [user]);

  // Derive active label directly from the URL (no setState in effects)
  const cleanPath = (pathname ?? "").replace(/\/+$/, "");
  const activeLabel = useMemo(() => {
    const match = menuItems.find((i) => i.href === cleanPath);
    return match?.label ?? "Overview";
  }, [menuItems, cleanPath]);
  const { resolvedTheme } = useTheme();

  // Stable key for page transition
  const baseKey = pathname?.startsWith("/dashboard/bookings")
    ? "/dashboard"
    : pathname ?? "/dashboard";

  if (!isHydrated || !user) {
    return <div className="p-6 text-sm text-zinc-500">A verificar sessão…</div>;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="
        min-h-dvh grid grid-cols-1 sm:grid-cols-[72px_1fr] lg:grid-cols-[260px_1fr]
        bg-white text-zinc-900
        dark:bg-[#0B0B0C] dark:text-[#EDEFF4]
      "
    >
      {/* Mobile sidebar */}
      <MobileSidebar
        items={menuItems}
        user={user}
        active={activeLabel}
        setActive={() => {}} // not needed anymore, but keep API if component expects it
        logout={logout}
        ThemeToggle={ThemeToggle}
      />

      <aside
        className="
          hidden sm:flex p-4
          border-r border-zinc-200 bg-zinc-50/70 backdrop-blur
          dark:border-[#2A2B31] dark:bg-[#121316]/80 dark:backdrop-blur
        "
      >
        <div className="flex w-full flex-col">
          <div className="mb-6 flex items-center gap-3 px-2">
            <Image
              src={isDark ? "/logo-white.png" : "/logo.png"}
              alt="BookHair"
              width={36}
              height={36}
              className="rounded-xl"
            />
            <span className="hidden lg:inline text-lg font-semibold tracking-wide">
              Book<span className="text-[var(--bh-gold,#D4AF37)]">Hair</span>
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems
              .filter((item) => item.roles.includes(user?.userRole ?? ""))
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeLabel === item.label;
                const isLogout = item.label === "Logout";
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (isLogout) {
                        logout(); // must NOT use hooks internally
                        router.push("/login");
                      } else if (item.href) {
                        router.push(item.href);
                      }
                    }}
                    className={[
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                      isActive
                        ? "bg-[var(--bh-gold,#D4AF37)]/10 text-zinc-900 ring-1 ring-[var(--bh-gold,#D4AF37)] dark:text-[#EDEFF4]"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-[#9AA0AE] dark:hover:bg-white/5",
                    ].join(" ")}
                  >
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-[var(--bh-gold,#D4AF37)]"
                          : "text-zinc-500 group-hover:text-zinc-700 dark:text-[#9AA0AE] dark:group-hover:text-zinc-200"
                      }
                    />
                    <span className="hidden lg:inline truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
          </nav>

          <div className="flex items-center justify-center gap-2">
            <div className="hidden lg:block rounded-xl bg-zinc-100 p-3 text-xs text-zinc-500 dark:bg-white/5 dark:text-[#9AA0AE]">
              © {new Date().getFullYear()} BookHair
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <main className="h-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={baseKey}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="h-full flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {modal}
    </div>
  );
}
