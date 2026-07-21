"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blocked = searchParams.get("blocked") === "1";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    setLoading(false);

    if (error) {
      setError("Неверный email или пароль");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-black px-6 text-white">
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-sm gap-4 rounded-2xl border border-white/10 bg-white/5 p-8"
      >
        <h1 className="text-xl font-semibold">Вход в админку</h1>
        {blocked && (
          <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">
            Доступ к этому аккаунту заблокирован администратором.
          </p>
        )}
        <label className="flex flex-col gap-1.5 text-sm text-white/70">
          Email
          <input
            required
            name="email"
            type="email"
            className="rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-white outline-none focus:border-fuchsia-400"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-white/70">
          Пароль
          <input
            required
            name="password"
            type="password"
            className="rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-white outline-none focus:border-fuchsia-400"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
