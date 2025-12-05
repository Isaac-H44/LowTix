import { useEffect, useState } from 'react';

export function FeedPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchRecommended() {
      setLoading(true);
      setError(null);

      try {
        const base = import.meta.env.VITE_API_BASE;
        if (!base) {
          throw new Error('VITE_API_BASE is not set in client .env.local');
        }

        // Placeholder: reuse GET /events as the source of recommendations.
        const response = await fetch(`${base}/events`, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const body = await response.json();
        const items = Array.isArray(body.items) ? body.items : body;
        setEvents(items);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load recommendations');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRecommended();

    return () => abortController.abort();
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">For You</h1>
        <p className="page-subtitle">Recommended events (placeholder powered by GET /events).</p>
      </header>

      {loading && <p className="text-muted">Loading recommendations...</p>}
      {error && (
        <p className="text-error" role="alert">
          Error loading recommendations: {error}
        </p>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="text-muted">No recommended events right now.</p>
      )}

      {!loading && !error && events.length > 0 && (
        <ul className="card-list">
          {events.map((event) => (
            <li key={event.event_id || event.id} className="card">
              <div className="card-title">{event.name}</div>
              <div className="card-meta">
                {event.city}, {event.state}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
