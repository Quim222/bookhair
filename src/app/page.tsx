"use client";

import AboutSection from "@/components/main/AboutSection";
import BackToTop from "@/components/animations/BackToTop";
import BounceCta from "@/components/animations/BounceCta";
import NavBar from "@/components/main/NavBar";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import AboutTeam from "@/components/main/AboutTeam";
import AboutServices from "@/components/main/AboutServices";
import AboutContact from "@/components/main/AboutContact";
import BookingGate from "@/components/main/BookingGate";
import NewBooking from "@/components/NewBooking";

export default function Home() {
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const appointmentRef = useRef<HTMLDivElement | null>(null);
  const [showBookingGate, setShowBookingGate] = useState(false);
  const [openBookingModal, setOpenBookingModal] = useState(false);

  function onBookingClick(v: boolean) {
    const skip = localStorage.getItem("bh:skipGate");
    const gate = localStorage.getItem("bh:gate");
    if (gate === "guest" && skip) {
      setOpenBookingModal(true);
    }
    if (skip && gate === "login") {
      window.location.href = "/login";
    } else {
      setShowBookingGate(v);
    }
  }

  return (
    <div className="font-sans min-h-screen">
      <NewBooking
        open={openBookingModal}
        onClose={() => setOpenBookingModal(false)}
        dashboard={false}
      />
      {/* Botão para cima */}
      <BackToTop showAt={200} />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col">
        {/* BG */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/fundo-principal.jpg"
            alt="Interior do salão"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
        </div>

        {/* NavBar (ocupa altura) */}
        <header className="relative z-20">
          <NavBar active="/" />
        </header>

        {/* Conteúdo */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center text-white px-6">
          {/* Cartão de vidro só no dark */}
          <div
            className="
              max-w-4xl w-full p-8 md:p-10 rounded-2xl mb-10
              bg-transparent
              dark:bg-zinc-900/45 
              dark:supports-[backdrop-filter]:backdrop-blur-md
              ring-1 ring-transparent dark:ring-white/10
            "
          >
            <h1
              className="
                text-5xl md:text-6xl font-extrabold tracking-tight leading-tight
                text-white
                dark:text-transparent dark:bg-gradient-to-r dark:from-gray-200 dark:to-gray-400 dark:bg-clip-text
              "
            >
              Bem-vindo ao Book Hair
            </h1>

            <p className="mt-3 text-lg md:text-xl text-white/90">
              O seu salão de beleza moderno em Lagos
            </p>
            <p className="mt-2 text-base md:text-lg text-white/80">
              Cortes, coloração e tratamentos realizados por profissionais
              dedicados. Realce a sua beleza com estilo, confiança e bem-estar.
            </p>
          </div>

          {/* CTA – rolar até à secção “sobre” (melhor UX que ir ao fundo) */}
          <div
            className="
              flex flex-col sm:flex-row 
              items-center justify-center 
              gap-4 sm:gap-8
            "
          >
            <button
              onClick={() =>
                aboutRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-2 inline-flex items-center gap-2 px-6 
              py-3 rounded-full bg-white/90 text-black font-semibold shadow-lg 
              hover:bg-white hover:text-gold focus:outline-offset-1 focus:ring-2 focus:ring-gold
              dark:bg-gradient-to-r dark:from-gray-500 dark:to-gray-700 dark:text-white 
              dark:hover:from-gray-700 dark:hover:to-gray-600 transition"
            >
              <span>Quer conhecer mais?</span>
            </button>

            <button
              onClick={() => onBookingClick(true)}
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full 
              bg-white/90 text-black font-semibold shadow-lg hover:bg-white hover:text-gold 
              focus:outline-offset-1 focus:ring-2 focus:ring-gold
              dark:bg-gradient-to-r dark:from-gray-500 dark:to-gray-700 dark:text-white 
              dark:hover:from-gray-700 dark:hover:to-gray-600 transition"
            >
              <span>Deseja marcar uma sessão?</span>
            </button>
          </div>
        </div>
      </section>

      {/* Secção abaixo (alvo do scroll) */}
      <main ref={aboutRef} className="scroll-mt-24">
        <AboutSection />
        <AboutTeam />
        <AboutServices />
        <AboutContact />
        <section
          ref={appointmentRef}
          id="appointment"
          className="bg-black text-white"
        >
          <div className="max-w-7xl mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Já nos conhece?
            </h2>
            <p className="mb-6 text-gray-300">
              Se já está pronto para cuidar do seu estilo, agende a sua marcação
              connosco e garanta o seu horário.
            </p>
            <div className="relative inline-block align-middle overflow-visible pb-3 -mb-1">
              <BounceCta
                onClick={() => onBookingClick(true)}
                className="
                  inline-flex items-center justify-center
                  transform-gpu will-change-transform touch-manipulation leading-none select-none
                  bg-[#D4AF37] text-black font-semibold px-8 py-3 rounded-full
                  hover:bg-[#B8860B] transition-colors duration-200
                "
              >
                Fazer Marcação
              </BounceCta>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-black border-t border-zinc-800">
        {/* linha principal */}
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* logo */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-gold">BookHair</h3>
            <p className="mt-2 text-sm text-gray-400">
              Agendamentos fáceis, rápidos e com estilo.
            </p>
          </div>

          {/* redes sociais */}
          <div className="flex items-center gap-4">
            <a aria-label="Instagram" href="#" className="hover:text-gold">
              📸
            </a>
            <a aria-label="TikTok" href="#" className="hover:text-gold">
              🎵
            </a>
            <a aria-label="LinkedIn" href="#" className="hover:text-gold">
              💼
            </a>
          </div>
        </div>

        {/* copy */}
        <div className="border-t border-zinc-800">
          <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} BookHair. Todos os direitos reservados.
          </div>
        </div>
      </footer>
      {showBookingGate && (
        <BookingGate
          onNext={() => {
            setShowBookingGate(false);
            localStorage.setItem("bh:gate", "guest");
            setOpenBookingModal(true);
          }}
          onLogin={() => {
            setShowBookingGate(false);
            localStorage.setItem("bh:gate", "login");
            window.location.href = "/login";
          }}
          onBack={(value) => {
            setShowBookingGate(value);
          }}
        />
      )}
    </div>
  );
}
