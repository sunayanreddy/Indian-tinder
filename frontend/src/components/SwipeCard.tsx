import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import AvatarBadge from './AvatarBadge';

interface SwipeCardProps {
  user: User;
  onLike: () => void;
  onPass: () => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ user, onLike, onPass }) => {
  return (
    <article className="profile-card">
      <div className="avatar-panel">
        <AvatarBadge avatarKey={user.avatarKey} name={user.name} size={160} />
        <p className="muted">Private photos stay hidden until both trust each other.</p>
      </div>
      <div className="profile-body">
        <h2>
          {user.name}, {user.age}
        </h2>
        <p className="profile-location">
          {user.location} · {user.gender.replace('_', ' ')}
        </p>
        <p>{user.bio || 'No bio yet.'}</p>
        <div className="tag-row">
          {user.interests.map(interest => (
            <span className="tag" key={interest}>
              {interest}
            </span>
          ))}
        </div>
        <Link className="btn btn-ghost" to={`/profile/${user.id}`}>
          View Profile
        </Link>
        <div className="action-row">
          <button className="btn btn-pass" onClick={onPass}>
            Pass
          </button>
          <button className="btn btn-like" onClick={onLike}>
            Like
          </button>
        </div>
      </div>
    </article>
  );
};

export default SwipeCard;
