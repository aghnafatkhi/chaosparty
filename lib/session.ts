import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'chaos_party_session';

export type SessionData = {
  id: string; // pusher socket_id doesn't persist, so we use a stable session id
  name: string;
  avatar: string;
};

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  if (!session?.value) return null;
  try {
    return JSON.parse(session.value) as SessionData;
  } catch (e) {
    return null;
  }
}

export async function setSession(data: SessionData) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 1 day
  });
}
