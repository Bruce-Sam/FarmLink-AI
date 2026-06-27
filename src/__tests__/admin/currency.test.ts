import { describe, expect, it } from 'vitest';
import { formatCompactGhs, formatGhs } from '@/lib/formatters/currency';

describe('Admin currency formatters', () => {
  it('formats GHS with GH₵ symbol', () => {
    expect(formatGhs(1500)).toContain('GH₵');
    expect(formatGhs(1500)).toContain('1,500');
  });

  it('returns em dash for nullish amounts', () => {
    expect(formatGhs(null)).toBe('GH₵ —');
    expect(formatGhs(undefined)).toBe('GH₵ —');
  });

  it('formats compact millions', () => {
    expect(formatCompactGhs(2_500_000)).toBe('GH₵ 2.5M');
  });

  it('formats compact thousands', () => {
    expect(formatCompactGhs(12_400)).toBe('GH₵ 12.4K');
  });
});
