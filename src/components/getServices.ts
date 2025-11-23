import { BASE_URL } from "@/libs/api";
import { getUserUrl } from "./getUserUrl";

export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // duração em minutos
  price: number; // preço em euros
  image: string | null;
  color: string;
};

export async function getServices(): Promise<Service[]> {
  const response = await fetch(BASE_URL + "/service", {
    cache: "no-store",
  });
  const data: Service[] = await response.json();

  if (!response.ok) {
    throw new Error("Erro ao buscar os serviços");
  }

  const withImages = await Promise.all(
    data.map(async (s) => {
      // se o teu backend já servir a imagem por URL pública, preferível usar URL direta:
      const imageInfo = await getUserUrl(s.id);
      const image = imageInfo?.hasPhoto && imageInfo.url ? imageInfo.url : null;
      return { ...s, image };
    })
  );

  return withImages;
}
