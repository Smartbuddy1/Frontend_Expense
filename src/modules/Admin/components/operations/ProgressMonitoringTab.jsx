import React, { useState } from 'react';
import { 
  TrendingUp, Activity, CheckCircle2, AlertTriangle, 
  Clock, Calendar, Users, Camera, MapPin, 
  Building2, Plus, ArrowUpRight, Search, Sparkles, Filter,
  Check, HardHat, FileText, ChevronRight, Eye, Download, Printer
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const ProgressMonitoringTab = ({ 
  projects = [], 
  siteLogs = [], 
  onNavigateTab,
  onOpenUpdateProgress, 
  onSelectProject 
}) => {
  const { language } = useLanguage();
  const [selectedProjectId, setSelectedProjectId] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('projects'); // 'projects' or 'logs'

  // Limit to 3 core active projects or full list
  const displayProjects = projects.slice(0, 3);

  // Filtered projects
  const filteredProjects = displayProjects.filter(p => {
    const matchesProject = selectedProjectId === 'All' || p.id === selectedProjectId;
    const matchesSearch = 
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.supervisorName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  });

  // Filtered site logs
  const filteredLogs = siteLogs.filter(log => {
    const matchesProject = selectedProjectId === 'All' || log.projectId === selectedProjectId;
    const matchesSearch = 
      (log.projectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.workSummary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.supervisorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesSearch;
  });

  const handleExportPDF = () => {
    if (activeSubTab === 'projects') {
      const columns = ['Code', 'Project Name', 'Site Location', 'Supervisor', 'Progress', 'Status'];
      const rows = filteredProjects.map(p => [
        p.code || p.id,
        p.name,
        p.location,
        p.supervisorName || '-',
        `${p.progress}%`,
        p.health || 'On Track'
      ]);
      exportToPDF('AARYA_INNOVTECH_Site_Progress_Report', columns, rows, 'Official Site Physical Progress & Milestones Audit');
    } else {
      const columns = ['Date', 'Project Site', 'Supervisor', 'Work Title', 'Work Summary', 'Status'];
      const rows = filteredLogs.map(l => [
        `${l.date} ${l.time || ''}`,
        l.projectName || '-',
        l.supervisorName || '-',
        l.title || '-',
        l.workSummary || '-',
        l.status || 'Active'
      ]);
      exportToPDF('AARYA_INNOVTECH_Daily_Site_Logs', columns, rows, 'Official Daily Site Logs & Field Telemetry Telemetry');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. Header Section */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: '900',
            color: '#0f172a',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <TrendingUp style={{ color: '#2563eb' }} size={26} />
            <span>Site Progress & Work Logs</span>
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0.25rem 0 0 0', fontWeight: '500' }}>
            Structured vertical audit table of on-site milestones, daily logs, and physical progress.
          </p>
        </div>

        {/* Action Controls: Search, Filter, PDF */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '190px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search site, supervisor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.48rem 0.85rem 0.48rem 2.2rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Project Dropdown */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              padding: '0.48rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.84rem',
              fontWeight: '700',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Projects ({projects.length})</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.code || p.name} ({p.progress}%)
              </option>
            ))}
          </select>

          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            style={{
              padding: '0.48rem 0.95rem',
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Download size={15} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Summary Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        width: '100%'
      }}>
        {/* Card 1: Projects -> Redirects to Site Projects Module */}
        <div 
          onClick={() => {
            if (onNavigateTab) {
              onNavigateTab('projects');
            } else {
              setActiveSubTab('projects');
              setSelectedProjectId('All');
            }
          }}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #2563eb',
            padding: '1rem 1.25rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.15)'; e.currentTarget.style.borderColor = '#93c5fd'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Sites</span>
          <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#0f172a', marginTop: '0.15rem' }}>3 Sites</div>
        </div>

        {/* Card 2: Avg Progress -> Switches to Projects Progress Table */}
        <div 
          onClick={() => setActiveSubTab('projects')}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: activeSubTab === 'projects' ? '1.5px solid #10b981' : '1px solid #e2e8f0',
            borderLeft: '4px solid #10b981',
            padding: '1rem 1.25rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(16,185,129,0.15)'; e.currentTarget.style.borderColor = '#6ee7b7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = activeSubTab === 'projects' ? '#10b981' : '#e2e8f0'; }}
        >
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Progress</span>
          <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#10b981', marginTop: '0.15rem' }}>57.3%</div>
        </div>

        {/* Card 3: Jobs -> Opens Update Milestone Modal or highlights milestones */}
        <div 
          onClick={() => {
            if (onOpenUpdateProgress && displayProjects.length > 0) {
              onOpenUpdateProgress(displayProjects[0]);
            } else {
              setActiveSubTab('projects');
            }
          }}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #8b5cf6',
            padding: '1rem 1.25rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(139,92,246,0.15)'; e.currentTarget.style.borderColor = '#c4b5fd'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Tasks</span>
          <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#8b5cf6', marginTop: '0.15rem' }}>15 Tasks</div>
        </div>

        {/* Card 4: Daily Site Reports -> Switches to Daily Site Logs Table */}
        <div 
          onClick={() => setActiveSubTab('logs')}
          style={{
            backgroundColor: activeSubTab === 'logs' ? '#fff7ed' : '#ffffff',
            borderRadius: '14px',
            border: activeSubTab === 'logs' ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
            borderLeft: '4px solid #ea580c',
            padding: '1rem 1.25rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(234,88,12,0.15)'; e.currentTarget.style.borderColor = '#fdba74'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = activeSubTab === 'logs' ? '#ea580c' : '#e2e8f0'; }}
        >
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Daily Site Reports</span>
          <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#ea580c', marginTop: '0.15rem' }}>{filteredLogs.length} Reports</div>
        </div>
      </div>

      {/* 3. Sub Tabs Toggle: Projects Progress Table vs. Daily Logs Table */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.25rem' }}>
        <button
          onClick={() => setActiveSubTab('projects')}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            backgroundColor: activeSubTab === 'projects' ? '#2563eb' : 'transparent',
            color: activeSubTab === 'projects' ? '#ffffff' : '#64748b',
            fontSize: '0.88rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Building2 size={16} />
          <span>Site Projects Progress Table ({filteredProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            backgroundColor: activeSubTab === 'logs' ? '#2563eb' : 'transparent',
            color: activeSubTab === 'logs' ? '#ffffff' : '#64748b',
            fontSize: '0.88rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={16} />
          <span>Daily Supervisor Site Logs ({filteredLogs.length})</span>
        </button>
      </div>

      {/* 4. Vertical Table Format: Tab 1 - Projects Physical Progress */}
      {activeSubTab === 'projects' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          width: '100%'
        }}>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1.5px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <th style={{ padding: '0.95rem 1.25rem', whiteSpace: 'nowrap' }}>PROJECT SITE</th>
                  <th style={{ padding: '0.95rem 1rem', whiteSpace: 'nowrap' }}>LEAD SUPERVISOR</th>
                  <th style={{ padding: '0.95rem 1rem', whiteSpace: 'nowrap', textAlign: 'center' }}>STATUS</th>
                  <th style={{ padding: '0.95rem 1.25rem', whiteSpace: 'nowrap', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, idx) => {
                  return (
                    <tr
                      key={project.id}
                      style={{
                        borderBottom: idx === filteredProjects.length - 1 ? 'none' : '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Project Site */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <strong 
                          onClick={() => onSelectProject(project)}
                          style={{ color: '#0f172a', fontSize: '0.92rem', cursor: 'pointer', fontWeight: '800' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#0f172a'}
                        >
                          {project.name}
                        </strong>
                      </td>

                      {/* Lead Supervisor */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: '#f1f5f9',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '0.82rem',
                            border: '1px solid #e2e8f0',
                            flexShrink: 0
                          }}>
                            {project.supervisorName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.88rem' }}>
                              {project.supervisorName || 'Unassigned'}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                              {project.supervisorPhone || '+91 98220 00000'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '9999px',
                          backgroundColor: project.health === 'On Track' ? '#ecfdf5' : '#fef2f2',
                          color: project.health === 'On Track' ? '#059669' : '#dc2626',
                          border: `1px solid ${project.health === 'On Track' ? '#a7f3d0' : '#fecaca'}`
                        }}>
                          ● {project.health || 'On Track'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => onOpenUpdateProgress && onOpenUpdateProgress(project)}
                          style={{
                            padding: '0.45rem 0.9rem',
                            borderRadius: '8px',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <TrendingUp size={13} />
                          <span>Update</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Vertical Table Format: Tab 2 - Daily Supervisor Site Logs */}
      {activeSubTab === 'logs' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          width: '100%'
        }}>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1.5px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <th style={{ padding: '0.95rem 1.25rem', whiteSpace: 'nowrap' }}>DATE & TIME</th>
                  <th style={{ padding: '0.95rem 1rem', whiteSpace: 'nowrap' }}>SITE PROJECT</th>
                  <th style={{ padding: '0.95rem 1rem', whiteSpace: 'nowrap' }}>SUPERVISOR</th>
                  <th style={{ padding: '0.95rem 1rem', whiteSpace: 'nowrap' }}>WORK LOG TITLE & DESCRIPTION</th>
                  <th style={{ padding: '0.95rem 1.25rem', whiteSpace: 'nowrap', textAlign: 'center' }}>LOG STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr
                    key={log.id || idx}
                    style={{
                      borderBottom: idx === filteredLogs.length - 1 ? 'none' : '1px solid #f1f5f9',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Date & Time */}
                    <td style={{ padding: '0.95rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800', color: '#0f172a', fontSize: '0.88rem' }}>
                        <Calendar size={14} style={{ color: '#2563eb' }} />
                        <span>{log.date}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.1rem' }}>
                        {log.time || '11:00 AM'}
                      </span>
                    </td>

                    {/* Site Project */}
                    <td style={{ padding: '0.95rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        display: 'inline-block'
                      }}>
                        {log.projectName || 'Site Project'}
                      </span>
                    </td>

                    {/* Supervisor */}
                    <td style={{ padding: '0.95rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#f1f5f9',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '0.78rem'
                        }}>
                          {log.supervisorName?.charAt(0) || 'S'}
                        </div>
                        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.88rem' }}>
                          {log.supervisorName || 'Field Lead'}
                        </span>
                      </div>
                    </td>

                    {/* Work Log Title & Description */}
                    <td style={{ padding: '0.95rem 1rem', verticalAlign: 'middle' }}>
                      <strong style={{ color: '#0f172a', fontSize: '0.9rem', display: 'block' }}>
                        {log.title}
                      </strong>
                      <p style={{ color: '#475569', fontSize: '0.82rem', margin: '0.15rem 0 0 0', lineHeight: 1.4, maxWidth: '420px' }}>
                        {log.workSummary}
                      </p>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.95rem 1rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '0.76rem',
                        fontWeight: '800',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        backgroundColor: log.status === 'Active' ? '#fef2f2' : '#ecfdf5',
                        color: log.status === 'Active' ? '#dc2626' : '#059669',
                        border: `1px solid ${log.status === 'Active' ? '#fecaca' : '#a7f3d0'}`
                      }}>
                        ● {log.status || 'Verified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProgressMonitoringTab;
