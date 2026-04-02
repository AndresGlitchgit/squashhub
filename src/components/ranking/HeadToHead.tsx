'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import type { RankPlayer } from './PlayerRankCard';

interface HeadToHeadProps {
  players: RankPlayer[];
}

export function HeadToHead({ players }: HeadToHeadProps) {
  const [selectedPlayer1, setSelectedPlayer1] = useState<RankPlayer | null>(players[0] || null);
  const [selectedPlayer2, setSelectedPlayer2] = useState<RankPlayer | null>(players[1] || null);
  const [showPlayer1Dropdown, setShowPlayer1Dropdown] = useState(false);
  const [showPlayer2Dropdown, setShowPlayer2Dropdown] = useState(false);

  const PlayerSelector = ({
    player,
    onSelect,
    showDropdown,
    setShowDropdown,
    label,
  }: {
    player: RankPlayer | null;
    onSelect: (p: RankPlayer) => void;
    showDropdown: boolean;
    setShowDropdown: (show: boolean) => void;
    label: string;
  }) => (
    <div className="relative flex-1">
      <label className="text-xs text-[#9CA3AF] mb-2 block">{label}</label>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#161616] border border-[#1f1f1f] hover:border-[#10B981]/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {player ? (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {player.avatar_url ? (
                  <Image
                    src={player.avatar_url}
                    alt={player.display_name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {player.display_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-[#f0f0f0] truncate">
                {player.display_name}
              </span>
            </>
          ) : (
            <span className="text-sm text-[#9CA3AF]">Selecione</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#9CA3AF] flex-shrink-0 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
        />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#161616] border border-[#1f1f1f] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onSelect(p);
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#1f1f1f] transition-colors border-b border-[#0c0c0c] last:border-b-0"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {p.avatar_url ? (
                  <Image src={p.avatar_url} alt={p.display_name} width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white">{p.display_name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#f0f0f0]">{p.display_name}</p>
                <p className="text-xs text-[#9CA3AF]">{p.elo_rating} ELO</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <PlayerSelector
          player={selectedPlayer1}
          onSelect={setSelectedPlayer1}
          showDropdown={showPlayer1Dropdown}
          setShowDropdown={setShowPlayer1Dropdown}
          label="Jogador 1"
        />
        <PlayerSelector
          player={selectedPlayer2}
          onSelect={setSelectedPlayer2}
          showDropdown={showPlayer2Dropdown}
          setShowDropdown={setShowPlayer2Dropdown}
          label="Jogador 2"
        />
      </div>

      {selectedPlayer1 && selectedPlayer2 ? (
        <div className="bg-gradient-to-r from-[#161616] to-[#0c0c0c] rounded-lg p-6 border border-[#1f1f1f]">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto mb-3 overflow-hidden flex items-center justify-center">
                {selectedPlayer1.avatar_url ? (
                  <Image src={selectedPlayer1.avatar_url} alt={selectedPlayer1.display_name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">{selectedPlayer1.display_name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <p className="font-semibold text-[#f0f0f0] text-sm">{selectedPlayer1.display_name}</p>
              <p className="text-sm text-[#10B981] mt-1">{selectedPlayer1.elo_rating} ELO</p>
            </div>

            <div className="flex flex-col items-center gap-2 px-4">
              <div className="text-xl font-bold text-[#FBBF24]">VS</div>
            </div>

            <div className="flex-1 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto mb-3 overflow-hidden flex items-center justify-center">
                {selectedPlayer2.avatar_url ? (
                  <Image src={selectedPlayer2.avatar_url} alt={selectedPlayer2.display_name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">{selectedPlayer2.display_name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <p className="font-semibold text-[#f0f0f0] text-sm">{selectedPlayer2.display_name}</p>
              <p className="text-sm text-[#10B981] mt-1">{selectedPlayer2.elo_rating} ELO</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-[#161616] rounded-lg border border-[#1f1f1f]">
          <p className="text-[#9CA3AF] text-sm">Selecione dois jogadores para comparar</p>
        </div>
      )}
    </div>
  );
}
