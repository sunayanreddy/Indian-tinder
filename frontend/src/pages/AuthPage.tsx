import React, { useMemo, useState } from 'react';
import { login, register, RegisterInput } from '../services/api';
import { User } from '../types';

interface AuthPageProps {
  onAuthenticated: (token: string, user: User) => void;
}

const defaultRegisterState: RegisterInput = {
  name: '',
  email: '',
  password: '',
  age: 25,
  bio: '',
  location: '',
  interests: []
};

const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState('travel, food, music');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoTip = useMemo(
    () => 'Demo account: isha@example.com / password123',
    []
  );

  const submitLogin = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      onAuthenticated(result.token, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
      password,
      age,
      bio,
      location,
      interests: interests
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
    };

    try {
      const result = await register(payload);
      onAuthenticated(result.token, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
        <h1>Indian Tinder Pro</h1>
        <p>Meet people, get matched, and start meaningful conversations.</p>
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
            <>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                type="text"
                placeholder="Full name"
                required
              />
              <div className="grid-two">
                <input
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  type="number"
                  min={18}
                  max={70}
                  placeholder="Age"
                  required
                />
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  type="text"
                  placeholder="City"
                  required
                />
              </div>
              <input
                value={bio}
                onChange={e => setBio(e.target.value)}
                type="text"
                placeholder="Bio"
                required
              />
              <input
                value={interests}
                onChange={e => setInterests(e.target.value)}
                type="text"
                placeholder="Interests separated by commas"
                required
              />
            </>
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

        <p className="muted">{demoTip}</p>
      </section>
    </main>
  );
};

export default AuthPage;
