// Platform take rate: 10%, loaded entirely onto the brand side. The
// talent's payout always equals the agreed rate in full — what they see
// when they accept a gig is exactly what lands in their account. The
// brand is charged the agreed rate plus this fee, on top, at checkout.
export const PLATFORM_FEE_RATE = 0.1;

export type FeeBreakdown = {
  baseCents: number;
  brandChargeCents: number;
  talentPayoutCents: number;
  platformFeeCents: number;
};

// Snapshotting these amounts at checkout time (rather than recomputing
// from agreed_rate later) means a future change to the fee rate never
// retroactively changes what a past booking charged or paid out.
export function feeBreakdownFromRate(agreedRate: number): FeeBreakdown {
  const baseCents = Math.round(agreedRate * 100);
  const talentPayoutCents = baseCents;
  const brandChargeCents = Math.round(baseCents * (1 + PLATFORM_FEE_RATE));
  const platformFeeCents = brandChargeCents - talentPayoutCents;
  return { baseCents, brandChargeCents, talentPayoutCents, platformFeeCents };
}
