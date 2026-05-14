import { NextResponse } from 'next/server';
import { getRoom } from '@/lib/room-store';
import { getSession } from '@/lib/session';
import { pusherServer } from '@/lib/pusher';
import { EVENTS } from '@/lib/pusher-events';

export async function POST(req: Request) {
  try {
    const { code, answer } = await req.json();
    const session = await getSession();
    
    if (!code || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomCode = code.toUpperCase();
    const room = getRoom(roomCode);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.gameState !== 'playing') {
      return NextResponse.json({ error: 'Not currently playing' }, { status: 400 });
    }

    // Save answer
    room.minigameState.answers[session.id] = answer;

    // Notify others someone answered
    await pusherServer.trigger(`presence-room-${roomCode}`, EVENTS.ANSWER_RECEIVED, {
      playerId: session.id
    });

    // Short-circuit if everyone answered
    if (Object.keys(room.minigameState.answers).length >= room.players.size) {
      // In a more robust system, we would advance the room, but we don't want to conflict with setTimeout
      // So we'll just wait for the timeout or advance manually here if we cancel timeout.
      // For now, let the timeout run out naturally or we can add a tiny delay.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
