import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsConditions = () => {
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
          Terms and Conditions
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
            1. Introduction
          </h2>
          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-secondary, #475569)',
            lineHeight: '1.75',
            margin: 0
          }}>
            Welcome to ASEMS (Aarya Site Expense Management System). By accessing and using our site accounts portal, advance disbursal workflows, and expenditure verification systems ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. This portal is maintained for authorized financial personnel of Aarya Innovtech Pvt Ltd.
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
            2. Scope of Accounts & Financial Operations
          </h2>
          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-secondary, #475569)',
            lineHeight: '1.75',
            margin: 0
          }}>
            The ASEMS Accounts Portal facilitates the verification, auditing, and disbursal of project site expenses, vendor invoices, material advances, and subcontractor claims. Users with Accounts roles are responsible for ensuring that all financial entries match authorized project budgets, verified site attendance rolls, and tax compliance guidelines.
          </p>
        </div>

        {/* Section 3 */}
        <div style={{ marginBottom: '2.25rem' }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--text-primary, #0f172a)',
            margin: '0 0 0.85rem 0'
          }}>
            3. Payments, Disbursals & Banking Rails
          </h2>
          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-secondary, #475569)',
            lineHeight: '1.75',
            margin: 0
          }}>
            All advance and vendor disbursements must be routed exclusively through approved corporate banking channels (NEFT, RTGS, IMPS, or official UPI QR codes). Cash transactions must remain strictly within authorized site per-diem limits. Every payment record must include an authentic Bank Transaction Reference (UTR) number to maintain an irreversible financial audit log.
          </p>
        </div>

        {/* Section 4 */}
        <div style={{ marginBottom: '2.25rem' }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--text-primary, #0f172a)',
            margin: '0 0 0.85rem 0'
          }}>
            4. Vendor Invoice & Tax Verification Standards
          </h2>
          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-secondary, #475569)',
            lineHeight: '1.75',
            margin: 0
          }}>
            Procurement claims must be accompanied by legible tax invoices with valid GSTIN details where statutory requirements apply. Accounts Executives reserve the right to reject or request corrections for duplicate invoices, unreadable receipts, incorrect tax calculations, or expenses exceeding sanctioned BOQ (Bill of Quantities) category caps.
          </p>
        </div>

        {/* Section 5 */}
        <div style={{ marginBottom: '2.25rem' }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--text-primary, #0f172a)',
            margin: '0 0 0.85rem 0'
          }}>
            5. Project BOQ Limits & Fund Allocations
          </h2>
          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-secondary, #475569)',
            lineHeight: '1.75',
            margin: 0
          }}>
            Fund releases for each installation project are constrained by the approved project budget. Any allocation that causes an expenditure overrun requires prior written authorization from senior management. Project balances are monitored in real time to ensure liquidity and project completion.
          </p>
        </div>

        {/* Section 6 */}
        <div style={{ marginBottom: '2.25rem' }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--text-primary, #0f172a)',
            margin: '0 0 0.85rem 0'
          }}>
            6. Confidentiality & User Account Security
          </h2>
          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-secondary, #475569)',
            lineHeight: '1.75',
            margin: 0
          }}>
            Accounts portal credentials, OTP tokens, contractor tariffs, and banking statements must be kept confidential. Users must not share access credentials or leave unattended authenticated sessions. Unauthorized data export or external disclosure of financial logs is strictly prohibited.
          </p>
        </div>

        {/* Section 7 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--text-primary, #0f172a)',
            margin: '0 0 0.85rem 0'
          }}>
            7. Contact & Audit Support
          </h2>
          <p style={{
            fontSize: '0.94rem',
            color: 'var(--text-secondary, #475569)',
            lineHeight: '1.75',
            margin: 0
          }}>
            For questions regarding accounting policies, statutory GST compliance, or technical support with ASEMS, please reach out to the Accounts & Finance Department at <strong>support@aaryainnovtech.com</strong> or call the accounts helpdesk at <strong>+91 9359604384</strong>.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TermsConditions;
