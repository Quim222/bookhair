"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuArrowUp } from "react-icons/lu";

type Props = {
  showAt?: number;      // px de scroll para aparecer
  className?: string;   // estilos extra
  offsetBottom?: number;// distância ao fundo
};

export default function BackToTop({ showAt = 200, className = "", offsetBottom = 24 }: Props) {
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > showAt);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAt]);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="backtotop"
          onClick={toTop}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          aria-label="Voltar ao topo"
          className={`fixed right-4 sm:right-6 z-[60] rounded-full border border-black/5 dark:border-white/10 
                      bg-white/90 dark:bg-zinc-900/90 text-gray-900 dark:text-white shadow-lg
                      hover:bg-white dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2
                      focus:ring-black/30 dark:focus:ring-white/30 ${className}`}
          style={{ bottom: offsetBottom }}
        >
          <div className="p-3 md:p-3.5">
            <LuArrowUp size={20} />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
