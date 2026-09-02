import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminApp from './modules/Admin/App';
import AccountantApp from './modules/Accountant/App';
import SupervisorApp from './modules/SiteSupervisor/App';
import OperationsApp from './modules/Operations/App';
import { Smartphone, Lock, Eye, EyeOff, Sun, Moon, AlertCircle, ArrowRight, FileText } from 'lucide-react';
import logoImg from './modules/Admin/assets/logo.png';

// Base path the app is deployed under (e.g. "/" locally, "/expense/" on
// aaryainnovtech.com/expense/) — set at build time via `vite build --base`.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

// Backend roles map straight to the module paths that already exist.
const ROLE_TO_PATH = {
  admin: `${BASE}/admin`,
  operations: `${BASE}/operations`,
  accountant: `${BASE}/accountant`,
  site_supervisor: `${BASE}/supervisor`,
};

function GlobalLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        mobile: username,
        password,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const path = ROLE_TO_PATH[data.user.role];
      if (!path) {
        setError(`Logged in, but no dashboard is set up for role "${data.user.role}" yet.`);
        setLoading(false);
        return;
      }
      window.location.href = path;
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reach the server. Is the backend running?');
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container" style={{ padding: '1rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div className="auth-bg-shape-1"></div>
      <div className="auth-bg-shape-2"></div>

      <button 
        type="button"
        className="auth-theme-toggle"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      
      <div className="auth-card" style={{ width: '100%', maxWidth: '400px', backgroundColor: theme === 'dark' ? 'var(--surface-bg)' : '#ffffff', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08)', zIndex: 10, padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src={logoImg} 
            alt="ASEMS Logo" 
            style={{ 
              height: '80px', 
              width: 'auto',
              maxWidth: '100%',
              margin: '0 auto 1.25rem auto', 
              display: 'block',
              objectFit: 'contain',
              backgroundColor: theme === 'dark' ? '#ffffff' : 'transparent',
              padding: theme === 'dark' ? '8px 16px' : '0',
              borderRadius: theme === 'dark' ? '12px' : '0'
            }} 
          />
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>ASEMS Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Login to access your dashboard</p>
        </div>

        <div>
          {error && (
            <div style={{ backgroundColor: 'var(--bg-danger, rgba(239, 68, 68, 0.1))', borderLeft: '4px solid var(--danger-color, #ef4444)', color: 'var(--danger-color, #ef4444)', padding: '0.6rem 0.85rem', borderRadius: '0 6px 6px 0', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Mobile Number</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Smartphone size={18} className="input-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem', height: '3.25rem', fontSize: '1rem', backgroundColor: 'var(--surface-bg)' }}
                  placeholder="e.g. 9999999999"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Password</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Lock size={18} className="input-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.75rem', height: '3.25rem', fontSize: '1rem', backgroundColor: 'var(--surface-bg)' }}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '3.25rem', fontSize: '1rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? (
                'Logging in...'
              ) : (
                <>
                  Login to Continue
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <a href={`${BASE}/supervisor/expense-form`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
              <FileText size={18} />
              Submit Public Expense Form
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const path = window.location.pathname;

  if (path.startsWith(`${BASE}/admin`)) {
    return <AdminApp />;
  }
  if (path.startsWith(`${BASE}/accountant`)) {
    return <AccountantApp />;
  }
  if (path.startsWith(`${BASE}/supervisor`)) {
    return <SupervisorApp />;
  }
  if (path.startsWith(`${BASE}/operations`)) {
    return <OperationsApp />;
  }

  // Render Global Login Page instead of landing page
  return <GlobalLogin />;
}

export default App;
