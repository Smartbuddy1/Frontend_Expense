import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Folder, Monitor, LogOut, FileText, Sun, Moon, Settings, User, Phone, Shield, Menu, Activity, PieChart, Tag, ClipboardList, Radio, Wallet } from 'lucide-react';
import Footer from './Footer';
import aiLogo from '../assets/ai_logo.jpg';

const Layout = () => {
  const { user, logout } = useAuth();
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

  // Close sidebar on route change or search param change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname, location.search]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Only real, backend-connected screens are in the nav for launch — the rest
  // (Expense Verification/Wallet Funds/Budget/Advances/Ledger/Settlements/
  // Analytics/Reports) still run on sample data (see docs/03-frontend-status.md)
  // and are hidden so nobody mistakes them for working. Their code is
  // untouched; just re-add here once they're wired to the real API.
  const navigation = [
    { name: 'Live Payments ⚡', href: '/dashboard?tab=live-payments', icon: Shield, tabKey: 'live-payments' },
    { name: 'Dashboard', href: '/dashboard?tab=overview', icon: LayoutDashboard, tabKey: 'overview' },
  ];

  const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';
  const activeNavItem = navigation.find(n => n.tabKey === currentTab) || navigation[0];

  return (
    <div className="app-layout">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={aiLogo} 
            alt="Aarya Innovtech Logo" 
            style={{
              width: '100%',
              maxWidth: '220px',
              height: 'auto',
              maxHeight: '68px',
              objectFit: 'contain',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              padding: '6px 12px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
            }} 
          />
        </div>
        
        <div className="sidebar-nav">
          <div className="sidebar-nav-title">MAIN MENU</div>
          <nav>
            {navigation.map((item) => {
              const isActive = (item.tabKey === currentTab);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon className="sidebar-link-icon" size={18} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      minWidth: '22px',
                      height: '22px',
                      padding: '0 0.35rem',
                      borderRadius: '11px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : (item.badgeColor || '#3b82f6'),
                      color: '#ffffff',
                      marginLeft: '0.5rem',
                      lineHeight: '1'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.logo ? (
                <img src={user?.logo?.startsWith('http') ? user.logo : `${import.meta.env.VITE_SERVER_URL}${user.logo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'white' }} />
              ) : (
                (user?.name || user?.username || user?.mobile || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name || user?.username || user?.mobile}</p>
              <p className="user-role">{user?.role || 'Accountant'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '2rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="hamburger-menu"
              onClick={() => setIsSidebarOpen(true)}
              style={{ display: 'none', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}
            >
              <Menu size={24} />
            </button>
            <h1 className="page-title">
              {activeNavItem.name}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={toggleTheme} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--slate-400)', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={`Switch Theme`}
            >
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button>
            
            <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--slate-600)' }}></div>
            
            <div 
              ref={profileRef}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', position: 'relative' }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>
                {user?.name || user?.username || 'User'}
              </span>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', 
                backgroundColor: 'var(--slate-200)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--primary-color)'
              }}>
                {user?.logo ? (
                  <img src={user?.logo?.startsWith('http') ? user.logo : `${import.meta.env.VITE_SERVER_URL}${user.logo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'white' }} />
                ) : (
                  <User size={24} color="var(--slate-600)" />
                )}
              </div>

              {/* PROFILE DROPDOWN CARD */}
              {isProfileOpen && (
                <div style={{ 
                  position: 'absolute', top: '50px', right: '0', width: '320px', 
                  backgroundColor: 'var(--surface-bg)', borderRadius: '12px', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', overflow: 'hidden', zIndex: 1000,
                  border: '1px solid var(--border-color)'
                }}>
                  {/* Top Blue Section */}
                  <div style={{ backgroundColor: '#3b82f6', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                      width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#cbd5e1', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
                      border: '3px solid rgba(255,255,255,0.4)', overflow: 'hidden'
                    }}>
                      {user?.logo ? (
                        <img src={user?.logo?.startsWith('http') ? user.logo : `${import.meta.env.VITE_SERVER_URL}${user.logo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'white' }} />
                      ) : (
                        <User size={40} color="#475569" />
                      )}
                    </div>
                    <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                      {(user?.name || user?.username || 'User').toUpperCase()}
                    </h3>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', padding: '0.2rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {(user?.role || 'User').toUpperCase()}
                    </span>
                  </div>

                  {/* Middle Dark Section */}
                  <div style={{ backgroundColor: '#1e293b', padding: '1.5rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '1px' }}>ACCOUNT DETAILS</p>
                    
                    <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                        <Phone size={18} color="#3b82f6" />
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.1rem' }}>{user?.mobile || 'N/A'}</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>User ID / Mobile</p>
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                        <Shield size={18} color="#10b981" />
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.1rem' }}>{user?.role} Access</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Security Level</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Logout Section */}
                  <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'center' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      <LogOut size={18} /> Secure Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
          <div style={{ flex: '1 0 auto' }}>
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Layout;
