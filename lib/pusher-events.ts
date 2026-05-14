export const EVENTS = {
  PLAYER_JOINED:    'player-joined',
  PLAYER_LEFT:      'player-left',
  GAME_STARTED:     'game-started',
  MINIGAME_BEGIN:   'minigame-begin',
  MINIGAME_TICK:    'minigame-tick',    // timer countdown
  ANSWER_RECEIVED:  'answer-received',  // show who answered
  ROUND_RESULTS:    'round-results',
  GAME_OVER:        'game-over',
  AVATAR_REACT:     'avatar-react',     // trigger animation on specific player
  ROOM_STATE_UPDATE:'room-state-update',// Custom: force a full sync state refresh
} as const;
