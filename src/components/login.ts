import { store } from "@/libs/store";
import { setUser, clearUser, User } from "@/libs/authSlice";
import { apiFetch, BASE_URL } from "@/libs/api";
import { getUserUrl } from "./getUserUrl";

export async function login(
  username: string,
  password: string
): Promise<boolean> {
  try {
    const response = await fetch(BASE_URL+"/auth/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: username,
        password,
      }),
    });

    if (!response.ok) {
      console.error("Falha no login. Status:", response.status);
      return false; // erro de login
    }

    const token = (await response.text()).trim();

    sessionStorage.setItem("token", token); 

    const meRes = await apiFetch("/users/me");
    if (!meRes.ok) {
      console.error("Falha ao obter dados do usuário. Status:", meRes.status);
      sessionStorage.removeItem("token");
      store.dispatch(clearUser());
      return false;
    }

    const data = (await meRes.json()) as User;

    const dataPhoto = await getUserUrl(data.userId);

    console.log("Foto URL após login:", dataPhoto.url);

    store.dispatch(
      setUser({
        userId: String(data.userId),
        name: data.name,
        email: data.email,
        userRole: data.userRole,
        statusUser: data.statusUser,
        photoUrl: dataPhoto.url,
        hasPhoto: dataPhoto.hasPhoto,
      })
    );

    return true;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
  }

  return false;
}

type RegisterResult =
  | { ok: true; status: number }
  | { ok: false; status: number; error: string };

export async function register(
  name: string,
  email: string,
  password: string,
  phone: string
): Promise<RegisterResult> {
  try {
    const res = await fetch(BASE_URL + "/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name, email, password, userRole: "CLIENTE" , phone, statusUser:"ATIVO"}),
    });

    if (res.ok) {
      // 200/201/204 sem body -> sucesso
      return { ok: true, status: res.status };
    }

    // Tenta extrair mensagem de erro do body
    let msg = `Erro ${res.status}`;
    const ct = res.headers.get("content-type") ?? "";

    try {
      if (ct.includes("application/json")) {
        const data = await res.json();
        // cobre os teus campos: detail, error, message
        msg = data.detail || data.error || data.message || msg;
      } else {
        const text = (await res.text()).trim();
        if (text) msg = text;
      }
    } catch {}

    console.error("Register falhou:", res.status, msg);
    return { ok: false, status: res.status, error: msg };
  } catch (err: any) {
    console.error("Erro de rede no register:", err);
    return { ok: false, status: 0, error: err?.message ?? "Erro de rede" };
  }
}

export function logout() {
  sessionStorage.removeItem("token");
  store.dispatch(clearUser());
}
