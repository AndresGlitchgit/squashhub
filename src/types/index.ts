/**
 * TypeScript type definitions for the application
 */

// Player types
export interface Player {
  id: string;
  userId: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  bio: string | null;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
  currentElo: number;
  wins: number;
  losses: number;
  matches: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PlayerProfile = Omit<Player, 'id' | 'userId' | 'email' | 'createdAt' | 'updatedAt'>;

// Group types
export interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  privacy: string; // PUBLIC, PRIVATE
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  groupId: string;
  playerId: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: Date;
  updatedAt: Date;
  player?: Player;
  group?: Group;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
  memberCount: number;
}

// Venue types
export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phoneNumber: string | null;
  website: string | null;
  courts: number;
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Booking types
export interface Booking {
  id: string;
  groupId: string | null;
  venueId: string;
  title: string;
  description: string | null;
  date: Date;
  time: Date;
  duration: number;
  maxPlayers: number;
  status: 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';
  recurrence: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceEndDate: Date | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
  venue?: Venue;
  group?: Group | null;
  rsvps?: BookingRSVP[];
}

export interface BookingWithDetails extends Booking {
  venue: Venue;
  rsvps: BookingRSVPWithPlayer[];
  acceptedCount: number;
  spotsAvailable: number;
}

// RSVP types
export interface BookingRSVP {
  id: string;
  bookingId: string;
  playerId: string;
  status: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'NO_RESPONSE';
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingRSVPWithPlayer extends BookingRSVP {
  player: Player;
}

// Match types
export interface Match {
  id: string;
  bookingId: string | null;
  groupId: string | null;
  venueId: string;
  format: 'SINGLES' | 'DOUBLES';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  player1Id: string;
  player2Id: string | null;
  player3Id: string | null;
  player4Id: string | null;
  createdAt: Date;
  updatedAt: Date;
  player1?: Player;
  player2?: Player | null;
  player3?: Player | null;
  player4?: Player | null;
  games?: MatchGame[];
}

export interface MatchWithDetails extends Match {
  player1: Player;
  player2: Player | null;
  player3: Player | null;
  player4: Player | null;
  games: MatchGame[];
  venue: Venue;
}

// Match game types
export interface MatchGame {
  id: string;
  matchId: string;
  gameNumber: number;
  player1Score: number;
  player2Score: number | null;
  player3Score: number | null;
  player4Score: number | null;
  winnerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Tournament types
export interface Tournament {
  id: string;
  groupId: string;
  name: string;
  description: string | null;
  format: 'ROUND_ROBIN' | 'KNOCKOUT' | 'GROUP_STAGE';
  status: 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: Date;
  endDate: Date | null;
  maxParticipants: number;
  entryFee: number;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
  group?: Group;
  participants?: TournamentParticipant[];
}

export interface TournamentWithParticipants extends Tournament {
  participants: TournamentParticipantWithPlayer[];
  participantCount: number;
}

// Tournament participant types
export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  playerId: string;
  position: number | null;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentParticipantWithPlayer extends TournamentParticipant {
  player: Player;
}

// ELO history types
export interface EloHistory {
  id: string;
  playerId: string;
  matchId: string | null;
  oldRating: number;
  newRating: number;
  change: number;
  reason: 'WIN' | 'LOSS' | 'ADJUSTMENT';
  createdAt: Date;
}

// Notification types
export interface Notification {
  id: string;
  playerId: string;
  type: string;
  title: string;
  message: string;
  relatedId: string | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and sort types
export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface BookingFilter extends FilterOptions {
  venueId?: string;
  groupId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface MatchFilter extends FilterOptions {
  groupId?: string;
  venueId?: string;
  status?: string;
  format?: string;
  playerId?: string;
}

// User session type
export interface UserSession {
  user: Player;
  isAuthenticated: boolean;
}
