import { Room, ClientRoom, Player } from '@/types/game';

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const globalForRooms = global as unknown as { roomsMap: Map<string, Room> };
export const rooms = globalForRooms.roomsMap || new Map<string, Room>();

if (process.env.NODE_ENV !== 'production') {
  globalForRooms.roomsMap = rooms;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function createRoom(hostId: string, hostName: string, hostAvatar: string): Room {
  let code = generateRoomCode();
  while (rooms.has(code)) {
    code = generateRoomCode();
  }
  
  const hostPlayer: Player = {
    id: hostId,
    name: hostName,
    avatar: hostAvatar,
    score: 0,
    isHost: true,
    isOnline: false // Becomes true when they connect via WebSocket
  };

  const newRoom: Room = {
    code,
    players: new Map([[hostId, hostPlayer]]),
    gameState: 'lobby',
    currentMiniGame: null,
    minigameState: { answers: {} },
    round: 0,
    maxRounds: 3,
    hostId: hostId,
  };
  
  rooms.set(code, newRoom);
  return newRoom;
}

// Helper to safely serialize the room state to send to clients
export function toClientRoom(room: Room): ClientRoom {
  const playersObj: Record<string, Player> = {};
  room.players.forEach((player, id) => {
    playersObj[id] = player;
  });

  return {
    ...room,
    players: playersObj,
  };
}
