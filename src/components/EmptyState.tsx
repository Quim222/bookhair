// components/EmptyState.tsx
export default function EmptyState({
  title = "Sem dados",
  description = "Não encontramos registos para mostrar.",
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="
        flex flex-col items-center justify-center text-center
        rounded-2xl border p-8 w-full
        bg-white border-zinc-200
        dark:bg-[#121316] dark:border-[#2A2B31] dark:text-[#EDEFF4]
      "
    >
      <div className="text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-[#9AA0AE]">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="
            mt-4 rounded-md bg-[var(--bh-gold,#D4AF37)] px-4 py-2 text-sm font-medium text-white
            hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bh-gold,#D4AF37)]
          "
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
