"use client";

import React, { useEffect, useState } from "react";
import ThemeToggle from "../ThemeToogle"; // garante o nome do ficheiro certo
import Image from "next/image";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { LuMenu, LuX } from "react-icons/lu";
import Link from "next/link";
import { useAppSelector } from "@/libs/store";
import { logout } from "../login";

const links = [
  { label: "Sobre", ref: "#sobre" },
  { label: "Equipa", ref: "#equipa" },
  { label: "Serviços", ref: "#services" },
  { label: "Contactos", ref: "#contactos" }, // cria a secção quando tiveres
];

export default function NavBar({ active }: { active: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [isOpen, setIsOpen] = useState(false);
  const user = useAppSelector((s) => s.auth.user);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <nav className="sticky top-0 z-50">
      {/* container para centralizar e dar padding lateral */}
      <div className="sm:px-6 lg:py-2 lg:px-8 shadow-md shadow-white/20">
        {/* linha do topo com altura consistente */}
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              key={isDark ? "dark" : "light"}
              src={isDark ? "/logo-white.png" : "/logo-white.png"}
              alt="Logo"
              width={60}
              height={60}
              className="block"
            />
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <ul className="flex space-x-6">
              {links.map(({ label, ref }) => (
                <li
                  key={label}
                  className={`cursor-pointer text-white transition-all ${
                    active === ref
                      ? "text-gold"
                      : "hover:text-gold dark:hover:text-gold-dark"
                  } transform hover:scale-110 relative group dark:text-white duration-100`}
                >
                  <Link href={ref}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-full ring-1 ring-gold/70
             px-4 py-2 text-sm font-medium
             text-gold hover:bg-gold hover:text-black
             transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                  }}
                  className="inline-flex cursor-pointer items-center rounded-full ring-1 ring-white/70
             px-4 py-2 text-sm font-medium
             text-white hover:bg-gold hover:ring-gold hover:text-black
             transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center rounded-full ring-1 ring-gold/70
             px-4 py-2 text-sm font-medium
             text-gold hover:bg-gold hover:text-black
             transition-colors"
              >
                Login
              </Link>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300/70 hover:bg-black/5 transition"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            <AnimatePresence initial={false} mode="wait">
              {isOpen ? (
                <motion.span
                  key="x"
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 700, damping: 40 }}
                >
                  <LuX className="text-white" size={20} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 700, damping: 40 }}
                >
                  <LuMenu className="text-white" size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Painel mobile por baixo da linha do topo */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="sm:hidden fixed inset-0 z-[60] flex"
            >
              {/* overlay escuro */}
              <button
                aria-label="Fechar menu"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-black/70 backdrop-blur-sm"
              />

              {/* sheet lateral (direita) */}
              <div className="w-[88%] max-w-[420px] h-full bg-[#0B0B0C] text-white shadow-2xl border-l border-white/10">
                {/* header do sheet */}
                <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/logo-white.png"
                      alt="Logo"
                      width={28}
                      height={28}
                    />
                    <span className="text-sm font-semibold">BookHair</span>
                  </div>
                  <button
                    aria-label="Fechar menu"
                    onClick={() => setIsOpen(false)}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-white/10"
                  >
                    <LuX size={20} />
                  </button>
                </div>

                {/* conteúdo */}
                <div className="p-6 space-y-8 overflow-y-auto h-[calc(100%-56px)]">
                  {/* links */}
                  <ul className="space-y-4">
                    {links.map(({ label, ref }) => (
                      <li key={label}>
                        <Link
                          href={ref}
                          onClick={() => setIsOpen(false)}
                          className="block text-lg leading-6 opacity-90 hover:opacity-100"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="h-px bg-white/10" />

                  {/* sessão */}
                  <div className="flex flex-col gap-3">
                    {user ? (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center justify-center h-11 rounded-full
                         bg-[var(--bh-gold,#D4AF37)] text-black font-medium"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center justify-center h-11 rounded-full
                         border border-white/25 text-white font-medium
                         hover:bg-white/10"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center justify-center h-11 rounded-full
                       bg-[var(--bh-gold,#D4AF37)] text-black font-medium"
                      >
                        Login
                      </Link>
                    )}
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* toggle mais compacto */}
                  <div className="flex items-center justify-between" aria-label="Alternar tema">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
