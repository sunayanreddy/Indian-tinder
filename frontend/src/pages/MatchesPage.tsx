import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
          <Link className="match-item" key={match.matchId} to={`/chat/${match.user.id}`}>
            <img src={match.user.avatarUrl} alt={match.user.name} />
            <div>
              <h3>{match.user.name}</h3>
              <p>{match.lastMessage?.text || 'You are now connected. Say hi.'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MatchesPage;
