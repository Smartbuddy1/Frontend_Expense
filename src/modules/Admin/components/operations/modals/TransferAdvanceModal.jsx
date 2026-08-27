import React, { useState } from 'react';
import { X, Send, IndianRupee, User, Building2, CreditCard, FileText, Calendar, CheckCircle2 } from 'lucide-react';

export const TransferAdvanceModal = ({
  isOpen,
  onClose,
  onTransfer,
  supervisors = [],
  projects = []
}) => {
  const [supervisorId, setSupervisorId] = useState(supervisors[0]?.id || '');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [refNo, setRefNo] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const selectedSup = supervisors.find(s => s.id === supervisorId) || supervisors[0];
    const selectedProj = projects.find(p => p.id === projectId) || projects[0];

    const transferData = {
      id: `ADV-${Date.now()}`,
      supervisorId: selectedSup?.id,
      supervisorName: selectedSup?.name,
      projectId: selectedProj?.id,
      projectName: selectedProj?.name,
      amount: Number(amount),
      paymentMode,
      refNo: refNo || `TXN${Math.floor(100000 + Math.random() * 900000)}`,
      date: transferDate,
      notes: notes || 'Direct site float advance by Admin',
      timestamp: new Date().toISOString()
    };

    if (onTransfer) {
      onTransfer(transferData);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setAmount('');
      setRefNo('');
      setNotes('');
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'fadeInUp 0.3s ease'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#0f172a',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>Direct Advance Transfer</h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Log advance float transferred to site supervisor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content / Form */}
        {isSuccess ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#065f46', margin: 0 }}>
              Advance Transferred Successfully!
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>
              ₹{Number(amount).toLocaleString('en-IN')} has been added to supervisor's live float balance.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Select Supervisor */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                Select Supervisor *
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={supervisorId}
                  onChange={(e) => setSupervisorId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    fontWeight: '600'
                  }}
                >
                  {supervisors.map(sup => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} ({sup.phone || sup.role || 'Site Lead'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Select Project / Site */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                Assigned Project Site *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: '600'
                }}
              >
                {projects.map(proj => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name} ({proj.location || proj.code || 'Site'})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount & Mode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  Advance Amount (₹) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#64748b' }}>₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '1.05rem',
                      fontWeight: '800',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  Payment Mode *
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <option value="UPI">Google Pay / PhonePe (UPI)</option>
                  <option value="NEFT">Bank NEFT / RTGS</option>
                  <option value="IMPS">Instant IMPS</option>
                  <option value="Cash">Cash at Site</option>
                  <option value="CompanyCard">Company Card</option>
                </select>
              </div>
            </div>

            {/* UTR / Ref No & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  UPI / Bank Ref (UTR No.)
                </label>
                <input
                  type="text"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  placeholder="e.g. UPI-9847294"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  Transfer Date
                </label>
                <input
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                Notes / Purpose
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Weekly labor payment & raw materials advance"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  flex: 1.5,
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
              >
                <Send size={18} />
                Transfer Advance
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TransferAdvanceModal;
