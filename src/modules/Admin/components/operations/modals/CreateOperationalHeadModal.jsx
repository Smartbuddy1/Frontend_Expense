import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, User, Phone, Mail, Lock, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateOperationalHeadModal = ({
  isOpen,
  onClose,
  onSave,
  editingHead = null
}) => {
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Vice President & Operational Head'
  });

  useEffect(() => {
    setFormError('');
    if (editingHead) {
      setFormData({
        id: editingHead.id,
        userId: editingHead.userId || null,
        name: editingHead.name || '',
        phone: editingHead.phone || '',
        email: editingHead.email || '',
        password: '',
        role: editingHead.role || 'Vice President & Operational Head',
        department: editingHead.department || 'Industrial Telemetry & Operations',
        employeeId: editingHead.employeeId || 'EMP-OPS-001',
        location: editingHead.location || 'Head Office - Pune, Maharashtra',
        experience: editingHead.experience || '12+ Years Enterprise Operations',
        totalBudgetAuthorisation: editingHead.totalBudgetAuthorisation || '₹6,00,000+',
        status: editingHead.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        role: 'Vice President & Operational Head'
      });
    }
  }, [editingHead, isOpen]);

  if (!isOpen) return null;

  const isEdit = Boolean(editingHead);
  const cleanPhone = (formData.phone || '').replace(/\D/g, '').slice(0, 10);
  const isPhoneValid = /^[6-9]\d{9}$/.test(cleanPhone);
  const isPasswordValid = isEdit
    ? (!formData.password || formData.password.length >= 6)
    : (Boolean(formData.password) && formData.password.length >= 6);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter Full Name.');
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

    const headToSave = {
      ...formData,
      id: editingHead ? editingHead.id : `OPH-${Date.now().toString().slice(-4)}`,
      userId: editingHead?.userId || formData.userId || null,
      phone: cleanPhone,
      employeeId: editingHead ? editingHead.employeeId : `EMP-OPS-${Math.floor(100 + Math.random() * 900)}`,
      department: editingHead?.department || 'Industrial Telemetry & Operations',
      location: editingHead?.location || 'Head Office - Pune, Maharashtra',
      experience: editingHead?.experience || '12+ Years Enterprise Operations',
      totalBudgetAuthorisation: editingHead?.totalBudgetAuthorisation || '₹6,00,000+',
      status: editingHead?.status || 'Active'
    };

    onSave(headToSave);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '20px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '92vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeInUp 0.25s ease'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          background: 'var(--bg-panel)',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}>
              <ShieldCheck size={22} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                {isEdit ? 'Edit Operational Head' : 'Add New Operational Head'}
              </h2>
              <p style={{ fontSize: '0.8rem', margin: '0.15rem 0 0 0', color: 'var(--text-secondary)' }}>
                Operational Head Credentials & Role
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body - ONLY 5 FIELDS: Name, Phone, Mail, Pass, Role */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {formError && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid #ef4444',
              borderRadius: '10px',
              color: '#dc2626',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary, #334155)', marginBottom: '0.35rem' }}>
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94a3b8)' }} />
              <input
                type="text"
                required
                placeholder="e.g. Dinesh Sonawane"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formError) setFormError('');
                }}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  fontSize: '0.92rem',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 2. Official Phone */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary, #334155)', margin: 0 }}>
                Mobile Number (Login ID) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: isPhoneValid ? '#10b981' : (cleanPhone.length > 0 ? '#f59e0b' : '#94a3b8'), fontWeight: '700' }}>
                {cleanPhone.length}/10
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94a3b8)' }} />
              <input
                type="tel"
                inputMode="numeric"
                required
                maxLength="10"
                placeholder="e.g. 9359604384 (10 digits)"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone: val });
                  if (formError) setFormError('');
                }}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  borderRadius: '10px',
                  border: `1.5px solid ${isPhoneValid ? '#10b981' : (cleanPhone.length > 0 ? '#ef4444' : 'var(--border-color, #cbd5e1)')}`,
                  fontSize: '0.92rem',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
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

          {/* 3. Official Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary, #334155)', marginBottom: '0.35rem' }}>
              Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94a3b8)' }} />
              <input
                type="email"
                required
                placeholder="e.g. dinesh.s@aaryainnovtech.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (formError) setFormError('');
                }}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  fontSize: '0.92rem',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 4. Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary, #334155)', margin: 0 }}>
                Password {isEdit ? '(Leave blank to keep unchanged)' : <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              <span style={{ fontSize: '0.75rem', color: isPasswordValid ? '#10b981' : (formData.password ? '#f59e0b' : '#94a3b8'), fontWeight: '700' }}>
                {formData.password ? `${formData.password.length} chars (min 6)` : 'min 6 chars'}
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94a3b8)' }} />
              <input
                type="password"
                required={!isEdit}
                placeholder={isEdit ? 'Leave blank to keep current' : '•••••••• (min 6 characters)'}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (formError) setFormError('');
                }}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  borderRadius: '10px',
                  border: `1.5px solid ${formData.password ? (formData.password.length >= 6 ? '#10b981' : '#ef4444') : 'var(--border-color, #cbd5e1)'}`,
                  fontSize: '0.92rem',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {formData.password && formData.password.length < 6 && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#ef4444', fontWeight: '500' }}>
                ⚠️ Needs at least 6 characters (currently {formData.password.length}/6)
              </p>
            )}
            {formData.password && formData.password.length >= 6 && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#10b981', fontWeight: '500' }}>
                ✓ Strong password length ({formData.password.length} characters)
              </p>
            )}
          </div>


          {/* Footer Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color, #e2e8f0)'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--card-bg, #ffffff)',
                color: 'var(--text-secondary, #475569)',
                fontSize: '0.92rem',
                fontWeight: '700',
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
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
              }}
            >
              {isEdit ? 'Save Changes' : '+ Add Operational Head'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOperationalHeadModal;
