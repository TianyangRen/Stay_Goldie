"use client";

import { useRef, useState, useTransition } from "react";
import type { CreatePetPostState } from "@/app/admin/pet-posts/actions";
import { createPetPost } from "@/app/admin/pet-posts/actions";

type PetOption = { id: string; name: string };

type Props = {
  pets: PetOption[];
};

export function PetPostForm({ pets }: Props) {
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState<CreatePetPostState | undefined>();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [extraUrls, setExtraUrls] = useState("");
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    if (!petId) {
      setState({ ok: false, message: "请先选择宠物。" });
      return;
    }

    setUploading(true);
    setState(undefined);
    const next = [...imageUrls];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setState({ ok: false, message: "仅支持图片文件。" });
          return;
        }

        const presign = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            petId,
          }),
        });

        const data = (await presign.json()) as {
          uploadUrl?: string;
          publicUrl?: string;
          error?: string;
        };

        if (!presign.ok) {
          setState({
            ok: false,
            message: data.error ?? "预签名失败。可改用下方「图片 URL」手动填写。",
          });
          return;
        }

        const put = await fetch(data.uploadUrl!, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!put.ok) {
          setState({ ok: false, message: "上传到对象存储失败。" });
          return;
        }

        if (data.publicUrl) {
          next.push(data.publicUrl);
        } else {
          setState({
            ok: false,
            message:
              "已上传但未返回公开 URL。请设置 S3_PUBLIC_BASE_URL，或在下方手动填写可访问的图片地址。",
          });
          return;
        }
      }

      setImageUrls(next);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const manual = extraUrls
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const merged = [...imageUrls, ...manual];
    fd.set("mediaUrls", merged.join("\n"));

    startTransition(async () => {
      const result = await createPetPost(undefined, fd);
      setState(result);
      if (result.ok) {
        setImageUrls([]);
        setExtraUrls("");
        setPetId(pets[0]?.id ?? "");
        setFormKey((k) => k + 1);
      }
    });
  }

  return (
    <form key={formKey} className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <label className="text-sm text-zinc-700 md:col-span-2">
        宠物
        <select
          name="petId"
          required
          value={petId}
          onChange={(e) => setPetId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm"
        >
          <option value="">请选择</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name}
            </option>
          ))}
        </select>
      </label>

      <div className="md:col-span-2">
        <p className="text-sm text-zinc-700">图片（预签名上传，需配置 S3）</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="mt-2 w-full text-sm"
          disabled={uploading || pending}
          onChange={(e) => void handleFiles(e.target.files)}
        />
        {uploading ? <p className="mt-1 text-xs text-zinc-500">上传中…</p> : null}
        {imageUrls.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-zinc-600">
            {imageUrls.map((url) => (
              <li key={url} className="truncate">
                {url}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <label className="text-sm text-zinc-700 md:col-span-2">
        图片 URL（每行一个，未配置对象存储时使用）
        <textarea
          value={extraUrls}
          onChange={(e) => setExtraUrls(e.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm"
          rows={3}
          placeholder="https://..."
        />
      </label>

      <label className="text-sm text-zinc-700 md:col-span-2">
        动态文案
        <textarea
          name="caption"
          required
          rows={4}
          className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm"
          placeholder="今天的小记录…"
        />
      </label>

      <button
        type="submit"
        disabled={pending || uploading}
        className="rounded-full bg-[var(--sg-green)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60 md:col-span-2"
      >
        {pending ? "发布中…" : "发布动态"}
      </button>

      {state?.ok === false ? (
        <p className="text-sm text-red-600 md:col-span-2">{state.message}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-emerald-800 md:col-span-2">发布成功。</p>
      ) : null}
    </form>
  );
}
