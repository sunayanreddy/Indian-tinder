import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AvatarBadge from '../components/AvatarBadge';
import { getMatches } from '../services/api';
import { MatchSummary } from '../types';

const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMatches = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMatches();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-head">
        <h1>Connections</h1>
        <button className="btn btn-ghost" onClick={() => void loadMatches()}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading your connections...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && matches.length === 0 && <p>You have no matches yet. Start swiping.</p>}

      <div className="match-list">
        {matches.map(match => (
          <div className="match-item" key={match.matchId}>
            <AvatarBadge avatarKey={match.user.avatarKey} name={match.user.name} size={56} />
            <div>
              <h3>{match.user.name}</h3>
              <p>{match.lastMessage?.text || 'You are now connected. Say hi.'}</p>
              <small className="muted">Messages: {match.messageCount}</small>
              <div className="match-actions">
                <Link className="btn btn-ghost" to={`/profile/${match.user.id}`}>
                  View Profile
                </Link>
                <Link className="btn btn-like" to={`/chat/${match.user.id}`}>
                  Open Chat
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchesPage;
