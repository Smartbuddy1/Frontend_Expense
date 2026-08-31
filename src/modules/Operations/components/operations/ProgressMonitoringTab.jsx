import React, { useState } from 'react';
import { 
  TrendingUp, Activity, CheckCircle2, AlertTriangle, 
  Clock, Calendar, Users, Camera, MapPin, 
  Building2, Plus, ArrowUpRight, Search, Sparkles, Filter,
  Check, HardHat, FileText, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ProgressMonitoringTab = ({ 
  projects = [], 
  siteLogs = [], 
  onOpenUpdateProgress, 
  onSelectProject 
}) => {
  const { language } = useLanguage();
  const [selectedProjectId, setSelectedProjectId] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const displayProjects = projects;

  // Filtered projects
  const filteredProjects = selectedProjectId === 'All' 
    ? displayProjects 
    : displayProjects.filter(p => p.id === selectedProjectId);

  // Filtered site logs
  const filteredLogs = siteLogs.filter(log => {
    const matchesProject = selectedProjectId === 'All' || log.projectId === selectedProjectId;
    const matchesSearch = 
      (log.projectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.workSummary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.supervisorName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
      {/* 1. Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{
            fontSize: '1.45rem',
            fontWeight: '800',
            color: '#0f172a',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <TrendingUp style={{ color: '#ea580c' }} size={24} />
            {language === 'mr' ? 'कामाची प्रगती व साईट लॉग्स (Progress Monitoring)' : 'Monitor Project Progress & Field Logs'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            {language === 'mr' ? 'प्रत्येक साईटचे टप्पे, कामगारांची दैनंदिन कामे व प्रगती अहवाल.' : 'Real-time site milestones, prefab erection checkpoints & supervisor log telemetry.'}
          </p>
        </div>

        {/* Project Selector Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              fontSize: '0.82rem',
              fontWeight: '700',
              outline: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <option value="All">All Maharashtra Projects ({projects.length})</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.code || p.name} ({p.progress}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Horizontal Project Progress Milestones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredProjects.map((project) => {
          const milestones = project.milestones || [
            { id: 'M1', title: 'Survey & Excavation', status: 'Completed', targetDate: '2026-05-15' },
            { id: 'M2', title: 'Plumbing & Drainage', status: 'Completed', targetDate: '2026-06-10' },
            { id: 'M3', title: 'Prefab Enclosure Setup', status: 'In Progress', targetDate: '2026-07-20' },
            { id: 'M4', title: 'SCADA & Sensor Testing', status: 'Pending', targetDate: '2026-08-15' },
            { id: 'M5', title: 'Final Handover', status: 'Pending', targetDate: '2026-08-30' },
          ];

          return (
            <div
              key={project.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.35rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.15rem',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Project Top Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ minWidth: 0, flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe'
                    }}>
                      {project.code || project.id}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569'
                    }}>
                      {project.category}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '9999px',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0'
                    }}>
                      ● {project.health || 'On Track'}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onSelectProject(project)}
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: '800',
                      color: '#0f172a',
                      margin: '0.35rem 0 0.15rem 0',
                      cursor: 'pointer'
                    }}
                  >
                    {project.name}
                  </h3>

                  <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={13} style={{ color: '#ef4444' }} />
                    <span>{project.location}</span>
                    <span>• Supervisor: <strong style={{ color: '#0f172a' }}>{project.supervisorName}</strong></span>
                  </p>
                </div>

                {/* Progress Percent & Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2563eb' }}>{project.progress}%</span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', fontWeight: '600' }}>Overall Progress</span>
                  </div>

                  <button
                    onClick={() => onOpenUpdateProgress(project)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '10px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: '700',
                      border: 'none',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                      cursor: 'pointer'
                    }}
                  >
                    Update Progress
                  </button>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div style={{ width: '100%', height: '8px', borderRadius: '9999px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{
                  width: `${project.progress}%`,
                  height: '100%',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>

              {/* Horizontal Milestones Stepper */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.65rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid #f1f5f9'
              }}>
                {milestones.map((m, idx) => {
                  const isDone = m.status === 'Completed';
                  const isInProg = m.status === 'In Progress';

                  return (
                    <div
                      key={m.id || idx}
                      style={{
                        padding: '0.65rem',
                        borderRadius: '10px',
                        backgroundColor: isDone ? '#ecfdf5' : isInProg ? '#eff6ff' : '#f8fafc',
                        border: `1px solid ${isDone ? '#a7f3d0' : isInProg ? '#bfdbfe' : '#e2e8f0'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: isDone ? '#059669' : isInProg ? '#2563eb' : '#64748b' }}>
                          M{idx + 1}
                        </span>
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: '700',
                          color: isDone ? '#059669' : isInProg ? '#2563eb' : '#94a3b8'
                        }}>
                          {m.status}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        color: '#0f172a',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {m.title}
                      </p>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Target: {m.targetDate}</span>
                    </div>
                  );
                })}
              </div>

              {/* Horizontal Budget vs Expense Tracker */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #f1f5f9',
                fontSize: '0.78rem'
              }}>
                <div>
                  <span style={{ color: '#64748b' }}>Site Budget: </span>
                  <strong style={{ color: '#0f172a' }}>₹{(project.budget || 0).toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Expense Logged: </span>
                  <strong style={{ color: '#ef4444' }}>₹{(project.spent || 0).toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Advance Paid: </span>
                  <strong style={{ color: '#059669' }}>₹{(project.advance || 0).toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Remaining Balance: </span>
                  <strong style={{ color: '#2563eb' }}>₹{(project.balance || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Live Site Logs Feed */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Live Supervisor Daily Work Logs
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
              On-site progress reports, civil tests, and SCADA board integrations
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              <div style={{ minWidth: 0, flex: '1 1 280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.72rem', color: '#2563eb' }}>
                    {log.projectName || 'Site'}
                  </span>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{log.title}</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0.2rem 0 0 0' }}>
                  {log.workSummary}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0f172a', display: 'block' }}>{log.supervisorName}</span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{log.date} {log.time ? `• ${log.time}` : ''}</span>
                </div>

                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: log.status === 'Active' ? '#fef2f2' : '#ecfdf5',
                  color: log.status === 'Active' ? '#dc2626' : '#059669',
                  border: `1px solid ${log.status === 'Active' ? '#fecaca' : '#a7f3d0'}`
                }}>
                  ● {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressMonitoringTab;
