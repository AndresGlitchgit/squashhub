'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { formatDatePtBr, formatTime, getInitials } from '@/lib/utils';
import { Toast } from '@/components/ui/Toast';

export interface PendingMatch {
  id: string;
  player1_id: string;
  player2_id: string;
  format?: string;
  played_at: string;
  status?: string;
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
    winner_id?: string;
  }>;
}

interface PendingMatchesProps {
  matches: PendingMatch[];
  userId: string;
  onMatchUpdated?: () => void;
}

export function PendingMatches({
  matches,
  userId: _userId,
  onMatchUpdated,
}: PendingMatchesProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // All matches passed here are already filtered to be pending and where user is player2
  const pendingMatches = matches;

  const handleConfirm = async (matchId: string) => {
    setIsLoading(matchId);
    try {
      const response = await fetch('/api/matches/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: matchId, action: 'confirm' }),
      });

      if (!response.ok) {
        const error = await response.json();
        setToast({
          message: error.error || 'Erro ao confirmar partida',
          type: 'error',
        });
        return;
      }

      setToast({
        message: 'Partida confirmada com sucesso!',
        type: 'success',
      });

      onMatchUpdated?.();
    } catch (error) {
      setToast({
        message: 'Erro ao confirmar partida',
        type: 'error',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleReject = async (matchId: string) => {
    setIsLoading(matchId);
    try {
      const response = await fetch('/api/matches/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: matchId, action: 'reject' }),
      });

      if (!response.ok) {
        const error = await response.json();
        setToast({
          message: error.error || 'Erro ao rejeitar partida',
          type: 'error',
        });
        return;
      }

      setToast({
        message: 'Partida rejeitada',
        type: 'success',
      });

      onMatchUpdated?.();
    } catch (error) {
      setToast({
        message: 'Erro ao rejeitar partida',
        type: 'error',
      });
    } finally {
      setIsLoading(null);
    }
  };

  if (pendingMatches.length === 0) {
    return null;
  }

  return (
    <>
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-[#FBBF24]" />
          <h2 className="text-sm font-semibold text-[#f0f0f0]">
            Pendentes de Confirmação
          </h2>
          <span className="ml-auto text-xs font-medium text-[#FBBF24] bg-[#1f1f1f] px-2 py-1 rounded-full">
            {pendingMatches.length}
          </span>
        </div>

        <div className="space-y-3">
          {pendingMatches.map((match) => {
            const opponent = match.player1;
            const opponentName = opponent?.display_name || 'Adversário';
            const opponentInitials = getInitials(opponentName);
            const matchedDate = new Date(match.played_at);

            // Calculate score from match games
            const player1Wins = match.match_games?.filter(
              (g) => g.winner_id === match.player1_id
            ).length || 0;
            const player2Wins = match.match_games?.filter(
              (g) => g.winner_id === match.player2_id
            ).length || 0;

            return (
              <div
                key={match.id}
                className="bg-[#1a1a1a] border border-[#FBBF24]/30 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#FBBF24]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-[#FBBF24]">
                        {opponentInitials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#f0f0f0] truncate">
                        {opponentName}
                      </p>
                      <p className="text-xs text-[#999] mt-0.5">
                        {formatDatePtBr(matchedDate, 'dd MMM')} às{' '}
                        {formatTime(matchedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold text-[#FBBF24]">
                      {player1Wins}-{player2Wins}
                    </p>
                    <p className="text-xs text-[#999] mt-0.5">
                      {match.format === 'SINGLES' ? 'Simples' : 'Duplas'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleConfirm(match.id)}
                    disabled={isLoading === match.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#0f9e6d] disabled:bg-[#10B981] disabled:opacity-50 text-[#0c0c0c] text-xs font-semibold py-2 rounded-md transition"
                  >
                    {isLoading === match.id ? (
                      <svg
                        className="animate-spin h-3 w-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleReject(match.id)}
                    disabled={isLoading === match.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-red-600/20 disabled:opacity-50 border border-red-600 text-red-400 text-xs font-semibold py-2 rounded-md transition"
                  >
                    {isLoading === match.id ? (
                      <svg
                        className="animate-spin h-3 w-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    Rejeitar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </>
  );
}
