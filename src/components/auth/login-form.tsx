"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { springTap } from "@/lib/motion";

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/account/pets";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const reduced = useReducedMotion() ?? false;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: nextUrl,
    });

    setPending(false);

    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }

    window.location.assign(result?.url ?? nextUrl);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <StaggerContainer className="space-y-4">
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] px-4 py-3 text-sm"
              placeholder="owner@example.com"
            />
          </label>
        </StaggerItem>
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] px-4 py-3 text-sm"
            />
          </label>
        </StaggerItem>
        <StaggerItem>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <motion.button
            type="submit"
            disabled={pending}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            transition={springTap}
            className="mt-1 w-full rounded-2xl bg-[var(--sg-cta)] px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </motion.button>
        </StaggerItem>
        <StaggerItem>
          <p className="text-center text-sm text-zinc-600">
            New here?{" "}
            <Link href="/register" className="font-medium text-[var(--sg-green)] underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </StaggerItem>
        <StaggerItem>
          <p className="text-xs leading-6 text-zinc-500">
            Demo owner: owner@example.com / Owner123! · Admin: admin@staygoldie.local / Admin123!
          </p>
        </StaggerItem>
      </StaggerContainer>
    </form>
  );
}
