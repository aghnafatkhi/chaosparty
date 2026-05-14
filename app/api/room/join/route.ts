import { NextResponse } from 'next/server';
import { getRoom } from '@/lib/room-store';
import { setSession, getSession } from '@/lib/session';
import { broadcastRoomUpdate } from '@/lib/game-logic';

export async function POST(req: Request) {
  try {
    const { code, name, avatar } = await req.json();
    if (!code || !name || !avatar) {
      return NextResponse.json({ error: 'Code, name, and avatar required' }, { status: 400 });
    }

    const roomCode = code.toUpperCase();
    const room = getRoom(roomCode);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.gameState !== 'lobby') {
      return NextResponse.json({ error: 'Game already in progress' }, { status: 403 });
    }
    
    if (room.players.size >= 8) {
      return NextResponse.json({ error: 'Room is full' }, { status: 403 });
    }

    let playerId = crypto.randomUUID();
    
    // Attempt to reuse session if joining same room with same name
    const existingSession = await getSession();
    if (existingSession && room.players.has(existingSession.id)) {
      playerId = existingSession.id;
    }

    room.players.set(playerId, {
      id: playerId,
      name,
      avatar,
      score: 0,
      isHost: false,
      isOnline: false,
    });

    await setSession({
      id: playerId,
      name,
      avatar,
    });

    // We don't necessarily broadcast immediately because the player hasn't joined Pusher channel yet,
    // but the state has changed. Let's broadcast so lobby updates for existing players.
    await broadcastRoomUpdate(room);

    return NextResponse.json({ roomCode: room.code });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
