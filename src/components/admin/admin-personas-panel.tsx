"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPostingPersona, deletePostingPersona } from "@/app/blog/actions";
import { Pressable } from "@/components/motion/pressable";
import { springTap } from "@/lib/motion";
import { motion, useReducedMotion } from "framer-motion";

type PersonaRow = { id: string; name: string; avatarUrl: string | null };

export function AdminPersonasPanel({ initial }: { initial: PersonaRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const reduced = useReducedMotion() ?? false;

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const nextName = name.trim();
    const nextAvatar = avatarUrl.trim() || null;
    setMsg(null);
    startTransition(async () => {
      const res = await createPostingPersona({
        name: nextName,
        avatarUrl: nextAvatar ?? undefined,
      });
      if (!res.ok) {
        setMsg(res.message);
        return;
      }
      setName("");
      setAvatarUrl("");
      router.refresh();
      const newId = res.data?.id;
      if (newId) {
        setRows((r) => [...r, { id: newId, name: nextName, avatarUrl: nextAvatar }]);
      }
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const res = await deletePostingPersona(id);
      if (!res.ok) {
        setMsg(res.message);
        return;
      }
      setRows((r) => r.filter((x) => x.id !== id));
      router.refresh();
    });
  }

  const field =
    "mt-1 w-full rounded-xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] p-3 text-sm";

  return (
    <div className="card-elevated rounded-3xl p-6">
      <h2 className="text-lg font-semibold text-[var(--sg-green)]">Posting personas (pets)</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Create named “voices” with avatars. When publishing an update, you can post as yourself or as one of these
        personas.
      </p>

      <form onSubmit={onCreate} className="mt-4 grid gap-3">
        <label className="text-sm text-zinc-700">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} className={field} />
        </label>
        <label className="text-sm text-zinc-700">
          Avatar URL (optional)
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            className={field}
          />
        </label>
        {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
        <Pressable className="inline-block justify-self-start">
          <motion.button
            type="submit"
            disabled={pending}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            transition={springTap}
            className="rounded-full bg-[var(--sg-cta)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Add persona
          </motion.button>
        </Pressable>
      </form>

      <ul className="mt-6 space-y-2">
        {rows.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] px-3 py-2 text-sm"
          >
            <span className="font-medium">{p.name}</span>
            <button
              type="button"
              onClick={() => onDelete(p.id)}
              disabled={pending}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
        {rows.length === 0 ? <li className="text-sm text-zinc-500">No personas yet — add one above.</li> : null}
      </ul>
    </div>
  );
}
