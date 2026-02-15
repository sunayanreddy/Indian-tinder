import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AvatarBadge from '../components/AvatarBadge';
import { getApiErrorMessage, getUserProfileById } from '../services/api';
import { ViewerProfileDetails } from '../types';

const UserProfilePage: React.FC = () => {
  const params: any = useParams();
  const userId = params.userId || '';
  const [details, setDetails] = useState<ViewerProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        const data = await getUserProfileById(userId);
        setDetails(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not load profile'));
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      void load();
    }
  }, [userId]);

  if (loading) {
    return <div className="page-shell"><p>Loading profile...</p></div>;
  }

  if (error || !details) {
    return <div className="page-shell"><p className="error-text">{error || 'Profile unavailable'}</p></div>;
  }

  return (
    <div className="page-shell">
      <div className="page-head">
        <h1>{details.user.name}&apos;s Profile</h1>
      </div>

      <div className="trust-panel">
        <AvatarBadge avatarKey={details.user.avatarKey} name={details.user.name} size={72} />
        <div>
          <p className="muted">{details.user.location}</p>
          <p className="muted">{details.user.gender.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="profile-body" style={{ marginTop: 14 }}>
        <p>{details.user.bio || 'No bio yet.'}</p>
        <div className="tag-row">
          {(details.user.interests || []).map(interest => (
            <span className="tag" key={interest}>{interest}</span>
          ))}
        </div>
      </div>

      {details.canViewPrivatePhotos ? (
        <div className="private-photo-grid" style={{ marginTop: 14 }}>
          {details.privatePhotos.map(photo => (
            <img key={photo} src={photo} alt="Private profile" className="private-photo" />
          ))}
        </div>
      ) : (
        <p className="muted" style={{ marginTop: 14 }}>
          Private photos are locked until both users build trust and grant access.
        </p>
      )}
    </div>
  );
};

export default UserProfilePage;
