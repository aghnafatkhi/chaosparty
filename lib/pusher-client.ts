import PusherClient from 'pusher-js';

let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = (): PusherClient => {
  if (typeof window === 'undefined') {
    throw new Error('PusherClient should only be used on the client-side.');
  }
  
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY || "key",
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
        authEndpoint: '/api/pusher/auth',
      }
    );
  }
  return pusherClientInstance;
};
