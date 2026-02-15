import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import TopNav from './components/TopNav';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import { getProfile, setAuthToken } from './services/api';
import './styles/globals.css';
import { User } from './types';

const App: React.FC = () => {
  const [token, setTokenState] = useState<string>(() => localStorage.getItem('dating_token') || '');
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(Boolean(token));

  useEffect(() => {
    setAuthToken(token || '');
  }, [token]);

  useEffect(() => {
    const restoreUser = async (): Promise<void> => {
      if (!token) {
        setUser(null);
        setLoadingUser(false);
        return;
      }

      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (_err) {
        localStorage.removeItem('dating_token');
        setTokenState('');
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    void restoreUser();
  }, [token]);

  const authenticated = useMemo(() => Boolean(token && user), [token, user]);

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

  const logout = (): void => {
    setToken('');
    setUser(null);
  };

  if (loadingUser) {
    return <div className="loading-shell">Loading your profile...</div>;
  }

  return (
    <BrowserRouter>
      {authenticated && <TopNav onLogout={logout} />}

      <Switch>
        <Route path="/auth">
          {authenticated ? <Redirect to="/discover" /> : <AuthPage onAuthenticated={onAuthenticated} />}
        </Route>

        <Route path="/discover">
          {authenticated ? <DiscoverPage /> : <Redirect to="/auth" />}
        </Route>

        <Route path="/matches">
          {authenticated ? <MatchesPage /> : <Redirect to="/auth" />}
        </Route>

        <Route path="/chat/:matchUserId">
          {authenticated && user ? <ChatPage userId={user.id} /> : <Redirect to="/auth" />}
        </Route>

        <Route path="/">
          <Redirect to={authenticated ? '/discover' : '/auth'} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
