import React from 'react';
import { MatchSummary } from '../types';
import AvatarBadge from './AvatarBadge';

interface MatchModalProps {
  match: MatchSummary;
  onClose: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({ match, onClose }) => {
  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>It&apos;s a Match</h2>
        <AvatarBadge avatarKey={match.user.avatarKey} name={match.user.name} size={120} />
        <p>
          You and <strong>{match.user.name}</strong> liked each other.
        </p>
        <p className="muted">Keep chatting to build trust and unlock private photos with consent.</p>
        <button className="btn btn-like" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default MatchModal;
