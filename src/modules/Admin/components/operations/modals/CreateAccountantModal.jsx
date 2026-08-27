import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Lock, Briefcase, Building, ShieldCheck } from 'lucide-react';

const CreateAccountantModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingAccountant = null 
}) => {
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
    if (editingAccountant) {
      setFormData({
        id: editingAccountant.id,
        name: editingAccountant.name || '',
        phone: editingAccountant.phone || '',
        email: editingAccountant.email || '',
        password: editingAccountant.password || '••••••••',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in required fields: Accountant Name and Email Address.');
      return;
    }

    const payload = {
      id: editingAccountant ? editingAccountant.id : `ACC-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      phone: formData.phone.trim() || '+91 98220 77889',
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
      branch: formData.branch,
      status: formData.status
    };

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
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
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
          borderBottom: '1.5px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {editingAccountant ? 'Edit Accountant Profile' : 'Add New Accountant'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
              Register accounts executive for site bills auditing, vouchers & disbursements
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
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
          
          {/* Row 1: Full Name * & Phone * */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.45rem' }}>
                Accountant Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kulkarni"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.78rem 1.05rem',
                  borderRadius: '11px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.96rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.45rem' }}>
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98220 77889"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.78rem 1.05rem',
                  borderRadius: '11px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.96rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row 2: Email Address * & Password * */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.45rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. accounts@aaryainnovtech.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.78rem 1.05rem',
                  borderRadius: '11px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.96rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.45rem' }}>
                Password *
              </label>
              <input
                type="password"
                required={!editingAccountant}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.78rem 1.05rem',
                  borderRadius: '11px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.96rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row 3: Role Designation & Office Branch */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.45rem' }}>
                Designation / Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.78rem 1.05rem',
                  borderRadius: '11px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.96rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Senior Accountant & Auditor">Senior Accountant & Auditor</option>
                <option value="Field Expenses Accountant">Field Expenses Accountant</option>
                <option value="Finance & Tax Auditor">Finance & Tax Auditor</option>
                <option value="Disbursement Officer">Disbursement Officer</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.94rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.45rem' }}>
                Office Branch / Division
              </label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.78rem 1.05rem',
                  borderRadius: '11px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.96rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Head Office - Pune">Head Office - Pune</option>
                <option value="Field Operations - Sangamner">Field Operations - Sangamner</option>
                <option value="Field Operations - Nashik">Field Operations - Nashik</option>
                <option value="Regional Division - Sambhajinagar">Regional Division - Sambhajinagar</option>
              </select>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '1rem',
            paddingTop: '1.4rem',
            borderTop: '1.5px solid #f1f5f9',
            marginTop: '0.4rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.78rem 1.6rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
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
                backgroundColor: '#ea580c',
                color: '#ffffff',
                fontSize: '0.96rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
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
