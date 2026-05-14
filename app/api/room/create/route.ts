import { NextResponse } from 'next/server';
import { createRoom } from '@/lib/room-store';
import { setSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { name, avatar } = await req.json();
    if (!name || !avatar) {
      return NextResponse.json({ error: 'Name and avatar required' }, { status: 400 });
    }

    const hostId = crypto.randomUUID();
    const room = createRoom(hostId, name, avatar);

    // Save host identity to cookie
    await setSession({
      id: hostId,
      name,
      avatar,
    });

    return NextResponse.json({ roomCode: room.code });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
