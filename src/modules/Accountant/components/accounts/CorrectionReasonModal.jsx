import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';

const PREDEFINED_REASONS = [
  'Bill/Receipt image is blurry or unreadable',
  'GSTIN is invalid or missing in tax invoice',
  'Amount on bill does not match the entered claim amount',
  'Duplicate bill submitted',
  'Expense exceeds sanctioned per-diem or category limit',
  'Missing vendor name, invoice date or tax breakup',
  'Requires detailed site BOQ itemization'
];

const CorrectionReasonModal = ({ item, type = 'Expense', onClose, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState(PREDEFINED_REASONS[0]);
  const [customNotes, setCustomNotes] = useState('');

  if (!item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Other' ? customNotes : `${selectedReason}${customNotes ? ` - Note: ${customNotes}` : ''}`;
    onSubmit && onSubmit(item, finalReason);
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
      padding: '1.5rem'
    }}>
      <div style={{
        backgroundColor: 'var(--surface-bg)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(239, 68, 68, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Send Back for Correction
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                {type} #{item.id} • {item.projectName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Select Reason for Correction <span style={{ color: '#ef4444' }}>*</span>:
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            >
              {PREDEFINED_REASONS.map((r, idx) => (
                <option key={idx} value={r}>{r}</option>
              ))}
              <option value="Other">Other / Specific Custom Reason...</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Instructions / Message for Site Supervisor ({item.supervisor}) <span style={{ color: '#ef4444' }}>*</span>:
            </label>
            <textarea
              rows={4}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Please upload clear GST tax invoice with signature or submit revised attendance muster."
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontWeight: '600',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '10px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
              }}
            >
              <Send size={16} />
              Send Correction Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CorrectionReasonModal;
