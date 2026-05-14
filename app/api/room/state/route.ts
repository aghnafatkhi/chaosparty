import { NextResponse } from 'next/server';
import { getRoom, toClientRoom } from '@/lib/room-store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({ error: 'Code required' }, { status: 400 });
  }

  const room = getRoom(code.toUpperCase());
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  return NextResponse.json({ room: toClientRoom(room) });
}
