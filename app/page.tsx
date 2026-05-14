'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AVATARS } from '@/lib/avatars';
import { cn } from '@/lib/utils';
import { Users, PartyPopper } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0].id);
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!name.trim()) return setError('Isi namamu dulu bro!');
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/room/${data.roomCode}`);
    } catch (err: any) {
      setError(err.message || 'Gagal bikin room');
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Isi namamu dulu bro!');
    if (!roomCode.trim()) return setError('Isi kode room dulu!');
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode, name, avatar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/room/${data.roomCode}`);
    } catch (err: any) {
      setError(err.message || 'Gagal masuk room');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-game-surface border-4 border-game-purple rounded-3xl p-6 md:p-8 shadow-[8px_8px_0_0_#9B5DE5]">
        
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-wider text-game-yellow mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" style={{ fontFamily: 'var(--font-fredoka)' }}>
            CHAOS PARTY
          </h1>
          <p className="text-gray-300 font-bold">Main bareng, ngakak bareng! 🎮</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border-2 border-red-500 text-red-200 text-center p-2 rounded-xl text-sm font-bold animate-bounce">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-game-pink font-bold block">Pilih Karaktermu</label>
            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatar(av.id)}
                  className={cn(
                    "text-4xl aspect-square rounded-2xl flex items-center justify-center transition-all",
                    av.color,
                    avatar === av.id ? "scale-110 ring-4 ring-white shadow-lg" : "opacity-50 hover:opacity-100 hover:scale-105"
                  )}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-game-green font-bold block">Nama Kamu</label>
            <input
              type="text"
              maxLength={15}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Si Paling..."
              className="w-full bg-game-bg border-2 border-game-green rounded-xl p-4 text-white text-xl font-bold focus:outline-none focus:ring-4 focus:ring-game-green/50 placeholder:text-gray-600 uppercase"
            />
          </div>

          <div className="pt-4 border-t-2 border-game-purple/30 flex flex-col gap-4">
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full bg-game-pink hover:bg-pink-500 text-white font-bold text-xl p-4 rounded-xl shadow-[0_6px_0_0_#A0164B] active:shadow-[0_0px_0_0_#A0164B] active:translate-y-[6px] transition-all flex items-center justify-center gap-2"
            >
              <PartyPopper size={24} />
              Bikin Room Baru
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t-2 border-game-purple/30"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 font-bold text-sm uppercase">Atau</span>
              <div className="flex-grow border-t-2 border-game-purple/30"></div>
            </div>

            <form onSubmit={handleJoinRoom} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="KODE"
                className="w-1/2 bg-game-bg border-2 border-game-yellow rounded-xl p-4 text-white text-xl font-bold text-center focus:outline-none focus:ring-4 focus:ring-game-yellow/50 placeholder:text-gray-600 uppercase"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-1/2 bg-game-yellow hover:bg-yellow-400 text-game-bg font-bold text-xl p-4 rounded-xl shadow-[0_6px_0_0_#B39B1E] active:shadow-[0_0px_0_0_#B39B1E] active:translate-y-[6px] transition-all flex items-center justify-center gap-2"
              >
                <Users size={24} strokeWidth={3} />
                Join
              </button>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
