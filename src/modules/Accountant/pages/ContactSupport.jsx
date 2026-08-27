import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, Mail, MapPin, ArrowLeft, Clock, MessageSquare, Building2, Headphones } from 'lucide-react';
import PrintFooter from '../components/PrintFooter';

const ContactSupport = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--surface-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 style={{ 
              fontSize: '1.95rem', 
              fontWeight: '800', 
              color: 'var(--text-primary)', 
              margin: 0, 
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-heading)'
            }}>
              Support & Helpdesk
            </h1>
            <p style={{ 
              fontSize: '0.96rem', 
              color: 'var(--text-secondary)', 
              margin: '0.35rem 0 0',
              fontFamily: 'var(--font-sans)',
              fontWeight: '500'
            }}>
              Contact ASEMS engineering, site accounting coordination & technical support desk
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Phone Hotline Card */}
        <div style={{
          backgroundColor: 'var(--surface-bg)',
          borderRadius: '18px',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 6px 14px rgba(249, 115, 22, 0.3)' }}>
            <PhoneCall size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Accounts Direct Hotline
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              For urgent payment verifications & site disbursals
            </p>
          </div>
          <a
            href="tel:9359604384"
            style={{
              fontSize: '1.3rem',
              fontWeight: '800',
              color: '#f97316',
              textDecoration: 'none',
              fontFamily: 'monospace'
            }}
          >
            +91 9359604384
          </a>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Available: Monday – Saturday (9:00 AM – 7:30 PM)</span>
        </div>

        {/* Email Support Card */}
        <div style={{
          backgroundColor: 'var(--surface-bg)',
          borderRadius: '18px',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 6px 14px rgba(59, 130, 246, 0.3)' }}>
            <Mail size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Email Helpdesk
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              Send audit statements & vendor invoice queries
            </p>
          </div>
          <a
            href="mailto:support@aaryainnovtech.com"
            style={{
              fontSize: '1.05rem',
              fontWeight: '700',
              color: '#3b82f6',
              textDecoration: 'none'
            }}
          >
            support@aaryainnovtech.com
          </a>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Typical response within 2 business hours</span>
        </div>

        {/* Corporate Office Card */}
        <div style={{
          backgroundColor: 'var(--surface-bg)',
          borderRadius: '18px',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 6px 14px rgba(16, 185, 129, 0.3)' }}>
            <Building2 size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Head Office
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              Aarya Innovtech Pvt Ltd
            </p>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', margin: 0, lineHeight: '1.5' }}>
            Maharashtra, India
          </p>
        </div>
      </div>

      <PrintFooter />
    </div>
  );
};

export default ContactSupport;
