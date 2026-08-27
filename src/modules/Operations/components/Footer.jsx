import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Zap, ShieldCheck, HardHat, PhoneCall } from 'lucide-react';
import logoImg from '../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      marginTop: '2rem',
      fontFamily: "'Cambria', Georgia, serif",
      background: 'var(--card-bg, #ffffff)',
      backgroundColor: 'var(--card-bg, #ffffff)',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '20px',
      padding: '1.25rem 2rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      color: 'var(--text-primary, #0f172a)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      transition: 'all 0.3s ease'
    }}>
      {/* Top Row: Brand Info (Left) + 4 Pill Badges (Right) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.25rem'
      }}>
        {/* Left: Official Logo + Title + Live Dot */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Logo container */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <img 
              src={logoImg} 
              alt="Logo" 
              style={{
                height: '42px',
                width: 'auto',
                maxHeight: '46px',
                objectFit: 'contain',
                display: 'block'
              }} 
            />
          </div>

          <div>
            <div style={{
              fontSize: '1.05rem',
              fontWeight: '800',
              letterSpacing: '-0.01em',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2
            }}>
              ASEMS Operations (SmartOps) Dashboard
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.45rem',
              marginTop: '0.2rem',
              fontSize: '0.78rem',
              color: '#64748b',
              fontWeight: '500'
            }}>
              <span>Site Supervision, Expense Tracking & Project Approval</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#059669',
                fontWeight: '700'
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.7)',
                  display: 'inline-block'
                }}></span>
                Live System Active
              </span>
            </div>
          </div>
        </div>

        {/* Right: 4 Pill Badges (Matching Screenshot) */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.55rem'
        }}>
          {/* Badge 1: Real-Time Telemetry */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#2563eb',
            fontSize: '0.73rem',
            fontWeight: '600'
          }}>
            <Zap size={13} />
            <span>Real-Time Site Analytics</span>
          </div>

          {/* Badge 2: Enterprise Security */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#059669',
            fontSize: '0.73rem',
            fontWeight: '600'
          }}>
            <ShieldCheck size={13} />
            <span>Role-Based Enterprise Security</span>
          </div>

          {/* Badge 3: 24/7 Asset Monitoring */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: '#f5f3ff',
            border: '1px solid #ddd6fe',
            color: '#7c3aed',
            fontSize: '0.73rem',
            fontWeight: '600'
          }}>
            <HardHat size={13} />
            <span>24/7 Field & Expense Audit</span>
          </div>

          {/* Badge 4: Support Helpline */}
          <a
            href="tel:9359604384"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.8rem',
              borderRadius: '9999px',
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
              color: '#ea580c',
              fontSize: '0.73rem',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(234, 88, 12, 0.1)'
            }}
            title="Helpline Support"
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffedd5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff7ed'}
          >
            <PhoneCall size={13} />
            <span>Support: 9359604384</span>
          </a>
        </div>
      </div>

      {/* Decorative Line */}
      <div style={{
        height: '1px',
        width: '100%',
        backgroundColor: '#f1f5f9'
      }} />

      {/* Bottom Row: Copyright + Links + Architected By */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '0.78rem',
        color: '#64748b'
      }}>
        {/* Copyright (Left) */}
        <div style={{ fontWeight: '500' }}>
          © {currentYear} <strong style={{ color: '#0f172a', fontWeight: '700' }}>ASEMS (Aarya Site Expense Management System)</strong>. All rights reserved.
        </div>

        {/* Legal Links (Center) */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1.25rem',
          fontWeight: '500'
        }}>
          <Link to="/terms-conditions" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}>
            Terms & Conditions
          </Link>
          <Link to="/privacy-policy" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}>
            Privacy Policy
          </Link>
          <Link to="/refund-policy" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}>
            Refund Policy
          </Link>
          <Link to="/contact-us" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}>
            Contact Us
          </Link>
          <a href="tel:9359604384" style={{ color: '#ea580c', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <PhoneCall size={12} /> 9359604384
          </a>
        </div>

        {/* Architected Credit (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.76rem' }}>
          <span>Architected by</span>
          <a
            href="https://aaryainnovtech.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#2563eb',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            Aarya Innovtech <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
