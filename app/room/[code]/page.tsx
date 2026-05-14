'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getPusherClient } from '@/lib/pusher-client';
import { EVENTS } from '@/lib/pusher-events';
import { ClientRoom, Player } from '@/types/game';
import { Users, Play, Copy, Check, Info } from 'lucide-react';
import { AVATARS } from '@/lib/avatars';
import { cn } from '@/lib/utils';
import GameRunner from '@/components/game/GameRunner'; // we will build this

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const roomCode = unwrappedParams.code.toUpperCase();
  const [room, setRoom] = useState<ClientRoom | null>(null);
  const [me, setMe] = useState<Player | null>(null);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // We need to fetch initial room state first to know if we are in it
    // Wait, let's just connect to Pusher, and auth will fail if we don't have session.
    const pusher = getPusherClient();
    const channelName = `presence-room-${roomCode}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      setIsConnected(true);
      // Fetch initial full room state from our API to be sure
      fetch(`/api/room/state?code=${roomCode}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
              router.push('/');
              return;
            }
            setRoom(data.room);
            const myPlayer = data.room.players[members.myID];
            setMe(myPlayer);
        });
    });

    channel.bind('pusher:subscription_error', () => {
      router.push('/');
    });

    channel.bind(EVENTS.ROOM_STATE_UPDATE, (updatedRoom: ClientRoom) => {
      setRoom(updatedRoom);
    });

    channel.bind(EVENTS.GAME_STARTED, () => {
      // Handled by room state update usually, but can be a distinct event
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [roomCode, router]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startGame = async () => {
    // Only host can start
    if (!me?.isHost) return;
    
    await fetch('/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: roomCode })
    });
  };

  if (!isConnected || !room || !me) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-game-yellow text-2xl font-bold animate-pulse" style={{ fontFamily: 'var(--font-fredoka)' }}>
          Loading Room...
        </div>
      </div>
    );
  }

  // If game is not in lobby, show the GameRunner
  if (room.gameState !== 'lobby') {
    return <GameRunner room={room} me={me} channelName={`presence-room-${roomCode}`} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-game-surface border-4 border-game-purple rounded-3xl p-6 shadow-[8px_8px_0_0_#9B5DE5]">
          <div className="text-center md:text-left">
            <h2 className="text-3xl text-game-pink font-bold drop-shadow-md" style={{ fontFamily: 'var(--font-fredoka)' }}>ROOM LOBBY</h2>
            <p className="text-gray-300 font-bold mt-1">Tunggu teman-temanmu join!</p>
          </div>

          <button 
            onClick={copyCode}
            className="flex items-center gap-3 bg-game-bg border-2 border-game-yellow px-6 py-4 rounded-xl hover:bg-game-yellow/10 transition-colors group"
          >
            <div className="text-center">
              <div className="text-xs text-game-yellow font-bold uppercase tracking-wider">KODE ROOM</div>
              <div className="text-3xl text-white font-bold tracking-widest">{roomCode}</div>
            </div>
            {copied ? <Check className="text-game-green" size={28} /> : <Copy className="text-game-yellow group-hover:scale-110 transition-transform" size={28} />}
          </button>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.values(room.players).map((player) => {
            const avatarInfo = AVATARS.find(a => a.id === player.avatar) || AVATARS[0];
            const isMe = player.id === me.id;
            
            return (
              <div 
                key={player.id} 
                className={cn(
                  "relative bg-game-surface border-4 rounded-2xl p-4 flex flex-col items-center gap-3 animate-in zoom-in duration-300",
                  player.isHost ? "border-game-yellow" : "border-game-purple/50",
                  isMe && "ring-4 ring-white/20"
                )}
              >
                {player.isHost && (
                  <div className="absolute -top-3 -right-3 bg-game-yellow text-game-bg text-xs font-bold px-2 py-1 rounded-lg rotate-12">
                     HOST
                  </div>
                )}
                
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner",
                  avatarInfo.color
                )}>
                  {avatarInfo.emoji}
                </div>
                
                <div className="text-center w-full">
                  <div className="font-bold text-lg truncate px-2">{player.name}</div>
                  {isMe && <div className="text-xs text-game-pink font-bold">IT'S YOU</div>}
                </div>
              </div>
            );
          })}
          
          {/* Empty slots placeholders (optional) */}
          {Array.from({ length: Math.max(0, 8 - Object.keys(room.players).length) }).map((_, i) => (
             <div 
               key={`empty-${i}`} 
               className="border-4 border-dashed border-game-purple/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 opacity-50"
             >
               <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-game-bg">
                 <Users className="text-game-purple/30" size={32} />
               </div>
               <div className="font-bold text-gray-500">Waiting...</div>
             </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center mt-4">
          {me.isHost ? (
            <button
              onClick={startGame}
              disabled={Object.keys(room.players).length < 2}
              className="bg-game-green hover:bg-green-400 disabled:bg-gray-600 disabled:text-gray-400 disabled:shadow-none text-game-bg font-bold text-2xl py-6 px-12 rounded-3xl shadow-[0_8px_0_0_#22990C] active:shadow-[0_0px_0_0_#22990C] active:translate-y-[8px] transition-all flex items-center gap-3"
              style={{ fontFamily: 'var(--font-fredoka)' }}
            >
              <Play size={32} fill="currentColor" />
              MULAI GAME!
            </button>
          ) : (
            <div className="bg-game-surface border-4 border-game-purple/30 text-gray-300 font-bold text-xl py-6 px-12 rounded-3xl flex items-center gap-3">
              <Info className="text-game-pink animate-pulse" />
              Nunggu Host Mulai Game...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
