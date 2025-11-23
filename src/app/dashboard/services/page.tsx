"use client";

import Image from "next/image";
import { getServices, Service } from "@/components/getServices";
import { apiFetch } from "@/libs/api";
import { useAppSelector } from "@/libs/store";
import React, { useEffect, useMemo, useState } from "react";

type FormState = {
  id?: string;
  name: string;
  description: string;
  duration: number | "";
  price: number | "";
  image?: string;
  color: string;
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [mode, setMode] = useState<"list" | "form">("list");
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    duration: "",
    price: "",
    image: "",
    color: "#000000",
  });

  const user = useAppSelector((s) => s.auth.user);
  const canEdit = useMemo(
    () => user?.userRole === "ADMIN" || user?.userRole === "FUNCIONARIO",
    [user]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await getServices();
        setServices(res);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError(err?.message ?? "Falha ao carregar serviços");
          console.error("Failed to fetch services:", err);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleDelete(serviceId: string) {
    if (!confirm("Tem a certeza que deseja eliminar este serviço?")) return;
    (async () => {
      try {
        await apiFetch(`/service/${serviceId}`, { method: "DELETE" });
        setServices((prev) => prev.filter((s) => s.id !== serviceId));
      } catch (err) {
        console.error("Failed to delete service:", err);
        alert("Falha ao eliminar serviço. Tente novamente.");
      }
    })();
  }

  function openCreate() {
    setForm({
      name: "",
      description: "",
      duration: "",
      price: "",
      image: "",
      color: "#000000",
    });
    setMode("form");
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFilePreview(f ? URL.createObjectURL(f) : null);
  }

  function openEdit(s: Service) {
    setForm({
      id: s.id,
      name: s.name ?? "",
      description: s.description ?? "",
      duration: Number(s.duration) ?? "",
      price: Number(s.price) ?? "",
      image: s.image ?? "",
      color: s.color ?? "#000000",
    });
    setMode("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name || !form.duration || !form.price || !form.description) {
      alert("Nome, duração, preço e descrição são obrigatórios.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration: Number(form.duration),
      price: Number(form.price),
      color: form.color || "#000000",
    };

    try {
      if (form.id) {
        const res = await apiFetch(`/service/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Falha ao atualizar serviço");
        const updated: Service = await res.json();
        if (file && updated.id) {
          try {
            const imgUrl = await uploadServicePhoto(updated.id, file, "PUT");
            updated.image = imgUrl;
            alert("Serviço e foto atualizados com sucesso.");
          } catch (err) {
            console.error("Failed to upload image:", err);
            alert("Serviço atualizado, mas falha ao enviar a foto.");
          }
        } else {
          updated.image = form.image ?? updated.image ?? "";
        }
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const res = await apiFetch("/service", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Falha ao criar serviço");
        const created: Service = await res.json();
        if (file && created.id) {
          try {
            const imgUrl = await uploadServicePhoto(created.id, file, "POST");
            created.image = imgUrl;
            alert("Serviço e foto enviados com sucesso.");
          } catch (err) {
            console.error("Failed to upload image:", err);
            alert("Serviço criado, mas falha ao enviar a foto.");
          }
        }
        setServices((prev) => [created, ...prev]);
      }
      file && URL.revokeObjectURL(filePreview || "");
      setMode("list");
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "Ocorreu um erro ao gravar o serviço.");
    }
  }

  async function uploadServicePhoto(serviceId: string, file: File, action: "POST" | "PUT") {
    const fd = new FormData();
    fd.append("file", file);

    const res = await apiFetch(`/photosUser/service/${serviceId}`, {
      method: action,
      body: fd,
    });
    if (!res.ok) throw new Error("Falha ao enviar a foto");

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
  }

  return (
    <main className="min-h-dvh flex flex-col bg-white text-zinc-900 dark:bg-[#0B0B0C] dark:text-[#EDEFF4]">
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="mb-10 flex items-center justify-between">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Serviços</h1>
              <p className="text-sm text-zinc-600 dark:text-[#9AA0AE]">
                Edita, elimina ou adiciona novos serviços. Mantém as imagens bonitas como na página inicial.
              </p>
            </div>

            {canEdit && mode === "list" && (
              <button
                onClick={openCreate}
                className="
                  rounded-md bg-[var(--bh-gold,#D4AF37)] px-4 py-2 text-sm font-medium text-white
                  hover:opacity-90 hover:scale-[1.02] transition-transform
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
                "
              >
                Adicionar serviço
              </button>
            )}
          </header>

          {/* LISTA */}
          {mode === "list" && (
            <>
              {loading && (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <li
                      key={i}
                      className="
                        h-48 rounded-2xl animate-pulse
                        bg-zinc-200/60 dark:bg-white/5
                        border border-zinc-200 dark:border-[#2A2B31]
                      "
                    />
                  ))}
                </ul>
              )}

              {error && !loading && (
                <div className="rounded-md border p-4 text-sm text-red-700 bg-red-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </div>
              )}

              {!loading && !error && (
                <>
                  {services.length === 0 ? (
                    <div className="flex items-center justify-between rounded-lg border p-4 border-zinc-200 dark:border-[#2A2B31] bg-white dark:bg-[#121316]">
                      <p className="text-sm text-zinc-600 dark:text-[#9AA0AE]">
                        Ainda não existem serviços.
                      </p>
                      {canEdit && (
                        <button
                          onClick={openCreate}
                          className="
                            rounded-md bg-[var(--bh-gold,#D4AF37)] px-3 py-2 text-sm text-white
                            hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
                          "
                        >
                          Criar o primeiro
                        </button>
                      )}
                    </div>
                  ) : (
                    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {services.map((service) => (
                        <li
                          key={service.id}
                          className="
                            group relative overflow-hidden rounded-2xl
                            border bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-lg
                            border-zinc-200 dark:border-[#2A2B31] dark:bg-[#121316] dark:ring-0
                          "
                        >
                          <div
                            onMouseEnter={() => setHoveredId(service.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="relative overflow-hidden aspect-[4/3] w-full"
                          >
                            {service.image ? (
                              <Image
                                src={service.image}
                                alt={service.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                                priority={false}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-zinc-200 dark:bg-[#1A1C22]">
                                <span className="text-sm text-zinc-700 dark:text-[#D7DBE3] px-3 text-center">
                                  {service.name}
                                </span>
                              </div>
                            )}

                            {/* overlay para legibilidade */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                            {/* conteúdo */}
                            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                              <div className="flex items-center justify-between gap-3">
                                <h2 className="flex-1 truncate text-lg font-semibold text-white drop-shadow">
                                  {service.name}
                                </h2>
                                <p className="shrink-0 text-sm text-white/90">
                                  {service.duration} min •{" "}
                                  {new Intl.NumberFormat("pt-PT", {
                                    minimumFractionDigits: 2,
                                  }).format(Number(service.price))}
                                  €
                                </p>
                              </div>

                              {service.description && (
                                <p className="mt-1 text-sm text-white/90 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                            </div>

                            {/* ações */}
                            {canEdit && hoveredId === service.id && (
                              <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEdit(service);
                                  }}
                                  className="
                                    rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium
                                    backdrop-blur hover:bg-white
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
                                    dark:bg-white/10 dark:text-[#EDEFF4] dark:hover:bg-white/20
                                  "
                                  aria-label={`Editar ${service.name}`}
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(service.id);
                                  }}
                                  className="
                                    rounded-full px-3 py-1.5 text-xs font-medium text-white
                                    bg-red-600/90 hover:bg-red-600
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                                  "
                                  aria-label={`Eliminar ${service.name}`}
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </>
          )}

          {/* FORMULÁRIO */}
          {mode === "form" && (
            <div className="rounded-2xl border p-6 shadow-sm border-zinc-200 dark:border-[#2A2B31] bg-white dark:bg-[#121316]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {form.id ? "Editar serviço" : "Adicionar serviço"}
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("list")}
                    className="
                      rounded-md border px-3 py-2 text-sm
                      border-zinc-200 text-zinc-800 hover:bg-zinc-50
                      dark:border-[#2A2B31] dark:text-[#EDEFF4] dark:hover:bg-white/5
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
                    "
                  >
                    Cancelar
                  </button>
                  <button
                    form="service-form"
                    type="submit"
                    className="
                      rounded-md bg-[var(--bh-gold,#D4AF37)] px-4 py-2 text-sm font-medium text-white
                      hover:opacity-90
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
                    "
                  >
                    Guardar
                  </button>
                </div>
              </div>

              <form id="service-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="text-sm font-medium text-zinc-800 dark:text-[#EDEFF4]">
                    Nome *
                  </label>
                  <input
                    className="
                      mt-1 w-full rounded-md border p-2 bg-white text-zinc-900 border-zinc-300
                      focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                      dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                    "
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ex.: Corte + Barba"
                    required
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="text-sm font-medium text-zinc-800 dark:text-[#EDEFF4]">
                    Duração (min) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="
                      mt-1 w-full rounded-md border p-2 bg-white text-zinc-900 border-zinc-300
                      focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                      dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                    "
                    value={form.duration}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        duration: e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    placeholder="45"
                    required
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="text-sm font-medium text-zinc-800 dark:text-[#EDEFF4]">
                    Preço (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    className="
                      mt-1 w-full rounded-md border p-2 bg-white text-zinc-900 border-zinc-300
                      focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                      dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                    "
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        price: e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    placeholder="15.00"
                    required
                  />
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="service-color" className="text-sm font-medium text-zinc-800 dark:text-[#EDEFF4]">
                    Cor
                  </label>
                  <input
                    id="service-color"
                    type="color"
                    name="color"
                    className="
                      mt-1 h-10 w-full rounded-md border p-3 bg-white text-zinc-900 border-zinc-300
                      focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                      dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                    "
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-zinc-800 dark:text-[#EDEFF4]">
                    Descrição
                  </label>
                  <textarea
                    className="
                      mt-1 w-full rounded-md border p-2 bg-white text-zinc-900 border-zinc-300
                      focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                      dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                    "
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Breve descrição do serviço…"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-zinc-800 dark:text-[#EDEFF4]">
                    Imagem
                  </label>
                  <input
                    className="
                      mt-1 w-full rounded-md border p-2 bg-white text-zinc-900 border-zinc-300
                      focus:border-[var(--bh-gold,#D4AF37)] focus:ring-1 focus:ring-[var(--bh-gold,#D4AF37)]
                      dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]
                    "
                    title="image"
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                  />
                  {(filePreview || form.image) && (
                    <div className="mt-3 relative h-48 w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-[#2A2B31]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={filePreview ?? form.image}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
