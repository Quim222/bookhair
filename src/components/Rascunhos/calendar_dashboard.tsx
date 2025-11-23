"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import ptLocale from "@fullcalendar/core/locales/pt";
import type { EventContentArg, SlotLabelContentArg } from "@fullcalendar/core";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BsScissors } from "react-icons/bs";
import { LuCalendarDays, LuUsers, LuSettings, LuChrome } from "react-icons/lu";
import "./calendar.css"; // os teus overrides

type EventInput = {
  id?: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  extendedProps?: {
    type?: "corte" | "cor" | "barba" | "outro";
    cliente?: string;
    stylist?: string;
  };
};

const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
});

export default function Dashboard() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  const [events, setEvents] = useState<EventInput[]>([
    {
      title: "Corte — João",
      start: new Date(new Date().setHours(9, 0, 0, 0)),
      end: new Date(new Date().setHours(9, 30, 0, 0)),
      extendedProps: { type: "corte", cliente: "João", stylist: "Marta" },
    },
    {
      title: "Coloração — Ana",
      start: new Date(new Date().setHours(14, 0, 0, 0)),
      end: new Date(new Date().setHours(15, 0, 0, 0)),
      extendedProps: { type: "cor", cliente: "Ana", stylist: "Rita" },
    },
  ]);

  // proteção de rota (token no sessionStorage)
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setHydrated(true);
  }, [router]);

  // ==== Hooks do calendário (sempre antes de qualquer return) ====
  const headerToolbar = useMemo(
    () => ({
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    }),
    []
  );

  const handleSelect = useCallback((info: any) => {
    const newEvent: EventInput = {
      title: "Nova marcação",
      start: info.start,
      end: info.end,
    };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  const handleEventClick = useCallback((clickInfo: any) => {
    // abrir modal de detalhes/editar
    // console.log(clickInfo.event);
  }, []);

  const eventContent = useCallback((arg: EventContentArg) => {
    const ext = arg.event.extendedProps as
      | EventInput["extendedProps"]
      | undefined;
    const type = ext?.type;
    const chipClass =
      type === "corte"
        ? "bh-chip bh-chip--corte"
        : type === "cor"
        ? "bh-chip bh-chip--cor"
        : "bh-chip";
    return (
      <div className={chipClass}>
        <span className="bh-chip__time">{arg.timeText}</span>
        <BsScissors className="bh-chip__icon" aria-hidden />
        <span className="bh-chip__title">{arg.event.title}</span>
      </div>
    );
  }, []);

  const slotLabelContent = useCallback((arg: SlotLabelContentArg) => {
    return (arg.text || "").replace(":00", "h").replace(":30", "h30");
  }, []);
  // =================================================================

  if (!hydrated) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent" />
      </div>
    );
  }

  // util: filtrar marcações de “hoje” para a coluna do meio
  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const todays = events
    .filter((e) => isSameDay(new Date(e.start), today))
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-6">
      {/* GRID PRINCIPAL */}
      <div className="grid gap-6 lg:grid-cols-[260px,360px,1fr]">
        {/* Sidebar */}
        <aside className="rounded-2xl bg-white shadow-sm p-3 md:p-4 sticky top-4 h-max">
          <div className="mb-4 flex items-center gap-2 px-2">
            <div className="size-8 rounded-full bg-zinc-200" />
            <div>
              <p className="text-sm text-zinc-500">Olá,</p>
              <p className="text-sm font-medium">BookHair</p>
            </div>
          </div>
          <nav className="space-y-1">
            <NavItem icon={<LuChrome />} label="Início" active />
            <NavItem icon={<LuCalendarDays />} label="Agenda" />
            <NavItem icon={<LuUsers />} label="Clientes" />
            <NavItem icon={<LuSettings />} label="Definições" />
          </nav>
        </aside>

        {/* Coluna do meio: Marcações de hoje + botão */}
        <section className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white shadow-sm p-4">
            <h2 className="mb-3 text-lg font-semibold">Marcações de hoje</h2>
            {todays.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-zinc-500">
                Sem marcações hoje.
              </div>
            ) : (
              <ul className="space-y-3">
                {todays.map((b, i) => (
                  <li
                    key={i}
                    className="rounded-xl border p-3 hover:border-gold transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{b.title}</p>
                        <p className="text-sm text-zinc-500">
                          {b.extendedProps?.stylist
                            ? `com ${b.extendedProps.stylist}`
                            : ""}
                        </p>
                      </div>
                      <time className="rounded-md bg-gold/10 px-2 py-1 text-sm font-medium text-gold">
                        {new Date(b.start).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            className="rounded-2xl bg-gradient-to-r from-gold to-gold/80 px-4 py-3 font-medium text-white shadow hover:opacity-90"
            onClick={() => {
              /* abrir modal de nova marcação */
            }}
          >
            Nova marcação
          </button>
        </section>

        {/* Coluna da direita: Calendário */}
        <section className="rounded-2xl bg-white shadow-sm p-3 md:p-4">
          <FullCalendar
            locales={[ptLocale]}
            locale="pt"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={headerToolbar}
            height="auto" // ajusta à altura do container
            contentHeight="auto"
            slotDuration="00:30:00"
            slotMinTime="09:00:00"
            slotMaxTime="19:00:00"
            weekends={false}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: "09:00",
              endTime: "19:00",
            }}
            selectable
            selectMirror
            selectOverlap={false}
            select={handleSelect}
            eventClick={handleEventClick}
            eventContent={eventContent}
            slotLabelContent={slotLabelContent}
            events={events}
            nowIndicator
            stickyHeaderDates
            timeZone="Europe/Lisbon"
            dayMaxEvents={3}
          />
        </section>
      </div>
    </div>
  );
}

/* pequeno componente para os itens do menu */
function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm
        ${active ? "bg-gold/10 text-gold" : "hover:bg-zinc-100 text-zinc-700"}`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
