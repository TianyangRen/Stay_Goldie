import { randomBytes } from "node:crypto";

/** URL-safe unique slug from title + random suffix. */
export function createPostSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const suffix = randomBytes(4).toString("hex");
  return `${base || "post"}-${suffix}`;
}
