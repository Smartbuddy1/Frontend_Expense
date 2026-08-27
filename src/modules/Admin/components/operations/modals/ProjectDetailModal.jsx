import React from 'react';
import { X, Building2, MapPin, Calendar, IndianRupee, Users, CheckCircle2, Activity, Clock, ShieldCheck, Phone, ArrowUpRight } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

const ProjectDetailModal = ({ isOpen, onClose, project, supervisors = [], teamMembers = [], expenses = [], onOpenAssign, onOpenProgress }) => {
  if (!isOpen || !project) return null;

  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const totalApprovedExpenses = projectExpenses
    .filter(e => e.status === 'Approved')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const assignedMembers = teamMembers.filter(m => project.assignedTeam?.includes(m.id));

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
        maxWidth: '720px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
                  {project.name}
                </h3>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#1e293b',
                  color: '#93c5fd',
                  border: '1px solid #334155'
                }}>
                  {project.code || project.id}
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={12} color="#f87171" />
                <span>{project.location} • {project.client}</span>
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

        {/* Modal Body */}
        <div style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
          {/* Top Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '0.85rem 1rem', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Live Progress</div>
              <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#2563eb', marginTop: '0.15rem' }}>
                {project.progress}%
              </div>
            </div>

            <div style={{ padding: '0.85rem 1rem', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Current Status</div>
              <div style={{ marginTop: '0.35rem' }}>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: project.health === 'On Track' ? '#ecfdf5' : '#fef2f2',
                  color: project.health === 'On Track' ? '#059669' : '#dc2626',
                  border: `1px solid ${project.health === 'On Track' ? '#a7f3d0' : '#fecaca'}`
                }}>
                  ● {project.health || 'On Track'}
                </span>
              </div>
            </div>

            <div style={{ padding: '0.85rem 1rem', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Assigned Crew</div>
              <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', marginTop: '0.15rem' }}>
                {assignedMembers.length || project.teamCount || 8} Members
              </div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div style={{ padding: '0.9rem 1.1rem', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Scope & Objective</div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#1e3a8a', lineHeight: 1.45 }}>{project.description}</p>
            </div>
          )}

          {/* Supervisor Card */}
          <div style={{ padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} color="#16a34a" /> Site Supervisor
              </span>
              {onOpenAssign && (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenAssign(project); }}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '800', fontSize: '0.76rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  Change <ArrowUpRight size={13} />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: '#f8fafc' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                {project.supervisorName?.charAt(0) || 'S'}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>{project.supervisorName || 'Unassigned'}</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                  <Phone size={11} /> <span>{project.supervisorPhone || '+91 98220 00000'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones Stepper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Activity size={14} color="#6366f1" /> Milestones & Execution Stages
              </span>
              {onOpenProgress && (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenProgress(project); }}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '800', fontSize: '0.76rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  Update <ArrowUpRight size={13} />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {project.milestones?.map((m, idx) => (
                <div key={m.id || idx} style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      backgroundColor: m.status === 'Completed' ? '#dcfce7' : m.status === 'In Progress' ? '#dbeafe' : '#e2e8f0',
                      color: m.status === 'Completed' ? '#16a34a' : m.status === 'In Progress' ? '#2563eb' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {m.status === 'Completed' ? <CheckCircle2 size={15} /> :
                       m.status === 'In Progress' ? <Activity size={15} /> :
                       <Clock size={15} />}
                    </div>
                    <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0f172a' }}>{m.title}</span>
                  </div>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    backgroundColor: m.status === 'Completed' ? '#ecfdf5' : m.status === 'In Progress' ? '#eff6ff' : '#ffffff',
                    color: m.status === 'Completed' ? '#059669' : m.status === 'In Progress' ? '#2563eb' : '#64748b',
                    border: `1px solid ${m.status === 'Completed' ? '#a7f3d0' : m.status === 'In Progress' ? '#bfdbfe' : '#cbd5e1'}`
                  }}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
            Timeline: {project.startDate} to {project.endDate}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
