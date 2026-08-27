import React, { useState, useEffect } from 'react';
import { X, Mail, Lock } from 'lucide-react';

const INDIAN_STATES = [
  'Maharashtra', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'
];

const CreateProjectModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingProject, 
  supervisors = [], 
  organizations = [] 
}) => {
  const [formData, setFormData] = useState({
    client: '',
    name: '',
    workOrderNo: '',
    saleOrderNo: '',
    state: 'Maharashtra',
    startDate: '',
    status: '',
    completedDate: '',
    email: '',
    password: '',
    remarks: '',
    supervisorId: ''
  });

  useEffect(() => {
    if (editingProject) {
      setFormData({
        client: editingProject.client || '',
        name: editingProject.name || '',
        workOrderNo: editingProject.workOrderNo || '',
        saleOrderNo: editingProject.saleOrderNo || editingProject.id || '',
        state: editingProject.state || 'Maharashtra',
        startDate: editingProject.startDate || '',
        status: editingProject.status || 'Ongoing',
        completedDate: editingProject.completedDate || '',
        email: editingProject.email || 'project.supervisor@aaryainnovtech.com',
        password: editingProject.password || '••••••••',
        remarks: editingProject.description || editingProject.remarks || '',
        supervisorId: editingProject.supervisorId || supervisors[0]?.id || ''
      });
    } else {
      setFormData({
        client: organizations[0]?.name || '',
        name: '',
        workOrderNo: '',
        saleOrderNo: `SO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
        state: 'Maharashtra',
        startDate: new Date().toISOString().split('T')[0],
        status: 'Ongoing',
        completedDate: '',
        email: '',
        password: '',
        remarks: '',
        supervisorId: supervisors[0]?.id || ''
      });
    }
  }, [editingProject, isOpen, organizations, supervisors]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.client.trim()) {
      alert('Please fill in required fields: Client Name and Project Name.');
      return;
    }

    const matchedSup = supervisors.find(s => s.id === formData.supervisorId) || supervisors[0];

    const projectPayload = {
      id: editingProject ? editingProject.id : (formData.saleOrderNo || `PRJ-${Date.now().toString().slice(-4)}`),
      name: formData.name.trim(),
      client: formData.client.trim(),
      workOrderNo: formData.workOrderNo.trim(),
      saleOrderNo: formData.saleOrderNo.trim(),
      state: formData.state,
      location: editingProject?.location || `${formData.state}, India`,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      status: formData.status || 'Ongoing',
      completedDate: formData.completedDate,
      email: formData.email.trim(),
      password: formData.password,
      description: formData.remarks.trim(),
      remarks: formData.remarks.trim(),
      supervisorId: matchedSup ? matchedSup.id : 'SUP-01',
      supervisorName: matchedSup ? matchedSup.name : 'Rohit Sharma',
      supervisorPhone: matchedSup ? matchedSup.phone : '+91 98220 11223',
      teamCount: editingProject?.teamCount || 8
    };

    onSave(projectPayload);
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
        maxWidth: '820px',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Modal Header: Exact Project Details + Close Button */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1.5px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: 0, fontFamily: 'serif' }}>
            Project Details
          </h2>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          
          {/* Row 1: Client Name * & Project Name * */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.4rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                Client Name *
              </label>
              <select
                required
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1.05rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Select Client --</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.name}>
                    {org.name}
                  </option>
                ))}
                <option value="Sangamner Municipal Council">Sangamner Municipal Council</option>
                <option value="Pune Smart City Development Corp">Pune Smart City Development Corp</option>
                <option value="MSRDC Maharashtra">MSRDC Maharashtra</option>
                <option value="Nashik Municipal Corporation">Nashik Municipal Corporation</option>
                <option value="Chhatrapati Sambhajinagar Smart City SPV">Chhatrapati Sambhajinagar Smart City SPV</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                Project Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sangamner Eco Toilet Installation - Site P1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1.05rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row 2: Work Order No & Sale Order No * */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.4rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                Work Order No
              </label>
              <input
                type="text"
                placeholder="e.g. WO-SMC-2026-08"
                value={formData.workOrderNo}
                onChange={(e) => setFormData({ ...formData, workOrderNo: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1.05rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                Sale Order No *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SO-2026-842"
                value={formData.saleOrderNo}
                onChange={(e) => setFormData({ ...formData, saleOrderNo: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1.05rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row 3: State * & Project Start Date * */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.4rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                State *
              </label>
              <select
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1.05rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Select State --</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                Project Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1.05rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row 4: Project Status * & Project Completed Date */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.4rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                Project Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1.05rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Select Status --</option>
                <option value="Ongoing">Ongoing</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Planning">Planning</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                Project Completed Date
              </label>
              <input
                type="date"
                value={formData.completedDate}
                onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1.05rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row 5: Email Address * & Password * */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.4rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. supervisor.site@aaryainnovtech.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1.05rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                Password *
              </label>
              <input
                type="password"
                required={!editingProject}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1.05rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Row 6: Remarks (Full Width) */}
          <div>
            <label style={{ display: 'block', fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
              Remarks
            </label>
            <textarea
              rows={3}
              placeholder=""
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              style={{
                width: '100%',
                padding: '0.85rem 1.15rem',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                fontSize: '1.05rem',
                color: '#0f172a',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Form Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '1rem',
            paddingTop: '1.4rem',
            borderTop: '1.5px solid #f1f5f9',
            marginTop: '0.6rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.8rem 1.6rem',
                borderRadius: '11px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '1.02rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.8rem 2rem',
                borderRadius: '11px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '1.02rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              {editingProject ? 'Update Project' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
