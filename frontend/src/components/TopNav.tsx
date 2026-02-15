import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';

interface TopNavProps {
  onLogout: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onLogout }) => {
  const location = useLocation();

  return (
    <header className="top-nav">
      <div className="brand">
        <BrandLogo compact />
      </div>
      <nav>
        <Link className={location.pathname === '/discover' ? 'active-link' : ''} to="/discover">
          Discover
        </Link>
        <Link className={location.pathname === '/matches' ? 'active-link' : ''} to="/matches">
          Matches
        </Link>
        <Link className={location.pathname === '/profile' ? 'active-link' : ''} to="/profile">
          Profile
        </Link>
      </nav>
      <button className="btn btn-ghost" onClick={onLogout}>
        Logout
      </button>
    </header>
  );
};

export default TopNav;
