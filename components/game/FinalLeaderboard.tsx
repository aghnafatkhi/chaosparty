'use client';

import { ClientRoom, Player } from '@/types/game';
import { AVATARS } from '@/lib/avatars';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

export default function FinalLeaderboard({ room, me }: { room: ClientRoom, me: Player }) {
  const router = useRouter();
  const players = Object.values(room.players).sort((a, b) => b.score - a.score);
  const winner = players[0];

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF2D78', '#FFE135', '#39FF14', '#9B5DE5']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF2D78', '#FFE135', '#39FF14', '#9B5DE5']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const backToLobby = () => {
    router.push('/');
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center bg-game-bg z-50 overflow-y-auto p-4 md:p-8">
      
      <h1 className="text-5xl md:text-7xl text-game-yellow font-bold mt-8 mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-in zoom-in" style={{ fontFamily: 'var(--font-fredoka)' }}>
        GAME OVER!
      </h1>

      <div className="flex flex-col items-center my-8 animate-in slide-in-from-bottom-10 fade-in duration-700">
        <div className="text-game-pink font-bold text-2xl uppercase mb-4 tracking-widest">👑 Sang Juara 👑</div>
        
        {winner && (
          <div className="bg-game-surface border-4 border-game-yellow rounded-3xl p-8 flex flex-col items-center shadow-[0_0_40px_rgba(255,225,53,0.5)]">
            <div className={`w-32 h-32 rounded-2xl flex items-center justify-center text-7xl ${AVATARS.find(a => a.id === winner.avatar)?.color || 'bg-gray-500'} animate-bounce`}>
              {AVATARS.find(a => a.id === winner.avatar)?.emoji}
            </div>
            <div className="text-4xl text-white font-bold mt-4" style={{ fontFamily: 'var(--font-fredoka)' }}>
              {winner.name}
            </div>
            <div className="text-2xl text-game-green font-bold mt-2">
              {winner.score} PTS
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-xl space-y-3 mb-8">
        {players.slice(1).map((p, index) => {
          const av = AVATARS.find(a => a.id === p.avatar) || AVATARS[0];
          return (
            <div key={p.id} className="flex items-center gap-4 bg-game-surface/50 border-2 border-game-purple/30 p-3 rounded-2xl">
              <div className="font-bold text-gray-400 w-6">#{index + 2}</div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${av.color}`}>
                {av.emoji}
              </div>
              <div className="flex-1 font-bold text-white text-lg">{p.name}</div>
              <div className="font-bold text-game-yellow">{p.score} pt</div>
            </div>
          );
        })}
      </div>

      <button 
        onClick={backToLobby}
        className="bg-game-pink hover:bg-pink-500 text-white font-bold text-2xl py-6 px-12 rounded-3xl shadow-[0_8px_0_0_#A0164B] active:translate-y-[8px] active:shadow-none transition-all"
        style={{ fontFamily: 'var(--font-fredoka)' }}
      >
        MAIN LAGI?
      </button>

    </div>
  );
}
