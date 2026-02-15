import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import TopNav from './components/TopNav';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import DiscoverPage from './pages/DiscoverPage';
import HomePage from './pages/HomePage';
import MatchesPage from './pages/MatchesPage';
import OnboardingPage from './pages/OnboardingPage';
import { getApiErrorStatus, getProfile, setAuthToken } from './services/api';
import './styles/globals.css';
import { User } from './types';

const App: React.FC = () => {
  const [token, setTokenState] = useState<string>(() => localStorage.getItem('dating_token') || '');
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(Boolean(token));
  const [profileLoadError, setProfileLoadError] = useState('');
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    setAuthToken(token || '');
  }, [token]);

  useEffect(() => {
    const restoreUser = async (): Promise<void> => {
      setProfileLoadError('');
      if (!token) {
        setUser(null);
        setLoadingUser(false);
        return;
      }

      try {
        let profile: User | null = null;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            profile = await getProfile();
            break;
          } catch (error) {
            const status = getApiErrorStatus(error);
            if (status === 401 || status === 403) {
              localStorage.removeItem('dating_token');
              setTokenState('');
              setUser(null);
              setProfileLoadError('');
              return;
            }
            await new Promise(resolve => setTimeout(resolve, 700 * (attempt + 1)));
          }
        }

        if (!profile) {
          setProfileLoadError('Unable to load your session right now. Please retry.');
          return;
        }

        setUser(profile);
      } finally {
        setLoadingUser(false);
      }
    };

    void restoreUser();
  }, [token, reloadTick]);

  const authenticated = useMemo(() => Boolean(token && user), [token, user]);
  const needsOnboarding = Boolean(user && !user.onboardingCompleted);

  const setToken = (nextToken: string): void => {
    if (nextToken) {
      localStorage.setItem('dating_token', nextToken);
    } else {
      localStorage.removeItem('dating_token');
    }
    setTokenState(nextToken);
  };

  const onAuthenticated = (nextToken: string, nextUser: User): void => {
    setToken(nextToken);
    setUser(nextUser);
  };

  const onOnboardingComplete = (updatedUser: User): void => {
    setUser(updatedUser);
  };

  const logout = (): void => {
    setToken('');
    setUser(null);
  };

  if (loadingUser) {
    return <div className="loading-shell">Loading your profile...</div>;
  }

  if (profileLoadError && token) {
    return (
      <div className="loading-shell">
        <div>
          <p>{profileLoadError}</p>
          <button className="btn btn-like" onClick={() => {
            setLoadingUser(true);
            setReloadTick(prev => prev + 1);
          }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {authenticated && !needsOnboarding && <TopNav onLogout={logout} />}

      <Switch>
        <Route path="/auth">
          {authenticated ? (
            <Redirect to={needsOnboarding ? '/onboarding' : '/discover'} />
          ) : (
            <AuthPage onAuthenticated={onAuthenticated} />
          )}
        </Route>

        <Route path="/home">
          {authenticated ? <Redirect to={needsOnboarding ? '/onboarding' : '/discover'} /> : <HomePage />}
        </Route>

        <Route path="/onboarding">
          {authenticated && user ? (
            needsOnboarding ? (
              <OnboardingPage user={user} onComplete={onOnboardingComplete} />
            ) : (
              <Redirect to="/discover" />
            )
          ) : (
            <Redirect to="/auth" />
          )} 
        </Route>

        <Route path="/discover">
          {authenticated ? (
            needsOnboarding ? (
              <Redirect to="/onboarding" />
            ) : (
              <DiscoverPage />
            )
          ) : (
            <Redirect to="/auth" />
          )}
        </Route>

        <Route path="/matches">
          {authenticated ? (
            needsOnboarding ? (
              <Redirect to="/onboarding" />
            ) : (
              <MatchesPage />
            )
          ) : (
            <Redirect to="/auth" />
          )}
        </Route>

        <Route path="/chat/:matchUserId">
          {authenticated && user ? (
            needsOnboarding ? (
              <Redirect to="/onboarding" />
            ) : (
              <ChatPage userId={user.id} />
            )
          ) : (
            <Redirect to="/auth" />
          )}
        </Route>

        <Route path="/">
          <Redirect to={authenticated ? (needsOnboarding ? '/onboarding' : '/discover') : '/home'} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
