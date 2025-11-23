import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles: string[];
};

type Props = {
  items: NavItem[];
  user?: { userRole?: string | null };
  active: string;
  setActive: (label: string) => void;
  logout: () => void;
  ThemeToggle: React.ComponentType;
};

export function MobileSidebar({
  items,
  user,
  active,
  setActive,
  logout,
  ThemeToggle,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const startX = useRef<number | null>(null);
  const currentX = useRef<number>(0);

  // Abrir ao deslizar da borda esquerda
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      if (x <= 24) {
        startX.current = x;
        currentX.current = x;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (startX.current !== null) currentX.current = e.touches[0].clientX;
    };
    const onTouchEnd = () => {
      if (startX.current !== null) {
        const delta = currentX.current - startX.current;
        if (delta > 60) setOpen(true);
      }
      startX.current = null;
    };

    const onTouchMoveClose = (e: TouchEvent) => {
      if (!open) return;
      const touch = e.touches[0];
      if (touch.clientX < 40) setOpen(false);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchmove", onTouchMoveClose, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchmove", onTouchMoveClose);
    };
  }, [open]);

  // Fechar com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Botão hambúrguer apenas no mobile */}
      <div className="flex sm:hidden items-center gap-2 p-2">
        <button
          aria-label="Abrir menu"
          onClick={() => setOpen(true)}
          className="
            rounded-xl border px-3 py-2 text-sm
            text-zinc-700 border-zinc-300
            active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
            dark:text-[#EDEFF4] dark:border-[#2A2B31]
            hover:bg-zinc-100 dark:hover:bg-white/5
          "
        >
          Menu
        </button>
        <ThemeToggle />
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={[
          "sm:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity",
          "supports-[backdrop-filter]:bg-black/30",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Drawer */}
      <aside
        className={[
          "sm:hidden fixed left-0 top-0 z-50 h-screen w-[78%] max-w-[320px]",
          "bg-white dark:bg-[#121316] shadow-2xl border-r border-zinc-200 dark:border-[#2A2B31]",
          "transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex w-full flex-col h-full p-3">
          {/* Header + fechar */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="BookHair"
                width={32}
                height={32}
                className="rounded-xl"
              />
              <span className="text-base font-semibold tracking-wide text-zinc-900 dark:text-[#EDEFF4]">
                Book<span className="text-[var(--bh-gold,#D4AF37)]">Hair</span>
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="
                rounded-lg px-2 py-1 text-sm
                text-zinc-600 hover:bg-zinc-100
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
                dark:text-[#9AA0AE] dark:hover:bg-white/5
              "
            >
              Fechar
            </button>
          </div>

          {/* Navegação */}
          <nav className="flex-1 space-y-2 overflow-auto">
            {items
              .filter((item) => item.roles.includes(user?.userRole ?? ""))
              .map((item) => {
                const Icon = item.icon;
                const isActive = active === item.label;
                const isLogout = item.label === "Logout";
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActive(item.label);
                      if (isLogout) {
                        logout();
                        router.push("/login");
                      } else if (item.href) {
                        router.push(item.href);
                      }
                      setOpen(false);
                    }}
                    className={[
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]",
                      isActive
                        ? "bg-[var(--bh-gold,#D4AF37)]/10 text-zinc-900 ring-1 ring-[var(--bh-gold,#D4AF37)] dark:text-[#EDEFF4]"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-[#9AA0AE] dark:hover:bg-white/5",
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
                    <span className="truncate text-zinc-900 dark:text-[#EDEFF4]">
                      {item.label}
                    </span>
                  </button>
                );
              })}
          </nav>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="rounded-xl bg-zinc-100 px-3 py-2 text-xs text-zinc-500 dark:bg-white/5 dark:text-[#9AA0AE] text-center">
              © {new Date().getFullYear()} BookHair
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
