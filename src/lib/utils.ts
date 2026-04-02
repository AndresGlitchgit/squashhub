import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistance, formatRelative, formatDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Combine classnames with Tailwind CSS merge support
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date using Portuguese (Brazil) locale
 */
export function formatDatePtBr(date: Date, formatStr: string = 'PPP'): string {
  return formatDate(date, formatStr, { locale: ptBR });
}

/**
 * Format relative time (e.g., "2 horas atrás")
 */
export function formatRelativePtBr(date: Date, baseDate: Date = new Date()): string {
  return formatRelative(date, baseDate, { locale: ptBR });
}

/**
 * Format distance between dates (e.g., "2 horas")
 */
export function formatDistancePtBr(date: Date, baseDate: Date = new Date()): string {
  return formatDistance(date, baseDate, { locale: ptBR, addSuffix: true });
}

/**
 * Format time in HH:mm format
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date): string {
  return `${formatDatePtBr(date, 'PP')} às ${formatTime(date)}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format a score with nice formatting
 */
export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return '-';
  return score.toString();
}

/**
 * Format an ELO rating
 */
export function formatElo(rating: number): string {
  return rating.toLocaleString('pt-BR');
}

/**
 * Format a duration in minutes to readable text
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return date > new Date();
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Get Elo rating color class
 */
export function getEloColorClass(rating: number): string {
  if (rating < 1200) return 'text-blue-400';
  if (rating < 1600) return 'text-green-400';
  if (rating < 2000) return 'text-yellow-400';
  if (rating < 2400) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get Elo rating label
 */
export function getEloLabel(rating: number): string {
  if (rating < 1200) return 'Iniciante';
  if (rating < 1600) return 'Intermediário';
  if (rating < 2000) return 'Avançado';
  if (rating < 2400) return 'Muito Bom';
  return 'Profissional';
}

/**
 * Parse query parameters from URL
 */
export function parseQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format phone number (Brazilian format)
 */
export function formatPhoneBr(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Get browser locale
 */
export function getBrowserLocale(): string {
  return navigator.language || navigator.languages?.[0] || 'pt-BR';
}

/**
 * Retry an async function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
