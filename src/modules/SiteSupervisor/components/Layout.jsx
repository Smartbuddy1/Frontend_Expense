import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  Building2, 
  Banknote, 
  ReceiptText, 
  UploadCloud, 
  Wallet, 
  LogOut, 
  Sun, 
  Moon, 
  User, 
  Phone, 
  Shield, 
  Menu,
  HardHat,
  Globe
} from 'lucide-react';
import Footer from './Footer';

const Layout = () => {
  const { user, logout } = useAuth();
  const { walletBalance } = useWallet();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    window.location.href = import.meta.env.BASE_URL;
  };

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('assignedProjects'), href: '/assigned-projects', icon: Building2 },
    { name: t('requestAdvance'), href: '/request-advance', icon: Banknote },
    { name: t('dailyExpenses'), href: '/daily-expenses', icon: ReceiptText },
    { name: t('balanceSettlement'), href: '/balance-settlement', icon: Wallet },
  ];

  return (
    <div className="app-layout">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', minHeight: '68px', height: 'auto' }}>
          <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, textDecoration: 'none' }}>
            <div style={{
              background: '#ffffff',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '165px',
              height: '48px',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.25)',
              transition: 'transform 0.2s ease',
              boxSizing: 'border-box'
            }}>
              <img 
                src="/company_logo.png" 
                alt="AI - Ideas engineered into reality" 
                style={{ 
                  maxHeight: '40px', 
                  maxWidth: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block'
                }} 
              />
            </div>
          </Link>
          {/* Mobile Close Drawer Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="sidebar-close-btn"
            title="Close Menu"
          >
            ✕
          </button>
        </div>
        
        <div className="sidebar-nav">
          <div className="sidebar-nav-title">Main Menu</div>
          <nav>
            {navigation.map((item) => {
              if (item.roles && !item.roles.includes(user?.role)) return null;
              
              const isActive = location.pathname.startsWith(item.href);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="sidebar-link-icon" size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer" style={{ padding: '0.85rem 1rem', background: 'rgba(2, 6, 23, 0.65)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div className="user-avatar" style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: '800', 
              fontSize: '0.95rem',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)'
            }}>
              {user?.logo ? (
                <img src={user?.logo?.startsWith('http') ? user.logo : `${import.meta.env.VITE_SERVER_URL}${user.logo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                'S'
              )}
            </div>
            <div className="user-details" style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <p className="user-name" style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#f8fafc', whiteSpace: 'nowrap' }}>
                {language === 'mr' ? 'साइट सुपरवायझर' : language === 'hi' ? 'साइट सुपरवाइजर' : 'Site Supervisor'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="logout-btn" 
            title={language === 'mr' ? 'लॉगआउट' : language === 'hi' ? 'लॉगआउट' : 'Logout'}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              padding: '0.45rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <button 
              className="hamburger-menu"
              onClick={() => setIsSidebarOpen(true)}
              title="Open Navigation"
            >
              <Menu size={22} />
            </button>
            <h1 className="page-title" style={{ margin: 0, fontWeight: '800' }}>
              {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Dashboard'}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* Live Supervisor Wallet Balance Badge */}
            <div 
              onClick={() => navigate('/balance-settlement')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.18) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '0.3rem 0.65rem',
                borderRadius: '0.65rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.2s ease',
              }}
              title="Site Supervisor Available Wallet Balance - Click to view Passbook"
            >
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: '#10b981',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(16, 185, 129, 0.4)',
                flexShrink: 0
              }}>
                <Wallet size={14} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="wallet-badge-label" style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1 }}>
                  Wallet
                </span>
                <span style={{ fontSize: '0.925rem', fontWeight: '800', color: '#10b981', lineHeight: 1.1 }}>
                  ₹{walletBalance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Language Switcher Pill Toggle (मराठी | English) */}
            <button
              onClick={toggleLanguage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '0.65rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                fontWeight: '800',
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px -1px var(--shadow-color)',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title="भाषा बदला / Switch Language / भाषा बदलें"
            >
              <Globe size={14} color="#3b82f6" />
              <span style={{ color: language === 'mr' ? '#3b82f6' : 'var(--text-secondary)' }}>मराठी</span>
              <span style={{ color: 'var(--slate-400)', fontSize: '0.65rem' }}>|</span>
              <span style={{ color: language === 'en' ? '#3b82f6' : 'var(--text-secondary)' }}>ENG</span>
              <span style={{ color: 'var(--slate-400)', fontSize: '0.65rem' }}>|</span>
              <span style={{ color: language === 'hi' ? '#3b82f6' : 'var(--text-secondary)' }}>हिं</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--slate-400)', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.3rem',
                flexShrink: 0
              }}
              title={`Switch Theme`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {/* User Profile */}
            <div 
              ref={profileRef}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <span className="user-name-header" style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                {user?.name || user?.username || 'User'}
              </span>
              <div style={{ 
                width: '34px', height: '34px', borderRadius: '50%', 
                backgroundColor: 'var(--slate-200)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--primary-color)',
                flexShrink: 0
              }}>
                {user?.logo ? (
                  <img src={user?.logo?.startsWith('http') ? user.logo : `${import.meta.env.VITE_SERVER_URL}${user.logo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'white' }} />
                ) : (
                  <User size={20} color="var(--slate-600)" />
                )}
              </div>

              {/* PROFILE DROPDOWN CARD */}
              {isProfileOpen && (
                <div style={{ 
                  position: 'absolute', top: '46px', right: '0', width: '300px', maxWidth: 'calc(100vw - 1.5rem)',
                  backgroundColor: 'var(--surface-bg)', borderRadius: '12px', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', overflow: 'hidden', zIndex: 1200,
                  border: '1px solid var(--border-color)'
                }}>
                  {/* Top Blue Section */}
                  <div style={{ backgroundColor: '#3b82f6', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                      width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#cbd5e1', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem',
                      border: '3px solid rgba(255,255,255,0.4)', overflow: 'hidden'
                    }}>
                      {user?.logo ? (
                        <img src={user?.logo?.startsWith('http') ? user.logo : `${import.meta.env.VITE_SERVER_URL}${user.logo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'white' }} />
                      ) : (
                        <User size={34} color="#475569" />
                      )}
                    </div>
                    <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.35rem', letterSpacing: '0.5px' }}>
                      {(user?.name || user?.username || 'User').toUpperCase()}
                    </h3>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', padding: '0.15rem 0.85rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                      {(user?.role || 'User').toUpperCase()}
                    </span>
                  </div>

                  {/* Middle Dark Section */}
                  <div style={{ backgroundColor: '#1e293b', padding: '1.25rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '0.75rem', letterSpacing: '1px' }}>ACCOUNT DETAILS</p>
                    
                    <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
                      <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '0.45rem', borderRadius: '50%' }}>
                        <Phone size={16} color="#3b82f6" />
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.1rem' }}>{user?.mobile || 'N/A'}</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>User ID / Mobile</p>
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '0.45rem', borderRadius: '50%' }}>
                        <Shield size={16} color="#10b981" />
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.1rem' }}>{user?.role} Access</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Security Level</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Logout Section */}
                  <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'center' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.925rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      <LogOut size={16} /> Secure Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ flex: '1 0 auto', width: '100%' }}>
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Layout;
