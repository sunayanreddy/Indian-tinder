import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface TopNavProps {
  onLogout: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onLogout }) => {
  const location = useLocation();

  return (
    <header className="top-nav">
      <div className="brand">Indian Tinder Pro</div>
      <nav>
        <Link className={location.pathname === '/discover' ? 'active-link' : ''} to="/discover">
          Discover
        </Link>
        <Link className={location.pathname === '/matches' ? 'active-link' : ''} to="/matches">
          Matches
        </Link>
      </nav>
      <button className="btn btn-ghost" onClick={onLogout}>
        Logout
      </button>
    </header>
  );
};

export default TopNav;
