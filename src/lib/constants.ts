/**
 * Application-wide constants
 */

export const SQUASHHUB_CONSTANTS = {
  // Elo rating
  DEFAULT_ELO: 1600,
  K_FACTOR: 32,
  MIN_ELO: 800,
  MAX_ELO: 3000,

  // Booking
  MAX_PLAYERS_PER_BOOKING: 4,
  MIN_PLAYERS_PER_BOOKING: 1,
  DEFAULT_BOOKING_DURATION: 60, // minutes
  MAX_BOOKING_DURATION: 180, // minutes

  // Match scoring (PAR-11 format)
  SQUASH_MIN_WINNING_SCORE: 11,
  SQUASH_DEUCE_THRESHOLD: 10,
  SQUASH_DEUCE_MARGIN: 2,

  // Game formats
  GAME_FORMATS: {
    SINGLE_GAME: 1,
    BEST_OF_3: 3,
    BEST_OF_5: 5,
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // UI
  TOAST_DURATION: 3000, // milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds

  // Session
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds

  // Storage
  MAX_AVATAR_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // Ranking
  TOP_PLAYERS_LIMIT: 10,
  RECENT_MATCHES_LIMIT: 5,

  // Validation
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  BIO_MAX_LENGTH: 500,
  GROUP_NAME_MAX_LENGTH: 100,
  GROUP_DESCRIPTION_MAX_LENGTH: 500,
} as const;

export const PLAYER_LEVELS = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'PROFESSIONAL',
] as const;

export const BOOKING_STATUSES = [
  'OPEN',
  'FULL',
  'CANCELLED',
  'COMPLETED',
] as const;

export const RSVP_STATUSES = [
  'ACCEPTED',
  'DECLINED',
  'TENTATIVE',
  'NO_RESPONSE',
] as const;

export const MATCH_FORMATS = ['SINGLES', 'DOUBLES'] as const;

export const MATCH_STATUSES = [
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export const TOURNAMENT_FORMATS = [
  'ROUND_ROBIN',
  'KNOCKOUT',
  'GROUP_STAGE',
] as const;

export const TOURNAMENT_STATUSES = [
  'REGISTRATION_OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export const GROUP_ROLES = ['OWNER', 'ADMIN', 'MODERATOR', 'MEMBER'] as const;

export const NOTIFICATION_TYPES = [
  'BOOKING_INVITATION',
  'BOOKING_CANCELLED',
  'MATCH_RESULT',
  'TOURNAMENT_INVITE',
  'TOURNAMENT_STARTED',
  'ELO_UPDATE',
  'NEW_FOLLOWER',
] as const;

export const RECURRENCE_TYPES = ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'] as const;

export const ELO_CHANGE_REASONS = ['WIN', 'LOSS', 'ADJUSTMENT'] as const;
