/**
 * Type definitions and helpers for notifications
 */

// Notification preference types
export interface NotificationPreferences {
  pushNotifications: boolean;
  whatsappNotifications: boolean;
  emailNotifications: boolean;
  whatsappPhone?: string;
  email?: string;
  notificationTypes: {
    bookingReminders: boolean;
    matchConfirmations: boolean;
    rankingUpdates: boolean;
    tournamentUpdates: boolean;
  };
}

// Notification types
export type NotificationType =
  | 'BOOKING_INVITATION'
  | 'BOOKING_REMINDER'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_RSVP'
  | 'MATCH_PENDING'
  | 'MATCH_CONFIRMED'
  | 'MATCH_RESULT'
  | 'RANKING_UPDATE'
  | 'TOURNAMENT_INVITE'
  | 'TOURNAMENT_STARTED'
  | 'TOURNAMENT_CANCELLED'
  | 'ELO_UPDATE';

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushNotifications: true,
  whatsappNotifications: false,
  emailNotifications: false,
  notificationTypes: {
    bookingReminders: true,
    matchConfirmations: true,
    rankingUpdates: true,
    tournamentUpdates: true,
  },
};

// Notification type descriptions
export const NOTIFICATION_TYPE_DESCRIPTIONS: Record<NotificationType, string> = {
  BOOKING_INVITATION: 'Convite para uma reserva',
  BOOKING_REMINDER: 'Lembrete de uma reserva próxima',
  BOOKING_CANCELLED: 'Cancelamento de uma reserva',
  BOOKING_RSVP: 'Resposta de RSVP a uma reserva',
  MATCH_PENDING: 'Novo desafio de partida',
  MATCH_CONFIRMED: 'Confirmação de partida',
  MATCH_RESULT: 'Resultado de uma partida',
  RANKING_UPDATE: 'Atualização de ranking/ELO',
  TOURNAMENT_INVITE: 'Convite para um torneio',
  TOURNAMENT_STARTED: 'Início de um torneio',
  TOURNAMENT_CANCELLED: 'Cancelamento de um torneio',
  ELO_UPDATE: 'Atualização de ELO rating',
};

// Notification icons/emojis for UI
export const NOTIFICATION_EMOJIS: Record<NotificationType, string> = {
  BOOKING_INVITATION: '📅',
  BOOKING_REMINDER: '🔔',
  BOOKING_CANCELLED: '❌',
  BOOKING_RSVP: '✅',
  MATCH_PENDING: '🎾',
  MATCH_CONFIRMED: '✅',
  MATCH_RESULT: '🏆',
  RANKING_UPDATE: '📈',
  TOURNAMENT_INVITE: '🏅',
  TOURNAMENT_STARTED: '🚀',
  TOURNAMENT_CANCELLED: '⛔',
  ELO_UPDATE: '⭐',
};

/**
 * Validate phone number format
 */
export function isValidBrazilianPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const cleaned = phone.replace(/\D/g, '');

  // Accept 10 or 11 digit Brazilian numbers or with country code
  if (cleaned.length === 10 || cleaned.length === 11) {
    return true;
  }

  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
    return true;
  }

  return false;
}

/**
 * Format phone number to international format
 */
export function formatToInternational(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('55')) {
    return cleaned;
  }

  return `55${cleaned}`;
}

/**
 * Format phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

/**
 * Parse Brazilian phone number from display format
 */
export function parsePhoneFromDisplay(formattedPhone: string): string {
  return formattedPhone.replace(/\D/g, '');
}

/**
 * Get notification color based on type
 */
export function getNotificationColor(type: NotificationType): string {
  const colorMap: Record<NotificationType, string> = {
    BOOKING_INVITATION: 'blue',
    BOOKING_REMINDER: 'amber',
    BOOKING_CANCELLED: 'red',
    BOOKING_RSVP: 'green',
    MATCH_PENDING: 'purple',
    MATCH_CONFIRMED: 'green',
    MATCH_RESULT: 'yellow',
    RANKING_UPDATE: 'cyan',
    TOURNAMENT_INVITE: 'pink',
    TOURNAMENT_STARTED: 'orange',
    TOURNAMENT_CANCELLED: 'red',
    ELO_UPDATE: 'cyan',
  };

  return colorMap[type] || 'gray';
}

/**
 * Get notification category from type
 */
