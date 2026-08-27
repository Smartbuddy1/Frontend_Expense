import React, { useState, useEffect } from 'react';
import { X, UserCheck, Building2, ShieldCheck, CheckCircle2, Phone, Users } from 'lucide-react';

const AssignTeamModal = ({ isOpen, onClose, onAssign, project, projects = [], supervisors = [] }) => {
  const [selectedProjectId, setSelectedProjectId] = useState('');
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
        setSelectedSupervisorId(matchedSup ? matchedSup.id : (project.supervisorId || supervisors[0]?.id || ''));
        const firstProj = projects[0];
        setSelectedProjectId(firstProj?.id || '');
        setTeamCount(firstProj?.teamCount || 8);
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
    : projects.find(p => p.id === selectedProjectId) || project;

  const handleSave = (e) => {
    e.preventDefault();
    const finalProjectId = isProjectGiven ? project.id : selectedProjectId;
    const supervisor = supervisors.find(s => s.id === selectedSupervisorId) ||
                       supervisors.find(s => s.name?.toLowerCase() === project.supervisorName?.toLowerCase());
    
    if (!finalProjectId) {
      alert('Please select a project to assign');
      return;
    }

    const resolvedSupId = supervisor ? supervisor.id : (selectedSupervisorId || project.supervisorId || `SUP-${Date.now()}`);
    const resolvedSupName = supervisor ? supervisor.name : (project.supervisorName || 'Site Supervisor');
    const resolvedSupPhone = supervisor ? supervisor.phone : (project.supervisorPhone || '+91 98220 11223');

    onAssign({
      projectId: finalProjectId,
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
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
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
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
            }}>
              <UserCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Assign Site Supervisor & Team
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0 0', fontWeight: '500' }}>
                Select supervisor and configure team members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* 1. Site / Project Info Card or Selector */}
          {isProjectGiven ? (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1rem 1.15rem'
            }}>
              <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Target Site / Project
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                <Building2 size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                <strong style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '800' }}>
                  {project.name}
                </strong>
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Client: <strong>{project.client}</strong> • {project.location}
              </p>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#334155', marginBottom: '0.45rem' }}>
                Select Target Project / Site *
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #2563eb',
                  backgroundColor: '#eff6ff',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  color: '#1d4ed8',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Select Project / Site --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. Select Supervisor Dropdown & List */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#334155', marginBottom: '0.45rem' }}>
              Select Site Supervisor *
            </label>
            <select
              value={selectedSupervisorId}
              onChange={(e) => setSelectedSupervisorId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1.5px solid #2563eb',
                backgroundColor: '#eff6ff',
                fontSize: '0.92rem',
                fontWeight: '800',
                color: '#1d4ed8',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="">-- Select Supervisor --</option>
              {supervisors.map((sup) => (
                <option key={sup.id} value={sup.id} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                  {sup.name} ({sup.specialization || 'Site Lead'}) • {sup.phone || '+91 98000 00000'}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Number of Team Members (Field Crew) */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: '800', color: '#334155', marginBottom: '0.45rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={16} style={{ color: '#2563eb' }} />
                <span>Total Team Members (कामगारांची संख्या) *</span>
              </span>
              <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '700' }}>
                {teamCount} Persons
              </span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                min="1"
                max="100"
                value={teamCount}
                onChange={(e) => setTeamCount(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {/* Quick Count Selector Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginRight: '0.2rem' }}>Quick select:</span>
              {[4, 6, 8, 10, 12, 15].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTeamCount(count)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '8px',
                    border: teamCount === count ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: teamCount === count ? '#eff6ff' : '#ffffff',
                    color: teamCount === count ? '#2563eb' : '#64748b',
                    fontSize: '0.78rem',
                    fontWeight: teamCount === count ? '800' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {count} Members
                </button>
              ))}
            </div>
          </div>

          {/* Quick Details of Currently Selected Supervisor */}
          {selectedSupervisorId && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
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
                        <strong style={{ color: '#0f172a', fontSize: '0.9rem', display: 'block' }}>{cur.name}</strong>
                        <span style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: '700' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
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

