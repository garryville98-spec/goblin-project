import SectionHeader from './SectionHeader.jsx';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserProfile } from '../services/db.js';

function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getUserProfile(user.id)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Goblin Client';
  const initials = displayName
    .split(' ')
    .map((w) => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const profileItems = [
    { label: 'Full name', value: displayName },
    { label: 'Email', value: user?.email || '—' },
    { label: 'Tier', value: 'Gold tier' },
    { label: 'Status', value: 'Verified' },
  ];

  if (loading) {
    return (
      <section className="page user-profile">
        <div className="loading">Loading profile…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page user-profile">
        <div className="error">{error}</div>
      </section>
    );
  }

  return (
    <section className="page user-profile">
      <div className="profile-grid">
        <article className="panel profile-header">
          <div className="avatar">{initials}</div>
          <h2 className="profile-name">{displayName}</h2>
          <div className="profile-badges">
            <span className="verified-badge">
              <span className="verified-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Verified
            </span>
            <span>Whitelisted</span>
            <span>Gold tier</span>
          </div>
        </article>

        <article className="panel profile-details">
          {profileItems.map((item) => (
            <div className="detail-row" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </article>

        <article className="panel">
          <SectionHeader
            eyebrow="Preferences"
            title="Notification controls"
          />
          <label className="toggle-row">
            <span>Email trade alerts</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="toggle-row">
            <span>Launchpad allocation alerts</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="toggle-row">
            <span>Risk liquidation warnings</span>
            <input type="checkbox" defaultChecked />
          </label>
        </article>
      </div>
    </section>
  );
}

export default UserProfile;
