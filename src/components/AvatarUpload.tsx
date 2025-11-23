import { useRef } from "react";
import { Camera } from "lucide-react";

type Props = {
  photoUrl?: string;
  onPhotoChange?: (file: File) => void;
  maxSizeMB?: number; // opcional (default 5MB)
};

export default function AvatarUpload({
  photoUrl,
  onPhotoChange,
  maxSizeMB = 5,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => fileInputRef.current?.click();

  const onKeyActivate: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validações básicas
    if (!file.type.startsWith("image/")) {
      // TODO: feedback ao utilizador
      e.currentTarget.value = "";
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      // TODO: feedback ao utilizador (ex.: toast)
      e.currentTarget.value = "";
      return;
    }

    onPhotoChange?.(file);

    // permite re-selecionar o mesmo ficheiro
    e.currentTarget.value = "";
  };

  return (
    <div className="relative w-20 h-20">
      {/* Botão acessível que cobre todo o avatar */}
      <button
        type="button"
        onClick={openPicker}
        onKeyDown={onKeyActivate}
        aria-label={photoUrl ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
        className="
          group relative w-full h-full rounded-full overflow-hidden
          border border-zinc-300 dark:border-zinc-700
          outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60
          focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900
        "
      >
        {photoUrl ? (
          // Se preferires Next.js <Image>, troca por <Image fill className="object-cover" ... />
          <img
            src={photoUrl}
            alt="Foto de perfil"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
            <Camera className="h-6 w-6 text-zinc-500" />
          </div>
        )}

        {/* Overlay via CSS (sem state) */}
        {photoUrl && (
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center rounded-full bg-black/50 text-white text-sm font-medium group-hover:flex transition-opacity">
            Trocar foto
          </div>
        )}
      </button>

      {/* input invisível */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        title="Upload profile photo"
        aria-label="Upload profile photo"
      />
    </div>
  );
}
