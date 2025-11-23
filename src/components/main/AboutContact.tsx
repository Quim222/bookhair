"use client";
import React from "react";

const ADDRESS = "Rua Exemplo 123, 8600-000 Lagos, Portugal";
const MAPS_QUERY = encodeURIComponent(ADDRESS);
const MAPS_SRC = `https://www.google.com/maps?q=${MAPS_QUERY}&hl=pt&z=15&output=embed`;

export default function AboutContact() {
  return (
    <div
      id="contactos"
      className="relative scroll-auto shadow-lg p-6 bg-gray-50 dark:bg-zinc-900/80 backdrop-blur-md"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="inline-block rounded-full text-black border border-gold px-3 py-1 text-xs tracking-wide mb-10 dark:border-gold-dark dark:text-gold-dark">
            CONTACTO
          </span>
          <h2 className="text-3xl text-gray-900 dark:text-white font-semibold leading-tight">
            Onde Estamos & Como Contactar
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Entre em contacto connosco para marcar a sua sessão ou esclarecer
            qualquer dúvida. A nossa equipa terá todo o prazer em ajudar a
            escolher o serviço ideal para si. Pode ligar-nos, enviar mensagem ou
            visitar-nos no salão – estaremos sempre disponíveis para cuidar de
            si.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cartão: Contacto */}
          <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-black dark:text-gold-dark">
              Fale Connosco
            </h3>
            <div className="space-y-3 text-zinc-700 dark:text-zinc-200">
              <p>
                <span className="font-bold">Telefone:</span>{" "}
                <a
                  className="inline-block no-underline hover:scale-105 hover:translate-x-1 transition-all duration-200"
                  href="tel:+351910000000"
                >
                  +351 910 000 000
                </a>
              </p>
              <p>
                <span className="font-bold">Email:</span>{" "}
                <a
                  className="inline-block no-underline hover:scale-105 hover:translate-x-1 transition-all duration-200"
                  href="mailto:bookhair@exemplo.pt"
                >
                  bookhair@exemplo.pt
                </a>
              </p>
              <p>
                <span className="font-bold">WhatsApp:</span>{" "}
                <a
                  className="inline-block no-underline hover:scale-105 hover:translate-x-1 transition-all duration-200"
                  href="https://wa.me/351910000000"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Enviar mensagem
                </a>
              </p>
              <p>
                <span className="font-bold">Morada:</span> {ADDRESS}
              </p>

              <div className="pt-4">
                <h4 className="font-semibold mb-1">Horário</h4>
                <ul className="text-sm space-y-1">
                  <li>Seg–Sex: 10:00 – 19:00</li>
                  <li>Sábado: 10:00 – 17:00</li>
                  <li>Domingo: Encerrado</li>
                </ul>
              </div>

              <div className="pt-6 flex gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 border dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Abrir no Google Maps
                </a>
                <a
                  href="tel:+351910000000"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-black text-white dark:bg-zinc-800 hover:opacity-90 transition"
                >
                  Ligar Agora
                </a>
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="aspect-[4/3] md:aspect-[16/9]">
              <iframe
                title="Localização BookHair"
                src={MAPS_SRC}
                className="w-full h-full"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="p-4 text-sm text-zinc-600 dark:text-zinc-300">
              * Visualização do mapa com base na morada. Clique em “Abrir no
              Google Maps” para navegação.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
