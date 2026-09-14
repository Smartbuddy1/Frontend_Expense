import React, { useState, useEffect } from 'react';
import { X, Building2, UserCheck, Calendar, DollarSign, MapPin, Tag, FileText, CheckCircle2, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const CreateProjectModal = ({ isOpen, onClose, onSave, editingProject, supervisors = [] }) => {
  const { language } = useLanguage();
  const [supervisorMode, setSupervisorMode] = useState('single'); // 'single' | 'multiple'
  const [selectedSupervisorIds, setSelectedSupervisorIds] = useState([]);
  const [formData, setFormData] = useState(editingProject || {
    name: '',
    code: '',
    location: '',
    phone: '',
    email: '',
    password: '',
    category: 'Commercial',
    budget: '',
    startDate: '',
    endDate: '',
    supervisorId: '',
    teamCount: 8,
    description: '',
    status: 'In Progress',
    health: 'On Track',
  });

  useEffect(() => {
    if (editingProject) {
      const matchedSup = supervisors.find(s => s.id === editingProject.supervisorId || s.name === editingProject.supervisorName);
      // Check if project has multiple supervisors
      if (editingProject.supervisorIds && editingProject.supervisorIds.length > 1) {
        setSupervisorMode('multiple');
        setSelectedSupervisorIds(editingProject.supervisorIds);
      } else {
        setSupervisorMode('single');
        setSelectedSupervisorIds([]);
      }
      setFormData({
        name: editingProject.name || '',
        code: editingProject.id || '',
        location: editingProject.location || '',
        phone: editingProject.phone || editingProject.clientPhone || '',
        email: editingProject.email || editingProject.clientEmail || '',
        password: editingProject.password || '',
        category: editingProject.category || 'Infrastructure & Civil',
        budget: editingProject.budget || '',
        startDate: editingProject.startDate || '',
        endDate: editingProject.endDate || '',
        supervisorId: matchedSup ? matchedSup.id : (editingProject.supervisorId || supervisors[0]?.id || ''),
        teamCount: editingProject.teamCount || 8,
        description: editingProject.description || '',
        status: editingProject.status || 'In Progress',
        health: editingProject.health || 'On Track',
      });
    } else {
      setSupervisorMode('single');
      setSelectedSupervisorIds([]);
      setFormData({
        name: '',
        code: `PRJ-SGM-${Math.floor(Math.random() * 90) + 10}`,
        location: '',
        phone: '',
        email: '',
        password: '',
        category: 'Infrastructure & Civil',
        budget: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        supervisorId: supervisors[0]?.id || '',
        teamCount: 8,
        description: '',
        status: 'In Progress',
        health: 'On Track',
      });
    }
  }, [editingProject, isOpen, supervisors]);

  if (!isOpen) return null;

  const handleToggleSupervisorId = (id) => {
    setSelectedSupervisorIds(prev => {
      const isSelected = prev.includes(id);
      if (!isSelected) {
        // Auto-fill phone and email for newly added supervisor
        const selectedSup = supervisors.find(s => s.id === id);
        setFormData(fd => ({
          ...fd,
          phone: selectedSup?.phone || fd.phone,
          email: selectedSup?.email || fd.email
        }));
        return [...prev, id];
      }
      return prev.filter(x => x !== id);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim() || !formData.email?.trim() || !formData.description?.trim()) {
      alert('Please fill in all mandatory fields (*)');
      return;
    }
    if (supervisorMode === 'multiple' && selectedSupervisorIds.length === 0) {
      alert('Please select at least one supervisor.');
      return;
    }

    // Resolve supervisor info
    const primarySupId = supervisorMode === 'single'
      ? formData.supervisorId
      : selectedSupervisorIds[0];
    const selectedSup = supervisors.find(s => s.id === primarySupId);
    const resolvedSupervisorName = selectedSup
      ? (supervisorMode === 'multiple'
          ? selectedSupervisorIds.map(id => supervisors.find(s => s.id === id)?.name || '').filter(Boolean).join(', ')
          : selectedSup.name)
      : (editingProject?.supervisorName || 'Rohit Sharma');
    const resolvedSupervisorPhone = selectedSup
      ? selectedSup.phone
      : (editingProject?.supervisorPhone || '+91 98220 11223');

    const projectPayload = {
      id: editingProject ? editingProject.id : formData.code,
      name: formData.name,
      location: formData.location || 'Maharashtra, India',
      phone: formData.phone || '',
      email: formData.email || '',
      password: formData.password || '',
      category: editingProject?.category || 'E-Toilet Installation',
      budget: editingProject?.budget || 200000,
      spent: editingProject ? editingProject.spent : 0,
      startDate: editingProject?.startDate || new Date().toISOString().split('T')[0],
      endDate: editingProject?.endDate || new Date().toISOString().split('T')[0],
      status: formData.status,
      health: formData.health || 'On Track',
      progress: editingProject ? editingProject.progress : 0,
      supervisorId: primarySupId || editingProject?.supervisorId || 'SUP-ROHIT',
      supervisorIds: supervisorMode === 'multiple' ? selectedSupervisorIds : [primarySupId || editingProject?.supervisorId],
      supervisorName: resolvedSupervisorName,
      supervisorPhone: resolvedSupervisorPhone,
      teamCount: Number(formData.teamCount) || 8,
      description: formData.description,
      milestones: editingProject?.milestones || [
        { id: 'M1', title: 'Site Mobilization & Survey', status: 'Completed', targetDate: '' },
        { id: 'M2', title: 'Civil & Foundation Works', status: 'In Progress', targetDate: '' },
        { id: 'M3', title: 'Structural Setup', status: 'Pending', targetDate: '' },
      ],
      assignedTeam: editingProject?.assignedTeam || ['TECH-01', 'TECH-02'],
    };

    onSave(projectPayload);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                {editingProject 
                  ? (language === 'mr' ? 'प्रोजेक्ट माहिती बदला (Edit Project)' : 'Edit Project Details') 
                  : (language === 'mr' ? 'नवीन प्रोजेक्ट तयार करा (Create Project)' : 'Create New Project')}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                {editingProject 
                  ? (language === 'mr' ? 'प्रोजेक्टचे नाव, क्लायंट आणि सुपरवायझर अपडेट करा' : 'Update project parameters & supervisor') 
                  : (language === 'mr' ? 'नवीन ई-टॉयलेट किंवा सिव्हिल साईट नोंदवा' : 'Define new project scope & supervisor')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Project Code */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              {language === 'mr' ? 'प्रोजेक्ट कोड' : 'Project Code'}
            </label>
            <input
              type="text"
              disabled={!!editingProject}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: editingProject ? '#f8fafc' : '#ffffff',
                fontSize: '0.88rem',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Project Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              {language === 'mr' ? 'प्रोजेक्ट / साईटचे नाव *' : 'Project / Site Name *'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sangamner Eco Toilet Installation - Site P1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Site Supervisor - Mode Toggle + Input */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                Site Supervisor *
              </label>
              {/* Single / Multiple Toggle */}
              <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0.2rem' }}>
                {['single', 'multiple'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setSupervisorMode(mode); setSelectedSupervisorIds([]); }}
                    style={{
                      padding: '0.28rem 0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      backgroundColor: supervisorMode === mode ? '#2563eb' : 'transparent',
                      color: supervisorMode === mode ? '#ffffff' : '#64748b',
                      boxShadow: supervisorMode === mode ? '0 2px 6px rgba(37,99,235,0.3)' : 'none'
                    }}
                  >
                    {mode === 'single' ? '👤 Single' : '👥 Multiple'}
                  </button>
                ))}
              </div>
            </div>

            {/* SINGLE mode: dropdown */}
            {supervisorMode === 'single' && (
              <select
                required
                value={formData.supervisorId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedSup = supervisors.find(s => s.id === selectedId);
                  setFormData({ 
                    ...formData, 
                    supervisorId: selectedId,
                    phone: selectedSup?.phone || formData.phone,
                    email: selectedSup?.email || formData.email
                  });
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="" disabled>Select Supervisor</option>
                {supervisors.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            )}

            {/* MULTIPLE mode: checkbox list */}
            {supervisorMode === 'multiple' && (
              <div style={{
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                overflow: 'hidden',
                maxHeight: '180px',
                overflowY: 'auto'
              }}>
                {supervisors.length === 0 && (
                  <p style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>No supervisors available.</p>
                )}
                {supervisors.map((sup, idx) => {
                  const checked = selectedSupervisorIds.includes(sup.id);
                  return (
                    <label
                      key={sup.id}
                      onClick={() => handleToggleSupervisorId(sup.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 0.85rem',
                        cursor: 'pointer',
                        backgroundColor: checked ? 'rgba(37,99,235,0.06)' : (idx % 2 === 0 ? '#fafafa' : '#ffffff'),
                        borderBottom: idx < supervisors.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.15s ease',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '5px',
                        border: `2px solid ${checked ? '#2563eb' : '#cbd5e1'}`,
                        backgroundColor: checked ? '#2563eb' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}>
                        {checked && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '900', lineHeight: 1 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: '0.87rem', fontWeight: checked ? '700' : '500', color: checked ? '#1e3a8a' : '#334155' }}>
                        {sup.name}
                      </span>
                      {checked && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: '700', color: '#2563eb', backgroundColor: 'rgba(37,99,235,0.1)', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
                          Selected
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Show selected count in multiple mode */}
            {supervisorMode === 'multiple' && selectedSupervisorIds.length > 0 && (
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: '#2563eb', fontWeight: '700' }}>
                ✓ {selectedSupervisorIds.length} supervisor{selectedSupervisorIds.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>


          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Remark / Description *
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Initial notes, site requirements, special instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                color: '#0f172a',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.85rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
            marginTop: '0.5rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.88rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {language === 'mr' ? 'रद्द करा (Cancel)' : 'Cancel'}
            </button>
            <button
              type="submit"
              style={{
                padding: '0.65rem 1.65rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease'
              }}
            >
              <CheckCircle2 size={16} />
              {editingProject 
                ? (language === 'mr' ? 'बदल सेव्ह करा (Save Changes)' : 'Save Project Changes') 
                : (language === 'mr' ? 'प्रोजेक्ट तयार करा (Create Project)' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
