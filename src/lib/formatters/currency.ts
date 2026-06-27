const GHS_FORMATTER = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatGhs(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'GH₵ —';
  }
  return GHS_FORMATTER.format(amount).replace('GHS', 'GH₵');
}

export function formatCompactGhs(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'GH₵ —';
  if (amount >= 1_000_000) return `GH₵ ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `GH₵ ${(amount / 1_000).toFixed(1)}K`;
  return formatGhs(amount);
}
