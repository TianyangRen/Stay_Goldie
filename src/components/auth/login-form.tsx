"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/account/pets";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: nextUrl,
    });

    setPending(false);

    if (result?.error) {
      setError("邮箱或密码不正确。");
      return;
    }

    window.location.assign(result?.url ?? nextUrl);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block text-sm text-zinc-700">
        邮箱
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
          placeholder="owner@example.com"
        />
      </label>
      <label className="block text-sm text-zinc-700">
        密码
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "登录中…" : "登录"}
      </button>
      <p className="text-xs leading-6 text-zinc-500">
        演示账号：owner@example.com / Owner123! · 管理员：admin@staygoldie.local / Admin123!
      </p>
    </form>
  );
}
