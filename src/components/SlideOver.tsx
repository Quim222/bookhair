"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

type Side = "left" | "right";

type SlideOverProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: Side;
  width?: number; // px
  children: React.ReactNode;
  // Se quiseres esconder o header padrão:
  hideHeader?: boolean;
};

export default function SlideOver({
  open,
  onClose,
  title = "",
  side = "left",
  width = 420,
  children,
  hideHeader = false,
}: SlideOverProps) {
  // Montagem segura para portal (evita hydration warning)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Fechar por ESC + bloquear scroll do body
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Foco inicial no painel quando abre (acessibilidade)
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!mounted) return null;

  const initialX = side === "left" ? -width - 40 : width + 40;
  const classSide =
    side === "left"
      ? "left-0 border-r"
      : "right-0 border-l";

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.button
            type="button"
            aria-label="Fechar painel"
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Painel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title || "Painel"}
            tabIndex={-1}
            ref={panelRef}
            className={`fixed top-0 bottom-0 z-[101] bg-white dark:bg-zinc-900 ${classSide} border-zinc-200 dark:border-zinc-800 shadow-xl`}
            style={{ width, maxWidth: "90vw" }}
            initial={{ x: initialX }}
            animate={{ x: 0 }}
            exit={{ x: initialX }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            {!hideHeader && (
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
                <h2 className="truncate text-base font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-md border px-2 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="h-full overflow-auto p-4">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
