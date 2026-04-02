/**
 * Notification service
 * Orchestrates in-app, WhatsApp, and push notifications
 */

import { PrismaClient } from '@prisma/client';
import { whatsappService, WhatsAppService } from './whatsapp';
import { formatDateTime } from './utils';

const prisma = new PrismaClient();

interface NotificationPreferences {
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

// Notification type definitions
type NotificationType =
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

interface CreateNotificationOptions {
  type: NotificationType;
  playerId: string;
  title: string;
  message: string;
  relatedId?: string;
  skipWhatsApp?: boolean;
  whatsAppOverride?: string; // Allow override of phone number for this notification
}

/**
 * Get player's notification preferences
 */
async function getPlayerPreferences(playerId: string): Promise<NotificationPreferences> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    throw new Error(`Player not found: ${playerId}`);
  }

  // These would be stored in a separate notification_preferences table
  // For now, returning default preferences
  // TODO: Create notification_preferences table in schema
  return {
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
}

/**
 * Create an in-app notification
 */
async function createInAppNotification(
  options: CreateNotificationOptions,
): Promise<string> {
  const notification = await prisma.notification.create({
    data: {
      playerId: options.playerId,
      type: options.type,
      title: options.title,
      message: options.message,
      relatedId: options.relatedId,
    },
  });

  return notification.id;
}

/**
 * Send WhatsApp notification to player
 */
