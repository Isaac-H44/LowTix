import { useEffect, useState } from 'react';

export function AccountSettingsPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchProfiles() {
      setLoading(true);
      setError(null);

      try {
        const base = import.meta.env.VITE_API_BASE;
        if (!base) {
          throw new Error('VITE_API_BASE is not set in client .env.local');
        }

        const response = await fetch(`${base}/profiles`, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const body = await response.json();
        const items = Array.isArray(body.items) ? body.items : body;
        setProfiles(items);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load account data');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProfiles();

    return () => abortController.abort();
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">
          Placeholder account view powered by profiles from the API. Later this will be scoped to the
          signed-in user.
        </p>
      </header>

      {loading && <p className="text-muted">Loading account data...</p>}
      {error && (
        <p className="text-error" role="alert">
          Error: {error}
        </p>
      )}

      {!loading && !error && profiles.length === 0 && (
        <p className="text-muted">No profiles found.</p>
      )}

      {!loading && !error && profiles.length > 0 && (
        <ul className="card-list">
          {profiles.map((profile) => (
            <li key={profile.user_id} className="card">
              <div className="card-title">{profile.name || 'Unnamed user'}</div>
              <div className="card-meta">Role: {profile.role}</div>
              <div className="card-row">Phone: {profile.phone_number || 'n/a'}</div>
              <div className="card-row">
                Phone verified: {profile.phone_verified ? 'yes' : 'no'} — ID verified:{' '}
                {profile.id_verified ? 'yes' : 'no'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
