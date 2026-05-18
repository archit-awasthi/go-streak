// src/pages/LoginPage.jsx
import { useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      toast.error('Google sign-in failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    if (!email || !password) { toast.error('Enter email and password'); return; }
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const msg =
        err.code === 'auth/wrong-password'      ? 'Wrong password.' :
        err.code === 'auth/user-not-found'      ? 'No account found.' :
        err.code === 'auth/email-already-in-use'? 'Email already in use.' :
        err.code === 'auth/weak-password'       ? 'Password must be 6+ characters.' :
        'Authentication failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp-root">

      {/* ── LEFT PANEL ── */}
      <div className="lp-left">
        <div className="lp-left__inner">
          <p className="lp-eyebrow">No excuses. No shortcuts.</p>
          <h1 className="lp-headline">
            SHOW UP<br />
            EVERY<br />
            DAMN DAY.
          </h1>
          <div className="lp-brand">
            <span className="lp-brand__dot">●</span>
            <span className="lp-brand__name">GOSTREAK</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="lp-right">
        <div className="lp-form-wrap">

          <div className="lp-form-header">
            <h2 className="lp-form-title">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="lp-form-sub">
              {isSignUp
                ? 'Start building your streak today.'
                : 'Sign in to continue your streak.'}
            </p>
          </div>

          {/* Google */}
          <button
            id="google-signin-btn"
            className="lp-btn-google"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.2 0 5.9 1.1 8.1 2.9l6-6C34.5 3.1 29.6 1 24 1 14.8 1 7 6.5 3.5 14.2l7 5.4C12.2 13.5 17.6 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z"/>
              <path fill="#FBBC05" d="M10.5 28.5c-.5-1.5-.8-3-.8-4.5s.3-3 .8-4.5l-7-5.4C2 17.1 1 20.4 1 24s1 6.9 2.5 9.9l7-5.4z"/>
              <path fill="#34A853" d="M24 47c5.6 0 10.4-1.9 13.8-5.1l-7.4-5.7c-1.9 1.3-4.3 2-6.4 2-6.4 0-11.8-4-13.5-9.7l-7 5.4C7 41.5 14.8 47 24 47z"/>
            </svg>
            Continue with Google
          </button>

          <div className="lp-divider">
            <span>or</span>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="lp-form">
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-email">Email</label>
              <input
                id="lp-email"
                type="email"
                className="lp-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-password">Password</label>
              <input
                id="lp-password"
                type="password"
                className="lp-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>
            <button
              id="email-auth-submit"
              type="submit"
              className="lp-btn-primary"
              disabled={loading}
            >
              {loading ? '...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="lp-toggle">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              className="lp-toggle-btn"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
