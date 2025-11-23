"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector } from "@/libs/store";
import { apiFetch, apiFetchJson, UploadPhotoResponse } from "@/libs/api";
import {
  User as UserIcon,
  Mail,
  CalendarDays,
  Save,
  Trash2,
  Loader2,
  Lock,
} from "lucide-react";
import { setUser, User } from "@/libs/authSlice";
import { Booking, getDayKeyLocal, parseDate } from "../../page";
import AppointmentItem from "@/components/appointmentItem";
import { getAnalytic } from "@/libs/getAnalytic";
import Analitics from "@/components/analitics";
import AvatarUpload from "@/components/AvatarUpload";
import { logout } from "@/components/login";
import { useDispatch } from "react-redux";

export default function ProfilePage() {
  const [changed, setChanged] = useState(false);
  const [analitycs, setAnalitycs] = useState<any[]>([]);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user: authUser, isHydrated } = useAppSelector((s) => s.auth);
  const role = useMemo(
    () => authUser?.userRole || "guest",
    [authUser?.userRole]
  );
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  const [data, setData] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  // guard simples
  useEffect(() => {
    if (!isHydrated) return;
    if (!authUser) router.replace("/login");
  }, [isHydrated, authUser, router]);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  useEffect(() => {
    setFilteredBookings(bookings);
  }, [bookings]);

  // fetch profile + bookings
  useEffect(() => {
    if (!authUser) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const id = params.id;
        if (!mounted) return;
        setData(authUser?.userId === id ? authUser : null); // se for o próprio, usa o user do auth (já vem do store)
        setForm({
          name: authUser?.name ?? "",
          email: authUser?.email ?? "",
        });

        const url =
          role === "ADMIN" ? "/bookings" : "/bookings/user/" + authUser.userId;

        // Marcações recentes (limit 6)
        const bs = await apiFetch(url, {
          method: "GET",
        });
        if (!bs.ok) return;
        const bsJson = await bs.json();
        const parsed: Booking[] = bsJson.map((b: any) => {
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

        const analitycs = await getAnalytic(authUser);

        setAnalitycs(analitycs);
        setBookings(parsed ?? []);
      } catch (e: any) {
        setErr(e?.message || "Falha ao carregar perfil");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.id, authUser, role]);

  const handleChange =
    (key: keyof User) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setChanged(true);
    };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);

    if (!form.email || !form.name) {
      setErr("Nome e email são obrigatórios.");
      setSaving(false);
      return;
    }

    try {
      // 1) Se houver foto, faz upload primeiro e obtém URL persistente
      let photoUrlFromUpload: string | undefined;
      if (file && authUser?.userId) {
        photoUrlFromUpload = await uploadUserPhoto(authUser.userId, file);
        console.log("Foto enviada, URL:", photoUrlFromUpload);
        console.log("File preview a limpar:", filePreview);

        dispatch(setUser({ ...authUser, photoUrl: photoUrlFromUpload }));
        setForm((prev) => ({ ...prev, photoUrl: photoUrlFromUpload }));
        // deixa de usar blob preview após termos URL real
        if (filePreview) URL.revokeObjectURL(filePreview);
        setFilePreview(null);
      }

      // 2) Envia o perfil já com photoUrl (se veio do upload)
      const payload = {
        name: form.name,
        email: form.email,
        userRole: authUser?.userRole || "USER",
        statusUser: authUser?.statusUser || "ACTIVE",
        ...(photoUrlFromUpload ? { photoUrl: photoUrlFromUpload } : {}),
      };

      const res = await apiFetch("/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao guardar alterações.");
      }

      const updatedUser: User = await res.json();

      const finalPhotoUrl =
        photoUrlFromUpload ?? updatedUser.photoUrl ?? authUser?.photoUrl;

      // 3) Atualiza estados + Redux (sem mutar objeto)
      setData(updatedUser);
      setForm((prev) => ({ ...prev, photoUrl: finalPhotoUrl }));
      if (authUser) {
        dispatch(
          setUser({
            ...authUser!,
            ...updatedUser,
            photoUrl: finalPhotoUrl, // <- nunca fica undefined
          })
        );
      }

      setChanged(false);
      setErr(null);
    } catch (err: any) {
      console.error(err);
      setErr(err.message ?? "Erro ao guardar alterações.");
    } finally {
      setSaving(false);
    }
  };

  async function uploadUserPhoto(userId: string, file: File) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await apiFetchJson<UploadPhotoResponse>(
      "/photosUser/user/" + userId,
      {
        method: "PUT",
        body: fd,
      }
    );
    return res.url;
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFilePreview(f ? URL.createObjectURL(f) : null);
  }

  const handleDelete = async () => {
    if (!data) return;
    const ok = confirm(
      "Tens a certeza que queres remover a tua conta? Esta ação é irreversível."
    );
    if (!ok) return;
    try {
      setDeleting(true);
      await apiFetch(`/users/${data.userId}`, { method: "DELETE" });
      // se o utilizador removeu a própria conta → logout / login
      logout();
    } catch (e: any) {
      setErr(e?.message || "Não foi possível remover a conta");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-zinc-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>A carregar perfil…</span>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {err}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <AvatarUpload
            photoUrl={filePreview ?? authUser?.photoUrl ?? undefined} // string com URL da imagem do user
            onPhotoChange={(file) => {
              console.log("Foto alterada:", file);
              setFile(file); // <-- agora o handleSave sabe que há ficheiro
              const preview = URL.createObjectURL(file);
              setFilePreview(preview);
              setChanged(true);
            }}
          />
          <div>
            <h1 className="text-xl font-semibold">{data.name}</h1>
            <p className="text-sm text-zinc-500">Bem Vindo!</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/*<button
            onClick={() => router.push(`/dashboard/security/change-password`)}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <Lock className="h-4 w-4" />
            Alterar password
          </button>*/}
          <button
            form="profile-form"
            type="submit"
            disabled={!changed || saving}
            className={
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:opacity-95 disabled:opacity-60 " +
              (changed
                ? "bg-gold text-white"
                : "text-black border-black border")
            }
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Remover conta
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Perfil */}
        <div className="lg:col-span-2 space-y-20">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold">Os teus dados</h2>
            <form id="profile-form" onSubmit={handleSave}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-zinc-600 dark:text-zinc-300">
                    Nome
                  </span>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      value={form.name ?? ""}
                      onChange={handleChange("name")}
                      className="w-full rounded-lg border border-zinc-300 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--bh-gold,#D4AF37)] dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block text-zinc-600 dark:text-zinc-300">
                    Email
                  </span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      value={form.email ?? ""}
                      onChange={handleChange("email")}
                      disabled
                      className="w-full rounded-lg border border-zinc-300 pl-9 pr-3 py-2 text-sm opacity-70 dark:border-zinc-700 dark:bg-zinc-900"
                      title="Email não editável aqui"
                    />
                  </div>
                </label>
              </div>
            </form>

            {err && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}
          </div>
          <div className="shadow-sm rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                📊 Analítica
              </h1>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Última atualização: {new Date().toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[1fr]">
              {analitycs.length === 0 ? (
                <p className="text-sm text-zinc-500">Sem dados analíticos.</p>
              ) : (
                analitycs.map((item) => (
                  <Analitics key={item.name} data={item} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Box Marcações */}
        <div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div>
              <div className="mb-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <button
                    type="button"
                    aria-label="Escolher data"
                    onClick={() => setOpen((v) => !v)}
                    className="relative rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <CalendarDays className="h-5 w-5 text-[var(--bh-gold,#D4AF37)]" />
                  </button>
                  As tuas marcações
                </div>

                {open && (
                  <div className="mt-2 w-60 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                    <input
                      type="date"
                      title="Escolher data"
                      placeholder="YYYY-MM-DD"
                      aria-label="Escolher data"
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--bh-gold,#D4AF37)] dark:border-zinc-700 dark:bg-zinc-900"
                      onChange={(e) => {
                        const d = e.target.value;
                        setFilteredBookings(
                          bookings.filter((b) => b.dayKey === d)
                        );
                        setOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <p className="text-sm text-zinc-500">Sem marcações recentes.</p>
            ) : (
              <ul className="space-y-3">
                {filteredBookings.map((b) => (
                  <li key={b.id} className="flex justify-between">
                    <AppointmentItem booking={b} onUpdate={() => {}} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
