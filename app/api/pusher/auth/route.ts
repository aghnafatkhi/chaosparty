import { pusherServer } from '@/lib/pusher';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const socketId = data.get('socket_id') as string;
    const channel = data.get('channel_name') as string;
    
    // In next.js and traditional web forms, formData works, but pusher-js sometimes sends urlencoded via text.
    // To be safe, we'll parse if formData fails or is empty.
    
    if (!socketId || !channel) {
       // fallback for older/custom request bodies
       return new Response("Missing socket_id or channel_name", { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
      user_id: session.id,
      user_info: { name: session.name, avatar: session.avatar }
    });

    return Response.json(authResponse);
  } catch (error) {
    // If formData parsing fails, try parsing as URLSearchParams from text
    const text = await req.text();
    const params = new URLSearchParams(text);
    const socketId = params.get('socket_id');
    const channel = params.get('channel_name');

    if (!socketId || !channel) {
      return new Response("Missing socket_id or channel_name format", { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
      user_id: session.id,
      user_info: { name: session.name, avatar: session.avatar }
    });

    return Response.json(authResponse);
  }
}
