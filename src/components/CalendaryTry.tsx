"use client";

import React, { useMemo, useState, useId, useEffect, useRef } from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { pt } from "date-fns/locale";
import { Booking } from "@/app/dashboard/page";

export type BHEvent = {
  id?: string;
  title: string;
  date: Date;
  extended?: {
    type?: "corte" | "cor" | "barba" | "outro";
    stylist?: string;
    service?: string;
    cliente?: string;
  };
};

type Props = {
  events: Record<string, Booking[]>;
  onClickDay?: (day: Date) => void;
  onFilteredChange?: (filtered: Booking[]) => void;
};

const WEEKDAYS = ["S", "T", "Q", "Q", "S"]; // seg–sex
const SHOW_LIMIT = 2;

export default function MonthCalendarDF({
  events,
  onClickDay,
  onFilteredChange,
}: Props) {
  const [cursor, setCursor] = useState<Date>(new Date());
  const [stylist, setStylist] = useState<string>("ALL");
  const [service, setService] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");

  const stylistId = useId();
  const serviceId = useId();
  const statusId = useId();

  const allBookings = useMemo(() => Object.values(events).flat(), [events]);

  const stylists = useMemo(
    () => [
      "ALL",
      ...Array.from(
        new Set(allBookings.map((b) => b.employeeName).filter(Boolean))
      ),
    ],
    [allBookings]
  );

  const services = useMemo(
    () => [
      "ALL",
      ...Array.from(
        new Set(allBookings.map((e) => e.serviceName).filter(Boolean))
      ),
    ],
    [allBookings]
  );

  const serviceStatus = useMemo(
    () => [
      "ALL",
      ...Array.from(new Set(allBookings.map((e) => e.status).filter(Boolean))),
    ],
    [allBookings]
  );

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).filter(
      (d) => d.getDay() !== 0 && d.getDay() !== 6
    );
  }, [cursor]);

  const filteredByDay = useMemo(() => {
    const byDay: Record<string, Booking[]> = {};
    for (const b of allBookings) {
      if (stylist !== "ALL" && b.employeeName !== stylist) continue;
      if (service !== "ALL" && b.serviceName !== service) continue;
      if (status !== "ALL" && b.status !== status) continue;
      (byDay[b.dayKey] ??= []).push(b);
    }
    for (const k of Object.keys(byDay)) {
      byDay[k].sort((a, z) => (a.startMinutes ?? 0) - (z.startMinutes ?? 0));
    }
    return byDay;
  }, [allBookings, stylist, service, status]);

  useEffect(() => {
    if (!onFilteredChange) return;

    const flat = Object.values(filteredByDay).flat();

    // hash simples: tamanho + primeiros/últimos IDs (evita custo alto)
    const sig = `${flat.length}|${flat[0]?.id ?? ""}|${
      flat[flat.length - 1]?.id ?? ""
    }`;
    const lastSigRef =
      (useRef as any).lastSigRef ??
      ((useRef as any).lastSigRef = { current: "" });
    // ^ se já tiver um lastSigRef no arquivo ignore esta linha; do contrário:
    // const lastSigRef = useRef("");

    if (lastSigRef.current !== sig) {
      lastSigRef.current = sig;
      onFilteredChange(flat);
    }
  }, [filteredByDay, onFilteredChange]);

  const eventsOf = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    return filteredByDay[key] ?? [];
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top bar: navegação + filtros */}
      <div
        className="
          flex flex-wrap items-center justify-center md:justify-between gap-8
          rounded-lg p-2
          bg-white border border-zinc-200
          dark:bg-[#121316] dark:border-[#2A2B31] dark:text-[#EDEFF4]
        "
      >
        <div className="flex items-center justify-center gap-2 w-full">
          <button
            className="
              rounded-lg border px-3 py-1
              border-zinc-300 text-zinc-800 hover:bg-zinc-100
              dark:border-[#2A2B31] dark:text-[#EDEFF4] dark:hover:bg-white/5
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
            "
            onClick={() => setCursor((d) => subMonths(d, 1))}
            aria-label="Mês anterior"
            title="Mês anterior"
          >
            ‹
          </button>
          <p className="text-xl font-bold uppercase text-zinc-900 dark:text-[#EDEFF4]">
            {format(cursor, "MMMM yyyy", { locale: pt })}
          </p>
          <button
            className="
              rounded-lg border px-3 py-1
              border-zinc-300 text-zinc-800 hover:bg-zinc-100
              dark:border-[#2A2B31] dark:text-[#EDEFF4] dark:hover:bg-white/5
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
            "
            onClick={() => setCursor((d) => addMonths(d, 1))}
            aria-label="Mês seguinte"
            title="Mês seguinte"
          >
            ›
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap md:flex-row items-center justify-center gap-5 w-full">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <label
              htmlFor={stylistId}
              className="text-sm text-zinc-600 dark:text-[#9AA0AE]"
            >
              Funcionário
            </label>
            <select
              id={stylistId}
              className="
                rounded-md border px-4 py-1 text-sm
                bg-white text-zinc-900 border-zinc-300
                dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
              "
              value={stylist}
              onChange={(e) => setStylist(e.target.value)}
            >
              {stylists.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <label
              htmlFor={serviceId}
              className="text-sm text-zinc-600 dark:text-[#9AA0AE]"
            >
              Serviço
            </label>
            <select
              id={serviceId}
              className="
                rounded-md border px-2 py-1 text-sm
                bg-white text-zinc-900 border-zinc-300
                dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
              "
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <label
              htmlFor={statusId}
              className="text-sm text-zinc-600 dark:text-[#9AA0AE]"
            >
              Estado
            </label>
            <select
              id={statusId}
              className="
                rounded-md border px-2 py-1 text-sm
                bg-white text-zinc-900 border-zinc-300
                dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
              "
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {serviceStatus.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cabeçalho dias da semana */}
      <div className="shrink-0 grid grid-cols-5 gap-1 rounded-xl overflow-hidden bg-zinc-200 dark:bg-[#1A1C22]">
        {WEEKDAYS.map((w, i) => (
          <div
            key={i}
            className="
              flex justify-center items-center py-3 text-center text-xs font-medium
              bg-white text-zinc-500
              dark:bg-[#121316] dark:text-[#9AA0AE]
            "
          >
            {w}
          </div>
        ))}
      </div>

      {/* Grade dos dias */}
      <div className="grid grid-cols-5 auto-rows-[minmax(72px,1fr)] gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const outMonth = !isSameMonth(day, cursor);
          const today = isToday(day);
          const dayBookings = eventsOf(day);

          const count = dayBookings.length;
          const showOverflow = count > SHOW_LIMIT;

          return (
            <button
              key={key}
              onClick={() => onClickDay?.(day)}
              title={`Dia ${format(day, "d MMMM yyyy", { locale: pt })}`}
              className={[
                "relative w-full min-h-[100px] rounded-lg border bg-white",
                today
                  ? "border-[var(--bh-gold,#D4AF37)] ring-1 ring-[var(--bh-gold,#D4AF37)]"
                  : "border-zinc-200",
                outMonth && "opacity-50",
                "focus:outline-none focus:ring-2 focus:ring-[var(--bh-gold,#D4AF37)]",
                "dark:bg-[#121316] dark:border-[#2A2B31] dark:text-[#EDEFF4]",
              ].join(" ")}
            >
              {/* número do dia */}
              <span className="absolute left-1.5 top-1.5 text-xs font-medium text-zinc-700 dark:text-[#D7DBE3]">
                {format(day, "d", { locale: pt })}
              </span>

              {/* hoje: dot */}
              {today && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--bh-gold,#D4AF37)]" />
              )}

              {/* conteúdo */}
              <div className="absolute inset-x-1 bottom-1">
                {/* Mobile: dots */}
                <div className="flex gap-1 md:hidden">
                  {Array.from({ length: Math.min(count, 3) }).map((_, idx) => (
                    <span
                      key={idx}
                      className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"
                    />
                  ))}
                  {count > 3 && (
                    <span className="ml-1 text-[10px] text-zinc-500 dark:text-[#9AA0AE]">
                      +{count - 3}
                    </span>
                  )}
                </div>

                {/* Desktop: pílulas */}
                <div className="hidden md:block space-y-1">
                  {showOverflow ? (
                    <div
                      className={[
                        "truncate rounded-md px-2 py-1 text-[11px] font-bold text-center",
                        count > 5
                          ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                      ].join(" ")}
                    >
                      {count} marcações
                    </div>
                  ) : (
                    dayBookings.slice(0, SHOW_LIMIT).map((bk, idx) => {
                      const lower = (bk.serviceName || "").toLowerCase();
                      const pillBase =
                        "truncate rounded-md px-2 py-1 text-[11px] font-medium";
                      const pillCls = lower.includes("lavagem")
                        ? // roxo suave
                          "bg-[rgba(142,108,255,.14)] text-[#4e3aa6] dark:bg-[#8E6CFF]/20 dark:text-[#CFC5FF]"
                        : lower.includes("corte")
                        ? // dourado
                          "bg-[rgba(212,175,55,.14)] text-[#7a5b12] dark:bg-[var(--bh-gold,#D4AF37)]/20 dark:text-[#F1E4B8]"
                        : // neutro
                          "bg-zinc-100 text-zinc-700 dark:bg-white/5 dark:text-[#D7DBE3]";
                      return (
                        <div
                          key={bk.id ?? idx}
                          className={`${pillBase} ${pillCls}`}
                          title={`${bk.serviceName} — ${bk.clientName} (${bk.startTime}–${bk.endTime})`}
                        >
                          {(bk.serviceName ?? "Serviço") +
                            " — " +
                            (bk.clientName ?? "Cliente")}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
