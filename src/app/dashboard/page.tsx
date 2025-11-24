"use client";

import { useAppSelector } from "@/libs/store";
import MonthCalendarDF, { BHEvent } from "@/components/CalendaryTry";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/libs/api";
import { format } from "date-fns";
import AppointmentItem from "@/components/appointmentItem";
import { useRouter } from "next/navigation";
import NewBooking from "@/components/NewBooking";

export type Booking = {
  id: string;
  serviceName: string;
  employeeName: string;
  clientName: string;
  date: string; // ISO string
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: "PENDENTE" | "CONFIRMED" | "CANCELLED" | "FINISHED";
  dayKey: string; // derived, ex: "2025-09-11"
  startMinutes: number;
  color?: string;
};

export function parseDate(dateStr: string): {
  date: string;
  time: string;
  minutes: number;
} {
  const d = new Date(dateStr);
  const hours = d.getHours();
  const mins = d.getMinutes();
  return {
    date: d.toLocaleDateString("pt-PT"), // ex: 11/09/2025
    time: d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }), // ex: 10:00
    minutes: hours * 60 + mins, // ex: 600
  };
}

export function getDayKeyLocal(iso: string): string {
  const d = new Date(iso); // interpreta local (sem 'Z')
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // ex: 2025-09-11
}

export default function DashboardOverview() {
  const user = useAppSelector((s) => s.auth.user); // { id, name, email, userRole }
  const role = user?.userRole;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectBooking, setSelectBooking] = useState<Booking[]>([]);
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>();
  const [openBookingModal, setOpenBookingModal] = useState(false);

  useEffect(() => {
    if (!user?.userId) return;
    (async () => {
      try {
        const url =
          user.userRole === "ADMIN"
            ? "/bookings"
            : "/bookings/user/" + user.userId;
        const res = await apiFetch(url);
        if (!res.ok) throw new Error(`Erro ao buscar bookings: ${res.status}`);
        const data = await res.json();

        const parsed: Booking[] = data.map((b: any) => {
          const start = parseDate(b.startTime);
          const end = parseDate(b.endTime);
          const dayKey = getDayKeyLocal(b.startTime);
          return {
            id: b.id,
            serviceName: b.serviceName,
            employeeName: b.employeeName,
            clientName: b.customerName,
            date: start.date,
            startTime: start.time,
            endTime: end.time,
            status: b.status, // ou b.status se já vier no enum certo
            dayKey,
            startMinutes: start.minutes,
          };
        });

        parsed.sort((a, b) =>
          a.dayKey === b.dayKey
            ? a.startMinutes - b.startMinutes
            : a.dayKey.localeCompare(b.dayKey)
        );

        setBookings(parsed);
        if (role === "ADMIN") setSelectBooking(parsed);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user?.userId]);

  const updateBookingById = (id: string, patch: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );

    // mantém selectBooking coerente se ele estiver a mostrar esse booking
    setSelectBooking((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  };

  const handleFilteredChange = useCallback((list: Booking[]) => {
    // só atualiza se realmente mudou (checa tamanho e IDs)
    setSelectBooking((prev) => {
      if (prev.length === list.length) {
        let same = true;
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].id !== list[i].id) {
            same = false;
            break;
          }
        }
        if (same) return prev; // evita novo render
      }
      return list;
    });
  }, []);

  // Agrupamento derivado (sempre consistente com bookings)
  const bookingsByDay = useMemo(() => {
    return bookings.reduce((acc, bk) => {
      (acc[bk.dayKey] ??= []).push(bk);
      return acc;
    }, {} as Record<string, Booking[]>);
  }, [bookings]);

  return (
    <div
      className="flex min-h-screen flex-col px-4 py-6 
      bg-white dark:bg-[#0B0B0C] 
      text-zinc-900 dark:text-[#EDEFF4]"
    >
      <NewBooking
        open={openBookingModal}
        onClose={() => setOpenBookingModal(false)}
        dashboard={true}
        date={selectedDate}
      />

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between pb-4">
        <div>
          <h1 className="text-xl font-semibold">Overview</h1>
          <div className="text-md text-zinc-600 dark:text-[#9AA0AE]">
            <h6>
              Bem vindo de volta <span className="font-bold">{user?.name}</span>
            </h6>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenBookingModal(true)}
            className="
              rounded-lg bg-gold px-3 py-1.5 text-sm font-medium text-white 
              hover:opacity-90 focus-visible:ring-2 focus-visible:ring-gold
            "
          >
            Nova marcação
          </button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <section
        className="
          w-full flex flex-col gap-4
          mb-6
          xl:grid xl:items-start
          xl:[grid-template-columns:minmax(0,1.4fr)_minmax(18rem,30rem)]
        "
      >
        {/* Calendário */}
        <div
          className="
          rounded-2xl border border-zinc-200 dark:border-[#2A2B31] 
          bg-white dark:bg-[#121316] 
          p-4 shadow-sm
          xl:order-1 order-2
        "
        >
          <MonthCalendarDF
            events={bookingsByDay}
            onClickDay={(day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const dayBookings = bookingsByDay[dayKey] ?? [];
              setSelectBooking(dayBookings);
              setSelectedDate(dayKey);
              console.log("Dia clicado:", dayKey);
            }}
            onFilteredChange={handleFilteredChange}
            selectedDay={selectedDate}
          />
        </div>

        {/* Resumo */}
        <div
          className="
          rounded-2xl border border-zinc-200 dark:border-[#2A2B31]
          bg-white dark:bg-[#121316] p-6 shadow-sm
          flex flex-col min-h-0

          /* alturas por breakpoint */
          h-[70vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh]

          /* em xl: ocupa o ecrã (ajusta 6rem se tiver header fixo) */
          xl:sticky xl:top-20
          xl:h-[calc(100vh-6rem)] xl:max-h-[calc(100vh-6rem)]

          xl:order-2 order-1
  "
        >
          {/* header fixo */}
          <div className="mb-4 shrink-0 flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-[#EDEFF4]">
              Resumo
            </h2>
            <button
              onClick={() => setSelectBooking(bookings)}
              className="text-sm text-white bg-gold px-3 py-1.5 rounded-lg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-gold"
            >
              Todas as Marcações!
            </button>
          </div>

          {/* texto fixo */}
          <div className="space-y-4 shrink-0">
            {role === "ADMIN" && (
              <p className="text-sm text-zinc-600 dark:text-[#9AA0AE]">
                Vê as métricas gerais, utilizadores e serviços.
              </p>
            )}
            {role === "FUNCIONARIO" && (
              <p className="text-sm text-zinc-600 dark:text-[#9AA0AE]">
                Vê a tua agenda e os teus clientes.
              </p>
            )}
            {role === "CLIENTE" && (
              <p className="text-sm text-zinc-600 dark:text-[#9AA0AE]">
                Vê as tuas marcações e podes agendar.
                <br />
                Ao carregar num dia do calendário, podes criar uma nova marcação
                ou verificar se já existem.
              </p>
            )}
          </div>

          {/* só a lista tem scroll */}
          <div className="mt-4 flex-1 min-h-0 overflow-auto">
            {selectBooking.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-[#9AA0AE]">
                Nenhuma marcação selecionada.
              </p>
            ) : (
              <ul className="space-y-1 p-2">
                {selectBooking.map((bk) => (
                  <li key={bk.id} className="flex justify-between">
                    <AppointmentItem
                      booking={bk}
                      onUpdate={updateBookingById}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
