import { useEffect, useState } from 'react';

export function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchOrders() {
      setLoading(true);
      setError(null);

      try {
        const base = import.meta.env.VITE_API_BASE;
        if (!base) {
          throw new Error('VITE_API_BASE is not set in client .env.local');
        }

        const response = await fetch(`${base}/orders`, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const body = await response.json();
        const items = Array.isArray(body.items) ? body.items : body;
        setOrders(items);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load orders');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();

    return () => abortController.abort();
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">
          Ticket purchases, statuses, and refund information from the LowTix API.
        </p>
      </header>

      {loading && <p className="text-muted">Loading orders...</p>}
      {error && (
        <p className="text-error" role="alert">
          Error loading orders: {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p className="text-muted">No orders found.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="card-list">
          {orders.map((order) => (
            <li key={order.order_id || order.id} className="card">
              <div className="card-title">Order {order.order_id || order.id}</div>
              <div className="card-meta">Placed: {order.created_at}</div>
              <div className="card-row">Status: {order.status}</div>
              <div className="card-row">Total: ${order.total_price}</div>
              <div className="card-row">Payment: {order.payment_method}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
