import React from 'react';
import { Player } from '@/types/game';

interface ProfilePanelProps {
  player: Player;
  isCurrent: boolean;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ player, isCurrent }) => (
  <div className={`profile-panel ${isCurrent ? 'current' : 'enemy'}`}>
    <img src={`/avatars/${player.id}.png`} alt={player.name} className="avatar" />
    <div className="player-name">{player.name}</div>
    <div className="rounds">
      {[1, 2, 3].map((i) => (
        <span key={i} className={`crown ${player.roundsWon >= i ? 'filled' : ''}`}>👑</span>
      ))}
    </div>
    <div className="player-score">{player.score}</div>
  </div>
);

export default ProfilePanel;