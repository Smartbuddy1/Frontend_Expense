import React, { useState } from 'react';
import { X, CheckCircle2, Wallet } from 'lucide-react';
import { COMPANY_BANK_ACCOUNTS } from '../../data/accountsMockData';

const FundReleaseModal = ({ project, onClose, onSubmit }) => {
  const [releaseAmount, setReleaseAmount] = useState(50000);
  const [sourceAccount, setSourceAccount] = useState(COMPANY_BANK_ACCOUNTS[0]?.id || '');
  const [refNumber, setRefNumber] = useState(`FUND-TRX/${Math.floor(10000 + Math.random() * 90000)}`);
  const [purpose, setPurpose] = useState('Tranche 2 allocation for finishing sanitary fittings');

  if (!project) return null;

  const remainingBudget = (project.budget || 0) - (project.fundsReleased || 0);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!releaseAmount || Number(releaseAmount) <= 0) {
      setErrorMsg('Please enter a valid release amount (minimum ₹1,000).');
      return;
    }
    if (!sourceAccount) {
      setErrorMsg('Please select a source bank account.');
      return;
    }
    if (!refNumber?.trim()) {
      setErrorMsg('Transaction reference number is mandatory.');
      return;
    }
    if (!purpose?.trim()) {
      setErrorMsg('Tranche description / milestone is mandatory.');
      return;
    }
    setErrorMsg('');
    const bank = COMPANY_BANK_ACCOUNTS.find(b => b.id === sourceAccount);
    onSubmit && onSubmit(project, {
      amount: Number(releaseAmount),
      sourceAccount: bank?.name || 'Company Account',
      refNumber: refNumber.trim(),
      purpose: purpose.trim(),
      date: new Date().toISOString().split('T')[0]
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
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <Wallet size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Allocate & Release Project Funds
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0' }}>
                {project.name} ({project.id})
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', overflowY: 'auto', flex: 1 }}>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Total Sanctioned:</span>
                <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.15rem 0 0', fontFamily: 'monospace' }}>
                  {formatINR(project.budget)}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Already Released:</span>
                <p style={{ fontSize: '0.9rem', fontWeight: '800', color: '#10b981', margin: '0.15rem 0 0', fontFamily: 'monospace' }}>
                  {formatINR(project.fundsReleased)}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Remaining Buffer:</span>
                <p style={{ fontSize: '0.9rem', fontWeight: '800', color: '#3b82f6', margin: '0.15rem 0 0', fontFamily: 'monospace' }}>
                  {formatINR(remainingBudget)}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: '700'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Release Amount (INR ₹) <span style={{ color: '#ef4444' }}>*</span>:
              </label>
              <input
                type="number"
                min={1000}
                max={remainingBudget > 0 ? remainingBudget : 500000}
                value={releaseAmount}
                onChange={(e) => setReleaseAmount(e.target.value)}
                required
                placeholder="Enter release amount (minimum ₹1,000)"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: `1px solid ${!releaseAmount || Number(releaseAmount) <= 0 ? '#ef4444' : 'var(--border-color)'}`,
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {(!releaseAmount || Number(releaseAmount) <= 0) && (
                <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.2rem', display: 'block', fontWeight: '600' }}>
                  Release amount is mandatory (min ₹1,000)
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Source Bank Account <span style={{ color: '#ef4444' }}>*</span>:
              </label>
              <select
                value={sourceAccount}
                onChange={(e) => setSourceAccount(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: `1px solid ${!sourceAccount ? '#ef4444' : 'var(--border-color)'}`,
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="" disabled>-- Select Source Bank Account * --</option>
                {COMPANY_BANK_ACCOUNTS.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Available: {formatINR(acc.balance)})
                  </option>
                ))}
              </select>
              {!sourceAccount && (
                <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.2rem', display: 'block', fontWeight: '600' }}>
                  Source bank account is mandatory
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Transaction Reference / Authority Order <span style={{ color: '#ef4444' }}>*</span>:
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                required
                placeholder="e.g. FUND-TRX/85070 or RTGS UTR"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: `1px solid ${!refNumber?.trim() ? '#ef4444' : 'var(--border-color)'}`,
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {!refNumber?.trim() && (
                <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.2rem', display: 'block', fontWeight: '600' }}>
                  Transaction reference is mandatory
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Tranche Description / Milestone <span style={{ color: '#ef4444' }}>*</span>:
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                placeholder="e.g. Tranche 2 allocation for finishing sanitary fittings"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: `1px solid ${!purpose?.trim() ? '#ef4444' : 'var(--border-color)'}`,
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {!purpose?.trim() && (
                <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '0.2rem', display: 'block', fontWeight: '600' }}>
                  Tranche description / milestone is mandatory
                </span>
              )}
            </div>
          </div>

          {/* Fixed Footer Buttons */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--surface-bg)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
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
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
              }}
            >
              <CheckCircle2 size={16} />
              Approve & Release Fund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FundReleaseModal;
