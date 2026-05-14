import { NextResponse } from 'next/server';
import { getRoom } from '@/lib/room-store';
import { getSession } from '@/lib/session';
import { advanceGame, broadcastRoomUpdate } from '@/lib/game-logic';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const session = await getSession();
    
    if (!code || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const room = getRoom(code.toUpperCase());
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.hostId !== session.id) {
      return NextResponse.json({ error: 'Only host can start' }, { status: 403 });
    }

    // Advance from lobby to the first game
    await advanceGame(room);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start' }, { status: 500 });
  }
}
