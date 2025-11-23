"use client";

import React, { useEffect, useState } from "react";
import CardUserMainPage from "@/components/main/CardUserMainPage";
import { div } from "motion/react-client";
import Loading from "../Loading";
import { BASE_URL } from "@/libs/api";

export type EmployeeUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  photoUrl: string;
  hasPhoto: boolean;
};



export default function AboutTeam() {
  const [users, setUsers] = useState<EmployeeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL ?? "";

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch(BASE_URL + "/users/employees");

        if (!res.ok) throw new Error("Erro ao carregar os membros da equipa.");

        const raw = await res.json();


        const data: EmployeeUser[] = raw.map((u: any) => {
          const id = u.id ?? u.userId; 
          return {
            id,
            name: u.name,
            email: u.email,
            role: u.role,
            hasPhoto: Boolean(u.hasPhoto),
            photoUrl: u.photoUrl,
          };
        });
        setUsers(data);
      } catch (err) {
        setError("Erro ao carregar os membros da equipa.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading)
    return (
      <Loading text="A carregar a equipa..." />
    );
  if (error) return <div className="p-6 text-red-600">{error}</div>;


  return (
    <section id="equipa" className="
    relative scroll-auto shadow-lg p-6 bg-gray-50 dark:bg-zinc-900/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="inline-block rounded-full border px-3 py-1 text-xs tracking-wide mb-10 border-gold dark:border-gold-dark dark:text-gold-dark">
            NOSSA EQUIPA
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Conheça a Nossa Equipa
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            A nossa equipa reúne diferentes talentos com um objetivo comum:
            cuidar de cada detalhe para oferecer-lhe um serviço moderno, de
            confiança e pensado para si. Trabalhamos com paixão, qualidade e
            transparência — é isso que nos define em cada projeto.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {users.map((user) => (
            <CardUserMainPage key={user.id} data={user} />
          ))}
        </div>
      </div>
    </section>
  );
}
