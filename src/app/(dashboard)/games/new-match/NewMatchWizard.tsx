'use client';

import { useState } from 'react';
import { ChevronLeft, Search, Trophy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GameScoreInput } from '@/components/match/GameScoreInput';
import { formatDatePtBr, getInitials } from '@/lib/utils';

// SimpleMember type
interface SimpleMember {
  id: string;
  display_name: string;
  avatar_url: string | null;
  elo_rating: number;
  level: string;
}

interface NewMatchWizardProps {
  members: SimpleMember[];
  userId: string;
  groupId: string;
  userName: string;
}

type GameFormat = 'Jogo Único' | 'Melhor de 3' | 'Melhor de 5';
type GameFormatDb = 'jogo_unico' | 'melhor_de_3' | 'melhor_de_5';

interface GameScore {
  player1Score: number | null;
  player2Score: number | null;
  isValid: boolean;
}

export function NewMatchWizard({
  members,
  userId,
  groupId,
  userName,
}: NewMatchWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedOpponent, setSelectedOpponent] = useState<SimpleMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFormat, setGameFormat] = useState<GameFormat>('Melhor de 3');
  const [gameScores, setGameScores] = useState<GameScore[]>([
    { player1Score: null, player2Score: null, isValid: false },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gamesNeeded = gameFormat === 'Jogo Único' ? 1 : gameFormat === 'Melhor de 3' ? 3 : 5;

  // Filter members by search
  const filteredMembers = members.filter((member) => {
    const name = member.display_name.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  // Handle game scores update
  const handleGameScoreChange = (
    index: number,
    player1Score: number | null,
    player2Score: number | null,
    isValid: boolean,
  ) => {
    const newScores = [...gameScores];
    newScores[index] = { player1Score, player2Score, isValid };
    setGameScores(newScores);
  };

  // Add new game input
  const handleAddGame = () => {
    if (gameScores.length < gamesNeeded) {
      setGameScores([
        ...gameScores,
        { player1Score: null, player2Score: null, isValid: false },
      ]);
    }
  };

  // Determine match winner
  const calculateWinner = () => {
    let player1Wins = 0;
    let player2Wins = 0;

    gameScores.forEach((score) => {
      if (score.player1Score !== null && score.player2Score !== null) {
        if (score.player1Score > score.player2Score) {
          player1Wins++;
        } else if (score.player2Score > score.player1Score) {
          player2Wins++;
        }
      }
    });

    const gamesRequired = Math.ceil(gamesNeeded / 2);
    if (player1Wins >= gamesRequired) return 'player1';
    if (player2Wins >= gamesRequired) return 'player2';
    return null;
  };

  const matchWinner = calculateWinner();
  const allScoresValid = gameScores.every((score) => score.isValid);
  const canSubmit = allScoresValid && matchWinner !== null;

  // Map format to DB enum
  const getFormatDbValue = (format: GameFormat): GameFormatDb => {
    if (format === 'Jogo Único') return 'jogo_unico';
    if (format === 'Melhor de 3') return 'melhor_de_3';
    return 'melhor_de_5';
  };

  const handleSubmit = async () => {
    if (!selectedOpponent || !canSubmit) return;

    setIsSubmitting(true);
    try {
      const matchWinnerType = matchWinner as 'player1' | 'player2';
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: groupId,
          player1_id: userId,
          player2_id: selectedOpponent.id,
          winner_id: matchWinnerType === 'player1' ? userId : selectedOpponent.id,
          format: getFormatDbValue(gameFormat),
          games: gameScores.map((s, i) => ({
            game_number: i + 1,
            player1_score: s.player1Score,
            player2_score: s.player2Score,
            winner_id:
              s.player1Score !== null && s.player2Score !== null
                ? s.player1Score > s.player2Score
                  ? userId
                  : selectedOpponent.id
                : null,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Erro ao registrar partida: ${error.error || 'Erro desconhecido'}`);
        setIsSubmitting(false);
        return;
      }

      alert('Partida registrada com sucesso!');
      router.push('/games');
    } catch (error) {
      console.error('Error submitting match:', error);
      alert('Erro ao registrar partida');
      setIsSubmitting(false);
    }
  };

  // Step 1: Select opponent
  if (step === 1) {
    return (
      <main className="flex-1 flex flex-col h-screen bg-[#0c0c0c]">
        {/* Header */}
        <div className="sticky top-0 bg-[#0c0c0c] border-b border-[#1f1f1f] px-4 py-4 z-10">
          <button
            onClick={() => router.push('/games')}
            className="flex items-center gap-2 text-[#f0f0f0] hover:text-[#999] transition mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Registrar Partida</h1>
          <p className="text-xs text-[#999] mt-2">Passo 1 de 4: Escolha o adversário</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
          {/* Search input */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#999]" />
            <input
              type="text"
              placeholder="Buscar jogador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-[#1f1f1f] rounded-lg pl-10 pr-4 py-3 text-[#f0f0f0] placeholder-[#999] focus:outline-none focus:border-[#10B981] transition"
            />
          </div>

          {/* Members list */}
          <div className="space-y-2">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#999]">Nenhum jogador encontrado</p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    setSelectedOpponent(member);
                    setStep(2);
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border transition ${
                    selectedOpponent?.id === member.id
                      ? 'bg-[#161616] border-[#10B981]'
                      : 'bg-[#161616] border-[#1f1f1f] hover:border-[#10B981]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-[#0c0c0c]">
                      {getInitials(member.display_name)}
                    </span>
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#f0f0f0]">{member.display_name}</p>
                    <p className="text-xs text-[#999]">
                      Rating: {member.elo_rating} • {member.level}
                    </p>
                  </div>
                  {selectedOpponent?.id === member.id && (
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Next button */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c] border-t border-[#1f1f1f] p-4">
          <button
            onClick={() => setStep(2)}
            disabled={!selectedOpponent}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              selectedOpponent
                ? 'bg-[#10B981] text-[#0c0c0c] hover:bg-[#0f9e6d]'
                : 'bg-[#1f1f1f] text-[#999] cursor-not-allowed'
            }`}
          >
            Continuar
          </button>
        </div>
      </main>
    );
  }

  // Step 2: Select format
  if (step === 2) {
    return (
      <main className="flex-1 flex flex-col h-screen bg-[#0c0c0c]">
        {/* Header */}
        <div className="sticky top-0 bg-[#0c0c0c] border-b border-[#1f1f1f] px-4 py-4 z-10">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-[#f0f0f0] hover:text-[#999] transition mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Registrar Partida</h1>
          <p className="text-xs text-[#999] mt-2">Passo 2 de 4: Escolha o formato</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-20">
          {/* Opponent summary */}
          <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-4 mb-6">
            <p className="text-xs text-[#999] mb-2">Adversário</p>
            <p className="text-lg font-semibold text-[#f0f0f0]">{selectedOpponent?.display_name}</p>
          </div>

          {/* Format options */}
          <div className="space-y-3">
            {(
              [
                {
                  id: 'Jogo Único' as GameFormat,
                  label: 'Jogo Único',
                  description: 'Um jogo decisivo',
                },
                {
                  id: 'Melhor de 3' as GameFormat,
                  label: 'Melhor de 3',
                  description: 'Até 3 games',
                },
                {
                  id: 'Melhor de 5' as GameFormat,
                  label: 'Melhor de 5',
                  description: 'Até 5 games',
                },
              ] as const
            ).map((format) => (
              <button
                key={format.id}
                onClick={() => {
                  setGameFormat(format.id);
                  // Reset scores for new format
                  const maxGames = format.id === 'Jogo Único' ? 1 : format.id === 'Melhor de 3' ? 3 : 5;
                  setGameScores(
                    Array.from({ length: maxGames }, () => ({
                      player1Score: null,
                      player2Score: null,
                      isValid: false,
                    })),
                  );
                }}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  gameFormat === format.id
                    ? 'border-[#10B981] bg-[#161616]'
                    : 'border-[#1f1f1f] bg-[#161616] hover:border-[#10B981]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#f0f0f0]">{format.label}</p>
                    <p className="text-sm text-[#999]">{format.description}</p>
                  </div>
                  {gameFormat === format.id && (
                    <Check className="w-5 h-5 text-[#10B981]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Next button */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c] border-t border-[#1f1f1f] p-4">
          <button
            onClick={() => setStep(3)}
            className="w-full py-3 rounded-lg font-semibold bg-[#10B981] text-[#0c0c0c] hover:bg-[#0f9e6d] transition"
          >
            Continuar
          </button>
        </div>
      </main>
    );
  }

  // Step 3: Enter scores
  if (step === 3) {
    return (
      <main className="flex-1 flex flex-col h-screen bg-[#0c0c0c]">
        {/* Header */}
        <div className="sticky top-0 bg-[#0c0c0c] border-b border-[#1f1f1f] px-4 py-4 z-10">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 text-[#f0f0f0] hover:text-[#999] transition mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Registrar Partida</h1>
          <p className="text-xs text-[#999] mt-2">Passo 3 de 4: Registre os placar</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24">
          {/* Match info */}
          <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-[#999] mb-1">Você</p>
                <p className="font-semibold text-[#f0f0f0]">{userName}</p>
              </div>
              <div className="px-4 text-center">
                <p className="text-xs text-[#999] mb-1">Formato</p>
                <p className="font-semibold text-[#10B981]">
                  {gameFormat === 'Jogo Único' ? '1 Game' : gameFormat === 'Melhor de 3' ? 'MO3' : 'MO5'}
                </p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm text-[#999] mb-1">Adversário</p>
                <p className="font-semibold text-[#f0f0f0]">{selectedOpponent?.display_name}</p>
              </div>
            </div>
          </div>

          {/* Game score inputs */}
          <div className="space-y-4 mb-4">
            {gameScores.map((score, index) => (
              <GameScoreInput
                key={index}
                gameNumber={index + 1}
                player1Name={userName}
                player2Name={selectedOpponent?.display_name || 'Adversário'}
                initialPlayer1Score={score.player1Score || undefined}
                initialPlayer2Score={score.player2Score || undefined}
                onScoresChange={(p1, p2, isValid) =>
                  handleGameScoreChange(index, p1, p2, isValid)
                }
              />
            ))}
          </div>

          {/* Add game button */}
          {gameScores.length < gamesNeeded && (
            <button
              onClick={handleAddGame}
              className="w-full py-3 px-4 border-2 border-dashed border-[#1f1f1f] rounded-lg text-[#999] hover:border-[#10B981] hover:text-[#10B981] transition font-medium"
            >
              + Adicionar Game
            </button>
          )}

          {/* Winner indicator */}
          {matchWinner && (
            <div className="mt-6 bg-[#10B981] bg-opacity-10 border border-[#10B981] rounded-lg p-4">
              <p className="text-sm text-[#10B981] font-semibold">
                {matchWinner === 'player1' ? `✓ ${userName} vencerá esta partida` : `✓ ${selectedOpponent?.display_name} vencerá esta partida`}
              </p>
            </div>
          )}
        </div>

        {/* Next button */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c] border-t border-[#1f1f1f] p-4">
          <button
            onClick={() => setStep(4)}
            disabled={!canSubmit}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              canSubmit
                ? 'bg-[#10B981] text-[#0c0c0c] hover:bg-[#0f9e6d]'
                : 'bg-[#1f1f1f] text-[#999] cursor-not-allowed'
            }`}
          >
            Continuar
          </button>
        </div>
      </main>
    );
  }

  // Step 4: Review
  if (step === 4) {
    return (
      <main className="flex-1 flex flex-col h-screen bg-[#0c0c0c]">
        {/* Header */}
        <div className="sticky top-0 bg-[#0c0c0c] border-b border-[#1f1f1f] px-4 py-4 z-10">
          <button
            onClick={() => setStep(3)}
            className="flex items-center gap-2 text-[#f0f0f0] hover:text-[#999] transition mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Registrar Partida</h1>
          <p className="text-xs text-[#999] mt-2">Passo 4 de 4: Confirme os dados</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24">
          {/* Match summary */}
          <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <p className="text-sm text-[#999] mb-2">{userName}</p>
                <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-semibold text-[#0c0c0c]">
                    {getInitials(userName)}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold text-[#f0f0f0]">
                  {gameScores.filter((s) => s.player1Score !== null && s.player1Score > s.player2Score!).length}
                </p>
                <p className="text-xs text-[#999] mt-1">
                  {gameFormat === 'Jogo Único' ? 'Vitória' : 'Games'}
                </p>
              </div>

              <div className="text-center flex-1">
                <p className="text-sm text-[#999] mb-2">{selectedOpponent?.display_name}</p>
                <div className="w-12 h-12 rounded-full bg-[#FBBF24] flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-semibold text-[#0c0c0c]">
                    {getInitials(selectedOpponent?.display_name || '')}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {gameScores.map((score, index) => (
                <div key={index} className="flex items-center justify-center gap-4 text-sm">
                  <span className="text-[#f0f0f0] font-semibold">{score.player1Score}</span>
                  <span className="text-[#999]">Game {index + 1}</span>
                  <span className="text-[#f0f0f0] font-semibold">{score.player2Score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Match info */}
          <div className="space-y-3">
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-xs text-[#999] mb-1">Formato</p>
              <p className="text-sm font-semibold text-[#f0f0f0]">{gameFormat}</p>
            </div>
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-xs text-[#999] mb-1">Data</p>
              <p className="text-sm font-semibold text-[#f0f0f0]">{formatDatePtBr(new Date(), 'PPP')}</p>
            </div>
          </div>

          {/* Winner badge */}
          <div className="mt-6 bg-[#10B981] bg-opacity-10 border border-[#10B981] rounded-lg p-4 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-[#10B981]" />
            <div>
              <p className="text-sm font-semibold text-[#10B981]">
                {matchWinner === 'player1' ? 'Você venceu!' : 'Derrota registrada'}
              </p>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c] border-t border-[#1f1f1f] p-4 space-y-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              isSubmitting
                ? 'bg-[#666] text-[#999] cursor-not-allowed'
                : 'bg-[#10B981] text-[#0c0c0c] hover:bg-[#0f9e6d]'
            }`}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Partida'}
          </button>
          <button
            onClick={() => setStep(3)}
            className="w-full py-3 rounded-lg font-semibold bg-[#1f1f1f] text-[#f0f0f0] hover:bg-[#2a2a2a] transition"
          >
            Editar
          </button>
        </div>
      </main>
    );
  }

  return null;
}
