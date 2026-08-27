import React, { useState } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';

const ReceiptViewerModal = ({ expense, onClose, onApprove, onReject }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [activeChecklist, setActiveChecklist] = useState({
    gstMatched: false,
    amountMatched: false,
    itemVerified: false
  });

  if (!expense) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.6));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const allChecked = activeChecklist.amountMatched && activeChecklist.itemVerified;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div style={{
        backgroundColor: 'var(--surface-bg)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(59, 130, 246, 0.04)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
              flexShrink: 0
            }}>
              <FileText size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Vendor Invoice Verification #{expense.id}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0' }}>
                {expense.projectName} • Indented by {expense.supervisor} (Site In-Charge)
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Left Column: Image Preview */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-color)',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--surface-bg)'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Attached Tax Invoice / Vendor Bill
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleZoomIn} style={{ padding: '0.4rem', borderRadius: '6px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} title="Zoom In">
                  <ZoomIn size={16} />
                </button>
                <button onClick={handleZoomOut} style={{ padding: '0.4rem', borderRadius: '6px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} title="Zoom Out">
                  <ZoomOut size={16} />
                </button>
                <button onClick={handleRotate} style={{ padding: '0.4rem', borderRadius: '6px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} title="Rotate">
                  <RotateCw size={16} />
                </button>
              </div>
            </div>

            <div style={{
              flex: 1,
              minHeight: '340px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: '1rem',
              backgroundColor: '#0f172a'
            }}>
              <img
                src={expense.billUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'}
                alt="Bill Receipt"
                style={{
                  maxWidth: '100%',
                  maxHeight: '320px',
                  objectFit: 'contain',
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
              />
            </div>
          </div>

          {/* Right Column: Invoice Details & Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Direct Vendor Invoice Total:</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {formatINR(expense.amount)}
                </div>
              </div>
              <span style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.82rem'
              }}>
                {expense.category}
              </span>
            </div>

            {/* Stage 1 Ops Approval Details */}
            {(() => {
              const approval = expense.opsApproval || expense.dineshApproval || expense.operationsApproval;
              const approverName = approval?.approvedBy || 'Operations Head';
              const approvedAt = approval?.approvedAt || 'Verified on Site';
              const remarks = approval?.remarks || 'Goods received and verified on site.';

              return (
                <div style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}>
                  <ShieldCheck size={22} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#10b981' }}>
                      Stage 1 Verified by {approverName}
                    </strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                      "{remarks}"
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Approved by {approverName} • {approvedAt}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div style={{
              backgroundColor: 'var(--bg-color)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Material / Service Description:</span>
                <p style={{ fontWeight: '600', color: 'var(--text-primary)', margin: '0.1rem 0' }}>{expense.itemDescription}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Direct Payee (Vendor / Contractor):</span>
                  <p style={{ fontWeight: '700', color: '#3b82f6', margin: '0.1rem 0' }}>{expense.vendorName || 'Direct Site Vendor'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>GSTIN / Tax ID:</span>
                  <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'monospace', margin: '0.1rem 0' }}>{expense.vendorGstin || 'Unregistered'}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Bill / Invoice No:</span>
                  <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'monospace', margin: '0.1rem 0' }}>{expense.billNumber || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Site Indenter:</span>
                  <p style={{ fontWeight: '600', color: 'var(--text-primary)', margin: '0.1rem 0' }}>{expense.supervisor}</p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--surface-bg)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
                Accounts Audit & Vendor Payment Checklist:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={activeChecklist.amountMatched}
                    onChange={(e) => setActiveChecklist({ ...activeChecklist, amountMatched: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  <span>Invoice total matches PO / BOQ sanctioned cost ({formatINR(expense.amount)})</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={activeChecklist.itemVerified}
                    onChange={(e) => setActiveChecklist({ ...activeChecklist, itemVerified: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  <span>Goods receipt confirmed on site by Site In-Charge</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={activeChecklist.gstMatched}
                    onChange={(e) => setActiveChecklist({ ...activeChecklist, gstMatched: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  <span>Vendor GSTIN & bank payment credentials verified</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.75rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--surface-bg)',
          flexShrink: 0
        }}>
          <button
            onClick={() => onReject && onReject(expense)}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontWeight: '600',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <AlertTriangle size={17} />
            Send Back for Correction
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontWeight: '600',
                fontSize: '0.86rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              onClick={() => onApprove && onApprove(expense)}
              disabled={!allChecked}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '10px',
                backgroundColor: allChecked ? '#10b981' : 'var(--slate-400)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: allChecked ? 'pointer' : 'not-allowed',
                boxShadow: allChecked ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none'
              }}
            >
              <CheckCircle2 size={17} />
              Approve & Release to Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewerModal;
