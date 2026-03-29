"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createUpdatePost } from "@/app/blog/actions";
import { Pressable } from "@/components/motion/pressable";
import { springTap } from "@/lib/motion";
import { motion, useReducedMotion } from "framer-motion";

type Category = { id: string; name: string };
type Persona = { id: string; name: string };

type Props = {
  categories: Category[];
  personas?: Persona[];
  redirectAfter?: string;
};

export function UpdateComposer({ categories, personas, redirectAfter = "/blog" }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [personaId, setPersonaId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion() ?? false;

  const showPersona = Boolean(personas?.length);

  async function onUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file?.type.startsWith("image/")) return;
    setUploading(true);
    setMsg(null);
    try {
      const presign = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          purpose: "update_cover",
        }),
      });
      const data = (await presign.json()) as { uploadUrl?: string; publicUrl?: string; error?: string };
      if (!presign.ok) {
        setMsg(data.error ?? "Upload unavailable. Paste an image URL.");
        return;
      }
      const put = await fetch(data.uploadUrl!, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!put.ok) {
        setMsg("Upload failed.");
        return;
      }
      if (data.publicUrl) {
        setCoverUrl(data.publicUrl);
      } else {
        setMsg("Set S3_PUBLIC_BASE_URL or paste a cover image URL.");
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await createUpdatePost({
        title,
        content,
        coverImage: coverUrl.trim() || undefined,
        categoryId: categoryId || null,
        personaId: showPersona && personaId ? personaId : null,
      });
      if (!res.ok) {
        setMsg(res.message);
        return;
      }
      if (res.data?.slug) {
        router.push(`/blog/${res.data.slug}`);
      } else {
        router.push(redirectAfter);
      }
      router.refresh();
    });
  }

  const field =
    "mt-1 w-full rounded-xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] p-3 text-sm";

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {showPersona ? (
        <label className="text-sm text-zinc-700">
          Post as
          <select
            value={personaId}
            onChange={(e) => setPersonaId(e.target.value)}
            className={field}
          >
            <option value="">Yourself (staff profile)</option>
            {personas!.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (persona)
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="text-sm text-zinc-700">
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={160} className={field} />
      </label>

      <label className="text-sm text-zinc-700">
        Caption / body
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
          maxLength={12000}
          className={field}
        />
      </label>

      <label className="text-sm text-zinc-700">
        Cover image URL (optional)
        <input
          type="url"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://…"
          className={field}
        />
      </label>
      <p className="text-xs text-zinc-500">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files)} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-[var(--sg-cta)] underline">
          {uploading ? "Uploading…" : "Upload cover"}
        </button>{" "}
        (needs S3 env)
      </p>

      {categories.length > 0 ? (
        <label className="text-sm text-zinc-700">
          Category (optional)
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={field}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {msg ? <p className="text-sm text-red-600">{msg}</p> : null}

      <Pressable className="inline-block justify-self-start">
        <motion.button
          type="submit"
          disabled={pending}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          transition={springTap}
          className="rounded-full bg-[var(--sg-cta)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Publishing…" : "Publish update"}
        </motion.button>
      </Pressable>
    </form>
  );
}
