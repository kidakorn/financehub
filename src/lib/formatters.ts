import type { Lang } from '@/types/index';

/** Format a number as Thai Baht with 2 decimal places */
export function formatTHB(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format a number with commas, no decimals */
export function formatInt(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a date string (YYYY-MM-DD) per active language */
export function formatDate(isoDate: string, lang: Lang): string {
  if (!isoDate) return '';
  const date = new Date(isoDate + 'T00:00:00');
  const locale = lang === 'th' ? 'th-TH' : 'en-GB';
  return date.toLocaleDateString(locale, {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  });
}

/** Generate a simple UUID-like ID */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Add N months to a date and return YYYY-MM-DD */
export function addMonths(isoDate: string, months: number): string {
  const date = new Date(isoDate + 'T00:00:00');
  date.setMonth(date.getMonth() + months);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
