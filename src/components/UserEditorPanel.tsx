"use client";

import SlideOver from "./SlideOver";
import { useEffect, useState } from "react";
import type { User } from "@/libs/authSlice";
import { apiFetch } from "@/libs/api";

type Props = {
  open: boolean;
  onClose: () => void;
  user?: User | null; // se vier nulo → modo criar
  onSaved?: (updated: User) => void; // callback para atualizar a lista na page
};

export default function UserEditorPanel({
  open,
  onClose,
  user,
  onSaved,
}: Props) {
  const isEdit = !!user;
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [role, setRole] = useState<User["userRole"]>(user?.userRole ?? "CLIENTE");
  const [status, setStatus] = useState<User["statusUser"]>(user?.statusUser ?? "ATIVO");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFilePreview(f ? URL.createObjectURL(f) : null);
  }

  useEffect(() => {
    if (open) {
      setName(user?.name ?? "");
      setEmail(user?.email ?? "");
      setRole(user?.userRole ?? "CLIENTE");
      setStatus(user?.statusUser ?? "ATIVO");
      setPhone(user?.phone ?? "");
      setPassword("");
      setFile(null);
      setFilePreview(null);
      setSaving(false);
      setErr(null);
    }
  }, [open, user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setErr(null);

      const payloadBase = {
        name,
        email,
        phone,
        userRole: role,
        statusUser: status,
      };
      const payload = password?.trim()
        ? { ...payloadBase, password: password.trim() }
        : payloadBase;

      const res = await apiFetch(`/users`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const updated: User = await res.json();

      if (file && updated.userId) {
        try {
          const imgUrl = await uploadUserPhoto(updated.userId, file, isEdit ? "PUT" : "POST");
          updated.photoUrl = imgUrl;
          alert("Utilizador e foto enviados com sucesso.");
        } catch (err) {
          console.error("Failed to upload image:", err);
          alert("Utilizador criado, mas falha ao enviar a foto.");
        }
      }

      onSaved?.(updated);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Falha ao guardar utilizador.");
    } finally {
      setSaving(false);
    }
  };

  async function uploadUserPhoto(userId: string, file: File, action: "POST" | "PUT") {
    const fd = new FormData();
    fd.append("file", file);

    const res = await apiFetch(`/photosUser/user/${userId}`, {
      method: action,
      body: fd,
    });
    if (!res.ok) throw new Error("Falha ao enviar a foto");

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
  }

  const inputCls =
    "w-full rounded-md border px-3 py-2 text-sm " +
    "bg-white text-zinc-900 border-zinc-300 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)] focus:border-[var(--bh-gold,#D4AF37)] " +
    "dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]";

  const labelCls = "mb-1 block text-zinc-700 dark:text-[#EDEFF4]";

  const selectCls =
    "w-full rounded-md border px-3 py-2 text-sm " +
    "bg-white text-zinc-900 border-zinc-300 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)] focus:border-[var(--bh-gold,#D4AF37)] " +
    "dark:bg-[#0B0B0C] dark:text-[#EDEFF4] dark:border-[#2A2B31]";

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar utilizador" : "Novo utilizador"}
      side="right"
      width={420}
    >
      <div className="space-y-4">
        {err && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {err}
          </div>
        )}

        <label className="block text-sm">
          <span className={labelCls}>Nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            autoComplete="name"
          />
        </label>

        <label className="block text-sm">
          <span className={labelCls}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            autoComplete="email"
          />
        </label>

        <label className="block text-sm">
          <span className={labelCls}>Telefone</span>
          <input
            type="tel"
            value={phone}
            maxLength={9}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
            autoComplete="tel"
          />
        </label>

        {!isEdit && (
          <label className="block text-sm">
            <span className={labelCls}>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className={labelCls}>Função</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as User["userRole"])}
              className={selectCls}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="FUNCIONARIO">FUNCIONARIO</option>
              <option value="CLIENTE">CLIENTE</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className={labelCls}>Estado</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as User["statusUser"])}
              className={selectCls}
            >
              <option value="ATIVO">ATIVO</option>
              <option value="PENDENTE">PENDENTE</option>
            </select>
          </label>
        </div>

        {role !== "CLIENTE" && (
          <div>
            <label className="block text-sm">
              <span className={labelCls}>Imagem</span>
              <input
                className={inputCls}
                type="file"
                accept="image/*"
                onChange={onFileChange}
              />
            </label>

            {(filePreview || user?.photoUrl) && (
              <div className="mt-3 relative h-36 w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-[#2A2B31]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={filePreview ?? user?.photoUrl ?? ""}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            disabled={saving}
            onClick={handleSave}
            className="
              rounded-md bg-[var(--bh-gold,#D4AF37)] px-4 py-2 text-sm font-medium text-white
              hover:opacity-90 disabled:opacity-60
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
            "
          >
            {saving ? "A guardar…" : isEdit ? "Guardar" : "Adicionar"}
          </button>
          <button
            onClick={onClose}
            className="
              rounded-md border px-4 py-2 text-sm
              border-zinc-200 text-zinc-800 hover:bg-zinc-50
              dark:border-[#2A2B31] dark:text-[#EDEFF4] dark:hover:bg-white/5
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
            "
          >
            Cancelar
          </button>
        </div>
      </div>
    </SlideOver>
  );
}
