"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { updateProfile } from "@/app/account/profile/actions";
import { Pressable } from "@/components/motion/pressable";
import { springTap } from "@/lib/motion";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  email: string;
  initialName: string;
  initialImage: string | null;
};

export function ProfileForm({ email, initialName, initialImage }: Props) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [imageUrl, setImageUrl] = useState(initialImage ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion() ?? false;

  async function onUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file?.type.startsWith("image/")) return;
    setUploading(true);
    setMessage(null);
    try {
      const presign = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          purpose: "profile",
        }),
      });
      const data = (await presign.json()) as { uploadUrl?: string; publicUrl?: string; error?: string };
      if (!presign.ok) {
        setMessage(data.error ?? "Upload not available. Paste an image URL instead.");
        return;
      }
      const put = await fetch(data.uploadUrl!, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!put.ok) {
        setMessage("Upload failed.");
        return;
      }
      if (data.publicUrl) {
        setImageUrl(data.publicUrl);
      } else {
        setMessage("Set S3_PUBLIC_BASE_URL for direct URLs after upload, or paste a public image link.");
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await updateProfile({
        name,
        image: imageUrl.trim() || null,
      });
      if (!res.ok) {
        setMessage(res.message);
        return;
      }
      await update();
      router.refresh();
      setMessage("Saved.");
    });
  }

  const field =
    "mt-2 w-full rounded-2xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] px-4 py-3 text-sm";

  return (
    <form onSubmit={onSubmit} className="card-elevated max-w-lg rounded-3xl p-6">
      <p className="text-sm text-zinc-600">
        <span className="font-medium text-[var(--sg-text)]">Email</span> (login — cannot be changed)
      </p>
      <p className="mt-1 rounded-2xl border border-dashed border-[var(--sg-border-subtle)] bg-[var(--sg-surface-alt)] px-4 py-3 text-sm text-zinc-500">
        {email}
      </p>

      <label className="mt-6 block text-sm text-zinc-700">
        Display name
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={80}
          className={field}
          autoComplete="nickname"
        />
      </label>

      <label className="mt-4 block text-sm text-zinc-700">
        Avatar URL (optional)
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          type="url"
          placeholder="https://…"
          className={field}
        />
      </label>

      <p className="mt-3 text-xs text-zinc-500">
        Or upload a square photo (requires S3/R2 env).{" "}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files)} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || pending}
          className="font-medium text-[var(--sg-cta)] underline underline-offset-4"
        >
          {uploading ? "Uploading…" : "Choose file"}
        </button>
      </p>

      {message ? <p className="mt-4 text-sm text-zinc-600">{message}</p> : null}

      <Pressable className="mt-6 inline-block">
        <motion.button
          type="submit"
          disabled={pending}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          transition={springTap}
          className="rounded-full bg-[var(--sg-cta)] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save profile"}
        </motion.button>
      </Pressable>
    </form>
  );
}
