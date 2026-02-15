import React from 'react';
import { User } from '../types';

interface SwipeCardProps {
  user: User;
  onLike: () => void;
  onPass: () => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ user, onLike, onPass }) => {
  return (
    <article className="profile-card">
      <img src={user.avatarUrl} alt={user.name} className="profile-image" />
      <div className="profile-body">
        <h2>
          {user.name}, {user.age}
        </h2>
        <p className="profile-location">{user.location}</p>
        <p>{user.bio}</p>
        <div className="tag-row">
          {user.interests.map(interest => (
            <span className="tag" key={interest}>
              {interest}
            </span>
          ))}
        </div>
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
