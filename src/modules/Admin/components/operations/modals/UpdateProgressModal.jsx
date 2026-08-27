import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Activity, CheckCircle2, AlertCircle, Clock, Calendar, Users, CloudSun, Camera } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

const UpdateProgressModal = ({ isOpen, onClose, project, onUpdateProgress, supervisors }) => {
  const [progress, setProgress] = useState(0);
  const [health, setHealth] = useState('On Track');
  const [milestones, setMilestones] = useState([]);
  const [logSummary, setLogSummary] = useState('');
  const [workforceCount, setWorkforceCount] = useState(25);
  const [issuesReported, setIssuesReported] = useState('');
  const [weather, setWeather] = useState('Clear, 28°C');

  useEffect(() => {
    if (project) {
      setProgress(project.progress || 0);
      setHealth(project.health || 'On Track');
      setMilestones(project.milestones || []);
      setLogSummary('');
      setWorkforceCount(project.teamCount * 3 || 25);
      setIssuesReported('');
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const toggleMilestoneStatus = (index) => {
    const updated = [...milestones];
    const currentStatus = updated[index].status;
    if (currentStatus === 'Pending') updated[index].status = 'In Progress';
    else if (currentStatus === 'In Progress') updated[index].status = 'Completed';
    else updated[index].status = 'Pending';
    setMilestones(updated);

    // Auto calculate progress percentage
    if (updated.length > 0) {
      const completedCount = updated.filter(m => m.status === 'Completed').length;
      const inProgressCount = updated.filter(m => m.status === 'In Progress').length;
      const calcProgress = Math.min(100, Math.round(((completedCount + (inProgressCount * 0.5)) / updated.length) * 100));
      setProgress(calcProgress);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const previousProgress = project.progress || 0;
    const diff = Number(progress) - previousProgress;
    const progressDiffText = diff >= 0 ? `+${diff}%` : `${diff}%`;

    const summaryText = logSummary.trim() || `Site milestone and progress updated to ${progress}%.`;
    const logTitle = logSummary.trim() ? (logSummary.length > 35 ? `${logSummary.substring(0, 35)}...` : logSummary) : `Milestone Progress Reached ${progress}%`;

    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      projectId: project.id,
      projectName: project.name || project.code || 'Site Project',
      supervisorName: project.supervisorName || 'Site Supervisor',
      supervisor: project.supervisorName || 'Site Supervisor',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: logTitle,
      progressAdded: progressDiffText,
      currentOverallProgress: Number(progress),
      statusTag: health,
      workSummary: summaryText,
      laborCount: Number(workforceCount) || 8,
      workforceCount: Number(workforceCount) || 8,
      issues: issuesReported || 'None',
      issuesReported: issuesReported || 'None',
      status: 'Active',
      weather,
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=600&auto=format&fit=crop&q=60'
    };

    if (onUpdateProgress) {
      onUpdateProgress({
        projectId: project.id,
        progress: Number(progress),
        health,
        milestones,
        status: Number(progress) === 100 ? 'Completed' : (project.status === 'Planning' && Number(progress) > 0 ? 'In Progress' : project.status),
        newLog
      });
    }

    onClose();
  };

  const getHealthBadgeStyle = (h) => {
    switch (h) {
      case 'On Track':
        return { backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' };
      case 'At Risk':
        return { backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' };
      case 'Delayed':
        return { backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' };
      case 'Completed':
        return { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid #e2e8f0',
        animation: 'fadeInUp 0.25s ease'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#0f172a',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '0.25rem 0.5rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: '1px solid #334155'
            }}>
              <img 
                src={logoImg || '/logo_new.png'} 
                alt="Aarya Innovtech" 
                style={{ height: '30px', width: 'auto', objectFit: 'contain' }} 
              />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
                Update Site Progress & Milestones
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Aarya Innovtech • <strong style={{ color: '#60a5fa' }}>{project.name}</strong>
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
          
          {/* Project Status Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              Project Status
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[
                { name: 'On Track', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
                { name: 'At Risk', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                { name: 'Delayed', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                { name: 'Completed', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
              ].map((item) => {
                const isSelected = health === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setHealth(item.name)}
                    style={{
                      padding: '0.55rem 0.5rem',
                      borderRadius: '10px',
                      border: isSelected ? `2px solid ${item.color}` : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? item.bg : '#ffffff',
                      color: isSelected ? item.color : '#64748b',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center'
                    }}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Execution Milestones */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Execution Milestones (Click to advance status)
              </label>
              <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: '700' }}>Tap to toggle</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {milestones.map((m, idx) => (
                <div
                  key={m.id || idx}
                  onClick={() => toggleMilestoneStatus(idx)}
                  style={{
                    padding: '0.7rem 0.9rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#93c5fd'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: m.status === 'Completed' ? '#dcfce7' : m.status === 'In Progress' ? '#dbeafe' : '#f1f5f9',
                      color: m.status === 'Completed' ? '#16a34a' : m.status === 'In Progress' ? '#2563eb' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {m.status === 'Completed' ? <CheckCircle2 size={16} /> :
                       m.status === 'In Progress' ? <Activity size={16} /> :
                       <Clock size={16} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0f172a' }}>{m.title}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    backgroundColor: m.status === 'Completed' ? '#ecfdf5' : m.status === 'In Progress' ? '#eff6ff' : '#f8fafc',
                    color: m.status === 'Completed' ? '#059669' : m.status === 'In Progress' ? '#2563eb' : '#64748b',
                    border: `1px solid ${m.status === 'Completed' ? '#a7f3d0' : m.status === 'In Progress' ? '#bfdbfe' : '#e2e8f0'}`
                  }}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Site Activity Notes */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.3rem' }}>
                <Users size={12} /> Active Workforce / Labor Count
              </label>
              <input
                type="number"
                value={workforceCount}
                onChange={(e) => setWorkforceCount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.3rem' }}>
                <AlertCircle size={12} color="#f59e0b" /> Site Issues / Blockers (if any)
              </label>
              <input
                type="text"
                placeholder="e.g. Awaiting delivery of 2-inch valves from supplier"
                value={issuesReported}
                onChange={(e) => setIssuesReported(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div style={{
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
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
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Save Progress & Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProgressModal;
