'use client';

import { ClientRoom, Player } from '@/types/game';
import { useState } from 'react';

export default function PilihAtauMenyesal({ room, me }: { room: ClientRoom, me: Player, channelName: string }) {
  const [voted, setVoted] = useState<string | null>(null);

  const handleVote = async (choice: string) => {
    if (voted !== null) return;
    setVoted(choice);
    await fetch('/api/game/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: room.code, answer: choice })
    });
  };

  const options = room.minigameState?.options || ["Option 1", "Option 2"];

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center -mt-10">
      <div className="inline-block bg-game-purple text-white font-bold px-4 py-1 rounded-full mb-8 text-sm uppercase tracking-widest">
        Pilih Atau Menyesal
      </div>

      <h2 className="text-3xl md:text-4xl text-white font-bold text-center mb-12" style={{ fontFamily: 'var(--font-fredoka)' }}>
        {room.minigameState?.question}
      </h2>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        <button
          onClick={() => handleVote("0")}
          disabled={voted !== null}
          className={`flex-1 min-h-[200px] p-8 rounded-3xl border-4 text-2xl md:text-3xl font-bold transition-all
            ${voted === "0" ? 'bg-game-pink border-white scale-105 shadow-[0_0_30px_#FF2D78]' : voted !== null ? 'bg-game-surface border-game-surface opacity-50' : 'bg-game-surface border-game-pink hover:bg-game-pink hover:-translate-y-2'}
          `}
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          {options[0]}
        </button>

        <div className="flex items-center justify-center">
          <div className="bg-game-yellow text-game-bg text-2xl font-bold rounded-full w-16 h-16 flex items-center justify-center rotate-12 z-10">
            VS
          </div>
        </div>

        <button
          onClick={() => handleVote("1")}
          disabled={voted !== null}
          className={`flex-1 min-h-[200px] p-8 rounded-3xl border-4 text-2xl md:text-3xl font-bold transition-all
            ${voted === "1" ? 'bg-game-green text-game-bg border-white scale-105 shadow-[0_0_30px_#39FF14]' : voted !== null ? 'bg-game-surface border-game-surface opacity-50 text-white' : 'bg-game-surface text-white border-game-green hover:bg-game-green hover:text-game-bg hover:-translate-y-2'}
          `}
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          {options[1]}
        </button>
      </div>
      
      {voted !== null && (
        <div className="mt-12 text-xl text-gray-400 font-bold animate-pulse">
          Menunggu pemain lain...
        </div>
      )}
    </div>
  );
}
