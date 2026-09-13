// Platform take rate: 5% added to what the brand is charged, 5% deducted
// from what the talent receives — 10% total to Streetcast. Kept as two
// separate constants (rather than one combined number) so the split
// itself, not just the total, is easy to tune later.
export const BRAND_FEE_RATE = 0.05;
export const TALENT_FEE_RATE = 0.05;

export type FeeBreakdown = {
  baseCents: number;
  brandChargeCents: number;
  talentPayoutCents: number;
  platformFeeCents: number;
};

// Snapshotting these amounts at checkout time (rather than recomputing
// from agreed_rate later) means a future change to the fee rates never
// retroactively changes what a past booking charged or paid out.
export function feeBreakdownFromRate(agreedRate: number): FeeBreakdown {
  const baseCents = Math.round(agreedRate * 100);
  const brandChargeCents = Math.round(baseCents * (1 + BRAND_FEE_RATE));
  const talentPayoutCents = Math.round(baseCents * (1 - TALENT_FEE_RATE));
  const platformFeeCents = brandChargeCents - talentPayoutCents;
  return { baseCents, brandChargeCents, talentPayoutCents, platformFeeCents };
}
