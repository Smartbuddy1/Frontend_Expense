import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Lock, Wrench, Building2, CheckCircle2 } from 'lucide-react';

const CreateTeamMemberModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingMember = null, 
  projects = [] 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Mechanical Fitter',
    skills: '',
    assignedProjectId: '',
    status: 'On-Site'
  });

  useEffect(() => {
    if (editingMember) {
      setFormData({
        id: editingMember.id,
        name: editingMember.name || '',
        phone: editingMember.phone || '',
        email: editingMember.email || `${(editingMember.name || 'tech').toLowerCase().replace(/\s+/g, '.')}@aaryainnovtech.com`,
        password: editingMember.password || '••••••••',
        role: editingMember.role || 'Mechanical Fitter',
        skills: editingMember.skills || '',
        assignedProjectId: editingMember.assignedProjectId || projects[0]?.id || '',
        status: editingMember.status || 'On-Site'
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        role: 'Mechanical Fitter',
        skills: '',
        assignedProjectId: projects[0]?.id || '',
        status: 'On-Site'
      });
    }
  }, [editingMember, isOpen, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter member name.');
      return;
    }

    const payload = {
      id: editingMember ? editingMember.id : `TECH-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      phone: formData.phone.trim() || '+91 98111 22334',
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
      skills: formData.skills.trim() || 'Prefab Structure, Assembly',
      assignedProjectId: formData.assignedProjectId,
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
        maxWidth: '620px',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.35rem 1.75rem',
          borderBottom: '1.5px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Register on-site technician, fitter, electrician or helper
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Row 1: Full Name * & Phone * */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.4rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ganesh More"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.4rem' }}>
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98111 22334"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row 2: Email Address * & Password * */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.4rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. ganesh.more@aaryainnovtech.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.4rem' }}>
                Password *
              </label>
              <input
                type="password"
                required={!editingMember}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row 3: Trade / Skill Role * & Assign Project Site */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.4rem' }}>
                Trade / Skill Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Mechanical Fitter">Mechanical Fitter</option>
                <option value="Plumbing Specialist">Plumbing Specialist</option>
                <option value="Automation Electrician">Automation Electrician</option>
                <option value="Solar Technician">Solar Technician</option>
                <option value="Structural Assembler">Structural Assembler</option>
                <option value="Welder & Fabricator">Welder & Fabricator</option>
                <option value="Field Helper">Field Helper</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.4rem' }}>
                Assign Project Site
              </label>
              <select
                value={formData.assignedProjectId}
                onChange={(e) => setFormData({ ...formData, assignedProjectId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Select Assigned Site --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Operational Status */}
          <div>
            <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.4rem' }}>
              Operational Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                color: '#0f172a',
                outline: 'none',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box'
              }}
            >
              <option value="On-Site">On-Site (Active)</option>
              <option value="Available">Available (Pool)</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.85rem',
            paddingTop: '1.25rem',
            borderTop: '1.5px solid #f1f5f9',
            marginTop: '0.4rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.85rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
              }}
            >
              {editingMember ? 'Update Member' : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamMemberModal;
