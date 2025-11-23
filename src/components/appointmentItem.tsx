import { Booking } from "@/app/dashboard/page";
import { apiFetch } from "@/libs/api";
import { useAppSelector } from "@/libs/store";
import { useState } from "react";

type AppointmentItemProps = {
  booking: Booking;
  onUpdate: (id: string, patch: Partial<Booking>) => void;
};

export default function AppointmentItem({
  booking,
  onUpdate,
}: AppointmentItemProps) {
  const role = useAppSelector((s) => s.auth.user?.userRole);
  const [hovering, setHovering] = useState(false);

  async function handleApprove() {
    try {
      const resp = await apiFetch(
        `/bookings/${booking.id}/status?status=CONFIRMED`,
        { method: "PUT" }
      );
      if (!resp.ok) throw new Error("Erro ao aprovar a marcação");
      onUpdate(booking.id, { status: "CONFIRMED" });
      setHovering(false);
    } catch (err) {
      console.error("Erro ao aprovar:", err);
    }
  }

  async function handleDelete() {
    try {
      const response = await apiFetch(
        `/bookings/${booking.id}/status?status=CANCELLED`,
        { method: "PUT" }
      );
      if (!response.ok) throw new Error("Erro ao cancelar a marcação");
      onUpdate(booking.id, { status: "CANCELLED" });
    } catch (err) {
      console.error("Erro ao cancelar:", err);
    }
  }

  // Paleta de estado com variantes dark acessíveis
  const statusClass =
    booking.status === "CONFIRMED"
      ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
      : booking.status === "PENDENTE"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300"
      : booking.status === "CANCELLED"
      ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
      : "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"; // FINISHED

  return (
    <div
      className="
        w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm
        ring-1 ring-transparent transition
        hover:shadow-md hover:ring-[var(--bh-gold,#D4AF37)]/60
        dark:border-[#2A2B31] dark:bg-[#121316] dark:text-[#EDEFF4]
      "
    >
      {/* Topo: Serviço + Hora */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <span
          className="
            rounded-full bg-[var(--bh-gold,#D4AF37)]/10 px-3 py-1
            text-[13px] font-semibold tracking-wide
            text-[var(--bh-gold,#D4AF37)]
          "
        >
          {booking.serviceName}
        </span>

        <span
          className="
            rounded-md px-2.5 py-1 text-xs font-medium
            bg-zinc-100 text-zinc-700
            dark:bg-white/5 dark:text-[#D7DBE3]
          "
        >
          <span className="mr-1 text-zinc-500 dark:text-[#9AA0AE]">⏰</span>
          {booking.date} {" – "}
          {booking.startTime} {" às "} {booking.endTime}
        </span>
      </div>

      {/* Cliente (realce) */}
      <div className="mb-1 flex items-center gap-2">
        <div
          className="
            grid h-6 w-6 place-items-center rounded-full
            bg-[var(--bh-gold,#D4AF37)]/15 text-[12px] font-semibold
            text-[var(--bh-gold,#D4AF37)]
          "
        >
          {booking.clientName?.[0]?.toUpperCase() ?? "C"}
        </div>
        <span className="text-sm font-semibold text-zinc-900 dark:text-[#EDEFF4]">
          {booking.clientName}
        </span>
      </div>

      {/* Funcionário */}
      <div className="text-[13px] text-zinc-600 dark:text-[#9AA0AE]">
        <span className="font-medium text-zinc-700 dark:text-[#EDEFF4]">
          Funcionário:{" "}
        </span>
        {booking.employeeName}
      </div>

      {/* Estado (apenas ADMIN) */}
      {role === "ADMIN" && (
        <div className="mt-3">
          <button
            type="button"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={handleApprove}
            disabled={
              booking.status === "CONFIRMED" ||
              booking.status === "CANCELLED" ||
              booking.status === "FINISHED"
            }
            className={`
              rounded-full px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer
              disabled:cursor-auto disabled:opacity-80
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
              ${hovering
                ? "bg-green-500 text-white dark:bg-green-500 dark:text-white"
                : statusClass}
            `}
          >
            {hovering ? "APROVAR" : booking.status}
          </button>

          {booking.status !== "CANCELLED" && booking.status !== "FINISHED" && (
            <button
              className="
                ml-2 rounded-full px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer
                bg-red-300 text-white hover:bg-red-500
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
                dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500 dark:hover:text-white
              "
              onClick={handleDelete}
            >
              CANCEL
            </button>
          )}
        </div>
      )}
    </div>
  );
}
