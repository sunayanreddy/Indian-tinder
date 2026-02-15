import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

const HomePage: React.FC = () => {
  const heroVisualStyle = {
    backgroundImage:
      "linear-gradient(190deg, rgba(9, 14, 22, 0.12), rgba(9, 14, 22, 0.28)), url('/landing-couple.png')"
  };

  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          <BrandLogo />
        </div>
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
          <p className="landing-kicker">Date Blind, Build trust and become friends.</p>
          <h1>Date Blind, Build trust and become friends.</h1>
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
          <div className="landing-stats">
            <div className="stat-card">
              <h3>Consent-first</h3>
              <p>Private images remain locked until both users grant access.</p>
            </div>
            <div className="stat-card">
              <h3>Avatar-led Discovery</h3>
              <p>Match through values and vibe before appearance.</p>
            </div>
          </div>
        </div>
        <div className="landing-visual" style={heroVisualStyle} role="img" aria-label="Blind date visual" />
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <h3>Intent-led Profiles</h3>
          <p>
            Set your relationship goals, preferences, lifestyle, and key details so every connection starts with
            clarity.
          </p>
        </article>
        <article className="feature-card">
          <h3>Smart Match Journey</h3>
          <p>
            Discover profiles, match instantly on mutual likes, and move into focused one-to-one conversation.
          </p>
        </article>
        <article className="feature-card">
          <h3>Trust Unlock Layer</h3>
          <p>
            Photos are shared only after meaningful conversation and explicit permission from the profile owner.
          </p>
        </article>
      </section>
    </main>
  );
};

export default HomePage;
