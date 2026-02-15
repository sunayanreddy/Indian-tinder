import React from 'react';

interface AvatarBadgeProps {
  avatarKey: string;
  name: string;
  size?: number;
}

const AVATAR_MAP: Record<string, { emoji: string; bg: string }> = {
  fox: { emoji: '🦊', bg: '#fee2e2' },
  lotus: { emoji: '🪷', bg: '#fce7f3' },
  lion: { emoji: '🦁', bg: '#fde68a' },
  falcon: { emoji: '🦅', bg: '#dbeafe' },
  panda: { emoji: '🐼', bg: '#e5e7eb' },
  tiger: { emoji: '🐯', bg: '#ffedd5' },
  peacock: { emoji: '🦚', bg: '#dcfce7' }
};

const AvatarBadge: React.FC<AvatarBadgeProps> = ({ avatarKey, name, size = 56 }) => {
  const config = AVATAR_MAP[avatarKey] || AVATAR_MAP.fox;

  return (
    <div
      className="avatar-badge"
      title={`${name}'s avatar`}
      style={{ width: size, height: size, background: config.bg }}
    >
      <span style={{ fontSize: Math.floor(size * 0.45) }}>{config.emoji}</span>
    </div>
  );
};

export default AvatarBadge;
