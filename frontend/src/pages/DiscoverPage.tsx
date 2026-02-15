import React, { useEffect, useState } from 'react';
import MatchModal from '../components/MatchModal';
import SwipeCard from '../components/SwipeCard';
import { discoverUsers, swipeUser } from '../services/api';
import { MatchSummary, User } from '../types';

const DiscoverPage: React.FC = () => {
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [match, setMatch] = useState<MatchSummary | null>(null);

  const loadProfiles = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const users = await discoverUsers();
      setProfiles(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfiles();
  }, []);

  const handleSwipe = async (targetUserId: string, action: 'like' | 'pass'): Promise<void> => {
    try {
      const result = await swipeUser(targetUserId, action);
      setProfiles(prev => prev.filter(profile => profile.id !== targetUserId));
      if (result.matched && result.match) {
        setMatch(result.match);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Swipe failed');
    }
  };

  const topProfile = profiles[0];

  return (
    <div className="page-shell">
      <h1>Discover</h1>
      {loading && <p>Loading profiles...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !topProfile && <p>No new profiles right now. Check back soon.</p>}

      {topProfile && (
        <SwipeCard
          user={topProfile}
          onPass={() => handleSwipe(topProfile.id, 'pass')}
          onLike={() => handleSwipe(topProfile.id, 'like')}
        />
      )}

      {match && <MatchModal match={match} onClose={() => setMatch(null)} />}
    </div>
  );
};

export default DiscoverPage;
