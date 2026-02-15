import React, { useEffect, useMemo, useState } from 'react';
import {
  getApiErrorMessage,
  login,
  loginWithGoogle,
  register,
  RegisterInput
} from '../services/api';
import { User } from '../types';

interface AuthPageProps {
  onAuthenticated: (token: string, user: User) => void;
}

const defaultRegisterState: RegisterInput = {
  name: '',
  email: '',
  password: ''
};

const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoTip = useMemo(() => 'Demo account: isha@example.com / password123', []);
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    const scriptId = 'google-identity-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = scriptId;
      script.onload = () => {
        // @ts-ignore - Google Identity script injects this global
        const googleApi = window.google;
        if (googleApi) {
          googleApi.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              try {
                const result = await loginWithGoogle(response.credential);
                onAuthenticated(result.token, result.user);
              } catch (err) {
                setError(getApiErrorMessage(err, 'Google login failed'));
              }
            }
          });
          const container = document.getElementById('google-signin-button');
          if (container) {
            container.innerHTML = '';
            googleApi.accounts.id.renderButton(container, {
              theme: 'outline',
              size: 'large',
              shape: 'pill',
              text: 'continue_with'
            });
          }
        }
      };
      document.body.appendChild(script);
    }
  }, [googleClientId, onAuthenticated]);

  const submitLogin = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      onAuthenticated(result.token, result.user);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (): Promise<void> => {
    setLoading(true);
    setError('');

    const payload: RegisterInput = {
      ...defaultRegisterState,
      name,
      email,
      password
    };

    try {
      const result = await register(payload);
      onAuthenticated(result.token, result.user);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (mode === 'login') {
      await submitLogin();
      return;
    }
    await submitRegister();
  };

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <h1>Trust-first Dating</h1>
        <p>Use Gmail/Google or email login. Private photos unlock only with consent after meaningful chat.</p>
        <div className="auth-toggle">
          <button
            className={`btn ${mode === 'login' ? 'btn-like' : 'btn-ghost'}`}
            type="button"
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`btn ${mode === 'register' ? 'btn-like' : 'btn-ghost'}`}
            type="button"
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              type="text"
              placeholder="Full name"
              required
            />
          )}

          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            required
          />
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-like" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        {googleClientId ? (
          <div className="google-wrap">
            <p className="muted">or continue with Google</p>
            <div id="google-signin-button" />
          </div>
        ) : (
          <p className="muted">Set `REACT_APP_GOOGLE_CLIENT_ID` to enable Google sign-in.</p>
        )}

        <p className="muted">{demoTip}</p>
      </section>
    </main>
  );
};

export default AuthPage;
