"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

type Props = {
  children?: React.ReactNode;
  onClick?: () => void; // ex.: scroll para a secção abaixo
  className?: string;
};

export default function BounceCta({ children = "Quer conhecer?", onClick, className }: Props) {
  const controls = useAnimationControls();
  const prefersReduced = useReducedMotion();
  const [clicked, setClicked] = useState(false);

  const startBounce = useCallback(() => {
    if (prefersReduced || clicked) return;
    controls.start({
      y: [-5, 5],
      transition: {
        duration: 1.6,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    });
  }, [controls, prefersReduced, clicked]);

  const stopBounce = useCallback(() => {
    controls.stop();
    controls.start({ y: 0, transition: { duration: 0.2 } });
  }, [controls]);

  useEffect(() => {
    startBounce();
  }, [startBounce]);

  return (
    <motion.button
      type="button"
      animate={controls}
      onHoverStart={stopBounce}
      onHoverEnd={() => { startBounce(); }}
      onFocus={stopBounce}
      onBlur={() => { if (!clicked) startBounce(); }}
      onClick={() => { setClicked(true); stopBounce(); onClick?.(); startBounce(); }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`${className}`}
    >
      {children}
    </motion.button>
  );
}
