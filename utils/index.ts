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

// Helper function to check if user has a specific role
export function hasRole(user: any, roleName: string): boolean {
  if (!user) return false;
  // Support both old format (user.role) and new format (user.roles array)
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some((r: any) => {
      if (typeof r === 'string') return r === roleName;
      return r.name === roleName || r._id === roleName;
    });
  }
  return user.role === roleName;
}

// Helper function to get primary role from user
export function getPrimaryRole(user: any): string | null {
  if (!user) return null;
  // Support both old format (user.role) and new format (user.roles array)
  if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    const firstRole = user.roles[0];
    return typeof firstRole === 'string' ? firstRole : firstRole.name || firstRole.displayName || null;
  }
  return user.role || null;
}

// Helper function to get all role names from user
export function getRoleNames(user: any): string[] {
  if (!user) return [];
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.map((r: any) => (typeof r === 'string' ? r : r.name || r.displayName)).filter(Boolean);
  }
  return user.role ? [user.role] : [];
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


