"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { IoArrowBack } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { login, register } from "@/components/login";

type Mode = "login" | "register";

export default function Page() {
  const [mode, setMode] = useState<Mode>("login");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function onLoginSubmit(e: FormEvent) {
    e.preventDefault();
    const result: boolean = await login(email, password);

    if (result) {
      // Redirecionar para o dashboard
      router.push("/dashboard");
    } else {
      alert("Erro no login. Verifique as credenciais.");
    }
  }
  async function onRegisterSubmit(e: FormEvent) {
    e.preventDefault();

    const fullName = name + " " + lastName;
    if (password !== confirmPassword) {
      alert("As palavras-passe não coincidem.");
      return;
    }

    const result: boolean | { ok: boolean; error?: string } = await register(
      fullName,
      email,
      password,
      phone
    );

    if (result.ok) {
      alert("Registo bem sucedido! Já pode fazer login.");
      setMode("login");
    } else {
      alert(result.error); // p.ex. "Email já está em uso: ss@gmail.com"
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-600/90 flex items-center justify-center p-4">
      {/* Botão voltar */}
      <div className="fixed top-20 left-24">
        <button
          className="grid h-10 w-10 place-items-center rounded-full
            bg-transparent text-gold ring-1 ring-gold
            hover:bg-gold hover:text-black
            focus:outline-none focus:ring-2 focus:ring-gold/60
            dark:text-gold-dark dark:ring-gold-dark dark:hover:bg-gold-dark dark:hover:text-white
            transition-colors duration-150"
          aria-label="Voltar"
          title="Voltar"
          onClick={() => router.back()}
        >
          <IoArrowBack className="h-5 w-5" />
        </button>
      </div>

      {/* Cartão */}
      <div
        className="relative w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden
        dark:bg-zinc-800 dark:text-white/90"
      >
        {/* TRACK 200% — desliza entre Login e Registo */}
        <motion.div
          className="flex w-[200%]"
          animate={{ x: mode === "login" ? "0%" : "-50%" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: "transform" }}
        >
          {/* SLIDE A — LOGIN [Imagem | Form] */}
          <section className="w-1/2 grid grid-cols-1 lg:grid-cols-2">
            {/* Imagem esquerda */}
            <div className="relative order-2 lg:order-1 h-80 lg:h-auto">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key="login-img"
                  className="absolute inset-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35 }}
                >
                  <Image
                    src="/login.jpg"
                    alt="Login"
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-black/25 to-transparent" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Form Login direita */}
            <div className="p-8 md:p-12 order-1 md:order-2">
              <h1 className="text-3xl font-bold">Entrar</h1>
              <p className="text-sm text-zinc-600 mt-1 dark:text-zinc-400">
                Acede à tua conta para gerir marcações.
              </p>

              <form onSubmit={onLoginSubmit} className="mt-8 space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    required
                    className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[--gold]"
                    placeholder="exemplo@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Palavra-passe
                  </label>
                  <div className="mt-1">
                    <div
                      className="group flex items-center rounded-xl border border-zinc-300
                        focus-within:ring-2 focus-within:ring-[--gold]
                        dark:border-zinc-600 dark:bg-zinc-900 overflow-hidden"
                      >
                      <input
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        type={showLoginPass ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full bg-transparent border-0 px-4 py-3
                          focus:outline-none focus:ring-0
                          text-zinc-900 dark:text-white placeholder-zinc-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass((v) => !v)}
                        className="h-full p-2 mr-2 rounded-xl text-sm
                          text-zinc-600 dark:text-zinc-300
                          hover:bg-zinc-100 dark:hover:bg-zinc-800
                          focus:outline-none focus:ring-2 focus:ring-gold"
                        >
                        {showLoginPass ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gold hover:bg-gold-dark text-black py-3 font-medium hover:opacity-90"
                >
                  Login
                </button>

                <p className="text-sm text-zinc-600 text-center">
                  Novo por aqui?{" "}
                  <button
                    type="button"
                    className="text-[--gold] hover:underline"
                    onClick={() => setMode("register")}
                  >
                    Criar conta
                  </button>
                </p>
                <p className="text-xs text-zinc-500 text-center">
                  Ou{" "}
                  <a
                    href="/booking?mode=guest"
                    className="underline hover:text-[--gold]"
                  >
                    continuar como convidado
                  </a>
                </p>
              </form>
            </div>
          </section>

          {/* SLIDE B — REGISTO [Form | Imagem] */}
          <section className="w-1/2 grid grid-cols-1 lg:grid-cols-2">
            {/* Form Registo esquerda */}
            <div className="p-8 md:p-12 order-2 lg:order-1">
              <h1 className="text-3xl font-bold">Criar conta</h1>
              <p className="text-sm text-zinc-600 mt-1">
                Cria a tua conta para fazer marcações com facilidade.
              </p>

              <form onSubmit={onRegisterSubmit} className="mt-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-zinc-700"
                    >
                      Nome
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[--gold]"
                      placeholder="João"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-zinc-700"
                    >
                      Apelido
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[--gold]"
                      placeholder="Silva"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="regEmail"
                    className="block text-sm font-medium text-zinc-700"
                  >
                    Email
                  </label>
                  <input
                    id="regEmail"
                    type="email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    required
                    className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[--gold]"
                    placeholder="exemplo@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="regPhone"
                    className="block text-sm font-medium text-zinc-700"
                  >
                    Telefone
                  </label>
                  <input
                    id="regPhone"
                    type="tel"
                    maxLength={9}
                    onChange={(e) => {
                      setPhone(e.target.value);
                    }}
                    required
                    className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[--gold]"
                    placeholder="912345678"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="regPass"
                      className="block text-sm font-medium text-zinc-700"
                    >
                      Palavra-passe
                    </label>
                    <div className="relative">
                      <input
                        id="regPass"
                        type={showRegPass ? "text" : "password"}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-[--gold]"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPass((v) => !v)}
                        className="absolute inset-y-0 right-2 my-1 px-3 rounded-lg text-sm hover:bg-zinc-100"
                      >
                        {showRegPass ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="regConfirm"
                      className="block text-sm font-medium text-zinc-700"
                    >
                      Confirmar palavra-passe
                    </label>
                    <input
                      id="regConfirm"
                      type={showRegPass ? "text" : "password"}
                      required
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[--gold]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={onRegisterSubmit}
                  className="w-full rounded-xl bg-gold hover:bg-gold-dark text-black py-3 font-medium hover:opacity-90"
                >
                  Registar
                </button>

                <p className="text-sm text-zinc-600 text-center">
                  Já tens conta?{" "}
                  <button
                    type="button"
                    className="text-[--gold] hover:underline"
                    onClick={() => setMode("login")}
                  >
                    Entrar
                  </button>
                </p>
              </form>
            </div>

            {/* Imagem direita */}
            <div className="relative order-1 md:order-2 h-80 md:h-auto">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key="register-img"
                  className="absolute inset-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                >
                  <Image
                    src="/register.jpg"
                    alt="Registo"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-black/25 to-transparent" />
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
