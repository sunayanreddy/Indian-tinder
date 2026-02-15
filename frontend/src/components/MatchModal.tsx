import React from 'react';
import { MatchSummary } from '../types';

interface MatchModalProps {
  match: MatchSummary;
  onClose: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({ match, onClose }) => {
  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>It&apos;s a Match</h2>
        <img src={match.user.avatarUrl} alt={match.user.name} className="match-avatar" />
        <p>
          You and <strong>{match.user.name}</strong> liked each other.
        </p>
        <button className="btn btn-like" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default MatchModal;
