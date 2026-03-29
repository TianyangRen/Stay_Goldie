"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { addBlogPostComment, toggleBlogPostLike } from "@/app/blog/actions";
import Link from "next/link";
import { Pressable } from "@/components/motion/pressable";

type CommentRow = {
  id: string;
  content: string;
  createdAt: string;
  authorLabel: string;
};

type Props = {
  postId: string;
  slug: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialCommentCount: number;
  /** Shown on feed (preview) and detail (full thread). */
  comments?: CommentRow[];
  /** Tighter spacing on feed cards. */
  compact?: boolean;
};

export function FeedPostEngagement({
  postId,
  slug,
  initialLiked,
  initialLikeCount,
  initialCommentCount,
  comments,
  compact,
}: Props) {
  const { status } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function runToggle() {
    if (status !== "authenticated") return;
    startTransition(async () => {
      const res = await toggleBlogPostLike(postId);
      if (res.ok && res.data) {
        setLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
        router.refresh();
      } else if (!res.ok) {
        setErr(res.message);
      }
    });
  }

  function submitComment() {
    if (pending) return;
    if (status !== "authenticated" || !text.trim()) return;
    setErr(null);
    startTransition(async () => {
      const res = await addBlogPostComment({ postId, content: text.trim() });
      if (res.ok) {
        setText("");
        setCommentCount((c) => c + 1);
        router.refresh();
      } else {
        setErr(res.message);
      }
    });
  }

  function runComment(e: React.FormEvent) {
    e.preventDefault();
    submitComment();
  }

  function onCommentKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitComment();
    }
  }

  const sectionPad = compact ? "px-1" : "";

  return (
    <div className={compact ? "border-t border-[var(--sg-border-subtle)] px-3 py-2" : "mt-4 space-y-4"}>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {status === "authenticated" ? (
          <Pressable className="inline-block">
            <button
              type="button"
              onClick={runToggle}
              disabled={pending}
              className={`rounded-full px-3 py-1.5 font-medium ${
                liked ? "bg-[var(--sg-cta)]/15 text-[var(--sg-cta)]" : "bg-[var(--sg-surface-alt)] text-zinc-700"
              }`}
            >
              {liked ? "♥ Liked" : "♡ Like"} · {likeCount}
            </button>
          </Pressable>
        ) : (
          <Link href="/login" className="rounded-full bg-[var(--sg-surface-alt)] px-3 py-1.5 text-sm text-zinc-600">
            Log in to like · {likeCount}
          </Link>
        )}
        <span className="text-zinc-500" aria-live="polite">
          {commentCount} comment{commentCount === 1 ? "" : "s"}
        </span>
      </div>

      {err ? <p className="text-sm text-red-600">{err}</p> : null}

      {/* Composer first so typing never sits below the thread */}
      {status === "authenticated" ? (
        <form
          onSubmit={runComment}
          className={`flex flex-col gap-2 border-t border-[var(--sg-border-subtle)] pt-3 ${sectionPad}`}
        >
          <label className="sr-only" htmlFor={`comment-${postId}`}>
            Add a comment
          </label>
          <div className="flex gap-2">
            <textarea
              id={`comment-${postId}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onCommentKeyDown}
              rows={compact ? 2 : 3}
              maxLength={4000}
              placeholder="Add a comment…"
              className="min-h-[2.75rem] flex-1 resize-y rounded-2xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={pending || !text.trim()}
              title="Send — Enter (Shift+Enter for new line)"
              className="shrink-0 self-end rounded-2xl bg-[var(--sg-cta)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <span className="sr-only">Press Enter to send. Shift+Enter adds a line.</span>
        </form>
      ) : (
        <p className={`border-t border-[var(--sg-border-subtle)] pt-3 text-xs text-zinc-500 ${sectionPad}`}>
          <Link
            href={`/login?next=${encodeURIComponent(`/blog/${slug}`)}`}
            className="font-medium text-[var(--sg-cta)] underline underline-offset-4"
          >
            Log in
          </Link>{" "}
          to comment.
        </p>
      )}

      {comments && comments.length > 0 ? (
        <ul className={`space-y-2 border-t border-[var(--sg-border-subtle)] pt-3 ${sectionPad}`}>
          {comments.map((c) => (
            <li key={c.id} className={`text-sm ${compact ? "leading-snug" : ""}`}>
              <span className="font-semibold text-[var(--sg-text)]">{c.authorLabel}</span>
              <span className="text-zinc-400"> · </span>
              <span className="text-zinc-600">{c.content}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
