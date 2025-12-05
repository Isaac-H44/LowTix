import { useEffect, useState } from 'react';

export function BrowseEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchEvents() {
      setLoading(true);
      setError(null);

      try {
        const base = import.meta.env.VITE_API_BASE;
        if (!base) {
          throw new Error('VITE_API_BASE is not set in client .env.local');
        }

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
          setError(err.message || 'Failed to load events');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();

    return () => abortController.abort();
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Browse Events</h1>
        <p className="page-subtitle">Search &amp; discovery: events from the LowTix API.</p>
      </header>

      {loading && <p className="text-muted">Loading events...</p>}
      {error && (
        <p className="text-error" role="alert">
          Error loading events: {error}
        </p>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="text-muted">No events found.</p>
      )}

      {!loading && !error && events.length > 0 && (
        <ul className="card-list">
          {events.map((event) => (
            <li key={event.event_id || event.id} className="card">
              <div className="card-title">{event.name}</div>
              <div className="card-meta">
                {event.city}, {event.state} — {event.start_datetime}
              </div>
              <div className="card-row">From ${event.min_price}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
