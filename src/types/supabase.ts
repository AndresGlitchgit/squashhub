/**
 * Auto-generated Supabase types
 * This file contains the TypeScript definitions for your Supabase database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
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
          createdAt: string;
          updatedAt: string;
          phone: string | null;
          whatsapp_opt_in: boolean;
          push_notifications: boolean;
          email_notifications: boolean;
          booking_reminders: boolean;
          match_confirmations: boolean;
          ranking_updates: boolean;
          tournament_updates: boolean;
        };
        Insert: {
          id?: string;
          userId: string;
          email: string;
          username: string;
          firstName?: string | null;
          lastName?: string | null;
          avatar?: string | null;
          bio?: string | null;
          level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
          currentElo?: number;
          wins?: number;
          losses?: number;
          matches?: number;
          createdAt?: string;
          updatedAt?: string;
          phone?: string | null;
          whatsapp_opt_in?: boolean;
          push_notifications?: boolean;
          email_notifications?: boolean;
          booking_reminders?: boolean;
          match_confirmations?: boolean;
          ranking_updates?: boolean;
          tournament_updates?: boolean;
        };
        Update: {
          id?: string;
          userId?: string;
          email?: string;
          username?: string;
          firstName?: string | null;
          lastName?: string | null;
          avatar?: string | null;
          bio?: string | null;
          level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
          currentElo?: number;
          wins?: number;
          losses?: number;
          matches?: number;
          createdAt?: string;
          updatedAt?: string;
          phone?: string | null;
          whatsapp_opt_in?: boolean;
          push_notifications?: boolean;
          email_notifications?: boolean;
          booking_reminders?: boolean;
          match_confirmations?: boolean;
          ranking_updates?: boolean;
          tournament_updates?: boolean;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          avatar: string | null;
          privacy: string;
          maxMembers: number;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          avatar?: string | null;
          privacy?: string;
          maxMembers?: number;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          avatar?: string | null;
          privacy?: string;
          maxMembers?: number;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          groupId: string;
          playerId: string;
          role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
          joinedAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          groupId: string;
          playerId: string;
          role?: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
          joinedAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          groupId?: string;
          playerId?: string;
          role?: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
          joinedAt?: string;
          updatedAt?: string;
        };
      };
      venues: {
        Row: {
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
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
          latitude?: number | null;
          longitude?: number | null;
          phoneNumber?: string | null;
          website?: string | null;
          courts?: number;
          amenities?: string[];
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string;
          state?: string;
          postalCode?: string;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          phoneNumber?: string | null;
          website?: string | null;
          courts?: number;
          amenities?: string[];
          createdAt?: string;
          updatedAt?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          groupId: string | null;
          venueId: string;
          title: string;
          description: string | null;
          date: string;
          time: string;
          duration: number;
          maxPlayers: number;
          status: 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';
          recurrence: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
          recurrenceEndDate: string | null;
          createdByUserId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          groupId?: string | null;
          venueId: string;
          title: string;
          description?: string | null;
          date: string;
          time: string;
          duration?: number;
          maxPlayers?: number;
          status?: 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';
          recurrence?: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
          recurrenceEndDate?: string | null;
          createdByUserId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          groupId?: string | null;
          venueId?: string;
          title?: string;
          description?: string | null;
          date?: string;
          time?: string;
          duration?: number;
          maxPlayers?: number;
          status?: 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';
          recurrence?: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
          recurrenceEndDate?: string | null;
          createdByUserId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      booking_rsvps: {
        Row: {
          id: string;
          bookingId: string;
          playerId: string;
          status: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'NO_RESPONSE';
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          bookingId: string;
          playerId: string;
          status?: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'NO_RESPONSE';
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          bookingId?: string;
          playerId?: string;
          status?: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'NO_RESPONSE';
          createdAt?: string;
          updatedAt?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          bookingId: string | null;
          groupId: string | null;
          venueId: string;
          format: 'SINGLES' | 'DOUBLES';
          status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
          scheduledAt: string;
          startedAt: string | null;
          completedAt: string | null;
          player1Id: string;
          player2Id: string | null;
          player3Id: string | null;
          player4Id: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          bookingId?: string | null;
          groupId?: string | null;
          venueId: string;
          format: 'SINGLES' | 'DOUBLES';
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
          scheduledAt: string;
          startedAt?: string | null;
          completedAt?: string | null;
          player1Id: string;
          player2Id?: string | null;
          player3Id?: string | null;
          player4Id?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          bookingId?: string | null;
          groupId?: string | null;
          venueId?: string;
          format?: 'SINGLES' | 'DOUBLES';
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
          scheduledAt?: string;
          startedAt?: string | null;
          completedAt?: string | null;
          player1Id?: string;
          player2Id?: string | null;
          player3Id?: string | null;
          player4Id?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      match_games: {
        Row: {
          id: string;
          matchId: string;
          gameNumber: number;
          player1Score: number;
          player2Score: number | null;
          player3Score: number | null;
          player4Score: number | null;
          winnerId: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          matchId: string;
          gameNumber: number;
          player1Score: number;
          player2Score?: number | null;
          player3Score?: number | null;
          player4Score?: number | null;
          winnerId?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          matchId?: string;
          gameNumber?: number;
          player1Score?: number;
          player2Score?: number | null;
          player3Score?: number | null;
          player4Score?: number | null;
          winnerId?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      tournaments: {
        Row: {
          id: string;
          groupId: string;
          name: string;
          description: string | null;
          format: 'ROUND_ROBIN' | 'KNOCKOUT' | 'GROUP_STAGE';
          status: 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
          startDate: string;
          endDate: string | null;
          maxParticipants: number;
          entryFee: number;
          createdByUserId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          groupId: string;
          name: string;
          description?: string | null;
          format: 'ROUND_ROBIN' | 'KNOCKOUT' | 'GROUP_STAGE';
          status?: 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
          startDate: string;
          endDate?: string | null;
          maxParticipants: number;
          entryFee?: number;
          createdByUserId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          groupId?: string;
          name?: string;
          description?: string | null;
          format?: 'ROUND_ROBIN' | 'KNOCKOUT' | 'GROUP_STAGE';
          status?: 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
          startDate?: string;
          endDate?: string | null;
          maxParticipants?: number;
          entryFee?: number;
          createdByUserId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      tournament_participants: {
        Row: {
          id: string;
          tournamentId: string;
          playerId: string;
          position: number | null;
          points: number;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          tournamentId: string;
          playerId: string;
          position?: number | null;
          points?: number;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          tournamentId?: string;
          playerId?: string;
          position?: number | null;
          points?: number;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      elo_history: {
        Row: {
          id: string;
          playerId: string;
          matchId: string | null;
          oldRating: number;
          newRating: number;
          change: number;
          reason: 'WIN' | 'LOSS' | 'ADJUSTMENT';
          createdAt: string;
        };
        Insert: {
          id?: string;
          playerId: string;
          matchId?: string | null;
          oldRating: number;
          newRating: number;
          change: number;
          reason: 'WIN' | 'LOSS' | 'ADJUSTMENT';
          createdAt?: string;
        };
        Update: {
          id?: string;
          playerId?: string;
          matchId?: string | null;
          oldRating?: number;
          newRating?: number;
          change?: number;
          reason?: 'WIN' | 'LOSS' | 'ADJUSTMENT';
          createdAt?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          playerId: string;
          type: string;
          title: string;
          message: string;
          relatedId: string | null;
          read: boolean;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          playerId: string;
          type: string;
          title: string;
          message: string;
          relatedId?: string | null;
          read?: boolean;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          playerId?: string;
          type?: string;
          title?: string;
          message?: string;
          relatedId?: string | null;
          read?: boolean;
          createdAt?: string;
          updatedAt?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