async function sendWhatsAppNotification(
  playerId: string,
  phone: string,
  message: string,
  whatsappService: WhatsAppService,
): Promise<boolean> {
  try {
    if (!whatsappService.isConfigured()) {
      console.warn('WhatsApp service not configured');
      return false;
    }

    return await whatsappService.sendWhatsAppMessage(phone, message);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to send WhatsApp notification to ${playerId}:`, errorMessage);
    return false;
  }
}

/**
 * Notify about pending match
 */
export async function notifyMatchPending(
  matchId: string,
  registeredById: string,
  opponentId: string,
): Promise<void> {
  const opponent = await prisma.player.findUnique({
    where: { id: opponentId },
  });

  if (!opponent) {
    throw new Error(`Opponent not found: ${opponentId}`);
  }

  const preferences = await getPlayerPreferences(opponentId);

  // Create in-app notification
  await createInAppNotification({
    type: 'MATCH_PENDING',
    playerId: opponentId,
    title: 'Novo Desafio! 🎾',
    message: `Você foi desafiado para uma partida por ${registeredById}`,
    relatedId: matchId,
  });

  // Send WhatsApp if enabled
  if (
    preferences.whatsappNotifications &&
    preferences.notificationTypes.matchConfirmations &&
    preferences.whatsappPhone
  ) {
    await sendWhatsAppNotification(
      opponentId,
      preferences.whatsappPhone,
      `Novo Desafio! 🎾\n\nVocê foi desafiado para uma partida.\n\nAcesse o SquashHub para aceitar ou recusar.`,
      whatsappService,
    );
  }
}

/**
 * Notify about confirmed match
 */
export async function notifyMatchConfirmed(
  matchId: string,
  playerId: string,
  opponentName: string,
): Promise<void> {
  const preferences = await getPlayerPreferences(playerId);

  // Create in-app notification
  await createInAppNotification({
    type: 'MATCH_CONFIRMED',
    playerId,
    title: 'Partida Confirmada! ✅',
    message: `Sua partida contra ${opponentName} foi confirmada`,
    relatedId: matchId,
  });

  // Send WhatsApp if enabled
  if (
    preferences.whatsappNotifications &&
    preferences.notificationTypes.matchConfirmations &&
    preferences.whatsappPhone
  ) {
    await sendWhatsAppNotification(
      playerId,
      preferences.whatsappPhone,
      `Partida Confirmada! ✅\n\nVocê tem uma partida programada contra ${opponentName}.\n\nAcesse o SquashHub para mais detalhes.`,
      whatsappService,
    );
  }
}

/**
 * Notify about booking reminder
 */
export async function notifyBookingReminder(
  bookingId: string,
  playerId: string,
  bookingTitle: string,
  bookingDate: Date,
  venueName: string,
  bookingTime: Date,
): Promise<void> {
  const preferences = await getPlayerPreferences(playerId);

  const formattedDate = formatDateTime(bookingDate);
  const formattedTime = bookingTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Create in-app notification
  await createInAppNotification({
    type: 'BOOKING_REMINDER',
    playerId,
    title: 'Lembrete de Reserva 🎾',
    message: `${bookingTitle} em ${formattedDate}`,
    relatedId: bookingId,
  });

  // Send WhatsApp if enabled
  if (
    preferences.whatsappNotifications &&
    preferences.notificationTypes.bookingReminders &&
    preferences.whatsappPhone
  ) {
    await whatsappService.sendBookingReminder(
      preferences.whatsappPhone,
      bookingTitle,
      formattedDate,
      venueName,
      formattedTime,
    );
  }
}

/**
 * Notify about booking RSVP
 */
export async function notifyBookingRSVP(
  bookingId: string,
  playerId: string,
  status: string,
  respondentName: string,
): Promise<void> {
  const statusText =
    {
      ACCEPTED: 'aceitou',
      DECLINED: 'recusou',
      TENTATIVE: 'respondeu como incerto',
    }[status] || 'respondeu';

  // Create in-app notification
  await createInAppNotification({
    type: 'BOOKING_RSVP',
    playerId,
    title: 'Resposta de RSVP',
    message: `${respondentName} ${statusText} sua reserva`,
    relatedId: bookingId,
  });

  // WhatsApp notifications for RSVP are less critical
  // Only send if explicitly enabled
}

/**
 * Notify about ranking change
 */
export async function notifyRankingChange(
  playerId: string,
  groupId: string,
  newRating: number,
  oldRating: number,
): Promise<void> {
  const preferences = await getPlayerPreferences(playerId);

  const change = newRating - oldRating;

  // Create in-app notification
  const changeText = change > 0 ? `📈 +${change}` : `📉 ${change}`;
  await createInAppNotification({
    type: 'RANKING_UPDATE',
    playerId,
    title: `Ranking Atualizado ${changeText}`,
    message: `Seu novo rating: ${newRating}`,
    relatedId: groupId,
  });

  // Send WhatsApp if enabled
  if (
    preferences.whatsappNotifications &&
    preferences.notificationTypes.rankingUpdates &&
    preferences.whatsappPhone
  ) {
    // Get player position (simplified - would need more context)
    const position = 0; // TODO: Calculate actual position

    await whatsappService.sendRankingUpdate(
      preferences.whatsappPhone,
      newRating,
      change,
      position,
    );
  }
}

/**
 * Notify about tournament invitation
 */
export async function notifyTournamentInvite(
  playerId: string,
  tournamentId: string,
  tournamentName: string,
): Promise<void> {
  const preferences = await getPlayerPreferences(playerId);

  // Create in-app notification
  await createInAppNotification({
    type: 'TOURNAMENT_INVITE',
    playerId,
    title: 'Convite de Torneio 🏆',
    message: `Você foi convidado para participar de: ${tournamentName}`,
    relatedId: tournamentId,
  });

  // Send WhatsApp if enabled
  if (
    preferences.whatsappNotifications &&
    preferences.notificationTypes.tournamentUpdates &&
    preferences.whatsappPhone
  ) {
    await whatsappService.sendTournamentNotification(
      preferences.whatsappPhone,
      tournamentName,
      `Você foi convidado para participar deste torneio.\n\nAcesse o SquashHub para mais detalhes.`,
    );
  }
}

/**
 * Notify about tournament start
 */
export async function notifyTournamentStarted(
  playerId: string,
  tournamentId: string,
  tournamentName: string,
): Promise<void> {
  const preferences = await getPlayerPreferences(playerId);

  // Create in-app notification
  await createInAppNotification({
    type: 'TOURNAMENT_STARTED',
    playerId,
    title: 'Torneio Iniciado! 🏅',
    message: `${tournamentName} começou. Boa sorte!`,
    relatedId: tournamentId,
  });

  // Send WhatsApp if enabled
  if (
    preferences.whatsappNotifications &&
    preferences.notificationTypes.tournamentUpdates &&
    preferences.whatsappPhone
  ) {
    await whatsappService.sendTournamentNotification(
      preferences.whatsappPhone,
      tournamentName,
      `O torneio começou! Acesse o SquashHub para acompanhar.`,
    );
  }
}

/**
 * Notify about tournament cancellation
 */
export async function notifyTournamentCancelled(
  playerId: string,
  tournamentId: string,
  tournamentName: string,
): Promise<void> {
  const preferences = await getPlayerPreferences(playerId);

  // Create in-app notification
  await createInAppNotification({
    type: 'TOURNAMENT_CANCELLED',
    playerId,
    title: 'Torneio Cancelado',
    message: `O torneio "${tournamentName}" foi cancelado`,
    relatedId: tournamentId,
  });

  // Send WhatsApp notification about cancellation
  if (
    preferences.whatsappNotifications &&
    preferences.notificationTypes.tournamentUpdates &&
    preferences.whatsappPhone
  ) {
    await whatsappService.sendTournamentNotification(
      preferences.whatsappPhone,
      tournamentName,
      `Infelizmente, o torneio foi cancelado.`,
    );
  }
}

/**
 * Clean up old notifications (optional maintenance)
 */
export async function cleanupOldNotifications(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.notification.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}

/**
 * Export for testing and dependency injection
 */
export type { NotificationPreferences, NotificationType };
export default {
  notifyMatchPending,
  notifyMatchConfirmed,
  notifyBookingReminder,
  notifyBookingRSVP,
  notifyRankingChange,
  notifyTournamentInvite,
  notifyTournamentStarted,
  notifyTournamentCancelled,
  cleanupOldNotifications,
};
