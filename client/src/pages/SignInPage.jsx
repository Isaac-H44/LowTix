import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../auth/AuthContext.jsx';

export function SignInPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (isAuthenticated) {
    // Already signed in; go back to where user came from
    navigate(from, { replace: true });
  }

  async function handleRequestCode(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Supabase client not configured in this environment.');
      return;
    }

    if (!phone) {
      setError('Enter your mobile number to receive a code.');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: 'sms',
        },
      });

      if (signInError) {
        throw signInError;
      }

      setStep('verify');
      setMessage('We sent a 6-digit code to your phone. Enter it below to finish signing in.');
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

    if (!phone || !token) {
      setError('Enter the phone number and the code you received.');
      return;
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (verifyError) {
        throw verifyError;
      }

      // AuthContext listener will pick up the new session; navigate back
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
          Enter your mobile number and a one-time code to continue.
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
            <span>Mobile number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 123 4567"
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
            <span>Mobile number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 123 4567"
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
