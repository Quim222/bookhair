import { apiFetch } from "./api";
import { User } from "./authSlice";

export async function onApprove(user: User) {
  const resp = await apiFetch("/users/status/" + user.userId + "/ATIVO", {
    method: "PUT",
  });

  if (resp.ok) {
    alert("Utilizador aprovado com sucesso!");
    return { ...user, statusUser: "ATIVO" }; // devolve cópia atualizada
  } else {
    alert("Erro ao aprovar utilizador!");
    return null;
  }
}

export async function onDisapprove(serviceId: string) {
  const resp = await apiFetch("/users/status/" + serviceId + "/PENDENTE", {
    method: "PUT",
  });

  if (resp.ok) {
    alert("Utilizador desaprovado com sucesso!");
  } else {
    alert("Erro ao desaprovar utilizador!");
  }
}
