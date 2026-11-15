import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Lock, Briefcase, Building, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

const CreateAccountantModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingAccountant = null 
}) => {
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Senior Accountant & Auditor',
    branch: 'Head Office - Pune',
    status: 'Active'
  });

  useEffect(() => {
    setFormError('');
    if (editingAccountant) {
      setFormData({
        id: editingAccountant.id,
        name: editingAccountant.name || '',
        phone: editingAccountant.phone || editingAccountant.mobile || '',
        email: editingAccountant.email || '',
        password: '',
        role: editingAccountant.role || 'Senior Accountant & Auditor',
        branch: editingAccountant.branch || 'Head Office - Pune',
        status: editingAccountant.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        role: 'Senior Accountant & Auditor',
        branch: 'Head Office - Pune',
        status: 'Active'
      });
    }
  }, [editingAccountant, isOpen]);

  if (!isOpen) return null;

  const isEdit = Boolean(editingAccountant);
  const cleanPhone = (formData.phone || '').replace(/\D/g, '').slice(0, 10);
  const isPhoneValid = /^[6-9]\d{9}$/.test(cleanPhone);
  const isPasswordValid = isEdit 
    ? (!formData.password || formData.password.length >= 6) 
    : (Boolean(formData.password) && formData.password.length >= 6);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Accountant Name and Email Address are required.');
      return;
    }

    if (!isPhoneValid) {
      if (!/^[6-9]/.test(cleanPhone)) {
        setFormError('Mobile Number must start with 6, 7, 8, or 9.');
      } else {
        setFormError(`Mobile Number must be exactly 10 digits (currently ${cleanPhone.length}/10).`);
      }
      return;
    }

    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      setFormError(`Password is required and must be at least 6 characters long (currently ${formData.password?.length || 0}/6).`);
      return;
    }

    if (isEdit && formData.password && formData.password.length < 6) {
      setFormError('New password must be at least 6 characters long.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      phone: cleanPhone,
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
      branch: formData.branch,
      status: formData.status
    };

    if (editingAccountant) {
      payload.id = editingAccountant.id;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '18px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.4rem 1.85rem',
          borderBottom: '1.5px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--card-bg, #ffffff)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              {editingAccountant ? 'Edit Accountant Profile' : 'Add New Accountant'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary, #64748b)', margin: '0.25rem 0 0 0' }}>
              Register accounts executive for site bills auditing, vouchers & disbursements
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #64748b)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.85rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          
          {/* Validation Error Banner */}
          {formError && (
            <div style={{
              backgroundColor: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              color: '#ef4444',
              padding: '0.65rem 0.9rem',
              borderRadius: '0 8px 8px 0',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600'
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{formError}</span>
            </div>
          )}

          {/* Row 1: Full Name * & Phone * */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: '700', color: 'var(--text-primary, #1e293b)', marginBottom: '0.45rem' }}>
                Accountant Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kulkarni"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formError) setFormError('');
                }}
                style={{
                  width: '100%',
                  padding: '0.78rem 1.05rem',
                  borderRadius: '11px',
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  fontSize: '0.96rem',
                  color: 'var(--text-primary, #0f172a)',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label style={{ fontSize: '0.94rem', fontWeight: '700', color: 'var(--text-primary, #1e293b)', margin: 0 }}>
                  Mobile Number (Login ID) *
                </label>
                <span style={{ fontSize: '0.75rem', color: isPhoneValid ? '#10b981' : (cleanPhone.length > 0 ? '#f59e0b' : '#94a3b8'), fontWeight: '700' }}>
                  {cleanPhone.length}/10
                </span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                required
                maxLength="10"
                pattern="[6-9][0-9]{9}"
                placeholder="e.g. 9876543210 (10 digits)"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone: val });
                  if (formError) setFormError('');
                }}
                style={{
                  width: '100%',
                  padding: '0.78rem 1.05rem',
                  borderRadius: '11px',
                  border: `1.5px solid ${isPhoneValid ? '#10b981' : (cleanPhone.length > 0 ? '#ef4444' : 'var(--border-color, #cbd5e1)')}`,
                  fontSize: '0.96rem',
                  color: 'var(--text-primary, #0f172a)',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {cleanPhone.length > 0 && !isPhoneValid && (
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#ef4444', fontWeight: '500' }}>
                  {!/^[6-9]/.test(cleanPhone) 
                    ? '⚠️ Must start with 6, 7, 8, or 9' 
                    : `⚠️ Need ${10 - cleanPhone.length} more digit${10 - cleanPhone.length > 1 ? 's' : ''}`}
                </p>
              )}
              {isPhoneValid && (
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#10b981', fontWeight: '500' }}>
                  ✓ Valid 10-digit mobile number
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Email Address * & Password * */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: '700', color: 'var(--text-primary, #1e293b)', marginBottom: '0.45rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. accounts@aaryainnovtech.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (formError) setFormError('');
                }}
                style={{
                  width: '100%',
                  padding: '0.78rem 1.05rem',
                  borderRadius: '11px',
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  fontSize: '0.96rem',
                  color: 'var(--text-primary, #0f172a)',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label style={{ fontSize: '0.94rem', fontWeight: '700', color: 'var(--text-primary, #1e293b)', margin: 0 }}>
                  Password {isEdit ? '(Leave blank to keep current)' : '*'}
                </label>
                <span style={{ fontSize: '0.75rem', color: isPasswordValid ? '#10b981' : (formData.password ? '#f59e0b' : '#94a3b8'), fontWeight: '700' }}>
                  {formData.password ? `${formData.password.length} chars (min 6)` : 'min 6 chars'}
                </span>
              </div>
              <input
                type="password"
                required={!isEdit}
                placeholder={isEdit ? "Enter new password or leave blank" : "Enter password (min 6 chars)"}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (formError) setFormError('');
                }}
                style={{
                  width: '100%',
                  padding: '0.78rem 1.05rem',
                  borderRadius: '11px',
                  border: `1.5px solid ${formData.password ? (formData.password.length >= 6 ? '#10b981' : '#ef4444') : 'var(--border-color, #cbd5e1)'}`,
                  fontSize: '0.96rem',
                  color: 'var(--text-primary, #0f172a)',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {formData.password && formData.password.length < 6 && (
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#ef4444', fontWeight: '500' }}>
                  ⚠️ Password must be at least 6 characters (need ${6 - formData.password.length} more)
                </p>
              )}
              {formData.password && formData.password.length >= 6 && (
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#10b981', fontWeight: '500' }}>
                  ✓ Password length valid
                </p>
              )}
            </div>
          </div>



          {/* Form Actions Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '1rem',
            paddingTop: '1.4rem',
            borderTop: '1.5px solid var(--border-color, #f1f5f9)',
            marginTop: '0.4rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.78rem 1.6rem',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--card-bg, #ffffff)',
                color: 'var(--text-secondary, #475569)',
                fontSize: '0.96rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.78rem 2rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.96rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              {editingAccountant ? 'Update Accountant' : 'Create Accountant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountantModal;
