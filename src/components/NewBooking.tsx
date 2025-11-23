"use client";

import SlideOver from "./SlideOver";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@/libs/authSlice";
import { apiFetch } from "@/libs/api";
import { useAppSelector } from "@/libs/store";
import { Service } from "./getServices";
import { HOUR_TIME_OPTIONS } from "./modalAppointment";
import { format } from "date-fns";

type Props = {
  open: boolean;
  onClose: () => void;
  dashboard: boolean;
  date?: string;
};

export default function NewBooking({ open, onClose, dashboard, date: initialDate }: Props) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(initialDate || "");
  const [time, setTime] = useState("09:00");
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.userRole;
  const [status, setStatus] = useState<User["statusUser"]>("ATIVO");
  const [employees, setEmployees] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const canManageClients = role === "ADMIN" || role === "FUNCIONARIO";
  const [isGuest, setIsGuest] = useState(!dashboard);
  const isClient = role === "CLIENTE";
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function getServicesAndEmployees() {
      try {
        const [resServices, resEmployees, resUsers] = await Promise.all([
          apiFetch("/service", { noAuth: true }),
          apiFetch("/users/employees", { noAuth: true }),
          canManageClients
            ? apiFetch("/users/clients")
            : Promise.resolve({ ok: true, json: async () => [] }),
        ]);

        if (!resServices.ok || !resEmployees.ok || !resUsers.ok) {
          console.error("Falha ao buscar serviços ou utilizadores");
          return;
        }

        const [servicesData, employeesData, usersData] = await Promise.all([
          resServices.json(),
          resEmployees.json(),
          resUsers.json(),
        ]);

        if (!cancelled) {
          setServices(servicesData);
          setEmployees(employeesData);
          setUsers(usersData);
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (open) {
      setDate(initialDate ? initialDate : format(new Date(), "yyyy-MM-dd"));
    }

    getServicesAndEmployees();

    return () => {
      cancelled = true;
    };
  }, [initialDate, open, canManageClients]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const [clientQuery, setClientQuery] = useState("");
  const [userFocus, setUserFocus] = useState(false);
  const filteredUsers = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name?.toLowerCase().includes(q));
  }, [users, clientQuery]);

  useEffect(() => {
    if (isClient && user?.userId) {
      setSelectedClientId(user.userId);
      setClientQuery(user.name ?? "");
      setIsGuest(false);
    }
  }, [isClient, user?.userId, user?.name]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);

    try {
      const data = new FormData(e.currentTarget);

      const dateStr = String(data.get("date"));
      const timeStr = String(data.get("time"));
      const guest = isGuest;

      const payload = {
        employeeId: data.get("employee"),
        serviceId: data.get("service"),
        startTime: `${dateStr}T${timeStr}:00`,
        ...(guest
          ? {
              name_user: data.get("nameClient"),
              phone_user: data.get("phoneClient"),
              consent_terms: true,
            }
          : {
              userId: selectedClientId,
            }),
      };

      const response = await apiFetch("/bookings" + (guest ? "/guest" : ""), {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        noAuth: guest,
      });

      if (response.ok) {
        alert("Marcação criada com sucesso!");
        onClose();
      } else {
        const fallback = "Erro ao criar marcação. Tente novamente.";
        const raw = await response.text();
        let msg = fallback;
        try {
          const data = raw ? JSON.parse(raw) : null;
          msg =
            (response.status === 409 && (data?.detail || data?.message)) ||
            data?.detail ||
            data?.message ||
            data?.error ||
            raw ||
            fallback;
        } catch {
          msg = raw || fallback;
        }
        setErr(msg);
      }
    } catch (e: any) {
      setErr(e?.message || "Falha ao guardar utilizador.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={"Nova Marcação"}
      side="right"
      width={420}
    >
      <div className="space-y-4">
        {err && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40">
            {err}
          </div>
        )}

        <form onSubmit={handleSave} className="flex-1 overflow-auto p-4 space-y-4">
          {/* Serviço */}
          <div>
            <label htmlFor="service" className="text-sm font-medium text-gray-700 dark:text-[#EDEFF4]">
              Serviço
            </label>
            <select
              id="service"
              name="service"
              className="
                mt-1 w-full rounded-md border p-2 text-sm
                bg-white text-gray-800 border-gray-300
                focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
              "
              defaultValue=""
            >
              <option value="" disabled>— Escolha um serviço —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Funcionário */}
          <div>
            <label htmlFor="employee" className="text-sm font-medium text-gray-700 dark:text-[#EDEFF4]">
              Funcionário
            </label>
            <select
              id="employee"
              name="employee"
              className="
                mt-1 w-full rounded-md border p-2 text-sm
                bg-white text-gray-800 border-gray-300
                focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
              "
              defaultValue=""
            >
              <option value="" disabled>— Escolha um funcionário —</option>
              {employees.map((e) => (
                <option key={e.userId} value={e.userId}>{e.name}</option>
              ))}
            </select>
          </div>

          {/* Data & Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-[#EDEFF4]">
                Data
              </label>
              <input
                onChange={(e) => setDate(e.target.value)}
                name="date"
                id="date"
                type="date"
                value={date}
                className="
                  mt-1 w-full rounded-md border p-2
                  bg-white text-gray-800 border-gray-300
                  focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                  dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                "
              />
            </div>
            <div>
              <label htmlFor="time" className="text-sm font-medium text-gray-700 dark:text-[#EDEFF4]">
                Hora
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                name="time"
                id="time"
                className="
                  mt-1 w-full rounded-md border p-2
                  bg-white text-gray-800 border-gray-300
                  focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                  dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                "
              >
                {HOUR_TIME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clientes */}
          {dashboard &&
            (canManageClients ? (
              !isGuest && (
                <div className="relative">
                  <label htmlFor="clients" className="text-sm font-medium text-gray-700 dark:text-[#EDEFF4]">
                    Clientes
                  </label>
                  <input
                    onFocus={() => setUserFocus(true)}
                    onBlur={() => setTimeout(() => setUserFocus(false), 100)}
                    id="clients"
                    value={clientQuery}
                    onChange={(e) => {
                      setClientQuery(e.target.value);
                      setSelectedClientId("");
                    }}
                    placeholder="Pesquisar cliente por nome…"
                    className="
                      mt-1 w-full rounded-md border p-2 text-sm
                      bg-white text-gray-800 border-gray-300
                      focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                      dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                    "
                    autoComplete="off"
                  />
                  {userFocus && (
                    <ul
                      className="
                        absolute z-50 w-full mt-1 rounded-md border shadow-lg max-h-48 overflow-y-auto
                        bg-white border-gray-200
                        dark:bg-[#121316] dark:border-[#2A2B31]
                      "
                    >
                      {filteredUsers.length ? (
                        filteredUsers.map((u) => (
                          <li
                            key={u.userId}
                            onClick={() => {
                              setClientQuery(u.name ?? "");
                              setSelectedClientId(u.userId);
                            }}
                            className="p-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/5 text-gray-800 dark:text-[#EDEFF4]"
                          >
                            {u.name}
                          </li>
                        ))
                      ) : (
                        <li className="p-2 text-gray-500 dark:text-[#9AA0AE]">
                          Nenhum cliente encontrado
                        </li>
                      )}
                    </ul>
                  )}
                  {selectedClientId && (
                    <p className="text-xs text-gray-500 dark:text-[#9AA0AE] mt-1">
                      Selecionado: {users.find((u) => u.userId === selectedClientId)?.name}
                    </p>
                  )}
                </div>
              )
            ) : (
              <div>
                <label htmlFor="client" className="text-sm font-medium text-gray-700 dark:text-[#EDEFF4]">
                  Cliente
                </label>
                <input
                  id="client"
                  value={user?.name ?? ""}
                  readOnly
                  className="
                    mt-1 w-full rounded-md border p-2 text-sm
                    bg-gray-100 text-gray-700 border-gray-300
                    dark:bg-white/5 dark:text-[#EDEFF4] dark:border-[#2A2B31]
                  "
                />
              </div>
            ))}

          {/* Guest quick form */}
          {isGuest && (
            <div className="relative space-y-3 mt-10 mb-10">
              <div>
                <label htmlFor="nameClient" className="text-sm font-medium text-gray-700 dark:text-[#EDEFF4]">
                  Nome do Cliente
                </label>
                <input
                  id="nameClient"
                  type="text"
                  name="nameClient"
                  placeholder="Nome do cliente"
                  className="
                    mt-1 w-full rounded-md border p-2 text-sm
                    bg-white text-gray-800 border-gray-300
                    focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                    dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                  "
                  required={isGuest}
                />
              </div>
              <div>
                <label htmlFor="phoneClient" className="text-sm font-medium text-gray-700 dark:text-[#EDEFF4]">
                  Telefone do Cliente
                </label>
                <input
                  id="phoneClient"
                  type="tel"
                  name="phoneClient"
                  placeholder="Telefone do cliente"
                  className="
                    mt-1 w-full rounded-md border p-2 text-sm
                    bg-white text-gray-800 border-gray-300
                    focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                    dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                  "
                  required={isGuest}
                />
              </div>
            </div>
          )}

          {/* Footer ações */}
          <div className="pt-2 flex items-center justify-between px-6">
            {dashboard && canManageClients && (
              <div className="flex items-center">
                <input
                  onChange={(e) => setIsGuest(e.target.checked)}
                  type="checkbox"
                  id="guest-checkbox"
                  name="guest-checkbox"
                  className="
                    h-4 w-4 rounded
                    text-[var(--bh-gold,#D4AF37)]
                    focus:ring-[var(--bh-gold,#D4AF37)]
                    border-gray-300
                    dark:border-[#2A2B31] dark:bg-[#0B0B0C]
                  "
                />
                <label
                  htmlFor="guest-checkbox"
                  className="ms-2 text-sm font-medium text-gray-900 dark:text-[#EDEFF4]"
                >
                  Guest
                </label>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="
                  rounded-md border px-3 py-2 text-sm
                  hover:bg-zinc-50
                  border-zinc-200 text-zinc-800
                  dark:border-[#2A2B31] dark:text-[#EDEFF4] dark:hover:bg-white/5
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
                "
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="
                  rounded-md bg-[var(--bh-gold,#D4AF37)] px-3 py-2 text-sm font-medium text-white
                  hover:opacity-90 transition-transform hover:scale-[1.05] duration-200
                  disabled:opacity-70
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
                "
              >
                {saving ? "A guardar…" : "Guardar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </SlideOver>
  );
}
