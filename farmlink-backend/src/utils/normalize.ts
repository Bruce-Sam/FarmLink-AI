// Normalizes Ghanaian phone numbers to a +233XXXXXXXXX form where possible.
// Falls back to a trimmed, space-stripped value for other formats.
export function normalizePhone(raw: string): string {
  const trimmed = raw.replace(/[\s()-]/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  if (trimmed.startsWith('00')) return `+${trimmed.slice(2)}`;
  if (trimmed.startsWith('0') && trimmed.length === 10) return `+233${trimmed.slice(1)}`;
  if (trimmed.startsWith('233')) return `+${trimmed}`;
  return trimmed;
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
