import React, { useState, useEffect } from 'react';
import { X, UserCheck, Building2, ShieldCheck, CheckCircle2, Phone, Users } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

const AssignTeamModal = ({ isOpen, onClose, onAssign, project, projects = [], supervisors = [] }) => {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectMode, setProjectMode] = useState('single'); // 'single' | 'multiple'
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [teamCount, setTeamCount] = useState(8);

  const isProjectGiven = Boolean(project?.id && project?.name && !project?.supervisorOnly);

  useEffect(() => {
    if (project) {
      if (isProjectGiven) {
        setSelectedProjectId(project.id);
        const matched = supervisors.find(s => s.id === project.supervisorId || (s.name && project.supervisorName && s.name.toLowerCase() === project.supervisorName.toLowerCase()));
        setSelectedSupervisorId(matched ? matched.id : (project.supervisorId || supervisors[0]?.id || ''));
        setTeamCount(project.teamCount || (project.assignedTeam?.length > 0 ? project.assignedTeam.length : 8));
      } else {
        // Project passed is actually supervisor reference
        const matchedSup = supervisors.find(s => s.id === project.supervisorId || (s.name && project.supervisorName && s.name.toLowerCase() === project.supervisorName.toLowerCase()));
        const targetSupId = matchedSup ? matchedSup.id : (project.supervisorId || supervisors[0]?.id || '');
        setSelectedSupervisorId(targetSupId);
        
        // Find all projects currently assigned to this supervisor
        const supervisorProjects = projects.filter(p => p.supervisorId === targetSupId || (p.supervisorName && project.supervisorName && p.supervisorName.toLowerCase() === project.supervisorName.toLowerCase()));
        
        if (supervisorProjects.length > 0) {
          setSelectedProjectId(supervisorProjects[0].id);
          setSelectedProjectIds(supervisorProjects.map(p => p.id));
          setProjectMode(supervisorProjects.length > 1 ? 'multiple' : 'single');
          setTeamCount(supervisorProjects[0].teamCount || 8);
        } else {
          const firstProj = projects[0];
          setSelectedProjectId(firstProj?.id || '');
          setSelectedProjectIds(firstProj ? [firstProj.id] : []);
          setProjectMode('single');
          setTeamCount(firstProj?.teamCount || 8);
        }
      }
    }
  }, [project, isOpen, projects, supervisors, isProjectGiven]);

  // When project dropdown changes (for unassigned supervisor flow)
  const handleProjectChange = (projId) => {
    setSelectedProjectId(projId);
    const chosen = projects.find(p => p.id === projId);
    if (chosen) {
      setTeamCount(chosen.teamCount || 8);
    }
  };

  if (!isOpen || !project) return null;

  const activeProject = isProjectGiven 
    ? project 
    : projects.find(p => p.id === (projectMode === 'single' ? selectedProjectId : selectedProjectIds[0])) || project;

  const handleToggleProjectId = (id) => {
    setSelectedProjectIds(prev => {
      const isSelected = prev.includes(id);
      if (!isSelected) {
        return [...prev, id];
      } else {
        return prev.filter(pid => pid !== id);
      }
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const finalProjectId = isProjectGiven ? project.id : selectedProjectId;
    const supervisor = supervisors.find(s => s.id === selectedSupervisorId) ||
                       supervisors.find(s => s.name?.toLowerCase() === project.supervisorName?.toLowerCase());
    
    if (projectMode === 'single' && !finalProjectId) {
      alert('Please select a project to assign');
      return;
    }
    if (projectMode === 'multiple' && selectedProjectIds.length === 0) {
      alert('Please select at least one project to assign');
      return;
    }

    const resolvedSupId = supervisor ? supervisor.id : (selectedSupervisorId || project.supervisorId || `SUP-${Date.now()}`);
    const resolvedSupName = supervisor ? supervisor.name : (project.supervisorName || 'Site Supervisor');
    const resolvedSupPhone = supervisor ? supervisor.phone : (project.supervisorPhone || '+91 98220 11223');

    onAssign({
      projectId: finalProjectId,
      projectIds: projectMode === 'single' ? [finalProjectId] : selectedProjectIds,
      supervisorId: resolvedSupId,
      supervisorName: resolvedSupName,
      supervisorPhone: resolvedSupPhone,
      assignedTeam: activeProject?.assignedTeam || [],
      teamCount: Number(teamCount) || 8,
      notes: '',
    });
    onClose();
  };

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
        maxWidth: '520px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeInUp 0.2s ease'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              padding: '0.3rem 0.55rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid var(--border-color, #cbd5e1)'
            }}>
              <img 
                src={logoImg} 
                alt="Aarya Innovtech" 
                style={{ height: '28px', width: 'auto', objectFit: 'contain' }} 
              />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                Assign Site Supervisor & Team
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', margin: '0.15rem 0 0 0', fontWeight: '500' }}>
                Select supervisor and configure team members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--input-bg, #ffffff)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: '10px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary, #64748b)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* 1. Site / Project Info Card or Selector */}
          {isProjectGiven ? null : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-secondary, #334155)' }}>
                  Target Project(s) / Site(s) *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary, #f1f5f9)', padding: '0.2rem', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setProjectMode('single')}
                    style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: projectMode === 'single' ? 'var(--input-bg, #ffffff)' : 'transparent',
                      color: projectMode === 'single' ? 'var(--primary-color, #2563eb)' : 'var(--text-secondary, #64748b)',
                      boxShadow: projectMode === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Single Site
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectMode('multiple')}
                    style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: projectMode === 'multiple' ? 'var(--input-bg, #ffffff)' : 'transparent',
                      color: projectMode === 'multiple' ? 'var(--primary-color, #2563eb)' : 'var(--text-secondary, #64748b)',
                      boxShadow: projectMode === 'multiple' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Multiple Sites
                  </button>
                </div>
              </div>

              {projectMode === 'single' ? (
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color, #2563eb)',
                    backgroundColor: 'var(--input-bg, #eff6ff)',
                    fontSize: '0.92rem',
                    fontWeight: '800',
                    color: 'var(--text-primary, #1d4ed8)',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Select Project / Site --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} style={{ color: 'var(--text-primary, #0f172a)', backgroundColor: 'var(--input-bg, #ffffff)' }}>
                      {p.name} ({p.location})
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  background: 'var(--input-bg, #f8fafc)'
                }}>
                  {projects.map((p) => {
                    const isChecked = selectedProjectIds.includes(p.id);
                    return (
                      <label 
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          background: isChecked ? 'var(--bg-secondary, #eff6ff)' : 'transparent',
                          border: `1px solid ${isChecked ? 'var(--primary-color, #bfdbfe)' : 'transparent'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleProjectId(p.id)}
                          style={{
                            marginRight: '0.75rem',
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: 'var(--primary-color, #2563eb)'
                          }}
                        />
                        <span style={{ 
                          fontSize: '0.85rem', 
                          fontWeight: isChecked ? '700' : '500',
                          color: isChecked ? 'var(--primary-color, #1e40af)' : 'var(--text-primary, #334155)'
                        }}>
                          {p.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. Select Supervisor Dropdown & List */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-secondary, #334155)', marginBottom: '0.45rem' }}>
              Select Site Supervisor *
            </label>
            <select
              value={selectedSupervisorId}
              onChange={(e) => setSelectedSupervisorId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color, #2563eb)',
                backgroundColor: 'var(--input-bg, #eff6ff)',
                fontSize: '0.92rem',
                fontWeight: '800',
                color: 'var(--text-primary, #1d4ed8)',
                backgroundColor: 'var(--input-bg, #ffffff)',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="">-- Select Supervisor --</option>
              {supervisors.map((sup) => (
                <option key={sup.id} value={sup.id} style={{ color: 'var(--text-primary, #0f172a)', backgroundColor: 'var(--input-bg, #ffffff)' }}>
                  {sup.name} ({sup.specialization || 'Site Lead'}) • {sup.phone || '+91 98000 00000'}
                </option>
              ))}
            </select>
          </div>



          {/* Quick Details of Currently Selected Supervisor */}
          {selectedSupervisorId && (
            <div style={{
              backgroundColor: 'var(--card-bg, #f0fdf4)',
              border: '1px solid var(--border-color, #bbf7d0)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {(() => {
                const cur = supervisors.find(s => s.id === selectedSupervisorId);
                if (!cur) return null;
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '0.9rem'
                      }}>
                        {cur.name.charAt(0)}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.9rem', display: 'block' }}>{cur.name}</strong>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary, #15803d)', fontWeight: '700' }}>
                          <Phone size={11} style={{ display: 'inline', marginRight: '4px' }} />
                          {cur.phone}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#059669', backgroundColor: '#dcfce7', padding: '0.2rem 0.55rem', borderRadius: '9999px' }}>
                      ● Active Lead
                    </span>
                  </>
                );
              })()}
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #f1f5f9)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--input-bg, #ffffff)',
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
              disabled={!selectedSupervisorId}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background: selectedSupervisorId 
                  ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' 
                  : '#cbd5e1',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: selectedSupervisorId ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: selectedSupervisorId ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Save Assignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTeamModal;

