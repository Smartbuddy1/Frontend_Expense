import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminApp from './modules/Admin/App';
import AccountantApp from './modules/Accountant/App';
import SupervisorApp from './modules/SiteSupervisor/App';
import OperationsApp from './modules/Operations/App';
import { Smartphone, Lock, Eye, EyeOff, Sun, Moon, AlertCircle, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import logoImg from './modules/Admin/assets/logo.png';
import { ToastContainer, toast } from './components/Toast';

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Unable to connect to the server. Please check your internet.');
    } else if (error.response.status >= 500) {
      toast.error('Server issue. Please try again later.');
    }
    return Promise.reject(error);
  }
);
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
  const [touched, setTouched] = useState({ username: false, password: false });

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Validation rules
  const isMobileValid = /^[6-9]\d{9}$/.test(username);
  const isPasswordValid = password.length >= 6;

  const handleMobileChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setUsername(cleaned);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username) {
      setError('Please enter your 10-digit mobile number.');
      setTouched({ username: true, password: true });
      return;
    }
    if (!isMobileValid) {
      if (!/^[6-9]/.test(username)) {
        setError('Mobile number must start with 6, 7, 8, or 9.');
      } else {
        setError(`Mobile number must be exactly 10 digits (currently ${username.length}/10).`);
      }
      setTouched(prev => ({ ...prev, username: true }));
      return;
    }
    if (!password || !isPasswordValid) {
      setError(`Password must be at least 6 characters long (currently ${password.length}/6).`);
      setTouched(prev => ({ ...prev, password: true }));
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        mobile: username,
        password,
      });

      localStorage.setItem('expense_token', data.token);
      localStorage.setItem('expense_user', JSON.stringify(data.user));

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
            {/* Mobile Number Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>
                  Mobile Number (Login ID) *
                </label>
                <span style={{ fontSize: '0.75rem', color: isMobileValid ? '#10b981' : (username.length > 0 ? '#f59e0b' : 'var(--text-secondary)'), fontWeight: '600' }}>
                  {username.length}/10 digits
                </span>
              </div>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Smartphone size={18} className="input-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: isMobileValid ? '#10b981' : 'var(--text-secondary)' }} />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength="10"
                  pattern="[6-9][0-9]{9}"
                  className="form-input"
                  style={{
                    paddingLeft: '2.75rem',
                    paddingRight: isMobileValid ? '2.5rem' : '1rem',
                    height: '3.25rem',
                    fontSize: '1rem',
                    backgroundColor: 'var(--surface-bg)',
                    borderColor: isMobileValid 
                      ? '#10b981' 
                      : (touched.username && username.length > 0 ? '#ef4444' : 'var(--border-color)'),
                    transition: 'border-color 0.2s ease',
                  }}
                  placeholder="e.g. 9876543210"
                  value={username}
                  onChange={handleMobileChange}
                  onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
                  required
                />
                {isMobileValid && (
                  <CheckCircle2 size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#10b981' }} />
                )}
              </div>
              {/* Helper / Validation message */}
              {username.length > 0 && !isMobileValid && (
                <p style={{ margin: '0.35rem 0 0 0.2rem', fontSize: '0.75rem', color: '#ef4444', fontWeight: '500' }}>
                  {!/^[6-9]/.test(username) 
                    ? '⚠️ Number must start with 6, 7, 8, or 9' 
                    : `⚠️ Enter ${10 - username.length} more digit${10 - username.length > 1 ? 's' : ''} (exactly 10 digits required)`}
                </p>
              )}
              {isMobileValid && (
                <p style={{ margin: '0.35rem 0 0 0.2rem', fontSize: '0.75rem', color: '#10b981', fontWeight: '500' }}>
                  ✓ Valid 10-digit mobile number
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>
                  Password *
                </label>
                <span style={{ fontSize: '0.75rem', color: isPasswordValid ? '#10b981' : (password.length > 0 ? '#f59e0b' : 'var(--text-secondary)'), fontWeight: '600' }}>
                  {password.length > 0 ? `${password.length} chars (min 6)` : 'min 6 chars'}
                </span>
              </div>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Lock size={18} className="input-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: isPasswordValid ? '#10b981' : 'var(--text-secondary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{
                    paddingLeft: '2.75rem',
                    paddingRight: '2.75rem',
                    height: '3.25rem',
                    fontSize: '1rem',
                    backgroundColor: 'var(--surface-bg)',
                    borderColor: isPasswordValid 
                      ? '#10b981' 
                      : (touched.password && password.length > 0 ? '#ef4444' : 'var(--border-color)'),
                    transition: 'border-color 0.2s ease',
                  }}
                  placeholder="Enter your password (min 6 chars)"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
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
              {/* Password Helper / Validation message */}
              {password.length > 0 && !isPasswordValid && (
                <p style={{ margin: '0.35rem 0 0 0.2rem', fontSize: '0.75rem', color: '#ef4444', fontWeight: '500' }}>
                  ⚠️ Password must be at least 6 characters (need {6 - password.length} more)
                </p>
              )}
              {isPasswordValid && (
                <p style={{ margin: '0.35rem 0 0 0.2rem', fontSize: '0.75rem', color: '#10b981', fontWeight: '500' }}>
                  ✓ Password format valid
                </p>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                height: '3.25rem',
                fontSize: '1rem',
                marginTop: '0.5rem',
                opacity: (!isMobileValid || !isPasswordValid) && (username.length > 0 || password.length > 0) ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
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
