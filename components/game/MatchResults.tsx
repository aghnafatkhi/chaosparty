'use client';

import { ClientRoom, Player } from '@/types/game';
import { AVATARS } from '@/lib/avatars';

export default function MatchResults({ room, me }: { room: ClientRoom, me: Player }) {
  const players = Object.values(room.players).sort((a, b) => b.score - a.score);

  return (
    <div className="absolute inset-0 flex flex-col items-center p-4 bg-game-bg z-40 overflow-y-auto">
      <h2 className="text-4xl text-white font-bold my-8" style={{ fontFamily: 'var(--font-fredoka)' }}>
        <span className="text-game-green">HASIL </span>
        RONDE {room.round}
      </h2>

      {/* Specific Minigame Result Context could be here, but we will keep it simple and just show leaderboard */}

      <div className="w-full max-w-2xl space-y-4">
        {players.map((p, index) => {
          const av = AVATARS.find(a => a.id === p.avatar) || AVATARS[0];
          return (
            <div 
              key={p.id} 
              className={`flex items-center gap-4 bg-game-surface p-4 rounded-2xl border-4 ${p.id === me.id ? 'border-game-pink' : 'border-game-purple/50'} animate-in slide-in-from-bottom-${(index+1)*10} duration-500 delay-${index * 100}`}
            >
              <div className="text-2xl font-bold text-game-yellow w-8 text-center" style={{ fontFamily: 'var(--font-fredoka)' }}>
                #{index + 1}
              </div>
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${av.color}`}>
                {av.emoji}
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-white">{p.name}</div>
                {p.id === me.id && <div className="text-xs text-game-pink">IT'S YOU</div>}
              </div>
              <div className="text-3xl text-game-yellow font-bold" style={{ fontFamily: 'var(--font-fredoka)' }}>
                {p.score}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 text-xl font-bold text-gray-400 animate-pulse pb-8">
        Siap-siap next round...
      </div>
    </div>
  );
}
