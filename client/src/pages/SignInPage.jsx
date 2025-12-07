import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../auth/AuthContext.jsx';

export function SignInPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  async function handleSendLink(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Supabase client not configured in this environment.');
      return;
    }

    if (!email) {
      setError('Enter your email address to receive a sign-in link.');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
      });

      if (signInError) {
        throw signInError;
      }

      setMessage('Check your email for a sign-in link to continue.');
    } catch (err) {
      setError(err.message || 'Failed to send sign-in email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Sign In</h1>
        <p className="page-subtitle">
          Enter your email address and we will send you a one-time sign-in link.
        </p>
      </header>

      {error && (
        <p className="text-error" role="alert">
          {error}
        </p>
      )}
      {message && <p className="text-muted">{message}</p>}

      <form onSubmit={handleSendLink} className="form">
        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Sending link…' : 'Send sign-in link'}
        </button>
      </form>
    </section>
  );
}
