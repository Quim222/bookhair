"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { LuSunMedium } from "react-icons/lu";
import { GoMoon } from "react-icons/go";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // antes de montar, não mostramos nada para evitar hydration mismatch
  if (!mounted) {
    return (
      <button
        aria-label="Alternar tema"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full 
                   border border-zinc-300 bg-white/70 backdrop-blur
                   dark:bg-zinc-900/70 dark:border-zinc-700
                   hover:scale-105 transition"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Alternar tema"
      className="relative inline-flex h-10 w-full items-center justify-center rounded-full 
                 border border-zinc-300 bg-white/70 backdrop-blur
                 dark:bg-zinc-900/70 dark:border-zinc-700
                 hover:scale-95 hover:bg-white dark:hover:bg-zinc-900 sm:w-10 lg:w-20 transition "
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="text-amber-300"
          >
            <LuSunMedium size={20} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="text-blue-500 "
          >
            <GoMoon size={20} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
