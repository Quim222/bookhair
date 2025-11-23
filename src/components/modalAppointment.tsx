"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { apiFetch } from "@/libs/api";
import { Service } from "./getServices";
import { User } from "@/libs/authSlice";
import { useAppSelector } from "@/libs/store";

export const HOUR_TIME_OPTIONS = Array.from(
  { length: (19 - 8 + 1) * 2 },
  (_, i) => {
    const hour = 8 + Math.floor(i / 2); // começa em 8 até 19
    const minute = i % 2 === 0 ? "00" : "30"; // alterna 00 e 30

    const hourStr = hour.toString().padStart(2, "0");
    return {
      value: `${hourStr}:${minute}`,
      label: `${hourStr}:${minute}`,
    };
  }
);

export default function ModalAppointment() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const searchParams = useSearchParams();
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.userRole;
  const [isGuest, setIsGuest] = useState(false);
  const canManageClients = role === "ADMIN" || role === "FUNCIONARIO";
  const isClient = role === "CLIENTE";
  // form state
  const [date, setDate] = useState<string>(() => {
    const paramDate = searchParams.get("date");
    if (paramDate) return paramDate;

    // se não existir, usa a data atual
    const today = new Date().toISOString().split("T")[0];
    return today;
  });
  const [time, setTime] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // autocomplete state (clientes)
  const [clientQuery, setClientQuery] = useState("");
  const [userFocus, setUserFocus] = useState(false);
  const filteredUsers = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name?.toLowerCase().includes(q));
  }, [users, clientQuery]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && router.back();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

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

    getServicesAndEmployees();

    return () => {
      cancelled = true;
    };
  }, [canManageClients]);

  useEffect(() => {
    if (isClient && user?.userId) {
      setSelectedClientId(user.userId);
      setClientQuery(user.name ?? "");
      setIsGuest(false); // garante que não ativa guest
    }
  }, [isClient, user?.userId, user?.name]);

  const close = () => router.back();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // lógica para guardar a marcação
    const data = new FormData(e.currentTarget);

    const dateStr = String(data.get("date")); // "10/11/2025"
    const timeStr = String(data.get("time")); // "12:00"

    const payload: {
      employeeId: FormDataEntryValue | null;
      serviceId: FormDataEntryValue | null;
      startTime: string;
      userId?: string;
      name_user?: string;
      phone_user?: string;
      consent_terms?: boolean;
    } = {
      employeeId: data.get("employee"),
      serviceId: data.get("service"),
      startTime: dateStr + "T" + timeStr + ":00",
    };

    if (!isGuest && selectedClientId) {
      payload.userId = selectedClientId;
    }

    if (isGuest) {
      if (name) payload.name_user = name;
      if (phone) payload.phone_user = phone;
      payload.consent_terms = true;
    }

    const res = await apiFetch("/bookings" + (isGuest ? "/guest" : ""), {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      alert("Marcação criada com sucesso!");
      router.push("/dashboard");
      router.refresh();
    } else {
      const fallback = "Erro ao criar marcação. Tente novamente.";
      const raw = await res.text(); // lê o corpo uma única vez
      let msg = fallback;

      try {
        const data = raw ? JSON.parse(raw) : null;
        // Prioridades: 409 com detail/message, depois detail, message, error, senão texto cru
        msg =
          (res.status === 409 && (data?.detail || data?.message)) ||
          data?.detail ||
          data?.message ||
          data?.error ||
          raw ||
          fallback;
      } catch {
        // não é JSON -> usa texto cru
        msg = raw || fallback;
      }

      setError(msg);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-40 bg-black/30"
        onClick={close}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      {/* Sheet */}
      <motion.aside
        key="sheet"
        role="dialog"
        aria-modal="true"
        className="
          fixed right-0 top-0 z-50 h-dvh w-full bg-white shadow-xl
          md:max-w-md md:rounded-l-2xl border-l border-zinc-200
          flex flex-col
        "
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.22 }}
      >
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Nova marcação</h2>
          <button
            onClick={close}
            className="rounded-md border px-2 py-1 text-sm hover:bg-zinc-50"
          >
            Fechar
          </button>
        </header>
        {error && <p className="text-red-500">{error}</p>}
        <form
          className="flex-1 overflow-auto p-4 space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="service"
              className="text-sm font-medium text-gray-700"
            >
              Serviço
            </label>
            <select
              id="service"
              name="service"
              className="mt-1 w-full rounded-md border border-gray-300 p-2 bg-white text-gray-800 text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            >
              <option value="">— Escolha um serviço —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="employee"
              className="text-sm font-medium text-gray-700"
            >
              Funcionário
            </label>
            <select
              id="employee"
              name="employee"
              className="mt-1 w-full rounded-md border border-gray-300 p-2 bg-white text-gray-800 text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            >
              <option>— Escolha um funcionário —</option>
              {employees.map((e, i) => (
                <option
                  key={e.userId}
                  value={e.userId}
                  className={
                    i === employees.length - 1 ? "border-b border-gray-300" : ""
                  }
                >
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="date" className="text-sm font-medium">
                Data
              </label>
              <input
                onChange={(e) => setDate(e.target.value)}
                name="date"
                id="date"
                type="date"
                value={date}
                className="mt-1 w-full rounded-md border p-2"
              />
            </div>
            <div>
              <label htmlFor="time" className="text-sm font-medium">
                Hora
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                name="time"
                id="time"
                className="mt-1 w-full rounded-md border p-2"
              >
                {HOUR_TIME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clientes - Autocomplete simples */}
          {canManageClients ? (
            !isGuest && (
              <div className="relative">
                <label
                  htmlFor="clients"
                  className="text-sm font-medium text-gray-700"
                >
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
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 bg-white text-gray-800 text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  autoComplete="off"
                />
                {userFocus && (
                  <ul className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredUsers.length ? (
                      filteredUsers.map((u) => (
                        <li
                          key={u.userId}
                          onClick={() => {
                            setClientQuery(u.name ?? "");
                            setSelectedClientId(u.userId);
                          }}
                          className="p-2 cursor-pointer hover:bg-gray-100"
                        >
                          {u.name}
                        </li>
                      ))
                    ) : (
                      <li className="p-2 text-gray-500">
                        Nenhum cliente encontrado
                      </li>
                    )}
                  </ul>
                )}
                {/* Dica visual do selecionado */}
                {selectedClientId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selecionado:{" "}
                    {users.find((u) => u.userId === selectedClientId)?.name}
                  </p>
                )}
              </div>
            )
          ) : (
            <div>
              <label
                htmlFor="client"
                className="text-sm font-medium text-gray-700"
              >
                Cliente
              </label>
              <input
                id="client"
                value={user?.name ?? ""}
                readOnly
                className="mt-1 w-full rounded-md border border-gray-300 p-2 bg-gray-100 text-gray-700 text-sm"
              />
            </div>
          )}

          {canManageClients && isGuest && (
            <div className="relative space-y-3 mt-10 mb-10">
              <div>
                <label
                  htmlFor="nameClient"
                  className="text-sm font-medium text-gray-700"
                >
                  Nome do Cliente
                </label>
                <input
                  id="nameClient"
                  type="text"
                  placeholder="Nome do cliente"
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 bg-white text-gray-800 text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  required={isGuest}
                />
              </div>
              <div>
                <label
                  htmlFor="phoneClient"
                  className="text-sm font-medium text-gray-700"
                >
                  Telefone do Cliente
                </label>
                <input
                  id="phoneClient"
                  type="tel"
                  placeholder="Telefone do cliente"
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 bg-white text-gray-800 text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  required={isGuest}
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between px-6">
            {canManageClients && (
              <div className="flex items-center">
                <input
                  onChange={(e) => {
                    setIsGuest(e.target.checked);
                    console.log(e.target.checked);
                  }}
                  type="checkbox"
                  title="Guest"
                  placeholder="Guest"
                  aria-label="Guest"
                  name="guest-checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="guest-checkbox"
                  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Guest
                </label>
              </div>
            )}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={close}
                className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button className="rounded-md bg-[var(--bh-gold,#D4AF37)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-transform hover:scale-[1.05] duration-200">
                Guardar
              </button>
            </div>
          </div>
        </form>
      </motion.aside>
    </AnimatePresence>
  );
}
