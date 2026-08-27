import React, { useState } from 'react';
import { X, CheckCircle2, Calculator } from 'lucide-react';
import { COMPANY_BANK_ACCOUNTS } from '../../data/accountsMockData';

const SettlementModal = ({ settlement, onClose, onSubmit }) => {
  const isRefundDue = settlement?.settlementType === 'REFUND_DUE';
  const [trxRef, setTrxRef] = useState(
    isRefundDue 
      ? `REC-DEP/${Math.floor(100000 + Math.random() * 900000)}` 
      : `SETTL-PAY/${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [mode, setMode] = useState('UPI');
  const [bankAccount, setBankAccount] = useState(COMPANY_BANK_ACCOUNTS[0]?.id || '');
  const [remarks, setRemarks] = useState(
    isRefundDue 
      ? 'Unspent site fund balance reconciled to company bank account. Site ledger closed.' 
      : 'Settled additional vendor liability. Site financial ledger closed.'
  );

  if (!settlement) return null;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(settlement, {
      settlementId: settlement.id,
      paymentMode: mode,
      refNumber: trxRef,
      bankAccount: COMPANY_BANK_ACCOUNTS.find(b => b.id === bankAccount)?.name,
      remarks,
      completedDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1.25rem',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'var(--surface-bg)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: 'min(90vh, 680px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto'
      }}>
        {/* Fixed Header */}
        <div style={{
          padding: '1.2rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isRefundDue ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: isRefundDue ? '#10b981' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <Calculator size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Site Final Settlement & Closure Voucher
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0' }}>
                {settlement.projectName} • Indented by {settlement.supervisor}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', overflowY: 'auto', flex: 1 }}>
            
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Site Advances Disbursed:</span>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{formatINR(settlement.totalAdvanceGiven)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Verified Vendor Invoices:</span>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{formatINR(settlement.totalApprovedExpenses)}</strong>
              </div>

              <div style={{
                borderTop: '1px dashed var(--border-color)',
                paddingTop: '0.65rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isRefundDue ? '#10b981' : '#d97706' }}>
                  {isRefundDue ? '✓ Unspent Site Balance Buffer:' : '⚡ Pending Vendor Invoices Liability:'}
                </span>
                <span style={{
                  fontSize: '1.3rem',
                  fontWeight: '800',
                  color: isRefundDue ? '#10b981' : '#d97706',
                  fontFamily: 'monospace'
                }}>
                  {formatINR(settlement.difference)}
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {isRefundDue ? 'Payment Mode for Refund Deposit:' : 'Disbursal Mode for Excess Expense:'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {['UPI', 'NEFT / RTGS', 'Direct Cash', 'IMPS'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    style={{
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: `1.5px solid ${mode === m ? (isRefundDue ? '#10b981' : '#d97706') : 'var(--border-color)'}`,
                      backgroundColor: mode === m ? (isRefundDue ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)') : 'var(--surface-bg)',
                      color: mode === m ? (isRefundDue ? '#10b981' : '#d97706') : 'var(--text-primary)',
                      fontSize: '0.78rem',
                      fontWeight: mode === m ? '700' : '500',
                      cursor: 'pointer'
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Company Ledger Bank Account:
              </label>
              <select
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {COMPANY_BANK_ACCOUNTS.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {isRefundDue ? 'Deposit Reference / UTR No:' : 'Payment UTR / Ref Number:'}
                </label>
                <input
                  type="text"
                  value={trxRef}
                  onChange={(e) => setTrxRef(e.target.value)}
                  placeholder="e.g. UTR123456789"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Settlement Date:
                </label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Audit Closure Remarks:
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'none'
                }}
              />
            </div>
          </div>

          {/* Fixed Footer */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            backgroundColor: 'var(--surface-bg)',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.2rem',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontWeight: '600',
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '10px',
                backgroundColor: isRefundDue ? '#10b981' : '#d97706',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                boxShadow: isRefundDue ? '0 4px 14px rgba(16, 185, 129, 0.35)' : '0 4px 14px rgba(217, 119, 6, 0.35)'
              }}
            >
              <CheckCircle2 size={16} />
              {isRefundDue ? 'Confirm Refund & Close Site Ledger' : 'Disburse Payout & Close Site Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettlementModal;
