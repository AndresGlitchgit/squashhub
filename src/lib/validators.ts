import { z } from 'zod';
import { SQUASHHUB_CONSTANTS } from '@/lib/constants';

/**
 * Validation schemas for the application
 */

// Player validation
export const PlayerProfileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  username: z
    .string()
    .min(SQUASHHUB_CONSTANTS.USERNAME_MIN_LENGTH)
    .max(SQUASHHUB_CONSTANTS.USERNAME_MAX_LENGTH)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username pode conter apenas letras, números, underscores e hífens'),
  bio: z.string().max(SQUASHHUB_CONSTANTS.BIO_MAX_LENGTH).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']),
});

export type PlayerProfile = z.infer<typeof PlayerProfileSchema>;

// Match score validation
export const MatchScoreSchema = z.object({
  player1Score: z.number().int().min(0),
  player2Score: z.number().int().min(0),
}).refine(
  (data) => {
    const { player1Score, player2Score } = data;

    // At least one player must have min winning score
    if (player1Score < SQUASHHUB_CONSTANTS.SQUASH_MIN_WINNING_SCORE &&
        player2Score < SQUASHHUB_CONSTANTS.SQUASH_MIN_WINNING_SCORE) {
      return false;
    }

    // Winner must have min winning score
    const winner = player1Score >= player2Score ? player1Score : player2Score;
    if (winner < SQUASHHUB_CONSTANTS.SQUASH_MIN_WINNING_SCORE) {
      return false;
    }

    // If both >= 10, must have 2-point difference
    if (
      player1Score >= SQUASHHUB_CONSTANTS.SQUASH_DEUCE_THRESHOLD &&
      player2Score >= SQUASHHUB_CONSTANTS.SQUASH_DEUCE_THRESHOLD
    ) {
      const diff = Math.abs(player1Score - player2Score);
      if (diff < SQUASHHUB_CONSTANTS.SQUASH_DEUCE_MARGIN) {
        return false;
      }
    }

    // Loser cannot exceed winner score if winner < 10
    const loser = player1Score < player2Score ? player1Score : player2Score;
    const winnerScore = player1Score >= player2Score ? player1Score : player2Score;
    if (winnerScore < SQUASHHUB_CONSTANTS.SQUASH_DEUCE_THRESHOLD && loser >= SQUASHHUB_CONSTANTS.SQUASH_DEUCE_THRESHOLD) {
      return false;
    }

    return true;
  },
  {
    message: 'Pontuação inválida para o formato PAR-11',
  },
);

export type MatchScore = z.infer<typeof MatchScoreSchema>;

// Game validation
export const GameValidationSchema = z.object({
  gameNumber: z.number().int().min(1),
  format: z.enum(['BEST_OF_3', 'BEST_OF_5', 'SINGLE_GAME']),
  scores: z.array(MatchScoreSchema),
}).refine(
  (data) => {
    const { format, scores } = data;

    if (format === 'SINGLE_GAME' && scores.length !== 1) {
      return false;
    }
    if (format === 'BEST_OF_3' && scores.length <= 3) {
      return true;
    }
    if (format === 'BEST_OF_5' && scores.length <= 5) {
      return true;
    }

    return false;
  },
  {
    message: 'Número de games inválido para o formato',
  },
);

export type GameValidation = z.infer<typeof GameValidationSchema>;

// Booking validation
export const BookingCreationSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  venueId: z.string().cuid(),
  groupId: z.string().cuid().optional(),
  date: z.coerce.date().refine(
    (date) => date > new Date(),
    'A data da reserva deve ser no futuro',
  ),
  time: z.coerce.date(),
  duration: z
    .number()
    .int()
    .min(SQUASHHUB_CONSTANTS.DEFAULT_BOOKING_DURATION)
    .max(SQUASHHUB_CONSTANTS.MAX_BOOKING_DURATION),
  maxPlayers: z
    .number()
    .int()
    .min(SQUASHHUB_CONSTANTS.MIN_PLAYERS_PER_BOOKING)
    .max(SQUASHHUB_CONSTANTS.MAX_PLAYERS_PER_BOOKING),
  recurrence: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']),
  recurrenceEndDate: z.coerce.date().optional(),
});

export type BookingCreation = z.infer<typeof BookingCreationSchema>;

// RSVP validation
export const RSVPSchema = z.object({
  bookingId: z.string().cuid(),
  status: z.enum(['ACCEPTED', 'DECLINED', 'TENTATIVE']),
});

export type RSVP = z.infer<typeof RSVPSchema>;

// Group creation validation
export const GroupCreationSchema = z.object({
  name: z.string().min(1).max(SQUASHHUB_CONSTANTS.GROUP_NAME_MAX_LENGTH),
  description: z.string().max(SQUASHHUB_CONSTANTS.GROUP_DESCRIPTION_MAX_LENGTH).optional(),
  privacy: z.enum(['PUBLIC', 'PRIVATE']),
  maxMembers: z.number().int().min(2).max(100),
});

export type GroupCreation = z.infer<typeof GroupCreationSchema>;

// Tournament creation validation
export const TournamentCreationSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  groupId: z.string().cuid(),
  format: z.enum(['ROUND_ROBIN', 'KNOCKOUT', 'GROUP_STAGE']),
  startDate: z.coerce.date().refine(
    (date) => date > new Date(),
    'A data de início deve ser no futuro',
  ),
  endDate: z.coerce.date().optional(),
  maxParticipants: z.number().int().min(2).max(128),
  entryFee: z.number().min(0),
}).refine(
  (data) => !data.endDate || data.endDate > data.startDate,
  {
    message: 'Data de término deve ser posterior à data de início',
    path: ['endDate'],
  },
);

export type TournamentCreation = z.infer<typeof TournamentCreationSchema>;

// Venue validation
export const VenueCreationSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(300),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(2),
  postalCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  country: z.string().min(1).max(100),
  phoneNumber: z.string().regex(/^\d{10,11}$/, 'Telefone inválido').optional(),
  website: z.string().url().optional(),
  courts: z.number().int().min(1),
  amenities: z.array(z.string()).optional(),
});

export type VenueCreation = z.infer<typeof VenueCreationSchema>;

// Pagination validation
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(SQUASHHUB_CONSTANTS.MAX_PAGE_SIZE).default(SQUASHHUB_CONSTANTS.DEFAULT_PAGE_SIZE),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Search validation
export const SearchSchema = z.object({
  query: z.string().min(1).max(200),
  type: z.enum(['PLAYERS', 'GROUPS', 'VENUES', 'MATCHES']),
  limit: z.number().int().min(1).max(50).default(20),
});

export type Search = z.infer<typeof SearchSchema>;
