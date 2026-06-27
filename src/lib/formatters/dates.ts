import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : parseISO(value);
  return isValid(date) ? date : null;
}

export function formatAdminDate(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  if (!date) return '—';
  return format(date, 'dd MMM yyyy');
}

export function formatAdminDateTime(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  if (!date) return '—';
  return format(date, 'dd MMM yyyy, HH:mm');
}

export function formatRelativeTime(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  if (!date) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
