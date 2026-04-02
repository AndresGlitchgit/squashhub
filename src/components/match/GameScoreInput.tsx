'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { MatchScoreSchema } from '@/lib/validators';

interface GameScoreInputProps {
  gameNumber: number;
  player1Name: string;
  player2Name: string;
  onScoresChange: (player1Score: number | null, player2Score: number | null, isValid: boolean) => void;
  initialPlayer1Score?: number;
  initialPlayer2Score?: number;
}

export function GameScoreInput({
  gameNumber,
  player1Name,
  player2Name,
  onScoresChange,
  initialPlayer1Score,
  initialPlayer2Score,
}: GameScoreInputProps) {
  const [player1Score, setPlayer1Score] = useState<string>(initialPlayer1Score?.toString() || '');
  const [player2Score, setPlayer2Score] = useState<string>(initialPlayer2Score?.toString() || '');
  const [error, setError] = useState<string>('');

  // Validate scores when they change
  useEffect(() => {
    if (!player1Score && !player2Score) {
      setError('');
      onScoresChange(null, null, false);
      return;
    }

    const p1 = player1Score ? parseInt(player1Score, 10) : null;
    const p2 = player2Score ? parseInt(player2Score, 10) : null;

    if (p1 === null || p2 === null) {
      setError('');
      onScoresChange(p1, p2, false);
      return;
    }

    // Use Zod validator
    const result = MatchScoreSchema.safeParse({
      player1Score: p1,
      player2Score: p2,
    });

    if (!result.success) {
      setError('Pontuação inválida para PAR-11');
      onScoresChange(p1, p2, false);
    } else {
      setError('');
      onScoresChange(p1, p2, true);
    }
  }, [player1Score, player2Score, onScoresChange]);

  const isValid = !error && player1Score && player2Score;
  const p1 = player1Score ? parseInt(player1Score, 10) : 0;
  const p2 = player2Score ? parseInt(player2Score, 10) : 0;

  return (
    <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <label className="text-xs font-semibold text-[#999] uppercase tracking-wider">
          Game {gameNumber}
        </label>
        {isValid && <Check className="w-4 h-4 text-[#10B981]" />}
        {error && <AlertCircle className="w-4 h-4 text-red-500" />}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-2">
        {/* Player 1 score input */}
        <div>
          <label className="block text-xs text-[#999] mb-2">{player1Name}</label>
          <input
            type="number"
            min="0"
            max="30"
            value={player1Score}
            onChange={(e) => setPlayer1Score(e.target.value)}
            className={`w-full bg-[#0c0c0c] border rounded-lg p-3 text-center text-2xl font-bold focus:outline-none transition ${
              player1Score && isValid && p1 > p2
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-[#1f1f1f] text-[#f0f0f0] focus:border-[#10B981]'
            }`}
            placeholder="0"
          />
        </div>

        {/* Player 2 score input */}
        <div>
          <label className="block text-xs text-[#999] mb-2">{player2Name}</label>
          <input
            type="number"
            min="0"
            max="30"
            value={player2Score}
            onChange={(e) => setPlayer2Score(e.target.value)}
            className={`w-full bg-[#0c0c0c] border rounded-lg p-3 text-center text-2xl font-bold focus:outline-none transition ${
              player2Score && isValid && p2 > p1
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-[#1f1f1f] text-[#f0f0f0] focus:border-[#10B981]'
            }`}
            placeholder="0"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2">
          {error}
        </p>
      )}

      {!error && player1Score && player2Score && (
        <p className="text-xs text-[#10B981] mt-2">
          ✓ Pontuação válida
        </p>
      )}
    </div>
  );
}
