import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Building, 
  CheckCircle2, 
  DollarSign,
  Upload,
  Smartphone
} from 'lucide-react';
const COMPANY_BANK_ACCOUNTS = [
  { id: 'acc_icici', name: 'ICICI Bank Current A/c - 001905004412 (Main Operational)', balance: 1450000 },
  { id: 'acc_hdfc', name: 'HDFC Bank Current A/c - 50200088991122 (Project Disbursal)', balance: 880000 },
  { id: 'acc_sbi', name: 'State Bank of India - 30882199001 (Govt / Escrow)', balance: 2500000 },
  { id: 'acc_petty', name: 'Petty Cash Float (Office Cashier)', balance: 45000 }
];

const PAYMENT_MODES = [
  { id: 'UPI', label: 'UPI / QR Code', icon: Smartphone },
  { id: 'NEFT', label: 'NEFT (Bank Transfer)', icon: Building },
  { id: 'RTGS', label: 'RTGS (Real Time Gross)', icon: Building },
  { id: 'IMPS', label: 'IMPS (Instant Transfer)', icon: CreditCard },
  { id: 'Cash', label: 'Petty Cash / Direct Handover', icon: DollarSign }
];

const RecordPaymentModal = ({ 
  item, 
  type = 'Advance',
  onClose, 
  onSubmit 
}) => {
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [payingAccount, setPayingAccount] = useState(COMPANY_BANK_ACCOUNTS[0]?.id || '');
  const [amount, setAmount] = useState(item?.approvedAmount || item?.amount || item?.difference || 0);
  const [refNumber, setRefNumber] = useState(`UTR/${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [recipientName, setRecipientName] = useState(item?.supervisor || item?.vendorName || '');
  const [notes, setNotes] = useState(`Disbursal for ${item?.id} - ${item?.projectName || ''}`);
  const [proofUploaded, setProofUploaded] = useState(false);

  if (!item) return null;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedBank = COMPANY_BANK_ACCOUNTS.find(b => b.id === payingAccount);
    const paymentData = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      date: paymentDate,
      type: type === 'Advance' ? 'Site Advance Disbursal' : type === 'Settlement' ? 'Site Settlement Payout' : 'Expense Reimbursement',
      projectId: item.projectId,
      projectName: item.projectName,
      paidTo: recipientName,
      amount: Number(amount),
      paymentMode,
      refNumber,
      paidFromAccount: selectedBank?.name || 'Company Account',
      notes,
      proofUploaded
    };

    onSubmit && onSubmit(item, paymentData);
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
        maxWidth: '580px',
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
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <CreditCard size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Record Payment / Disbursal
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0' }}>
                {type} #{item.id} • {item.projectName}
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
            
            {/* Recipient Details */}
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Recipient Details:</span>
                <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0.1rem 0' }}>
                  {recipientName}
                </p>
                {item.bankDetails && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    <span>A/c: {item.bankDetails.accountNo} ({item.bankDetails.bankName})</span>
                    <br />
                    <span>UPI: <strong style={{ color: '#3b82f6' }}>{item.bankDetails.upiId}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Editable Disbursal Amount Field */}
            <div style={{
              padding: '0.9rem 1.1rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(16, 185, 129, 0.06)',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Disbursal Amount (₹) <span style={{ color: '#ef4444' }}>*</span>:
                </label>
                {item?.approvedAmount && Number(amount) !== Number(item.approvedAmount) && (
                  <button
                    type="button"
                    onClick={() => setAmount(item.approvedAmount)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Reset to Sanctioned (₹{Number(item.approvedAmount).toLocaleString('en-IN')})
                  </button>
                )}
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{
                  position: 'absolute',
                  left: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  color: '#10b981'
                }}>
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  placeholder="Enter custom amount..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.2rem',
                    borderRadius: '10px',
                    border: '1.5px solid #10b981',
                    backgroundColor: 'var(--surface-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '1.15rem',
                    fontWeight: '800',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Sanctioned Amount: <strong>₹{Number(item?.approvedAmount || item?.amount || 0).toLocaleString('en-IN')}</strong></span>
                {Number(amount) > Number(item?.approvedAmount || item?.amount || 0) && (
                  <span style={{ color: '#16a34a', fontWeight: '700' }}>
                    +₹{(Number(amount) - Number(item?.approvedAmount || item?.amount || 0)).toLocaleString('en-IN')} Extra Advance
                  </span>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Select Payment Mode <span style={{ color: '#ef4444' }}>*</span>:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {PAYMENT_MODES.map(mode => {
                  const Icon = mode.icon;
                  const isSelected = paymentMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMode(mode.id)}
                      style={{
                        padding: '0.55rem 0.4rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${isSelected ? '#10b981' : 'var(--border-color)'}`,
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--surface-bg)',
                        color: isSelected ? '#10b981' : 'var(--text-primary)',
                        fontWeight: isSelected ? '700' : '500',
                        fontSize: '0.76rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Icon size={16} />
                      {mode.id}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Paid From (Company Source Account) <span style={{ color: '#ef4444' }}>*</span>:
              </label>
              <select
                value={payingAccount}
                onChange={(e) => setPayingAccount(e.target.value)}
                required
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
                {COMPANY_BANK_ACCOUNTS.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Bal: {formatINR(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Transaction Ref / UTR No. <span style={{ color: '#ef4444' }}>*</span>:
                </label>
                <input
                  type="text"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  required
                  placeholder="Enter UTR / Bank Ref"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Payment Execution Date <span style={{ color: '#ef4444' }}>*</span>:
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
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
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <CheckCircle2 size={16} />
              Confirm & Post Payment Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
