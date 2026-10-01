import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(dateStr, pattern = 'MMM dd, yyyy') {
  if (!dateStr) return '—';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, pattern);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  return formatDate(dateStr, 'MMM dd, yyyy HH:mm:ss');
}

export function formatTimeAgo(dateStr) {
  if (!dateStr) return '—';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str, length = 35) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}
