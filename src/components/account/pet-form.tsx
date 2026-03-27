"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createPet, deletePet, updatePet } from "@/app/account/pets/actions";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { springTap } from "@/lib/motion";

export type PetFormInitial = {
  name: string;
  breed: string;
  sizeTier: string | null;
  birthDate: string | null;
  avatarUrl: string | null;
};

type Props = {
  mode: "create" | "edit";
  petId?: string;
  initial?: PetFormInitial;
};

export function PetForm({ mode, petId, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [delPending, setDelPending] = useState(false);
  const reduced = useReducedMotion() ?? false;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      breed: String(fd.get("breed") ?? "") || undefined,
      sizeTier: String(fd.get("sizeTier") ?? ""),
      birthDate: String(fd.get("birthDate") ?? "") || undefined,
      avatarUrl: String(fd.get("avatarUrl") ?? "") || undefined,
    };

    const result =
      mode === "create"
        ? await createPet(payload)
        : petId
          ? await updatePet(petId, payload)
          : { ok: false as const, message: "缺少宠物 ID。" };

    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/account/pets");
    router.refresh();
  }

  async function onDelete() {
    if (!petId || mode !== "edit") return;
    if (!window.confirm("确定删除该宠物？此操作不可撤销（若有预约或动态则无法删除）。")) return;
    setDelPending(true);
    setError(null);
    const result = await deletePet(petId);
    setDelPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/account/pets");
    router.refresh();
  }

  const init = initial ?? {
    name: "",
    breed: "",
    sizeTier: null,
    birthDate: null,
    avatarUrl: null,
  };

  const birthValue =
    init.birthDate && init.birthDate.length >= 10 ? init.birthDate.slice(0, 10) : "";

  const field =
    "mt-2 w-full rounded-2xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] px-4 py-3 text-sm";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg">
      <StaggerContainer className="space-y-4">
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            名字 <span className="text-red-600">*</span>
            <input
              name="name"
              type="text"
              required
              maxLength={80}
              defaultValue={init.name}
              className={field}
              placeholder="例如：Mochi"
            />
          </label>
        </StaggerItem>
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            品种
            <input
              name="breed"
              type="text"
              maxLength={120}
              defaultValue={init.breed ?? ""}
              className={field}
              placeholder="例如：柯基"
            />
          </label>
        </StaggerItem>
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            体型（影响寄养估价）
            <select
              name="sizeTier"
              defaultValue={init.sizeTier ?? ""}
              className={`${field} bg-white`}
            >
              <option value="">未选择</option>
              <option value="small">小型</option>
              <option value="medium">中型</option>
              <option value="large">大型</option>
            </select>
          </label>
        </StaggerItem>
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            生日
            <input name="birthDate" type="date" defaultValue={birthValue} className={field} />
          </label>
        </StaggerItem>
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            头像图片 URL
            <input
              name="avatarUrl"
              type="url"
              maxLength={2048}
              defaultValue={init.avatarUrl ?? ""}
              className={field}
              placeholder="https://…"
            />
          </label>
        </StaggerItem>
        <StaggerItem>
          <p className="text-xs text-zinc-500">
            可使用图床或可公开访问的图片链接。站内展示会尽量优化加载；域名未列入白名单时可能以原图加载。
          </p>
        </StaggerItem>
        <StaggerItem>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-wrap gap-3 pt-2">
            <motion.button
              type="submit"
              disabled={pending || delPending}
              whileTap={reduced ? undefined : { scale: 0.97 }}
              transition={springTap}
              className="rounded-full bg-[var(--sg-green)] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "保存中…" : mode === "create" ? "添加宠物" : "保存修改"}
            </motion.button>
            <Link
              href="/account/pets"
              className="rounded-full border border-[var(--sg-border-subtle)] px-6 py-2.5 text-sm font-medium text-zinc-800"
            >
              取消
            </Link>
            {mode === "edit" ? (
              <motion.button
                type="button"
                onClick={() => void onDelete()}
                disabled={pending || delPending}
                whileTap={reduced ? undefined : { scale: 0.97 }}
                transition={springTap}
                className="rounded-full border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-medium text-red-800 disabled:opacity-60"
              >
                {delPending ? "删除中…" : "删除"}
              </motion.button>
            ) : null}
          </div>
        </StaggerItem>
      </StaggerContainer>
    </form>
  );
}
