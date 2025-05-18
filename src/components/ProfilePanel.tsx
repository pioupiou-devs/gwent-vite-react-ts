import React from 'react';
import { Player } from '@/types/game';

interface ProfilePanelProps {
  player: Player;
  isCurrent: boolean;
  roundsWon: number;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ player, isCurrent, roundsWon }) => (
  <div className={`profile-panel ${isCurrent ? 'current' : 'enemy'}`}>
    <img src={`src/assets/avatars/${player.id}.jpg`} alt={player.name} className="avatar" />
    <div className="player-name">{player.name}</div>
    <div className="rounds">
      {[1,2,3].map((i) => (
        <span key={i} className={`crown ${roundsWon >= i ? 'filled' : ''}`}>👑</span>
      ))}
    </div>
    <div className="player-score">{player.score}</div>
  </div>
);

export default ProfilePanel;