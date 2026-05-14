'use client';

import { useEffect, useState } from 'react';
import { getPusherClient } from '@/lib/pusher-client';
import { EVENTS } from '@/lib/pusher-events';

export default function TimerBar({ channelName, initialTime = 30 }: { channelName: string, initialTime?: number }) {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.channel(channelName);
    
    channel?.bind(EVENTS.MINIGAME_TICK, (data: { time: number }) => {
      setTime(data.time);
    });

    return () => {
      channel?.unbind(EVENTS.MINIGAME_TICK);
    };
  }, [channelName]);

  const percentage = (time / initialTime) * 100;
  
  return (
    <div className="w-full bg-game-surface h-4 fixed top-0 left-0 z-50">
      <div 
        className="h-full bg-game-yellow transition-all duration-1000 ease-linear"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
