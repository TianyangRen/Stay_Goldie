"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPostSlug } from "@/lib/slug";
import { z } from "zod";

const postInput = z.object({
  title: z.string().min(1).max(160),
  content: z.string().min(1).max(12000),
  coverImage: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.string().url().optional(),
  ),
  categoryId: z.string().optional().nullable(),
  personaId: z.string().optional().nullable(),
});

async function uniqueSlug(title: string): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = attempt === 0 ? createPostSlug(title) : createPostSlug(`${title} ${attempt}`);
    const exists = await prisma.blogPost.findUnique({ where: { slug } });
    if (!exists) return slug;
  }
  return createPostSlug(`${title}-${Date.now()}`);
}

function excerptFromContent(content: string): string {
  const t = content.trim();
  if (t.length <= 280) return t;
  return `${t.slice(0, 277)}…`;
}

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; message: string };

/** Owners and admins can publish updates. Admins may attach a posting persona. */
export async function createUpdatePost(input: unknown): Promise<ActionResult<{ slug: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Sign in required." };
  }

  const parsed = postInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid post fields." };
  }

  const { title, content, categoryId, personaId } = parsed.data;
  const coverRaw = parsed.data.coverImage?.trim() ?? "";
  const coverImage = coverRaw.length > 0 ? coverRaw : null;

  let resolvedPersonaId: string | null = null;
  if (personaId) {
    if (session.user.role !== "ADMIN") {
      return { ok: false, message: "Only staff can post as a pet persona." };
    }
    const persona = await prisma.postingPersona.findFirst({
      where: { id: personaId, userId: session.user.id },
    });
    if (!persona) {
      return { ok: false, message: "Persona not found." };
    }
    resolvedPersonaId = persona.id;
  }

  if (categoryId) {
    const cat = await prisma.blogCategory.findUnique({ where: { id: categoryId } });
    if (!cat) {
      return { ok: false, message: "Category not found." };
    }
  }

  const slug = await uniqueSlug(title);
  const excerpt = excerptFromContent(content);

  await prisma.blogPost.create({
    data: {
      authorId: session.user.id,
      personaId: resolvedPersonaId,
      categoryId: categoryId ?? null,
      title: title.trim(),
      slug,
      excerpt,
      content: content.trim(),
      coverImage,
      publishedAt: new Date(),
    },
  });

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/account/updates");
  return { ok: true, data: { slug } };
}

export async function toggleBlogPostLike(postId: string): Promise<ActionResult<{ liked: boolean; likeCount: number }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Sign in to like posts." };
  }

  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post?.publishedAt) {
    return { ok: false, message: "Post not found." };
  }

  const existing = await prisma.blogPostLike.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.blogPostLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.blogPostLike.create({ data: { postId, userId: session.user.id } });
  }

  const likeCount = await prisma.blogPostLike.count({ where: { postId } });
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return { ok: true, data: { liked: !existing, likeCount } };
}

const commentInput = z.object({
  postId: z.string().min(1),
  content: z.string().min(1).max(4000),
});

export async function addBlogPostComment(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Sign in to comment." };
  }

  const parsed = commentInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Comment is invalid." };
  }

  const post = await prisma.blogPost.findUnique({ where: { id: parsed.data.postId } });
  if (!post?.publishedAt) {
    return { ok: false, message: "Post not found." };
  }

  const row = await prisma.blogPostComment.create({
    data: {
      postId: parsed.data.postId,
      userId: session.user.id,
      content: parsed.data.content.trim(),
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return { ok: true, data: { id: row.id } };
}

const personaInput = z.object({
  name: z.string().min(1).max(80),
  avatarUrl: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.string().url().optional(),
  ),
});

export async function createPostingPersona(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { ok: false, message: "Admin only." };
  }

  const parsed = personaInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid persona." };
  }

  const avatarRaw = parsed.data.avatarUrl?.trim();
  const row = await prisma.postingPersona.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name.trim(),
      avatarUrl: avatarRaw && avatarRaw.length > 0 ? avatarRaw : null,
    },
  });

  revalidatePath("/admin/blog");
  return { ok: true, data: { id: row.id } };
}

export async function deletePostingPersona(personaId: string): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { ok: false, message: "Admin only." };
  }

  const persona = await prisma.postingPersona.findFirst({
    where: { id: personaId, userId: session.user.id },
  });
  if (!persona) {
    return { ok: false, message: "Not found." };
  }

  await prisma.postingPersona.delete({ where: { id: persona.id } });
  revalidatePath("/admin/blog");
  return { ok: true };
}

export async function updatePostingPersona(
  personaId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { ok: false, message: "Admin only." };
  }

  const parsed = personaInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid persona." };
  }

  const persona = await prisma.postingPersona.findFirst({
    where: { id: personaId, userId: session.user.id },
  });
  if (!persona) {
    return { ok: false, message: "Not found." };
  }

  const avatarRaw = parsed.data.avatarUrl?.trim();
  await prisma.postingPersona.update({
    where: { id: persona.id },
    data: {
      name: parsed.data.name.trim(),
      avatarUrl: avatarRaw && avatarRaw.length > 0 ? avatarRaw : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true };
}
