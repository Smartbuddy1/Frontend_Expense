import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Users,
  Menu,
  X,
  Sun,
  Moon,
  User,
  ChevronDown,
  LogOut,
  Folder,
  LayoutDashboard,
  CreditCard,
  Activity,
  Phone,
  Shield,
  Bell,
  AlertTriangle,
  Globe,
  Languages,
  Scale,
  IndianRupee,
  TrendingUp
} from 'lucide-react';
import Footer from './Footer';
import AsemsLogo from './AsemsLogo';

const Layout = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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
    {
      name: 'Dashboard',
      href: '/operations?tab=overview',
      icon: LayoutDashboard,
      tab: 'overview',
    },
    {
      name: 'Create & Manage Projects',
      href: '/operations?tab=projects',
      icon: Folder,
      tab: 'projects',
    },
    {
      name: 'Site Supervisors',
      href: '/operations?tab=team',
      icon: Users,
      tab: 'team',
    },
    {
      name: 'Bill Approve',
      href: '/operations?tab=expenses',
      icon: CreditCard,
      tab: 'expenses',
    },
    {
      name: 'Cash & Advance',
      href: '/operations?tab=cashadvance',
      icon: IndianRupee,
      tab: 'cashadvance',
    },
    {
      name: 'Request Advance',
      href: '/operations?tab=reconciliation',
      icon: Scale,
      tab: 'reconciliation',
    },
    {
      name: 'Alerts',
      href: '/operations?tab=alerts',
      icon: AlertTriangle,
      tab: 'alerts',
    },
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
        {/* Logo Section - Exact 60px Height Matching Dashboard Header Line */}
        <div style={{
          height: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0 0.85rem',
          boxSizing: 'border-box',
          width: '100%'
        }}>
          <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              backgroundColor: '#ffffff',
              height: '44px',
              padding: '0.2rem 0.85rem',
              borderRadius: '12px',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '165px',
              boxSizing: 'border-box'
            }}>
              <AsemsLogo size="normal" />
            </div>
          </Link>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="sidebar-nav" style={{ padding: '0.95rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', fontFamily: "'Cambria', Georgia, serif" }}>
          {/* Main Menu Label */}
          <div style={{
            fontFamily: "'Cambria', Georgia, serif",
            fontSize: '0.76rem',
            color: '#64748b',
            fontWeight: '800',
            letterSpacing: '0.08em',
            padding: '0.65rem 0.5rem 0.6rem 0.5rem',
            textTransform: 'uppercase'
          }}>
            MAIN MENU
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem', marginTop: '0.35rem' }}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.includes('/operations')
                ? (location.search.includes(`tab=${item.tab}`) || (!location.search && item.tab === 'overview'))
                : location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.95rem 1.15rem',
                    borderRadius: '14px',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    background: isActive ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)' : 'transparent',
                    textDecoration: 'none',
                    fontFamily: "'Cambria', Georgia, serif",
                    fontSize: '0.95rem',
                    fontWeight: isActive ? '800' : '600',
                    transition: 'all 0.24s ease',
                    boxShadow: isActive ? '0 8px 22px -3px rgba(59, 130, 246, 0.55)' : 'none',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                    whiteSpace: 'normal'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? '#ffffff' : '#94a3b8', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Cambria', Georgia, serif", whiteSpace: 'normal', wordBreak: 'normal', lineHeight: 1.3, flex: 1 }}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Mini Profile Box at bottom of sidebar */}
        <div style={{
          marginTop: 'auto',
          padding: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.65rem',
          fontFamily: "'Cambria', Georgia, serif"
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '0.88rem',
              fontFamily: "'Cambria', Georgia, serif",
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
            }}>
              O
            </div>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontFamily: "'Cambria', Georgia, serif", fontSize: '0.92rem', fontWeight: '800', color: '#ffffff', display: 'block', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Operational
              </span>
              <span style={{ fontFamily: "'Cambria', Georgia, serif", fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginTop: '0.15rem' }}>
                Operations Module
              </span>
            </div>
          </div>

          {/* Logout Action Icon */}
          <button
            onClick={() => setShowLogoutModal(true)}
            title="Logout"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              padding: '0.45rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <header className="top-header">
          <div className="top-header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
            {/* ☰ Clean Borderless Menu Toggle Icon (Only on Mobile) */}
            <button
              className="mobile-hamburger-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary, #1e293b)',
                cursor: 'pointer',
                padding: '0.15rem',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'opacity 0.15s ease'
              }}
              title="Toggle Menu"
            >
              <Menu size={23} strokeWidth={2.2} />
            </button>

            <h1 className="page-title" style={{
              margin: 0,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary, #0f172a)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: 'clamp(0.95rem, 3.8vw, 1.25rem)',
              fontWeight: '800',
              fontFamily: "'Cambria', Georgia, serif"
            }}>
              {location.search.includes('tab=projects')
                ? 'Manage Projects'
                : location.search.includes('tab=team')
                  ? 'Site Supervisors'
                  : location.search.includes('tab=expenses')
                    ? 'Bill Approve'
                    : location.search.includes('tab=cashadvance')
                      ? 'Cash & Advance'
                      : location.search.includes('tab=reconciliation')
                        ? 'Request Advance'
                        : 'Dashboard'}
            </h1>
          </div>

          <div className="top-header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* Dark/Light Moon/Sun Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.2rem',
                transition: 'color 0.2s',
                flexShrink: 0
              }}
              title="Switch Theme"
            >
              {theme === 'light' ? <Moon size={22} strokeWidth={1.8} /> : <Sun size={22} strokeWidth={1.8} />}
            </button>

            {/* Crisp Vertical Divider Line */}
            <div style={{
              width: '1px',
              height: '24px',
              backgroundColor: 'var(--border-color, #94a3b8)',
              margin: '0 0.6rem',
              opacity: 0.8
            }}></div>

            {/* Admin Profile Display (Exact Matching Screenshot) */}
            <div
              ref={profileRef}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              title="Click to view profile / logout"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                position: 'relative',
                userSelect: 'none'
              }}
            >
              <span style={{
                fontSize: '1.05rem',
                fontWeight: '800',
                color: 'var(--text-primary, #0f172a)',
                fontFamily: "'Cambria', Georgia, serif",
                letterSpacing: '-0.01em'
              }}>
                {user?.name ? user.name.split(' ')[0] : (user?.username || 'Admin')}
              </span>

              {/* Blue Circled User Icon */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#dbeafe',
                border: '2px solid #3b82f6',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'transform 0.15s ease'
              }}>
                <User size={20} strokeWidth={2.2} />
              </div>

              {/* Exact Matching Admin Profile Dropdown Modal Card */}
              {isProfileOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 10px)',
                    width: '270px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    animation: 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* 1. Top Blue Header Card */}
                  <div style={{
                    backgroundColor: '#3b82f6',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    padding: '1.75rem 1rem 1.25rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    {/* Big Avatar Circle */}
                    <div style={{
                      width: '58px',
                      height: '58px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.65rem',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <User size={30} style={{ color: '#ffffff' }} />
                    </div>

                    <h3 style={{
                      fontSize: '1.18rem',
                      fontWeight: '900',
                      color: '#ffffff',
                      margin: '0 0 0.35rem 0',
                      letterSpacing: '0.02em'
                    }}>
                      {user?.name || user?.fullName || user?.username || 'Operations Head'}
                    </h3>

                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      letterSpacing: '0.06em',
                      padding: '0.2rem 0.75rem',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(255, 255, 255, 0.22)',
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      {user?.role ? user.role.replace(/_/g, ' ') : 'OPERATIONS HEAD'}
                    </span>
                  </div>

                  {/* 2. Bottom Dark Navy Content Card */}
                  <div style={{
                    backgroundColor: '#111827',
                    padding: '1.15rem 1rem 1rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {/* Section Title */}
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      color: '#9ca3af',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      display: 'block'
                    }}>
                      ACCOUNT & PROJECT DETAILS
                    </span>

                    {/* Box 1: Project / Company */}
                    <div style={{
                      backgroundColor: '#1f2937',
                      borderRadius: '12px',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      border: '1px solid #374151'
                    }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: '#4c1d95',
                        color: '#c084fc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Folder size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#ffffff', display: 'block', lineHeight: 1.2 }}>
                          ASEMS Operations
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginTop: '0.1rem' }}>
                          Aarya Innovtech Pvt. Ltd.
                        </span>
                      </div>
                    </div>

                    {/* Box 3: Security Level / Admin Access */}
                    <div style={{
                      backgroundColor: '#1f2937',
                      borderRadius: '12px',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      border: '1px solid #374151'
                    }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: '#064e3b',
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Shield size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#ffffff', display: 'block', lineHeight: 1.2 }}>
                          Admin Access
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginTop: '0.1rem' }}>
                          Security Level
                        </span>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setShowLogoutModal(true);
                      }}
                      style={{
                        marginTop: '0.35rem',
                        padding: '0.65rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '0.88rem',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <LogOut size={16} />
                      <span>Secure Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 72px)' }}>
          <div style={{ flex: '1 0 auto' }}>
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>

      {/* Matching Secure Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#111827',
              borderRadius: '24px',
              border: '1px solid #374151',
              width: '100%',
              maxWidth: '380px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Top Banner with Red Logout Icon */}
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
                border: '2px solid rgba(255, 255, 255, 0.4)'
              }}>
                <LogOut size={26} style={{ color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#ffffff' }}>
                Confirm Secure Logout
              </h3>
            </div>

            {/* Content & Action Buttons */}
            <div style={{ padding: '1.5rem 1.25rem' }}>
              <p style={{ fontSize: '0.94rem', color: '#9ca3af', textAlign: 'center', margin: '0 0 1.5rem 0', lineHeight: 1.4 }}>
                Are you sure you want to end your active session as <strong style={{ color: '#ffffff' }}>{user?.name || 'Admin'}</strong>?
              </p>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    backgroundColor: '#1f2937',
                    color: '#d1d5db',
                    border: '1px solid #374151',
                    fontSize: '0.92rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutModal(false);
                    handleLogout();
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.92rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
