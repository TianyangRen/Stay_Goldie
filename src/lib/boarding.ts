/** Default nightly boarding rate in CAD (env BOARDING_BASE_NIGHTLY_CAD overrides). */
export function getBoardingBaseNightlyCad(): number {
  const raw = process.env.BOARDING_BASE_NIGHTLY_CAD;
  if (raw === undefined || raw === "") {
    return 68;
  }
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 68;
}
