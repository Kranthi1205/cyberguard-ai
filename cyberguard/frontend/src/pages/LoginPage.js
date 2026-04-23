import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'center'
    });
  }, []);// eslint-disable-line

  const handleGoogleResponse = async (response) => {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/google', { credential: response.credential });
      if (data.success) login(data.token, data.user);
    } catch (e) {
      setError(e.response?.data?.message || 'Google sign-in failed');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      if (data.success) login(data.token, data.user);
    } catch (e) {
      setError(e.response?.data?.message || 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-container">
      {/* Left panel */}
      <div className="login-left-panel">
        <div style={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <div style={styles.logoTitle}>CyberGuard</div>
        </div>
        
        <div style={styles.tagline}>
          <h1 style={styles.taglineH1}>Security Operations,<br/>Intelligently Automated.</h1>
          <p style={styles.taglineP}>Next-generation autonomous threat detection and incident response powered by advanced agentic AI models.</p>
        </div>

        <div style={styles.stats}>
          <div style={styles.statItem}>
            <div style={styles.statVal}>99.7%</div>
            <div style={styles.statLab}>Detection Accuracy</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statVal}>&lt; 2s</div>
            <div style={styles.statLab}>Response Time</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statVal}>24/7</div>
            <div style={styles.statLab}>Active Monitoring</div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="login-right-panel">
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>{mode === 'login' ? 'Sign in' : 'Create an account'}</h2>
            <p style={styles.formSub}>{mode === 'login' ? 'Welcome back to your dashboard.' : 'Enter your details to get started.'}</p>
          </div>

          {error && <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {mode === 'register' && (
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input className="input" type="text" placeholder="John Doe" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
            )}
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input className="input" type="email" placeholder="name@company.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '12px' }}>
              {loading ? <div className="spinner"></div> : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div style={styles.divider}><span>or continue with</span></div>

          {/* Google Sign-In */}
          {GOOGLE_CLIENT_ID ? (
            <div ref={googleBtnRef} style={{ width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'center' }}></div>
          ) : (
            <div style={styles.googlePlaceholder}>
              <div style={styles.googleNote}>
                Add <code>REACT_APP_GOOGLE_CLIENT_ID</code> to enable Google Sign-In
              </div>
            </div>
          )}

          <div style={styles.switchMode}>
            {mode === 'login' ? (
              <>Don't have an account? <button style={styles.switchBtn} onClick={() => { setMode('register'); setError(''); }}>Sign up</button></>
            ) : (
              <>Already have an account? <button style={styles.switchBtn} onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  logo: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 12,
    position: 'absolute',
    top: 48,
    left: 64
  },
  logoTitle: { 
    fontFamily: 'var(--font-display)', 
    fontSize: 20, 
    fontWeight: 600, 
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em'
  },
  tagline: { 
    marginTop: 64,
    maxWidth: 500 
  },
  taglineH1: { 
    fontFamily: 'var(--font-display)', 
    fontSize: 48, 
    fontWeight: 600, 
    lineHeight: 1.1, 
    color: 'var(--text-primary)', 
    marginBottom: 24,
    letterSpacing: '-0.03em'
  },
  taglineP: { 
    fontSize: 16, 
    color: 'var(--text-secondary)', 
    lineHeight: 1.6, 
  },
  stats: { 
    display: 'flex', 
    gap: 48, 
    marginTop: 64 
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  statVal: { 
    fontFamily: 'var(--font-display)', 
    fontSize: 24, 
    fontWeight: 600, 
    color: 'var(--text-primary)' 
  },
  statLab: { 
    fontSize: 13, 
    color: 'var(--text-muted)', 
    fontWeight: 500 
  },
  formCard: { 
    width: '100%', 
    maxWidth: 380 
  },
  formHeader: { 
    marginBottom: 32,
    textAlign: 'center'
  },
  formTitle: { 
    fontFamily: 'var(--font-display)', 
    fontSize: 28, 
    fontWeight: 600, 
    color: 'var(--text-primary)', 
    letterSpacing: '-0.02em', 
    marginBottom: 8 
  },
  formSub: { 
    fontSize: 14, 
    color: 'var(--text-secondary)' 
  },
  errorBox: {
    display: 'flex', 
    alignItems: 'center', 
    gap: 8, 
    padding: '12px 16px',
    background: 'var(--red-dim)', 
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 6, 
    color: 'var(--red)', 
    fontSize: 13, 
    marginBottom: 24,
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 16 
  },
  field: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 6 
  },
  label: { 
    fontSize: 13, 
    color: 'var(--text-primary)', 
    fontWeight: 500 
  },
  divider: {
    display: 'flex', 
    alignItems: 'center', 
    gap: 16, 
    margin: '24px 0 8px',
    color: 'var(--text-muted)', 
    fontSize: 12,
    '::before': { content: '""', flex: 1, height: 1, background: 'var(--border)' },
    '::after': { content: '""', flex: 1, height: 1, background: 'var(--border)' },
  },
  googlePlaceholder: {
    padding: '12px', 
    border: '1px dashed var(--border-bright)', 
    borderRadius: 6, 
    textAlign: 'center',
    marginTop: '16px'
  },
  googleNote: { 
    fontSize: 13, 
    color: 'var(--text-muted)' 
  },
  switchMode: { 
    textAlign: 'center', 
    marginTop: 32, 
    fontSize: 14, 
    color: 'var(--text-secondary)' 
  },
  switchBtn: {
    background: 'none', 
    border: 'none', 
    color: 'var(--text-primary)', 
    cursor: 'pointer',
    fontFamily: 'var(--font-body)', 
    fontSize: 14, 
    fontWeight: 500, 
    marginLeft: 4
  },
};
