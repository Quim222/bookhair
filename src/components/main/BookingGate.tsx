// BookingGate.tsx
"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Props = {
  onNext: () => void; // continuar sem login
  onLogin: () => void; // ir para login/registro
  storageKey?: string; // p.ex. "bh:skipGate"
  onBack: (value: boolean) => void; // voltar
};

export default function BookingGate({
  onNext,
  onLogin,
  storageKey = "bh:skipGate",
  onBack,
}: Props) {
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const skip = localStorage.getItem(storageKey);
      if (!skip) setOpen(true);
    }
  }, [storageKey]);

  const handleClose = (action?: "guest" | "login") => {
    if (dontShow && typeof window !== "undefined") {
      localStorage.setItem(storageKey, "1");
    }
    setOpen(false);
    if (action === "login") onLogin();
    onBack(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => handleClose()}
          />

          {/* container: modal (md+) / bottom-sheet (sm) */}
          <motion.div
            className="fixed z-50 left-1/2 -translate-x-1/2 md:top-1/2 md:-translate-y-1/2 
                       w-full md:max-w-md md:rounded-2xl md:bg-white md:shadow-xl
                       bottom-0 md:bottom-auto bg-white rounded-t-2xl p-5"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="space-y-4">
              <div className="h-1 w-12 bg-zinc-300 rounded mx-auto md:hidden" />

              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold">Como prefere marcar?</h3>
                <p className="text-sm text-zinc-600 mt-1">
                  Entre para guardar histórico e reagendar facilmente — ou
                  continue como convidado.
                </p>
              </div>

              <ul className="text-sm text-zinc-700 space-y-2">
                <li>• Ver e gerir **marcações**</li>
                <li>• Guardar **preferências** e profissional favorito</li>
              </ul>

              <div className="grid gap-2">
                <button
                  onClick={() => handleClose("login")}
                  className="w-full rounded-xl px-4 py-2 font-medium bg-black text-white hover:opacity-90"
                >
                  Entrar / Criar conta
                </button>
                <button
                  onClick={onNext}
                  className="w-full rounded-xl px-4 py-2 font-medium bg-zinc-100 hover:bg-zinc-200"
                >
                  Avançar para a Marcação como Convidado
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={dontShow}
                  onChange={(e) => setDontShow(e.target.checked)}
                  className="h-4 w-4"
                />
                Não mostrar novamente
              </label>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
