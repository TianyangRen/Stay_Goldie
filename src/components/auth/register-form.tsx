"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/app/register/actions";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { springTap } from "@/lib/motion";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const reduced = useReducedMotion() ?? false;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();

    const reg = await registerUser({ email, password, name: name || undefined });
    if (!reg.ok) {
      setError(reg.message);
      setPending(false);
      return;
    }

    const signed = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl: "/account/pets",
    });

    setPending(false);

    if (signed?.error) {
      setError("Your account was created, but automatic sign-in failed. Please sign in with your password.");
      return;
    }

    window.location.assign(signed?.url ?? "/account/pets");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <StaggerContainer className="space-y-4">
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            Display name (optional)
            <input
              name="name"
              type="text"
              maxLength={80}
              autoComplete="name"
              className="mt-2 w-full rounded-2xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] px-4 py-3 text-sm"
              placeholder="Alex"
            />
          </label>
        </StaggerItem>
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] px-4 py-3 text-sm"
              placeholder="you@example.com"
            />
          </label>
        </StaggerItem>
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            Password (min. 8 characters)
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
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
            {pending ? "Creating account…" : "Register"}
          </motion.button>
        </StaggerItem>
        <StaggerItem>
          <p className="text-center text-sm text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[var(--sg-green)] underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </StaggerItem>
      </StaggerContainer>
    </form>
  );
}
