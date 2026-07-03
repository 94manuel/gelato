export interface SupplierScoreInput {
  qualityScore: number;
  serviceScore: number;
  priceScore: number;
  deliveryScore: number;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateSupplierTotalScore(input: SupplierScoreInput): number {
  const quality = clampScore(input.qualityScore);
  const service = clampScore(input.serviceScore);
  const price = clampScore(input.priceScore);
  const delivery = clampScore(input.deliveryScore);
  return Math.round((quality * 0.35 + service * 0.2 + price * 0.3 + delivery * 0.15) * 100) / 100;
}
