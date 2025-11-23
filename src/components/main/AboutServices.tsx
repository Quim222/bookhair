"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { getServices, Service } from "../getServices";
import CardService from "./CardService";
import { Scissors } from "lucide-react";

export default function AboutServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data);
      } catch (error) {
        console.error(error);
        setError("Erro ao buscar serviços");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div
      id="services"
      className="
      relative scroll-auto shadow-lg p-6 bg-white dark:bg-zinc-900/60 backdrop-blur-md"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <span className="inline-block rounded-full border px-3 py-1 text-xs tracking-wide border-gold dark:text-gold-dark">
            NOSSOS SERVIÇOS
          </span>
          <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
            Serviços que oferecemos para realçar a sua beleza.
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
            No Book Hair, oferecemos uma gama completa de serviços de beleza
            para atender às suas necessidades. Desde cortes de cabelo modernos
            até coloração vibrante e tratamentos capilares revitalizantes, a
            nossa equipa de profissionais está aqui para ajudar você a alcançar
            o visual que deseja.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/50 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <p className="text-center text-red-600 dark:text-red-400">{error}</p>
        )}

        {!loading &&
          !error &&
          (services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Scissors className="h-10 w-10 text-zinc-400 mb-3" />
              <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium">
                Nenhum serviço encontrado.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                className="flex flex-wrap justify-center gap-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                {services.map((service) => (
                  <CardService key={service.id} service={service} />
                ))}
              </motion.div>
            </AnimatePresence>
          ))}
      </div>
    </div>
  );
}
