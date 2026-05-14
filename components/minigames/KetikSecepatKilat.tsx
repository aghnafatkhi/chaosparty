'use client';

import { ClientRoom, Player } from '@/types/game';
import { useState, useEffect } from 'react';

export default function KetikSecepatKilat({ room, me }: { room: ClientRoom, me: Player, channelName: string }) {
  const [input, setInput] = useState('');
  const phrase = room.minigameState?.question || '';
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (input.toLowerCase().trim() === phrase.toLowerCase().trim() && !done) {
      setDone(true);
      fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: room.code, answer: Date.now() })
      });
    }
  }, [input, phrase, done, room.code]);

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center -mt-20">
      <div className="inline-block bg-game-pink text-white font-bold px-4 py-1 rounded-full mb-8 text-sm uppercase tracking-widest">
        Ketik Secepat Kilat!
      </div>
      
      <div className="text-3xl md:text-5xl text-game-yellow font-bold text-center mb-12 select-none" style={{ fontFamily: 'var(--font-fredoka)' }}>
        "{phrase}"
      </div>

      <div className="w-full max-w-xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={done}
          placeholder="Ketik disini..."
          className="w-full bg-game-surface border-4 border-game-purple text-white text-2xl md:text-4xl p-6 rounded-2xl text-center focus:outline-none focus:border-game-green transition-colors font-bold disabled:opacity-50"
          autoFocus
          autoComplete="off"
        />
      </div>

      {done && (
        <div className="mt-8 text-2xl text-game-green font-bold animate-bounce" style={{ fontFamily: 'var(--font-fredoka)' }}>
          SELESAI! Tunggu yang lain...
        </div>
      )}
    </div>
  );
}
