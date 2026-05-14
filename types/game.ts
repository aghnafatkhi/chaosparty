export type PlayerId = string;

export type Player = {
  id: PlayerId;      // Session/Cookie ID
  socketId?: string; // Pusher socket_id assigned upon joining presence channel
  name: string;
  avatar: string;    // Emoji or avatar id
  score: number;
  isHost: boolean;
  isOnline: boolean; // Derived from Pusher presence members
};

export type GameState = 'lobby' | 'countdown' | 'playing' | 'results' | 'final';

export type MiniGameState = {
  question?: string;
  options?: any;
  answers: Record<string, any>;
  results?: any;
};

export type Room = {
  code: string;
  players: Map<PlayerId, Player>;
  gameState: GameState;
  currentMiniGame: string | null;
  minigameState: MiniGameState;
  round: number;
  maxRounds: number;
  hostId: PlayerId | null;
};

// Serializable room version to send over REST / Pusher
export type ClientRoom = Omit<Room, 'players'> & {
  players: Record<PlayerId, Player>;
};
