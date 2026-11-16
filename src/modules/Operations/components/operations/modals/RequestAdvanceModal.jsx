import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL;

const RequestAdvanceModal = ({ isOpen, onClose, projects = [], supervisors = [], onRefresh }) => {
  // Extract all distinct site supervisors from both `supervisors` prop and `projects`
  const allSupervisors = useMemo(() => {
    const map = new Map();
    (supervisors || []).forEach(s => {
      if (s && s.id) {
        map.set(String(s.id), {
          id: String(s.id),
          name: s.name,
          phone: s.phone || s.mobile || ''
        });
      }
    });
    (projects || []).forEach(p => {
      (p.supervisors || []).forEach(s => {
        if (s && s.id && !map.has(String(s.id))) {
          map.set(String(s.id), {
            id: String(s.id),
            name: s.name,
            phone: s.phone || s.mobile || ''
          });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [supervisors, projects]);

  const [newReqForm, setNewReqForm] = useState({
    supervisorId: '',
    projectId: '',
    site: '',
    purpose: '',
    urgency: 'Regular',
    urgencyType: 'medium',
    amount: '',
    notes: ''
  });

  // Projects assigned to the selected supervisor (or all projects if none selected)
  const availableProjectsForSupervisor = useMemo(() => {
    if (!newReqForm.supervisorId) {
      return projects;
    }
    const supIdStr = String(newReqForm.supervisorId);
    const assigned = projects.filter(p =>
      (p.supervisorIds && p.supervisorIds.map(String).includes(supIdStr)) ||
      (p.supervisors && p.supervisors.some(s => String(s.id) === supIdStr)) ||
      String(p.supervisorId) === supIdStr
    );
    return assigned.length > 0 ? assigned : projects;
  }, [projects, newReqForm.supervisorId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReqForm.supervisorId) {
      toast.error('Please select a site supervisor.');
      return;
    }
    if (!newReqForm.projectId) {
      toast.error('Please select a project / site.');
      return;
    }
    if (!newReqForm.purpose.trim()) {
      toast.error('Please enter the purpose or reason for the advance.');
      return;
    }
    if (!newReqForm.amount || Number(newReqForm.amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    try {
      await axios.post(`${API}/advances`, {
        projectId: newReqForm.projectId,
        supervisorId: newReqForm.supervisorId,
        amount: Number(newReqForm.amount),
        purpose: newReqForm.purpose,
        urgency: newReqForm.urgency
      });
      setNewReqForm({ supervisorId: '', projectId: '', site: '', purpose: '', urgency: 'Regular', amount: '', notes: '' });
      toast.success('Advance requisition submitted for approval!');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit requisition');
    }
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '20px',
        border: '1.5px solid var(--border-color, #e2e8f0)',
        width: '100%',
        maxWidth: '540px',
        padding: '1.75rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color, #f1f5f9)', paddingBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Site Requisition Register
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-primary, #0f172a)', margin: '0.2rem 0 0 0' }}>
              + Request Advance Fund
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary, #94a3b8)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Supervisor Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary, #475569)', marginBottom: '0.35rem' }}>
              Site Supervisor Name *
            </label>
            <select
              value={newReqForm.supervisorId}
              onChange={(e) => {
                const supId = e.target.value;
                const supProjects = projects.filter(p =>
                  (p.supervisorIds && p.supervisorIds.map(String).includes(String(supId))) ||
                  (p.supervisors && p.supervisors.some(s => String(s.id) === String(supId))) ||
                  String(p.supervisorId) === String(supId)
                );
                const autoProj = supProjects.length === 1 ? supProjects[0] : null;
                const isValidExisting = supProjects.some(p => p.id === newReqForm.projectId);
                const chosenProj = autoProj || (isValidExisting ? projects.find(p => p.id === newReqForm.projectId) : null);

                setNewReqForm(prev => ({
                  ...prev,
                  supervisorId: supId,
                  projectId: chosenProj ? chosenProj.id : '',
                  site: chosenProj ? (chosenProj.location || chosenProj.name) : ''
                }));
              }}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                backgroundColor: 'var(--input-bg, #f8fafc)',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.9rem',
                fontWeight: '600',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="">-- Select Site Supervisor --</option>
              {allSupervisors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.phone ? `(${s.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Project / Site Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary, #475569)', marginBottom: '0.35rem' }}>
              Project Name *
            </label>
            <select
              value={newReqForm.projectId}
              onChange={(e) => {
                const projId = e.target.value;
                const proj = projects.find(p => p.id === projId);
                setNewReqForm(prev => {
                  let supId = prev.supervisorId;
                  if (!supId && proj) {
                    const firstSup = (proj.supervisors && proj.supervisors[0]) || (proj.supervisorIds && proj.supervisorIds[0]);
                    if (firstSup) {
                      supId = typeof firstSup === 'object' ? firstSup.id : String(firstSup);
                    }
                  }
                  return {
                    ...prev,
                    projectId: projId,
                    supervisorId: supId,
                    site: proj?.location || proj?.name || ''
                  };
                });
              }}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                backgroundColor: 'var(--input-bg, #f8fafc)',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.9rem',
                fontWeight: '600',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="">-- Select Project --</option>
              {availableProjectsForSupervisor.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.location ? `— ${p.location}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Site Location */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary, #475569)', marginBottom: '0.35rem' }}>
              Site Location *
            </label>
            <input
              type="text"
              value={newReqForm.site}
              onChange={(e) => setNewReqForm(prev => ({ ...prev, site: e.target.value }))}
              placeholder="e.g. Khopoli, Pen..."
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                backgroundColor: 'var(--input-bg, #f8fafc)',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Purpose / Reason */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary, #475569)', marginBottom: '0.35rem' }}>
              Purpose / Reason *
            </label>
            <input
              type="text"
              value={newReqForm.purpose}
              onChange={(e) => setNewReqForm(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="e.g. Urgent diesel purchase, laborer wages, cement bags..."
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                backgroundColor: 'var(--input-bg, #f8fafc)',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Grid: Urgency & Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary, #475569)', marginBottom: '0.35rem' }}>
                Urgency Level *
              </label>
              <select
                value={newReqForm.urgency}
                onChange={(e) => setNewReqForm(prev => ({ ...prev, urgency: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--input-bg, #f8fafc)',
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  color: 'var(--text-primary, #0f172a)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Immediate">Immediate</option>
                <option value="Within 24 Hours">Within 24 Hours</option>
                <option value="Regular">Regular</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary, #475569)', marginBottom: '0.35rem' }}>
                Requested Amount (₹) *
              </label>
              <input
                type="number" min="1"
                value={newReqForm.amount}
                onChange={(e) => setNewReqForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="e.g. 25000"
                min="100"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--input-bg, #f8fafc)',
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  color: '#059669',
                  fontSize: '1rem',
                  fontWeight: '800',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.7rem',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--input-bg, #f8fafc)',
                color: 'var(--text-secondary, #475569)',
                fontSize: '0.9rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1.5,
                padding: '0.7rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Submit Requisition</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestAdvanceModal;
