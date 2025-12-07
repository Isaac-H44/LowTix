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
  const [token, setToken] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  async function handleRequestCode(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Supabase client not configured in this environment.');
      return;
    }

    if (!email) {
      setError('Enter your email address to receive a code.');
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

      setStep('verify');
      setMessage('We emailed you a one-time code. Enter it below to finish signing in.');
    } catch (err) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Supabase client not configured in this environment.');
      return;
    }

    if (!email || !token) {
      setError('Enter your email address and the code you received.');
      return;
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (verifyError) {
        throw verifyError;
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Sign In</h1>
        <p className="page-subtitle">
          Enter your email address to receive a one-time code.
        </p>
      </header>

      {error && (
        <p className="text-error" role="alert">
          {error}
        </p>
      )}
      {message && <p className="text-muted">{message}</p>}

      {step === 'request' && (
        <form onSubmit={handleRequestCode} className="form">
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
            {loading ? 'Sending code…' : 'Send code'}
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifyCode} className="form">
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
          <label className="form-field">
            <span>One-time code</span>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="6-digit code"
              required
            />
          </label>
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & continue'}
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              setStep('request');
              setToken('');
            }}
          >
            Start over
          </button>
        </form>
      )}
    </section>
  );
}