export function getNotificationCategory(
  type: NotificationType,
): keyof NotificationPreferences['notificationTypes'] {
  const categoryMap: Record<NotificationType, keyof NotificationPreferences['notificationTypes']> = {
    BOOKING_INVITATION: 'bookingReminders',
    BOOKING_REMINDER: 'bookingReminders',
    BOOKING_CANCELLED: 'bookingReminders',
    BOOKING_RSVP: 'bookingReminders',
    MATCH_PENDING: 'matchConfirmations',
    MATCH_CONFIRMED: 'matchConfirmations',
    MATCH_RESULT: 'matchConfirmations',
    RANKING_UPDATE: 'rankingUpdates',
    TOURNAMENT_INVITE: 'tournamentUpdates',
    TOURNAMENT_STARTED: 'tournamentUpdates',
    TOURNAMENT_CANCELLED: 'tournamentUpdates',
    ELO_UPDATE: 'rankingUpdates',
  };

  return categoryMap[type] || 'bookingReminders';
}

/**
 * Check if notification type is enabled in preferences
 */
export function isNotificationTypeEnabled(
  type: NotificationType,
  preferences: NotificationPreferences,
): boolean {
  const category = getNotificationCategory(type);
  return preferences.notificationTypes[category];
}

/**
 * Check if a notification channel is available
 */
export function isChannelAvailable(
  channel: 'push' | 'whatsapp' | 'email',
  preferences: NotificationPreferences,
): boolean {
  switch (channel) {
    case 'push':
      return preferences.pushNotifications;
    case 'whatsapp':
      return preferences.whatsappNotifications && !!preferences.whatsappPhone;
    case 'email':
      return preferences.emailNotifications && !!preferences.email;
    default:
      return false;
  }
}

/**
 * Get enabled channels from preferences
 */
export function getEnabledChannels(preferences: NotificationPreferences): Array<'push' | 'whatsapp' | 'email'> {
  const channels: Array<'push' | 'whatsapp' | 'email'> = [];

  if (preferences.pushNotifications) channels.push('push');
  if (preferences.whatsappNotifications && preferences.whatsappPhone) channels.push('whatsapp');
  if (preferences.emailNotifications && preferences.email) channels.push('email');

  return channels;
}

/**
 * Validate notification preferences object
 */
export function validatePreferences(prefs: unknown): prefs is NotificationPreferences {
  if (!prefs || typeof prefs !== 'object') {
    return false;
  }

  const p = prefs as Record<string, unknown>;

  return (
    typeof p.pushNotifications === 'boolean' &&
    typeof p.whatsappNotifications === 'boolean' &&
    typeof p.emailNotifications === 'boolean' &&
    (p.whatsappPhone === undefined || typeof p.whatsappPhone === 'string') &&
    (p.email === undefined || typeof p.email === 'string') &&
    typeof p.notificationTypes === 'object' &&
    p.notificationTypes !== null &&
    typeof (p.notificationTypes as Record<string, unknown>).bookingReminders === 'boolean' &&
    typeof (p.notificationTypes as Record<string, unknown>).matchConfirmations === 'boolean' &&
    typeof (p.notificationTypes as Record<string, unknown>).rankingUpdates === 'boolean' &&
    typeof (p.notificationTypes as Record<string, unknown>).tournamentUpdates === 'boolean'
  );
}

/**
 * Merge preferences with defaults
 */
export function mergeWithDefaults(
  preferences: Partial<NotificationPreferences>,
): NotificationPreferences {
  return {
    pushNotifications: preferences.pushNotifications ?? DEFAULT_NOTIFICATION_PREFERENCES.pushNotifications,
    whatsappNotifications: preferences.whatsappNotifications ?? DEFAULT_NOTIFICATION_PREFERENCES.whatsappNotifications,
    emailNotifications: preferences.emailNotifications ?? DEFAULT_NOTIFICATION_PREFERENCES.emailNotifications,
    whatsappPhone: preferences.whatsappPhone,
    email: preferences.email,
    notificationTypes: {
      bookingReminders: preferences.notificationTypes?.bookingReminders ?? DEFAULT_NOTIFICATION_PREFERENCES.notificationTypes.bookingReminders,
      matchConfirmations: preferences.notificationTypes?.matchConfirmations ?? DEFAULT_NOTIFICATION_PREFERENCES.notificationTypes.matchConfirmations,
      rankingUpdates: preferences.notificationTypes?.rankingUpdates ?? DEFAULT_NOTIFICATION_PREFERENCES.notificationTypes.rankingUpdates,
      tournamentUpdates: preferences.notificationTypes?.tournamentUpdates ?? DEFAULT_NOTIFICATION_PREFERENCES.notificationTypes.tournamentUpdates,
    },
  };
}
