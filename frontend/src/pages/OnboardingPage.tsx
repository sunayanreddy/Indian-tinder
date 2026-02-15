import React, { useState } from 'react';
import { updateProfile } from '../services/api';
import { Gender, LifestyleHabit, LookingFor, RelationshipGoal, User } from '../types';

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

const normalizeLookingFor = (value: string): LookingFor => {
  switch (value) {
    case 'man':
    case 'woman':
    case 'non_binary':
    case 'everyone':
      return value;
    default:
      return 'prefer_not_say';
  }
};

const normalizeRelationshipGoal = (value: string): RelationshipGoal => {
  switch (value) {
    case 'short_term':
    case 'marriage':
    case 'friendship':
      return value;
    default:
      return 'long_term';
  }
};

const normalizeLifestyle = (value: string): LifestyleHabit => {
  switch (value) {
    case 'never':
    case 'occasionally':
    case 'socially':
    case 'regularly':
      return value;
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
  const [lookingFor, setLookingFor] = useState<LookingFor>(user.lookingFor || 'prefer_not_say');
  const [relationshipGoal, setRelationshipGoal] = useState<RelationshipGoal>(
    user.relationshipGoal || 'long_term'
  );
  const [occupation, setOccupation] = useState(user.occupation || '');
  const [education, setEducation] = useState(user.education || '');
  const [heightCm, setHeightCm] = useState(user.heightCm || 170);
  const [drinking, setDrinking] = useState<LifestyleHabit>(user.drinking || 'prefer_not_say');
  const [smoking, setSmoking] = useState<LifestyleHabit>(user.smoking || 'prefer_not_say');
  const [religion, setReligion] = useState(user.religion || '');
  const [languages, setLanguages] = useState((user.languages || []).join(', '));
  const [avatarKey, setAvatarKey] = useState(user.avatarKey || 'fox');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const interestList = interests
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    const languageList = languages
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    if (interestList.length < 3) {
      setError('Please add at least 3 interests.');
      setLoading(false);
      return;
    }
    if (languageList.length < 1) {
      setError('Please add at least 1 language.');
      setLoading(false);
      return;
    }

    try {
      const updated = await updateProfile({
        name,
        age,
        gender: normalizeGender(gender),
        bio,
        location,
        interests: interestList,
        avatarKey,
        lookingFor,
        relationshipGoal,
        occupation,
        education,
        heightCm,
        drinking,
        smoking,
        religion,
        languages: languageList,
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
        <p>Fill all details to get better matches. Only your avatar is public until photo access is granted.</p>

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
          <div className="grid-two">
            <select value={lookingFor} onChange={e => setLookingFor(normalizeLookingFor(e.target.value))}>
              <option value="man">Looking for Men</option>
              <option value="woman">Looking for Women</option>
              <option value="non_binary">Looking for Non-binary</option>
              <option value="everyone">Looking for Everyone</option>
              <option value="prefer_not_say">Prefer not to say</option>
            </select>
            <select
              value={relationshipGoal}
              onChange={e => setRelationshipGoal(normalizeRelationshipGoal(e.target.value))}
            >
              <option value="long_term">Long-term relationship</option>
              <option value="short_term">Short-term dating</option>
              <option value="marriage">Marriage</option>
              <option value="friendship">Friendship first</option>
            </select>
          </div>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" required />
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" rows={3} required />
          <div className="grid-two">
            <input
              value={occupation}
              onChange={e => setOccupation(e.target.value)}
              placeholder="Occupation"
              required
            />
            <input
              value={education}
              onChange={e => setEducation(e.target.value)}
              placeholder="Education"
              required
            />
          </div>
          <div className="grid-two">
            <input
              type="number"
              min={120}
              max={230}
              value={heightCm}
              onChange={e => setHeightCm(Number(e.target.value))}
              placeholder="Height (cm)"
              required
            />
            <input value={religion} onChange={e => setReligion(e.target.value)} placeholder="Religion" required />
          </div>
          <div className="grid-two">
            <select value={drinking} onChange={e => setDrinking(normalizeLifestyle(e.target.value))}>
              <option value="never">Drinking: Never</option>
              <option value="occasionally">Drinking: Occasionally</option>
              <option value="socially">Drinking: Socially</option>
              <option value="regularly">Drinking: Regularly</option>
              <option value="prefer_not_say">Drinking: Prefer not to say</option>
            </select>
            <select value={smoking} onChange={e => setSmoking(normalizeLifestyle(e.target.value))}>
              <option value="never">Smoking: Never</option>
              <option value="occasionally">Smoking: Occasionally</option>
              <option value="socially">Smoking: Socially</option>
              <option value="regularly">Smoking: Regularly</option>
              <option value="prefer_not_say">Smoking: Prefer not to say</option>
            </select>
          </div>
          <input
            value={interests}
            onChange={e => setInterests(e.target.value)}
            placeholder="Interests (comma separated, minimum 3)"
            required
          />
          <input
            value={languages}
            onChange={e => setLanguages(e.target.value)}
            placeholder="Languages spoken (comma separated)"
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
