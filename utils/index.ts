export function getInitials(input?: { firstName?: string | null; lastName?: string | null; email?: string | null } | string | null): string {
  if (!input) return '?';
  if (typeof input === 'string') {
    const s = input.trim();
    if (!s) return '?';
    const parts = s.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return s[0]?.toUpperCase() ?? '?';
  }
  const parts: string[] = [];
  if (input.firstName) parts.push(input.firstName);
  if (input.lastName) parts.push(input.lastName);
  if (parts.length === 0) {
    const c = (input.email ?? '').trim();
    return c ? c[0].toUpperCase() : '?';
  }
  return parts.map(p => p.charAt(0).toUpperCase()).join('');
}

export function formatDate(value?: string | number | Date | null, locale: string = 'en-US'): string {
  if (!value) return '—';
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(value ?? '');
  }
}

export function formatCurrency(
  value?: number | null,
  currency: string = 'KES',
  locale: string = 'en-KE',
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      ...options,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}


