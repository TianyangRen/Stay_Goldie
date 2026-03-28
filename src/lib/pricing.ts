/** Pure pricing helpers for boarding estimates (no I/O). */

const SIZE_MULTIPLIER: Record<string, number> = {
  small: 1,
  medium: 1.15,
  large: 1.35,
};

/** Calendar-night count between ISO date strings (booking UI). */
export function getNightCount(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const ms = outDate.getTime() - inDate.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Subtotal + suggested deposit from base rate, tiers, and stay length. */
export function estimateBookingTotal(params: {
  baseNightlyCad: number;
  petSizeTiers: string[];
  checkIn: string;
  checkOut: string;
}) {
  const nights = getNightCount(params.checkIn, params.checkOut);
  const petFactor =
    params.petSizeTiers.reduce((sum, tier) => sum + (SIZE_MULTIPLIER[tier] ?? 1), 0) *
    (params.petSizeTiers.length > 1 ? 0.9 : 1);
  const estimatedTotal = Number((params.baseNightlyCad * nights * petFactor).toFixed(2));
  const deposit = Number((estimatedTotal * 0.3).toFixed(2));

  return {
    nights,
    estimatedTotal,
    deposit,
  };
}
