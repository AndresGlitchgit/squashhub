'use client';

import { useState } from 'react';
import { Calendar, Users, MapPin, Trophy } from 'lucide-react';
import { formatDatePtBr, formatTime, getInitials } from '@/lib/utils';
import { PendingMatches } from '@/components/match/PendingMatches';
import type { PendingMatch } from '@/components/match/PendingMatches';

type TabType = 'upcoming' | 'history';

interface Booking {
  id: string;
  title: string;
  scheduled_at: string;
  max_players: number;
  venues?: {
    id: string;
    name: string;
    address?: string;
    city?: string;
  } | null;
  booking_rsvps?: Array<{
    player_id: string;
    status: string;
  }>;
}

interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string;
  played_at: string;
  player1_elo_before: number;
  player1_elo_after: number;
  player2_elo_before: number;
  player2_elo_after: number;
  status?: string;
  format: string;
  player1?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  player2?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  match_games?: Array<{
    game_number: number;
    player1_score: number;
    player2_score: number;
    winner_id: string;
  }>;
}

interface GamesClientProps {
  bookings: Booking[];
  matches: Match[];
  pendingMatches: PendingMatch[];
  userId: string;
}

export default function GamesClient({
  bookings,
  matches,
  pendingMatches,
  userId,
}: GamesClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="flex-1 overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-[#0c0c0c] border-b border-[#1f1f1f] px-4 py-5 z-10">
        <h1 className="text-2xl font-bold text-[#f0f0f0]">Jogos</h1>
      </div>

      {/* Pending matches section */}
      <PendingMatches
        key={refreshKey}
        matches={pendingMatches}
        userId={userId}
        onMatchUpdated={() => setRefreshKey((k) => k + 1)}
      />

      {/* Tab control */}
      <div className="flex gap-0.5 px-4 pt-4 border-b border-[#1f1f1f] bg-[#0c0c0c] sticky top-[73px] z-9">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition ${
            activeTab === 'upcoming'
              ? 'border-[#10B981] text-[#10B981]'
              : 'border-transparent text-[#999] hover:text-[#f0f0f0]'
          }`}
        >
          Próximos
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition ${
            activeTab === 'history'
              ? 'border-[#10B981] text-[#10B981]'
              : 'border-transparent text-[#999] hover:text-[#f0f0f0]'
          }`}
        >
          Histórico
        </button>
      </div>

      <div className="px-4 pt-4">
        {/* Upcoming bookings tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-3 pb-8">
            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#161616] flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-[#999]" />
                </div>
                <p className="text-[#f0f0f0] font-medium">Nenhuma reserva próxima</p>
                <p className="text-[#999] text-sm mt-1">Crie uma nova reserva para começar</p>
              </div>
            ) : (
              bookings.map((booking) => {
                const scheduledDate = new Date(booking.scheduled_at);
                const confirmCount = booking.booking_rsvps?.length || 0;

                return (
                  <div
                    key={booking.id}
                    className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#f0f0f0] mb-2">
                          {booking.title}
                        </h3>
                        <div className="space-y-1 text-sm text-[#999]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDatePtBr(scheduledDate, 'EEEE, dd MMM')} às {formatTime(scheduledDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{booking.venues?.name || 'Local não definido'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{confirmCount} de {booking.max_players} confirmados</span>
                          </div>
                        </div>
                      </div>
                      <button className="px-3 py-2 bg-[#10B981] text-[#0c0c0c] text-xs font-semibold rounded-md hover:bg-[#0f9e6d] transition whitespace-nowrap ml-2">
                        RSVP
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <div className="space-y-3 pb-8">
            {matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#161616] flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-[#999]" />
                </div>
                <p className="text-[#f0f0f0] font-medium">Nenhuma partida no histórico</p>
                <p className="text-[#999] text-sm mt-1">Registre sua primeira partida</p>
              </div>
            ) : (
              matches.map((match) => {
                // Determine opponent
                const isPlayer1 = match.player1_id === userId;
                const opponent = isPlayer1 ? match.player2 : match.player1;
                const opponentName = opponent?.display_name || 'Adversário';
                const opponentInitials = getInitials(opponentName);

                // Calculate score from match games
                const player1Wins = match.match_games?.filter(
                  (g) => g.winner_id === match.player1_id
                ).length || 0;
                const player2Wins = match.match_games?.filter(
                  (g) => g.winner_id === match.player2_id
                ).length || 0;

                const playerWins = isPlayer1 ? player1Wins : player2Wins;
                const opponentWins = isPlayer1 ? player2Wins : player1Wins;
                const score = `${playerWins}-${opponentWins}`;

                // Determine if win or loss
                const isWin = match.winner_id === userId;
                const playedDate = new Date(match.played_at);

                return (
                  <div
                    key={match.id}
                    className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-[#0c0c0c]">
                          {opponentInitials}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#f0f0f0] truncate">
                          {opponentName}
                        </p>
                        <p className="text-xs text-[#999]">
                          {formatDatePtBr(playedDate, 'dd MMM')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            isWin ? 'text-[#10B981]' : 'text-[#999]'
                          }`}
                        >
                          {score}
                        </p>
                        <p
                          className={`text-xs ${
                            isWin ? 'text-[#10B981]' : 'text-red-500'
                          }`}
                        >
                          {isWin ? 'V' : 'D'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </main>
  );
}
