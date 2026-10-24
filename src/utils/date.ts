/** Date helpers kept tiny and UTC-safe for yyyy-mm-dd storage. */

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function parseISO(date: string): Date {
  // Force local midnight so day math is stable across timezones.
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: string, days: number): string {
  const d = parseISO(date);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function diffDays(a: string, b: string): number {
  const ms = parseISO(b).getTime() - parseISO(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** Human friendly, e.g. "24 Oct 2026". Kept simple and locale-neutral. */
export function formatDate(date: string): string {
  const d = parseISO(date);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
