'use client';

import { ClientRoom } from '@/types/game';
import { useEffect, useState } from 'react';
import { getPusherClient } from '@/lib/pusher-client';
import { EVENTS } from '@/lib/pusher-events';

export default function CountDownOverlay({ room }: { room: ClientRoom }) {
  const [time, setTime] = useState(3);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.channel(`presence-room-${room.code}`);
    
    channel?.bind(EVENTS.MINIGAME_TICK, (data: { time: number }) => {
      setTime(data.time);
    });

    return () => {
      channel?.unbind(EVENTS.MINIGAME_TICK);
    };
  }, [room.code]);

  const getName = () => {
    if (room.currentMiniGame === 'siapa-yang-paling') return 'Siapa Yang Paling...?';
    if (room.currentMiniGame === 'speed-typing') return 'Ketik Secepat Kilat!';
    if (room.currentMiniGame === 'would-you-rather') return 'Pilih atau Menyesal';
    return 'Mini Game';
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-game-bg/90 z-50 backdrop-blur-sm p-4">
      <h2 className="text-4xl md:text-6xl text-game-pink font-bold drop-shadow-lg text-center mb-12 animate-in slide-in-from-top-10" style={{ fontFamily: 'var(--font-fredoka)' }}>
        {getName()}
      </h2>
      <div 
        key={time} // force re-render for animation
        className="text-[12rem] leading-none text-game-yellow font-bold animate-in zoom-in duration-500"
        style={{ fontFamily: 'var(--font-fredoka)' }}
      >
        {time}
      </div>
      <div className="text-2xl mt-8 font-bold text-white uppercase tracking-widest text-center animate-pulse">
        Siap-siap bro...
      </div>
    </div>
  );
}
