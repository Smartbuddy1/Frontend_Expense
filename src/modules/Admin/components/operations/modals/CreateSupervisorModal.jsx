import React, { useState, useEffect } from 'react';
import { X, UserPlus, Phone, Mail, Briefcase, IndianRupee, Building2, User, Edit3, Lock } from 'lucide-react';

const CreateSupervisorModal = ({ isOpen, onClose, onCreateSupervisor, editingSupervisor = null, projects = [] }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    phone: '',
    email: '',
    password: '',
    specialization: 'Site Operations & Field Lead',
    assignedProjectId: '',
    advanceAmount: '50000',
    experience: '5+ Years'
  });

  useEffect(() => {
    if (editingSupervisor) {
      const parts = (editingSupervisor.name || '').trim().split(' ');
      const firstName = parts[0] || '';
      const surname = parts.slice(1).join(' ') || '';

      setFormData({
        id: editingSupervisor.id,
        firstName,
        surname,
        phone: editingSupervisor.phone || '',
        email: editingSupervisor.email || '',
        password: editingSupervisor.password || '••••••••',
        specialization: editingSupervisor.specialization || 'Site Operations & Field Lead',
        assignedProjectId: editingSupervisor.activeProjects?.[0] || '',
        advanceAmount: String(editingSupervisor.advanceAmount || '50000'),
        experience: editingSupervisor.experience || '5+ Years'
      });
    } else {
      setFormData({
        firstName: '',
        surname: '',
        phone: '',
        email: '',
        password: '',
        specialization: 'Site Operations & Field Lead',
        assignedProjectId: '',
        advanceAmount: '50000',
        experience: '5+ Years'
      });
    }
  }, [editingSupervisor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      return;
    }

    const fullName = [formData.firstName.trim(), formData.surname.trim()].filter(Boolean).join(' ');

    onCreateSupervisor({
      ...formData,
      name: fullName,
      advanceAmount: Number(formData.advanceAmount) || 50000
    });

    onClose();
  };

  const isEdit = Boolean(editingSupervisor);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
        maxWidth: '560px',
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
            ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
            : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: isEdit ? '#10b981' : '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isEdit ? '0 4px 12px rgba(16, 185, 129, 0.35)' : '0 4px 12px rgba(37, 99, 235, 0.35)'
            }}>
              {isEdit ? <Edit3 size={20} /> : <UserPlus size={22} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {isEdit ? 'Edit Site Supervisor' : 'Add New Site Supervisor'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0', fontWeight: '500' }}>
                {isEdit ? 'Update supervisor contact and site allocation' : 'Register new field supervisor & assign site project'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* Name & Surname (2 Columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                <User size={13} style={{ display: 'inline', marginRight: '4px', color: '#2563eb' }} />
                First Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                <User size={13} style={{ display: 'inline', marginRight: '4px', color: '#2563eb' }} />
                Surname
              </label>
              <input
                type="text"
                placeholder="e.g. Shinde"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Contact Phone & Email (2 Cols) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                <Phone size={13} style={{ display: 'inline', marginRight: '4px', color: '#2563eb' }} />
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                <Mail size={13} style={{ display: 'inline', marginRight: '4px', color: '#2563eb' }} />
                Email Address
              </label>
              <input
                type="email"
                placeholder="supervisor@aaryainnovtech.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Password & Role / Specialization (2 Cols) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                <Lock size={13} style={{ display: 'inline', marginRight: '4px', color: '#2563eb' }} />
                Password *
              </label>
              <input
                type="password"
                required={!isEdit}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem', display: 'block' }}>
                8-10 characters login password
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                <Briefcase size={13} style={{ display: 'inline', marginRight: '4px', color: '#2563eb' }} />
                Specialization & Skill Role
              </label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Site Operations & Field Lead">Site Operations & Field Lead</option>
                <option value="Civil Construction & Plumbing Lead">Civil Construction & Plumbing Lead</option>
                <option value="SCADA, Electrical & IoT Specialist">SCADA, Electrical & IoT Specialist</option>
                <option value="Prefab Shell & Mechanical Lead">Prefab Shell & Mechanical Lead</option>
              </select>
            </div>
          </div>

          {/* Assign Project Site & Initial Advance (2 Cols) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                <Building2 size={13} style={{ display: 'inline', marginRight: '4px', color: '#2563eb' }} />
                Assign Project Site (Optional)
              </label>
              <select
                value={formData.assignedProjectId}
                onChange={(e) => setFormData({ ...formData, assignedProjectId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid #bfdbfe',
                  backgroundColor: '#eff6ff',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  color: '#1d4ed8',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Assign Later (Available Pool) --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '0.4rem' }}>
                <IndianRupee size={13} style={{ display: 'inline', marginRight: '4px', color: '#10b981' }} />
                Initial Advance Float (₹)
              </label>
              <input
                type="number"
                placeholder="50000"
                value={formData.advanceAmount}
                onChange={(e) => setFormData({ ...formData, advanceAmount: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
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
                background: isEdit 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: isEdit 
                  ? '0 4px 14px rgba(16, 185, 129, 0.35)'
                  : '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              {isEdit ? <Edit3 size={16} /> : <UserPlus size={16} />}
              <span>{isEdit ? 'Update Supervisor' : 'Create Supervisor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupervisorModal;
