import React from 'react';

interface BrandLogoProps {
  compact?: boolean;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false }) => {
  return (
    <div className={`brand-logo ${compact ? 'compact' : ''}`}>
      <span className="brand-mark" aria-hidden="true">
        IT
      </span>
      <span className="brand-wordmark">Indian Tinder</span>
    </div>
  );
};

export default BrandLogo;
