"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/libs/api";
import { useAppSelector } from "@/libs/store";
import type { User } from "@/libs/authSlice";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import UserEditorPanel from "@/components/UserEditorPanel";
import { onApprove } from "@/libs/onAprove";

type Role = "" | "ADMIN" | "FUNCIONARIO" | "CLIENTE";
type Status = "" | "ATIVO" | "PENDENTE";

export default function UsersPage() {
  const authUser = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelUser, setPanelUser] = useState<User | null>(null);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const openCreateUser = () => {
    setPanelUser(null);
    setPanelOpen(true);
  };

  const openEditUser = (u: User) => {
    setPanelUser(u);
    setPanelOpen(true);
  };

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // toolbar
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role>("");
  const [statusFilter, setStatusFilter] = useState<Status>("");

  // paginação
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    (async () => {
      if (!authUser) return;
      setLoading(true);
      setErr(null);
      try {
        const res = await apiFetch("/users");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: User[] = await res.json();

        // opcional: tentar carregar foto (mantive a tua lógica)
        await Promise.all(
          data.map(async (u) => {
            const photo = await apiFetch("/photosUser/" + u.userId);
            if (photo.ok) {
              const blob = await photo.blob();
              u.photoUrl = URL.createObjectURL(blob);
              u.hasPhoto = true;
            }
          })
        );

        setUsers(data ?? []);
      } catch (e) {
        console.error(e);
        setUsers([]);
        setErr("Falha ao carregar utilizadores.");
      } finally {
        setLoading(false);
      }
    })();
  }, [authUser]);

  // pesquisa + filtros
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const okQ =
        !q ||
        (u.name ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q);
      const okRole = !roleFilter || u.userRole === roleFilter;
      const okStatus = !statusFilter || u.statusUser === statusFilter;
      return okQ && okRole && okStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  // paginação derivada
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  // reset da página quando mudam filtros/pesquisa
  useEffect(() => setPage(1), [query, roleFilter, statusFilter]);

  // handlers (plugs)
  // openCreateUser and openEditUser are defined above to control the side panel
  const deleteUser = async (userId: string) => {
    if (!confirm("Tens a certeza que queres eliminar este utilizador?")) return;
    try {
      const res = await apiFetch("/users/" + userId, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setUsers((prev) => prev.filter((x) => x.userId !== userId));
    } catch (e) {
      alert("Erro ao eliminar utilizador.");
      console.error(e);
      return;
    }
  };

  const RoleBadge = ({ role }: { role: User["userRole"] }) => (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap " +
        (role === "ADMIN"
          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
          : role === "FUNCIONARIO"
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          : "bg-green-300 text-green-700 dark:bg-green-900/30 dark:text-green-300")
      }
    >
      {role}
    </span>
  );

  const StatusBadge = ({ status }: { status: User["statusUser"] }) => (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap " +
        (status === "ATIVO"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300")
      }
    >
      {status}
    </span>
  );

  const handleSaved = (updated: User) => {
    // Atualiza a lista local sem refetch (opcional)
    setUsers((prev) => {
      const idx = prev.findIndex((p) => p.userId === updated.userId);
      if (idx === -1) return [updated, ...prev]; // caso de "criar"
      const clone = [...prev];
      clone[idx] = { ...clone[idx], ...updated };
      return clone;
    });
  };

  async function handleApprove(u: User) {
    // loading só para este user
    setLoadingIds((s) => new Set(s).add(u.userId));

    // (opcional) atualização otimista
    setUsers((prev) =>
      prev.map((x) =>
        x.userId === u.userId ? { ...x, statusUser: "ATIVO" } : x
      )
    );

    try {
      const updated = await onApprove(u); // chama o helper
      // reconcilia com o que veio do servidor
      setUsers((prev: User[]) =>
        prev.map((x) =>
          x.userId === u.userId ? ({ ...x, ...updated } as User) : x
        )
      );
    } catch (e) {
      // rollback se falhar
      setUsers((prev: User[]) =>
        prev.map((x) =>
          x.userId === u.userId ? { ...x, statusUser: u.statusUser } : x
        )
      );
      alert("Erro ao aprovar utilizador.");
      console.error(e);
    } finally {
      setLoadingIds((s) => {
        const n = new Set(s);
        n.delete(u.userId);
        return n;
      });
    }
  }

  return (
    <main className="min-h-dvh w-full px-4 py-8 sm:px-6 lg:px-8 dark:bg-zinc-950">
      {/* Painel Reutilizável */}
      <UserEditorPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        user={panelUser}
        onSaved={handleSaved}
      />

      <div className="mx-auto w-full max-w-7xl">
        {/* header + toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Utilizadores
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Lista de todos os utilizadores registados.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <input
              type="search"
              placeholder="Procurar por nome ou email…"
              className="h-9 w-56 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--bh-gold,#D4AF37)] dark:border-zinc-800 dark:bg-zinc-900"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <select
                className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                aria-label="Filtrar por função"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as Role)}
              >
                <option value="">Todas as funções</option>
                <option value="ADMIN">ADMIN</option>
                <option value="FUNCIONARIO">FUNCIONARIO</option>
                <option value="CLIENTE">CLIENTE</option>
              </select>
              <select
                className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                aria-label="Filtrar por estado"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status)}
              >
                <option value="">Todos os estados</option>
                <option value="ATIVO">ATIVO</option>
                <option value="PENDENTE">PENDENTE</option>
              </select>
            </div>

            <button
              className="h-9 flex items-center justify-center rounded-lg bg-[var(--bh-gold,#D4AF37)] px-3 text-sm font-medium text-white hover:opacity-90"
              onClick={openCreateUser}
            >
              Novo utilizador <FaPlus />
            </button>
          </div>
        </div>

        {/* card + tabela */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {loading ? (
            <div className="p-10 text-center text-zinc-500 dark:text-zinc-400">
              A carregar utilizadores…
            </div>
          ) : err ? (
            <div className="p-10 text-center text-red-600">{err}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {/* table-fixed + colgroup com larguras fixas por coluna */}
                <table className="w-full min-w-[760px] table-fixed text-left text-sm">
                  <colgroup>
                    {/* Utilizador (avatar+nome) */}
                    <col className="w-[200px]" />
                    {/* Email */}
                    <col className="w-[250px]" />
                    {/* Função */}
                    <col className="w-[150px]" />
                    {/* Estado */}
                    <col className="w-[120px]" />
                    {/* Ações */}
                    <col className="w-[260px]" />
                  </colgroup>

                  <thead className="sticky top-0 bg-zinc-100 text-xs uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <tr>
                      <th className="px-6 py-3">Utilizador</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Função</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paged.map((u, idx) => (
                      <tr
                        key={u.userId}
                        className={idx % 2 ? "bg-zinc-50 dark:bg-zinc-950" : ""}
                      >
                        {/* Utilizador + avatar (truncate controlado) */}
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 shrink-0">
                              {u.photoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={u.photoUrl}
                                  alt={u.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                (u.name ?? "?")
                                  .split(" ")
                                  .map((p: string) => p[0])
                                  .slice(0, 2)
                                  .join("")
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="max-w-[360px] truncate font-medium text-zinc-900 dark:text-zinc-100">
                                {u.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email (truncate, no wrap) */}
                        <td className="px-6 py-3">
                          <div className="max-w-[320px] truncate whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                            {u.email}
                          </div>
                        </td>

                        {/* Função */}
                        <td className="px-6 py-3">
                          <RoleBadge role={u.userRole} />
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-3">
                          <StatusBadge status={u.statusUser} />
                        </td>

                        {/* Ações (largura fixa, alinhar à direita) */}
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {/* Placeholder invisível para reservar espaço */}
                            {u.statusUser !== "PENDENTE" && (
                              <span
                                className="h-8 min-w-[92px] rounded-full border border-transparent text-xs opacity-0 select-none"
                                aria-hidden
                              >
                                Aprovar
                              </span>
                            )}

                            {u.statusUser === "PENDENTE" && (
                              <button
                                type="button"
                                onClick={() => handleApprove(u)}
                                disabled={loadingIds.has(u.userId)}
                                title="Aprovar utilizador"
                                className="h-8 min-w-[92px] rounded-full border border-emerald-400 text-xs
                   text-emerald-700 hover:bg-emerald-50
                   focus:outline-none focus:ring-2 focus:ring-emerald-500
                   dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-zinc-800"
                              >
                                Aprovar
                              </button>
                            )}

                            <button
                              type="button"
                              title="Editar utilizador"
                              className="h-8 min-w-[80px] rounded-full border border-zinc-300 text-xs
                 text-zinc-700 hover:bg-zinc-50
                 focus:outline-none focus:ring-2 focus:ring-[var(--bh-gold,#D4AF37)]
                 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                              onClick={() => openEditUser(u)}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              title="Eliminar utilizador"
                              className="h-8 min-w-[92px] rounded-full bg-red-600 text-xs text-white
                 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                              onClick={() => deleteUser(u.userId)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {paged.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div className="min-h-20 flex items-center justify-center">
                            <div className="text-center p-6">
                              <div className="text-sm font-medium text-zinc-800 dark:text-[#EDEFF4]">
                                Sem registos
                              </div>
                              <div className="text-xs mt-1 text-zinc-600 dark:text-[#9AA0AE]">
                                Quando adicionares itens, eles aparecem aqui.
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* paginação */}
              <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800">
                <div className="text-zinc-600 dark:text-zinc-300">
                  {filtered.length} registo(s) • página {safePage} de{" "}
                  {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border px-3 py-1.5 disabled:opacity-50 dark:border-zinc-700"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </button>
                  <button
                    className="rounded-lg border px-3 py-1.5 disabled:opacity-50 dark:border-zinc-700"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Seguinte
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
