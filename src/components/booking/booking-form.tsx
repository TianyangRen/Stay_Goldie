"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { createBookingDraft } from "@/app/booking/actions";
import { estimateBookingTotal } from "@/lib/pricing";

type Pet = { id: string; name: string; sizeTier: string | null };

type Props = {
  pets: Pet[];
  isLoggedIn: boolean;
  baseNightlyCad: number;
  defaultCheckIn: string;
  defaultCheckOut: string;
};

export function BookingForm({
  pets,
  isLoggedIn,
  baseNightlyCad,
  defaultCheckIn,
  defaultCheckOut,
}: Props) {
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    pets.forEach((p) => {
      init[p.id] = true;
    });
    return init;
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const petIdsSelected = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([id]) => id),
    [selected],
  );

  const preview = useMemo(() => {
    if (petIdsSelected.length === 0) {
      return null;
    }
    const tiers = pets
      .filter((p) => petIdsSelected.includes(p.id))
      .map((p) => p.sizeTier ?? "medium");
    return estimateBookingTotal({
      baseNightlyCad,
      petSizeTiers: tiers,
      checkIn,
      checkOut,
    });
  }, [baseNightlyCad, checkIn, checkOut, petIdsSelected, pets]);

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function onPayDeposit() {
    setError(null);
    if (!isLoggedIn) {
      setError("请先登录。");
      return;
    }
    if (petIdsSelected.length === 0) {
      setError("请至少选择一只宠物。");
      return;
    }

    startTransition(async () => {
      const draft = await createBookingDraft({
        checkIn,
        checkOut,
        petIds: petIdsSelected,
      });

      if (!draft.ok) {
        setError(draft.message);
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking_deposit",
          bookingId: draft.bookingId,
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (res.status === 503) {
        setError("Stripe 未配置，无法支付订金。请设置 STRIPE_SECRET_KEY。");
        return;
      }

      if (!res.ok || !data.url) {
        setError(data.error ?? "无法创建结账会话。");
        return;
      }

      window.location.href = data.url;
    });
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        预约并支付订金需要先{" "}
        <Link href="/login?next=/booking" className="font-medium underline">
          登录
        </Link>
        。
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white p-6 text-sm text-zinc-600">
        当前账号下还没有宠物档案，无法预约。请联系管理员添加宠物信息，或通过数据库/后台录入。
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-zinc-700">
          入住日期
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 p-3"
          />
        </label>
        <label className="text-sm text-zinc-700">
          离店日期
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 p-3"
          />
        </label>
      </div>

      <div>
        <p className="text-sm font-medium text-zinc-800">选择宠物（多宠合并计价）</p>
        <ul className="mt-2 space-y-2">
          {pets.map((pet) => (
            <li key={pet.id}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={!!selected[pet.id]}
                  onChange={() => toggle(pet.id)}
                />
                {pet.name}
                <span className="text-zinc-500">({pet.sizeTier ?? "medium"})</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
        {preview ? (
          <>
            预估 {preview.nights} 晚 · 总价约 CAD {preview.estimatedTotal} · 订金 CAD {preview.deposit}{" "}
            （基础每晚 CAD {baseNightlyCad}，可在环境变量 BOARDING_BASE_NIGHTLY_CAD 调整）
          </>
        ) : (
          <>请至少选择一只宠物以显示预估金额。</>
        )}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        onClick={onPayDeposit}
        disabled={pending}
        className="rounded-full bg-[var(--sg-green)] px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "处理中…" : "创建预约并支付订金（Stripe）"}
      </button>
    </div>
  );
}
