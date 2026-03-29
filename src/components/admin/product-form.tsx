"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createProduct, deleteProduct, updateProduct } from "@/app/admin/products/actions";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { springTap } from "@/lib/motion";

export type ProductFormInitial = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  basePriceCad: number;
  salePriceCad: number | null;
  stock: number;
  lowStockLevel: number;
  isActive: boolean;
};

type Props =
  | { mode: "create"; initial?: never }
  | { mode: "edit"; productId: string; initial: ProductFormInitial };

export function ProductForm(props: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [delPending, setDelPending] = useState(false);
  const reduced = useReducedMotion() ?? false;

  const init: ProductFormInitial =
    props.mode === "edit"
      ? props.initial
      : {
          name: "",
          slug: "",
          description: "",
          imageUrl: null,
          basePriceCad: 0,
          salePriceCad: null,
          stock: 0,
          lowStockLevel: 5,
          isActive: true,
        };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const basePriceCad = Number(String(fd.get("basePriceCad")).replace(",", "."));
    const saleRaw = String(fd.get("salePriceCad") ?? "").trim();
    const salePriceCad = saleRaw === "" ? undefined : Number(saleRaw.replace(",", "."));

    const payload = {
      name: String(fd.get("name") ?? ""),
      slug: String(fd.get("slug") ?? "").trim().toLowerCase(),
      description: String(fd.get("description") ?? ""),
      imageUrl: String(fd.get("imageUrl") ?? "").trim() || undefined,
      basePriceCad,
      salePriceCad: Number.isFinite(salePriceCad as number) ? salePriceCad : undefined,
      stock: Number(fd.get("stock")),
      lowStockLevel: Number(fd.get("lowStockLevel")),
      isActive: String(fd.get("isActive")) === "1",
    };

    const result =
      props.mode === "create"
        ? await createProduct(payload)
        : await updateProduct(props.productId, payload);

    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function onDelete() {
    if (props.mode !== "edit") return;
    if (!window.confirm("Delete this product? Items with orders cannot be removed.")) return;
    setDelPending(true);
    setError(null);
    const result = await deleteProduct(props.productId);
    setDelPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  const field =
    "mt-2 w-full rounded-2xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] px-4 py-3 text-sm";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl">
      <StaggerContainer className="space-y-4">
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            Name <span className="text-red-600">*</span>
            <input name="name" type="text" required maxLength={200} defaultValue={init.name} className={field} />
          </label>
        </StaggerItem>
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            URL slug (lowercase letters, numbers, hyphens) <span className="text-red-600">*</span>
            <input
              name="slug"
              type="text"
              required
              maxLength={120}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              defaultValue={init.slug}
              className={`${field} font-mono`}
              placeholder="low-allergy-food-2kg"
            />
          </label>
        </StaggerItem>
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            Description <span className="text-red-600">*</span>
            <textarea
              name="description"
              required
              maxLength={10000}
              rows={5}
              defaultValue={init.description}
              className={field}
            />
          </label>
        </StaggerItem>
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            Hero image URL (https, optional)
            <input
              name="imageUrl"
              type="url"
              maxLength={2048}
              defaultValue={init.imageUrl ?? ""}
              className={field}
              placeholder="https://…"
            />
          </label>
        </StaggerItem>
        <StaggerItem>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-zinc-700">
              Base price (CAD) <span className="text-red-600">*</span>
              <input
                name="basePriceCad"
                type="number"
                required
                min={0.01}
                step="0.01"
                defaultValue={init.basePriceCad}
                className={field}
              />
            </label>
            <label className="block text-sm text-zinc-700">
              Sale price (CAD, optional—used at checkout when set)
              <input
                name="salePriceCad"
                type="number"
                min={0.01}
                step="0.01"
                defaultValue={init.salePriceCad ?? ""}
                className={field}
                placeholder="Leave empty for no sale price"
              />
            </label>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-zinc-700">
              Stock
              <input
                name="stock"
                type="number"
                required
                min={0}
                step={1}
                defaultValue={init.stock}
                className={field}
              />
            </label>
            <label className="block text-sm text-zinc-700">
              Low-stock alert threshold
              <input
                name="lowStockLevel"
                type="number"
                required
                min={0}
                step={1}
                defaultValue={init.lowStockLevel}
                className={field}
              />
            </label>
          </div>
        </StaggerItem>
        <StaggerItem>
          <label className="block text-sm text-zinc-700">
            Status
            <select
              name="isActive"
              defaultValue={init.isActive ? "1" : "0"}
              className={`${field} bg-white`}
            >
              <option value="1">Active (visible in shop)</option>
              <option value="0">Inactive (hidden)</option>
            </select>
          </label>
        </StaggerItem>
        <StaggerItem>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-wrap gap-3 pt-2">
            <motion.button
              type="submit"
              disabled={pending || delPending}
              whileTap={reduced ? undefined : { scale: 0.97 }}
              transition={springTap}
              className="rounded-full bg-[var(--sg-cta)] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : props.mode === "create" ? "Create product" : "Save"}
            </motion.button>
            <Link
              href="/admin/products"
              className="rounded-full border border-[var(--sg-border-subtle)] px-6 py-2.5 text-sm font-medium text-zinc-800"
            >
              Back to list
            </Link>
            {props.mode === "edit" ? (
              <motion.button
                type="button"
                onClick={() => void onDelete()}
                disabled={pending || delPending}
                whileTap={reduced ? undefined : { scale: 0.97 }}
                transition={springTap}
                className="rounded-full border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-medium text-red-800 disabled:opacity-60"
              >
                {delPending ? "Deleting…" : "Delete"}
              </motion.button>
            ) : null}
          </div>
        </StaggerItem>
      </StaggerContainer>
    </form>
  );
}
