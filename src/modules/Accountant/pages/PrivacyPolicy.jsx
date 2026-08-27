import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100%',
      padding: '1.5rem 1rem 4rem 1rem',
      boxSizing: 'border-box'
    }}>
      {/* Top Left Navigation Back Button */}
      <div style={{ maxWidth: '880px', margin: '0 auto 1.5rem auto' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#3b82f6',
            fontSize: '0.95rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            padding: '0.4rem 0',
            transition: 'opacity 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>

      {/* Main Document Card Container */}
      <div style={{
        maxWidth: '880px',
        margin: '0 auto',
        backgroundColor: 'var(--surface-bg, #ffffff)',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 4px 25px rgba(0, 0, 0, 0.04)',
        padding: '3rem 3.5rem',
        boxSizing: 'border-box'
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: '800',
          color: 'var(--text-primary, #0f172a)',
          margin: '0 0 1.25rem 0',
          letterSpacing: '-0.02em',
          fontFamily: 'var(--font-heading)'
        }}>
          Privacy Policy
        </h1>

        {/* Divider Line */}
        <div style={{
          height: '1px',
          backgroundColor: 'var(--border-color, #e2e8f0)',
          margin: '0 0 1.75rem 0'
        }} />

        {/* Last Updated Date */}
        <p style={{
          fontSize: '0.88rem',
          color: 'var(--text-secondary, #64748b)',
          margin: '0 0 2.25rem 0',
          fontWeight: '500'
        }}>
          Last updated: {new Date().toLocaleDateString('en-US')}
        </p>

        {/* Section 1 */}
        <div style={{ marginBottom: '2.25rem' }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--text-primary, #0f172a)',
            margin: '0 0 0.85rem 0'
          }}>
            1. Information We Collect
          </h2>
          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-secondary, #475569)',
            lineHeight: '1.75',
            margin: 0
          }}>
            ASEMS collects financial transaction logs, verified vendor invoices, contractor identity information, supervisor contact numbers, bank account numbers, and UPI details strictly for managing site expenses, advance disbursements, and audit trails.
          </p>
        </div>

        {/* Section 2 */}
        <div style={{ marginBottom: '2.25rem' }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--text-primary, #0f172a)',
            margin: '0 0 0.85rem 0'
          }}>
            2. Banking & Financial Data Protection
          </h2>
          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-secondary, #475569)',
            lineHeight: '1.75',
            margin: 0
          }}>
            All banking records, IFSC codes, transaction references (UTR), and disbursement vouchers are encrypted using enterprise industry standards. Financial data is never shared with third parties except authorized banking partners and statutory auditing authorities.
          </p>
        </div>

        {/* Section 3 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--text-primary, #0f172a)',
            margin: '0 0 0.85rem 0'
          }}>
            3. Audit Trail & Log Retention
          </h2>
          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-secondary, #475569)',
            lineHeight: '1.75',
            margin: 0
          }}>
            In compliance with accounting standards and corporate governance, transaction vouchers and verification audit logs are retained for statutory retention periods to ensure transparency and accountability.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
