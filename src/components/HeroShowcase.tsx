import React from 'react';

export default function HeroShowcase() {
  return (
    <div className="min-h-screen w-full bg-black text-white p-6 md:p-10">
      {/* Moldura da página */}
      <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-2 shadow-2xl">
        {/* Área interna com grid subtil + fade */}
        <div
          className="relative rounded-[22px] overflow-hidden px-6 md:px-10 py-14 md:py-20"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), " +
              "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06), rgba(0,0,0,0) 60%), " +
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), " +
              "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "100% 100%, 1200px 600px, 60px 60px, 60px 60px",
            backgroundPosition: "center top, center top, center, center",
          }}
        >
          {/* Fade/onda inferior (tom cobre) */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
            style={{
              background:
                "radial-gradient(120% 100% at 50% 100%, rgba(215,108,64,0.55), rgba(215,108,64,0.2) 40%, rgba(0,0,0,0) 70%)",
              maskImage:
                "radial-gradient(120% 100% at 50% 120%, black 40%, transparent 70%)",
            }}
          />

          {/* Canto superior esquerdo — logotipo simples */}
          <div className="absolute left-6 top-6 md:left-8 md:top-8 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-orange-600" />
            <span className="text-sm tracking-wider text-zinc-300">Chihiro</span>
          </div>

          {/* Canto inferior esquerdo — tagline discreta */}
          <div className="absolute left-6 bottom-6 md:left-8 md:bottom-8 text-[10px] md:text-xs text-zinc-400">
            Innovating Every Step. Presented by Chihiro.
          </div>

          {/* Canto inferior direito — citação */}
          <div className="absolute right-6 bottom-6 md:right-8 md:bottom-8 text-[10px] md:text-xs italic text-zinc-300">
            “Growth, Resilience, and Vision”
          </div>

          {/* Conteúdo central */}
          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Annual <span className="block">Performance</span>
            </h1>

            <div className="mt-2 text-2xl md:text-4xl italic text-zinc-200/90">
              Report 2025
            </div>

            {/* botões/ações (exemplo) */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#"
                className="rounded-xl px-5 py-2.5 text-sm font-medium bg-white text-black hover:bg-zinc-200 transition"
              >
                Ver Relatório
              </a>
              <a
                href="#"
                className="rounded-xl px-5 py-2.5 text-sm font-medium border border-white/20 hover:border-white/40 text-white/90 transition"
              >
                Download PDF
              </a>
            </div>
          </div>

          {/* Borda interna elegante */}
          <div className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-white/10" />
        </div>
      </div>

      {/* Secção extra opcional para pré-visualizar mais páginas/links */}
      <div className="mx-auto mt-10 max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Resumo Executivo", desc: "KPIs, destaques, resultados globais" },
          { title: "Operações", desc: "Eficiência, SLAs, melhoria contínua" },
          { title: "ESG & Sustentabilidade", desc: "Iniciativas e metas 2025+" },
        ].map((c, i) => (
          <a
            key={i}
            href="#"
            className="group rounded-2xl border border-white/10 bg-zinc-900/60 p-5 hover:bg-zinc-900/80 transition"
          >
            <div className="mb-2 text-sm uppercase tracking-widest text-zinc-400">Seção</div>
            <div className="text-lg font-medium text-white">{c.title}</div>
            <div className="mt-1 text-sm text-zinc-400">{c.desc}</div>
            <div className="mt-4 text-xs text-zinc-400 group-hover:text-white/80">Abrir →</div>
          </a>
        ))}
      </div>
    </div>
  );
}
