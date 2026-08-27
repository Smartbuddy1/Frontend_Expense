import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, User, Phone, Mail, Lock, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateOperationalHeadModal = ({
  isOpen,
  onClose,
  onSave,
  editingHead = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Vice President & Operational Head'
  });

  useEffect(() => {
    if (editingHead) {
      setFormData({
        id: editingHead.id,
        name: editingHead.name || '',
        phone: editingHead.phone || '',
        email: editingHead.email || '',
        password: editingHead.password || '••••••••',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter Full Name');
      return;
    }

    const headToSave = {
      ...formData,
      id: editingHead ? editingHead.id : `OPH-${Date.now().toString().slice(-4)}`,
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

  const isEdit = Boolean(editingHead);

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
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
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
          borderBottom: '1px solid #e2e8f0',
          background: isEdit 
            ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' 
            : 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}>
              <ShieldCheck size={22} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                {isEdit ? 'Edit Operational Head' : 'Add New Operational Head'}
              </h2>
              <p style={{ fontSize: '0.8rem', margin: '0.15rem 0 0 0', color: '#bfdbfe' }}>
                Operational Head Credentials & Role
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body - ONLY 5 FIELDS: Name, Phone, Mail, Pass, Role */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* 1. Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                required
                placeholder="e.g. Dinesh Sonawane"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 2. Official Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
              Phone Number <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                required
                placeholder="e.g. +91 93596 04384"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 3. Official Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
              Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                required
                placeholder="e.g. dinesh.s@aaryainnovtech.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 4. Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
              Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                required={!isEdit}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 5. Role / Designation */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
              Role / Designation <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                required
                placeholder="e.g. Vice President & Operational Head"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
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
