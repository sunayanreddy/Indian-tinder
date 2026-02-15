import React, { useState } from 'react';
import { updateProfile } from '../services/api';
import { Gender, User } from '../types';

interface OnboardingPageProps {
  user: User;
  onComplete: (user: User) => void;
}

const normalizeGender = (value: string): Gender => {
  switch (value) {
    case 'man':
      return 'man';
    case 'woman':
      return 'woman';
    case 'non_binary':
      return 'non_binary';
    case 'other':
      return 'other';
    default:
      return 'prefer_not_say';
  }
};

const OnboardingPage: React.FC<OnboardingPageProps> = ({ user, onComplete }) => {
  const [name, setName] = useState(user.name || '');
  const [age, setAge] = useState(user.age || 21);
  const [gender, setGender] = useState<string>(user.gender || 'prefer_not_say');
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [interests, setInterests] = useState((user.interests || []).join(', '));
  const [avatarKey, setAvatarKey] = useState(user.avatarKey || 'fox');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updated = await updateProfile({
        name,
        age,
        gender: normalizeGender(gender),
        bio,
        location,
        interests: interests
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
        avatarKey,
        privatePhotos: []
      });
      onComplete(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <h1>Complete Your Profile</h1>
        <p>Only your avatar is public. Your private photos unlock after trust-based chat + permission.</p>

        <form className="auth-form" onSubmit={submit}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
          <div className="grid-two">
            <input
              type="number"
              min={18}
              max={80}
              value={age}
              onChange={e => setAge(Number(e.target.value))}
              placeholder="Age"
              required
            />
            <select value={gender} onChange={e => setGender(e.target.value)}>
              <option value="man">Man</option>
              <option value="woman">Woman</option>
              <option value="non_binary">Non-binary</option>
              <option value="other">Other</option>
              <option value="prefer_not_say">Prefer not to say</option>
            </select>
          </div>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" required />
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" rows={3} required />
          <input
            value={interests}
            onChange={e => setInterests(e.target.value)}
            placeholder="Interests (comma separated)"
            required
          />
          <select value={avatarKey} onChange={e => setAvatarKey(e.target.value)}>
            <option value="fox">Fox</option>
            <option value="lotus">Lotus</option>
            <option value="lion">Lion</option>
            <option value="falcon">Falcon</option>
            <option value="panda">Panda</option>
            <option value="tiger">Tiger</option>
            <option value="peacock">Peacock</option>
          </select>

          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-like" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default OnboardingPage;
