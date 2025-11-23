"use client";

import { Provider } from "react-redux";
import { store } from "@/libs/store";
import { useEffect } from "react";
import { hydrateFromStorage } from "@/libs/authSlice";

export default function Providers({ children }: { children: React.ReactNode }) {
  // hidrata do localStorage quando o app monta no cliente
  useEffect(() => {
    store.dispatch(hydrateFromStorage());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}