import { apiFetch, BASE_URL } from "@/libs/api";

export async function getUserUrl(userId: string): Promise<{
  hasPhoto: boolean;
  url?: string;
  message?: string;
}> {
  const res = await apiFetch(`/photosUser/${userId}`, { method: "GET" });

  // Sem foto
  if (res.status === 404) {
    return { hasPhoto: false, message: "Foto não encontrada" };
  }

  if (!res.ok) {
    return { hasPhoto: false, message: "Erro ao obter foto" };
  }

  // Lê versão da imagem (ETag)
  const etag = (res.headers.get("etag") || "").replace(/"/g, "");

  const versionParam = etag ? `?v=${encodeURIComponent(etag)}` : "";

  return {
    hasPhoto: true,
    url: `${BASE_URL}/photosUser/${userId}${versionParam}`,
  };
}