'use client';

import { ClientRoom, Player } from '@/types/game';
import { useState, useEffect } from 'react';
import { AVATARS } from '@/lib/avatars';

export default function SiapaYangPaling({ room, me }: { room: ClientRoom, me: Player, channelName: string }) {
  const [voted, setVoted] = useState<string | null>(null);

  const handleVote = async (playerId: string) => {
    if (voted) return;
    setVoted(playerId);
    await fetch('/api/game/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: room.code, answer: playerId })
    });
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center pt-12 md:pt-20">
      
      <div className="text-center w-full max-w-3xl mb-8">
        <div className="inline-block bg-game-yellow text-game-bg font-bold px-4 py-1 rounded-full mb-4 text-sm uppercase tracking-widest">
          Siapa Yang Paling...?
        </div>
        <h2 className="text-3xl md:text-5xl text-white font-bold leading-tight" style={{ fontFamily: 'var(--font-fredoka)' }}>
          {room.minigameState?.question}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
        {Object.values(room.players).map(p => {
          if (p.id === me.id) return null; // Can't vote yourself
          
          const av = AVATARS.find(a => a.id === p.avatar) || AVATARS[0];
          const isVoted = voted === p.id;
          
          return (
            <button
              key={p.id}
              onClick={() => handleVote(p.id)}
              disabled={voted !== null}
              className={`relative bg-game-surface border-4 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${isVoted ? 'border-game-green scale-105 shadow-[0_0_20px_#39FF14]' : voted ? 'border-gray-700 opacity-50' : 'border-game-purple hover:border-game-pink hover:scale-105'}`}
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${av.color}`}>
                {av.emoji}
              </div>
              <div className="font-bold text-white text-lg">{p.name}</div>
              {isVoted && (
                <div className="absolute -top-3 right-0 bg-game-green text-game-bg font-bold px-2 py-1 rounded-lg text-xs">
                  VOTED!
                </div>
              )}
            </button>
          )
        })}
      </div>

    </div>
  );
}
