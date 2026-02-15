import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">Indian Tinder</div>
        <nav className="landing-actions">
          <Link className="btn btn-ghost" to="/auth?mode=login">
            Login
          </Link>
          <Link className="btn btn-like" to="/auth?mode=register">
            Sign Up
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-kicker">Private by Design</p>
          <h1>Meaningful Blind Dates, Built on Trust</h1>
          <p>
            Match through personality-first profiles and avatars. Unlock photos only after both people connect,
            chat, and consent.
          </p>
          <div className="landing-cta-row">
            <Link className="btn btn-like" to="/auth?mode=register">
              Start Dating
            </Link>
            <Link className="btn btn-ghost" to="/auth?mode=login">
              I Have an Account
            </Link>
          </div>
        </div>
        <div className="landing-visual" role="img" aria-label="Blind date visual" />
      </section>
    </main>
  );
};

export default HomePage;
