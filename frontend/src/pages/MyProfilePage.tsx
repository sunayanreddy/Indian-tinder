import React, { useEffect, useState } from 'react';
import AvatarBadge from '../components/AvatarBadge';
import { getApiErrorMessage, getMyProfileDetails, updateProfile } from '../services/api';
import { Gender, LifestyleHabit, LookingFor, MyProfileDetails, RelationshipGoal, User } from '../types';

interface MyProfilePageProps {
  onUserUpdated: (user: User) => void;
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

const MyProfilePage: React.FC<MyProfilePageProps> = ({ onUserUpdated }) => {
  const [details, setDetails] = useState<MyProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState('prefer_not_say');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState('');
  const [avatarKey, setAvatarKey] = useState('fox');
  const [lookingFor, setLookingFor] = useState<LookingFor>('prefer_not_say');
  const [relationshipGoal, setRelationshipGoal] = useState<RelationshipGoal>('long_term');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [heightCm, setHeightCm] = useState(170);
  const [drinking, setDrinking] = useState<LifestyleHabit>('prefer_not_say');
  const [smoking, setSmoking] = useState<LifestyleHabit>('prefer_not_say');
  const [religion, setReligion] = useState('');
  const [languages, setLanguages] = useState('');
  const [privatePhotosRaw, setPrivatePhotosRaw] = useState('');

  const load = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyProfileDetails();
      setDetails(response);
      setName(response.user.name || '');
      setAge(response.user.age || 21);
      setGender(response.user.gender || 'prefer_not_say');
      setBio(response.user.bio || '');
      setLocation(response.user.location || '');
      setInterests((response.user.interests || []).join(', '));
      setAvatarKey(response.user.avatarKey || 'fox');
      setLookingFor(response.user.lookingFor || 'prefer_not_say');
      setRelationshipGoal(response.user.relationshipGoal || 'long_term');
      setOccupation(response.user.occupation || '');
      setEducation(response.user.education || '');
      setHeightCm(response.user.heightCm || 170);
      setDrinking(response.user.drinking || 'prefer_not_say');
      setSmoking(response.user.smoking || 'prefer_not_say');
      setReligion(response.user.religion || '');
      setLanguages((response.user.languages || []).join(', '));
      setPrivatePhotosRaw((response.privatePhotos || []).join('\n'));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load profile'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const interestList = interests
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
      const languageList = languages
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

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
        privatePhotos: privatePhotosRaw
          .split('\n')
          .map(item => item.trim())
          .filter(Boolean)
      });
      onUserUpdated(updated);
      window.location.assign('/discover');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save profile'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-shell"><p>Loading your profile...</p></div>;
  }

  return (
    <div className="page-shell">
      <div className="page-head">
        <h1>My Profile</h1>
      </div>
      {details && (
        <div className="trust-panel">
          <AvatarBadge avatarKey={avatarKey} name={name} size={72} />
          <div>
            <p className="muted">{details.email}</p>
            <p className="muted">Edit your details and private photos anytime.</p>
          </div>
        </div>
      )}

      <form className="auth-form" onSubmit={save}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
        <div className="grid-two">
          <input type="number" min={18} max={80} value={age} onChange={e => setAge(Number(e.target.value))} required />
          <select value={gender} onChange={e => setGender(e.target.value)}>
            <option value="man">Man</option>
            <option value="woman">Woman</option>
            <option value="non_binary">Non-binary</option>
            <option value="other">Other</option>
            <option value="prefer_not_say">Prefer not to say</option>
          </select>
        </div>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" required />
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Bio" required />
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
        <div className="grid-two">
          <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="Occupation" required />
          <input value={education} onChange={e => setEducation(e.target.value)} placeholder="Education" required />
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
        <input value={interests} onChange={e => setInterests(e.target.value)} placeholder="Interests (comma separated)" required />
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
        <textarea
          value={privatePhotosRaw}
          onChange={e => setPrivatePhotosRaw(e.target.value)}
          rows={5}
          placeholder="Private photo URLs (one per line)"
        />
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-like" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default MyProfilePage;
