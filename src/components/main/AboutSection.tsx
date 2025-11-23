"use client";

import React from "react";

export default function AboutSection() {
  return (
    <section id="sobre" className="relative shadow-lg p-6 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md scroll-auto">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Coluna de imagens */}
          <div className="relative order-2 md:order-1">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border">
              <img
                src="/corte3.jpg"
                alt="Interior do salão, iluminação suave e ambiente acolhedor"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden w-2/3 overflow-hidden rounded-2xl border bg-white shadow-xl md:block">
              <img
                src="/corte6.jpg"
                alt="Detalhe de styling e zona de lavatório"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Coluna de texto */}
          <div className="order-1 md:order-2">
            <span className="inline-block rounded-full border px-3 py-1 text-xs tracking-wide border-gold">
              SOBRE NÓS
            </span>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              Um espaço pensado para te receber bem — e saíres ainda melhor.
            </h2>

            <p className="mt-5 text-zinc-600 dark:text-zinc-300">
              No <strong>BookHair</strong>, cada visita é mais do que um corte:
              é um momento só teu. Trabalhamos com
              <strong> produtos profissionais</strong> e técnicas atuais para
              realçar o teu estilo de forma simples, prática e com resultados
              que duram.
            </p>

            <p className="mt-4 text-zinc-600 dark:text-zinc-300">
              A nossa equipa é apaixonada por tendências, mas respeita a tua
              essência. O resultado? Cortes e colorações que vivem bem no dia a
              dia, com um acabamento de editorial — e um atendimento que lembra
              o de um amigo.
            </p>

            {/* Badges de valor */}
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border px-3 py-1 border-gold">
                Consultoria personalizada
              </span>
              <span className="rounded-full border px-3 py-1 border-gold">
                Produtos profissionais
              </span>
              <span className="rounded-full border px-3 py-1 border-gold">
                Técnicas atuais
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
