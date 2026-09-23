import React, { useState, useEffect } from 'react';
import { X, UserPlus, Phone, Mail, Briefcase, IndianRupee, User, Edit3, Lock, Eye, EyeOff } from 'lucide-react';

const CreateSupervisorModal = ({ isOpen, onClose, onCreateSupervisor, editingSupervisor = null, projects = [] }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    phone: '',
    email: '',
    password: '',
    specialization: 'Site Operations & Field Lead',
    experience: '5+ Years',
    assignedProjects: []
  });

  useEffect(() => {
    if (editingSupervisor) {
      const parts = (editingSupervisor.name || '').trim().split(' ');
      const firstName = parts[0] || '';
      const surname = parts.slice(1).join(' ') || '';

      const currentlyAssigned = projects.filter(p => String(p.supervisorId) === String(editingSupervisor.id)).map(p => String(p.id));

      setFormData({
        id: editingSupervisor.id,
        firstName,
        surname,
        phone: editingSupervisor.phone || '',
        email: editingSupervisor.email || '',
        password: editingSupervisor.password || '',
        specialization: editingSupervisor.specialization || 'Site Operations & Field Lead',
        experience: editingSupervisor.experience || '5+ Years',
        assignedProjects: currentlyAssigned
      });
    } else {
      setFormData({
        firstName: '',
        surname: '',
        phone: '',
        email: '',
        password: '',
        specialization: 'Site Operations & Field Lead',
        experience: '5+ Years',
        assignedProjects: []
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
      name: fullName
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
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '20px',
        border: '1px solid var(--border-color, #e2e8f0)',
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
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          background: 'var(--bg-panel)',
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                {isEdit ? 'Edit Site Supervisor' : 'Add New Site Supervisor'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', margin: '0.2rem 0 0 0', fontWeight: '500' }}>
                {isEdit ? 'Update supervisor contact and login details' : 'Register new field supervisor & credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: '10px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary, #64748b)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(255,255,255,0.1))'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* Name & Surname (2 Columns) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-secondary, #334155)', marginBottom: '0.4rem' }}>
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
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary, #0f172a)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-secondary, #334155)', marginBottom: '0.4rem' }}>
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
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary, #0f172a)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Contact Phone & Email (2 Cols) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-secondary, #334155)', marginBottom: '0.4rem' }}>
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
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary, #0f172a)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-secondary, #334155)', marginBottom: '0.4rem' }}>
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
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary, #0f172a)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Password / Access Key */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-secondary, #334155)', marginBottom: '0.4rem' }}>
              <Lock size={13} style={{ display: 'inline', marginRight: '4px', color: '#2563eb' }} />
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter supervisor login password..."
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 2.5rem 0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary, #0f172a)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary, #64748b)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {/* Assigned Projects */}
          {projects && projects.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-secondary, #334155)', marginBottom: '0.4rem' }}>
                <Briefcase size={13} style={{ display: 'inline', marginRight: '4px', color: '#2563eb' }} />
                Assigned Projects
              </label>
              <div style={{
                width: '100%',
                maxHeight: '140px',
                overflowY: 'auto',
                padding: '0.65rem',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--input-bg, #ffffff)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxSizing: 'border-box'
              }}>
                {projects.map((project, idx) => {
                  const isAssigned = formData.assignedProjects.includes(project.id || project.projectId || project.name);
                  const projectId = project.id || project.projectId || project.name;
                  return (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary, #0f172a)' }}>
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, assignedProjects: [...prev.assignedProjects, projectId] }));
                          } else {
                            setFormData(prev => ({ ...prev, assignedProjects: prev.assignedProjects.filter(id => id !== projectId) }));
                          }
                        }}
                        style={{ cursor: 'pointer', accentColor: '#2563eb' }}
                      />
                      {project.name} {project.siteLocation ? `(${project.siteLocation})` : ''}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          {/* Modal Actions Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--card-bg, #ffffff)',
                color: 'var(--text-secondary, #475569)',
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
