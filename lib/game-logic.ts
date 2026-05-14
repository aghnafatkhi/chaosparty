import { Room } from '@/types/game';
import { pusherServer } from './pusher';
import { EVENTS } from './pusher-events';
import { toClientRoom } from './room-store';

export const MINIGAMES = [
  'siapa-yang-paling',
  'speed-typing',
  'would-you-rather'
];

const SIAPA_QUESTIONS = [
  "Siapa yang paling mungkin ketiduran di kelas?",
  "Siapa yang paling mungkin makan Indomie pakai nasi 2 piring?",
  "Siapa yang paling mungkin balikan sama mantannya?",
  "Siapa yang paling sering typo di grup WA?",
  "Siapa yang paling sering telat karena alasan macet?"
];

const TYPING_PHRASES = [
  "Kukira cupu ternyata suhu",
  "Pinjam seratus besok diganti",
  "Info loker dong bang",
  "Tarik sis semongko",
  "Mendang mending mendang mending"
];

const WYR_QUESTIONS = [
  { q: "Pilih mana?", opt1: "Nggak bisa makan pedes seumur hidup", opt2: "Nggak bisa makan manis seumur hidup" },
  { q: "Pilih mana?", opt1: "HP selalu lowbet (5%)", opt2: "Sinyal selalu EDGE" },
  { q: "Pilih mana?", opt1: "Kelihatan culun tapi tajir melintir", opt2: "Kelihatan keren tapi bokek terus" }
];

function setupMinigameState(room: Room) {
  room.minigameState = { answers: {} };
  if (room.currentMiniGame === 'siapa-yang-paling') {
    room.minigameState.question = SIAPA_QUESTIONS[Math.floor(Math.random() * SIAPA_QUESTIONS.length)];
  } else if (room.currentMiniGame === 'speed-typing') {
    room.minigameState.question = TYPING_PHRASES[Math.floor(Math.random() * TYPING_PHRASES.length)];
  } else if (room.currentMiniGame === 'would-you-rather') {
    const q = WYR_QUESTIONS[Math.floor(Math.random() * WYR_QUESTIONS.length)];
    room.minigameState.question = q.q;
    room.minigameState.options = [q.opt1, q.opt2];
  }
}

export async function advanceGame(room: Room) {
  // If we are showing results, move to next round or final
  if (room.gameState === 'results') {
    if (room.round >= room.maxRounds) {
      room.gameState = 'final';
      room.currentMiniGame = null;
    } else {
      room.round++;
      room.gameState = 'countdown';
      room.currentMiniGame = MINIGAMES[Math.floor(Math.random() * MINIGAMES.length)];
      setupMinigameState(room);
    }
  } else if (room.gameState === 'lobby' || room.gameState === 'countdown') {
    if (room.gameState === 'lobby') {
      room.round = 1;
      room.currentMiniGame = MINIGAMES[Math.floor(Math.random() * MINIGAMES.length)];
      setupMinigameState(room);
    }
    room.gameState = 'playing';
  } else if (room.gameState === 'playing') {
    room.gameState = 'results';
    calculateScores(room);
  }

  await broadcastRoomUpdate(room);

  // Auto-advance logic using setTimeout
  if (room.gameState === 'countdown') {
    let timeLeft = 3;
    const interval = setInterval(async () => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(interval);
        await advanceGame(room);
      } else {
        await pusherServer.trigger(`presence-room-${room.code}`, EVENTS.MINIGAME_TICK, { time: timeLeft });
      }
    }, 1000);
  } else if (room.gameState === 'playing') {
    // 30 Seconds for mini game
    let timeLeft = 30;
    const interval = setInterval(async () => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(interval);
        await advanceGame(room);
      } else {
        await pusherServer.trigger(`presence-room-${room.code}`, EVENTS.MINIGAME_TICK, { time: timeLeft });
      }
    }, 1000);
  } else if (room.gameState === 'results') {
    // Show results for 8 seconds
    setTimeout(async () => {
      await advanceGame(room);
    }, 8000);
  }
}

export async function broadcastRoomUpdate(room: Room) {
  await pusherServer.trigger(`presence-room-${room.code}`, EVENTS.ROOM_STATE_UPDATE, toClientRoom(room));
}

function calculateScores(room: Room) {
  const ans = Object.entries(room.minigameState.answers);
  
  if (room.currentMiniGame === 'siapa-yang-paling') {
    // tally votes
    const votes: Record<string, number> = {};
    for (const [voterId, votedId] of ans) {
      votes[votedId] = (votes[votedId] || 0) + 1;
    }
    let max = 0;
    for (const v of Object.values(votes)) {
      if (v > max) max = v as number;
    }
    const winners = Object.keys(votes).filter(id => votes[id] === max);
    room.minigameState.results = { votes, winners };
    
    // Give points to people who voted for the winner, and the winner themselves
    for (const [playerId, player] of Array.from(room.players.entries())) {
      if (winners.includes(playerId)) player.score += 500;
      const myVote = room.minigameState.answers[playerId];
      if (winners.includes(myVote)) player.score += 200;
    }
    
  } else if (room.currentMiniGame === 'speed-typing') {
    // The answers object stores the time they answered.
    // Whoever has an answer here typed it correctly first.
    // Order them by the time they answered (we can use the value as a timestamp)
    const sorted = ans.sort((a, b) => a[1] - b[1]);
    room.minigameState.results = { standings: sorted.map(s => s[0]) };
    
    let points = 1000;
    for (const [playerId, time] of sorted) {
      const player = room.players.get(playerId);
      if (player) {
         player.score += points;
         points = Math.max(0, points - 250); // 1000, 750, 500, 250, 0...
      }
    }
    
  } else if (room.currentMiniGame === 'would-you-rather') {
    // tally options (0 or 1)
    const votes: Record<string, number> = { "0": 0, "1": 0 };
    for (const [voterId, choice] of ans) {
      votes[choice as string] = (votes[choice as string] || 0) + 1;
    }
    const majority = votes["0"] > votes["1"] ? "0" : votes["0"] < votes["1"] ? "1" : "tie";
    room.minigameState.results = { votes, majority };
    
    for (const [playerId, choice] of ans) {
      const player = room.players.get(playerId);
      if (player && choice == majority) {
        player.score += 500;
      }
    }
  }
}

