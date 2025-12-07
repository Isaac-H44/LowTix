import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchEventAndTiers() {
      setLoading(true);
      setError(null);

      try {
        const base = import.meta.env.VITE_API_BASE;
        if (!base) {
          throw new Error('VITE_API_BASE is not set in client .env.local');
        }

        const eventRes = await fetch(`${base}/events/${eventId}`, {
          signal: abortController.signal,
        });
        if (!eventRes.ok) {
          throw new Error(`Failed to load event (status ${eventRes.status})`);
        }
        const eventData = await eventRes.json();
        setEvent(eventData);

        const tiersRes = await fetch(
          `${base}/ticket-tiers?event_id=${encodeURIComponent(eventId)}`,
          { signal: abortController.signal }
        );
        if (!tiersRes.ok) {
          throw new Error(`Failed to load ticket tiers (status ${tiersRes.status})`);
        }
        const tiersData = await tiersRes.json();
        setTiers(Array.isArray(tiersData) ? tiersData : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load event details');
        }
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchEventAndTiers();
    }

    return () => abortController.abort();
  }, [eventId]);

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Event Details</h1>
      </header>

      {loading && <p className="text-muted">Loading event...</p>}
      {error && (
        <p className="text-error" role="alert">
          Error: {error}
        </p>
      )}

      {!loading && !error && !event && <p className="text-muted">Event not found.</p>}

      {!loading && !error && event && (
        <div className="card">
          <div className="card-title">{event.name}</div>
          <div className="card-meta">
            {event.city}, {event.state} — {event.venue_name}
          </div>
          <div className="card-row">Starts at: {event.start_datetime}</div>
          {event.description && <div className="card-row">{event.description}</div>}
          <div className="card-row">Minimum price: ${event.min_price}</div>

          <h3 style={{ marginTop: '1rem' }}>Ticket Tiers</h3>
          {tiers.length === 0 && <p className="text-muted">No ticket tiers found.</p>}
          {tiers.length > 0 && (
            <ul className="card-list">
              {tiers.map((tier) => (
                <li key={tier.ticket_tier_id || tier.id} className="card">
                  <div className="card-title">{tier.name}</div>
                  <div className="card-row">
                    Price: ${tier.price} + fee ${tier.fee}
                  </div>
                  <div className="card-row">
                    Remaining: {tier.quantity_total - tier.quantity_sold} / {tier.quantity_total}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="card-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="button"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/signin', { state: { from: { pathname: `/events/${eventId}` } } });
                  return;
                }
                // TODO: implement purchase flow against API
                alert('Purchase flow not yet implemented');
              }}
            >
              Purchase Tickets
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/signin', { state: { from: { pathname: `/events/${eventId}` } } });
                  return;
                }
                // TODO: implement join-queue flow against API
                alert('Join queue flow not yet implemented');
              }}
            >
              Join Queue
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
