'use client';

import { ClientRoom, Player } from '@/types/game';
import CountDownOverlay from './CountDownOverlay';
import MatchResults from './MatchResults';
import FinalLeaderboard from './FinalLeaderboard';
import { useEffect, useState } from 'react';
import SiapaYangPaling from '../minigames/SiapaYangPaling';
import KetikSecepatKilat from '../minigames/KetikSecepatKilat';
import PilihAtauMenyesal from '../minigames/PilihAtauMenyesal';
import TimerBar from './TimerBar';

type GameRunnerProps = {
  room: ClientRoom;
  me: Player;
  channelName: string;
};

export default function GameRunner({ room, me, channelName }: GameRunnerProps) {
  if (room.gameState === 'countdown') {
    return <CountDownOverlay room={room} />;
  }

  if (room.gameState === 'playing') {
    const renderMiniGame = () => {
      switch (room.currentMiniGame) {
        case 'siapa-yang-paling':
          return <SiapaYangPaling room={room} me={me} channelName={channelName} />;
        case 'speed-typing':
          return <KetikSecepatKilat room={room} me={me} channelName={channelName} />;
        case 'would-you-rather':
          return <PilihAtauMenyesal room={room} me={me} channelName={channelName} />;
        default:
          return <div className="text-white text-center p-8 text-2xl font-bold">Unknown Mini Game!</div>;
      }
    };

    return (
      <>
        <TimerBar channelName={channelName} />
        {renderMiniGame()}
      </>
    );
  }

  if (room.gameState === 'results') {
    return <MatchResults room={room} me={me} />;
  }

  if (room.gameState === 'final') {
    return <FinalLeaderboard room={room} me={me} />;
  }

  return null;
}
