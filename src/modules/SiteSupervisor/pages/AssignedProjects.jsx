import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  CheckCircle2,
  HardHat,
  FileText,
  Eye,
  FileDown,
  FileSpreadsheet,
  Printer,
  Search,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWallet } from '../context/WalletContext';
import { exportToExcel, triggerPrint, exportToPDF } from '../utils/exportUtils';

const AssignedProjects = () => {
  const { t, language } = useLanguage();
  const { project } = useWallet();

  // Real data from the backend — a supervisor currently has exactly one assigned project.
  const projects = project ? [{
    id: project.code,
    name: project.name,
    location: project.location || project.site || '—',
    status: project.status,
    supervisor: 'You',
    budgetAllocated: `Rs. ${Number(project.budget).toLocaleString('en-IN')}`,
    description: project.description || 'No description provided yet.'
  }] : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);

  const filteredProjects = projects.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      p.id.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term) ||
      p.status.toLowerCase().includes(term)
    );
  });

  const handleExportExcel = () => {
    const headers = ['Project ID', 'Project Name', 'Location', 'Status'];
    const rows = filteredProjects.map(p => [
      p.id,
      p.name,
      p.location,
      p.status
    ]);
    exportToExcel('Assigned_Projects_Master_List', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ['Project ID', 'Project Name', 'Location', 'Status'];
    const rows = filteredProjects.map(p => [
      p.id,
      p.name,
      p.location,
      p.status
    ]);
    exportToPDF({
      fileName: 'Assigned_Projects_Report',
      title: 'Assigned Projects & Sites Master Report',
      subtitle: 'Complete directory of active construction projects and site specifications.',
      headers,
      rows,
      meta: [
        { label: 'Total Projects', value: `${projects.length} Sites` },
        { label: 'Filtered', value: `${filteredProjects.length} Shown` }
      ]
    });
  };

  return (
    <div className="supervisor-container" style={{ gap: '1.25rem' }}>
      {/* Frameless Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '0.5rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 0.25rem 0'
          }}>
            {t('assignedProjects')}
          </h1>
          <p style={{
            fontSize: '0.925rem',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            {language === 'mr'
              ? 'तुमच्या सर्व नियुक्त केलेल्या साइट्सची माहिती आणि बजेट तपशील.'
              : 'Complete directory and specifications of assigned construction sites and allocated budgets.'}
          </p>
        </div>

        {/* Action Buttons: PDF, Excel, Print */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: '#6366f1',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Download Projects List as PDF"
          >
            <FileDown size={15} />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Export Projects List to Excel"
          >
            <FileSpreadsheet size={15} />
            <span>Excel</span>
          </button>

          <button
            onClick={triggerPrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Print Projects Table"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* 50% Width Search Bar Placed Below Subtitle Line */}
      <div style={{
        position: 'relative',
        width: '50%',
        minWidth: '280px',
        margin: '0.15rem 0 0.35rem 0'
      }}>
        <Search
          size={17}
          style={{
            position: 'absolute',
            left: '0.95rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            pointerEvents: 'none'
          }}
        />
        <input
          type="text"
          placeholder={language === 'mr' ? 'साइट, लोकेशन किंवा प्रोजेक्ट शोधा...' : 'Search site, location, client, status...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.55rem 2.2rem 0.55rem 2.5rem',
            borderRadius: '0.75rem',
            border: '1.5px solid var(--border-color)',
            backgroundColor: 'var(--surface-bg)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px -2px var(--shadow-color)',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px'
            }}
            title="Clear Search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Complete Project Info Table */}
      <div style={{
        background: 'var(--surface-bg)',
        borderRadius: '1.15rem',
        border: '1px solid var(--border-color)',
        padding: '1.25rem',
        boxShadow: '0 4px 15px -2px var(--shadow-color)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.1rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <FileText size={18} color="#3b82f6" />
            {language === 'mr' ? 'सर्व प्रोजेक्ट्सची माहिती' : 'All Assigned Projects Information'}
          </h2>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            {filteredProjects.length} {language === 'mr' ? 'प्रोजेक्ट्स' : 'Projects'}
          </span>
        </div>

        <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          <table className="premium-table" style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Project ID</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Project & Site Name</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Location</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {language === 'mr' ? 'कोणताही जुळणारा प्रोजेक्ट सापडला नाही.' : 'No matching projects found.'}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => (
                  <tr
                    key={proj.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '0.9rem 1rem', fontWeight: '700', color: '#3b82f6', whiteSpace: 'nowrap' }}>
                      {proj.id}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {proj.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        Lead: {proj.supervisor}
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} color="#ef4444" />
                        <span>{proj.location}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981'
                      }}>
                        <CheckCircle2 size={12} /> {proj.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setSelectedProjectModal(proj)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '0.5rem',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          fontSize: '0.775rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProjectModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}
          onClick={() => setSelectedProjectModal(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--surface-bg)',
              borderRadius: '1.25rem',
              width: '100%',
              maxWidth: '500px',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 color="#3b82f6" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {selectedProjectModal.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProjectModal(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ background: 'var(--card-bg)', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Scope & Description</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                  {selectedProjectModal.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'var(--card-bg)', padding: '0.75rem 0.9rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                    {language === 'mr' ? 'लोकेशन' : 'LOCATION'}
                  </span>
                  <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {selectedProjectModal.location}
                  </div>
                </div>
                <div style={{ background: 'var(--card-bg)', padding: '0.75rem 0.9rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                    {language === 'mr' ? 'प्रकल्प स्थिती' : 'PROJECT STATUS'}
                  </span>
                  <div style={{ fontSize: '0.875rem', fontWeight: '800', color: '#10b981', marginTop: '0.2rem' }}>
                    {selectedProjectModal.status}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`Downloading Work Order & Blueprint PDF for ${selectedProjectModal.name}...`);
                  setSelectedProjectModal(null);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.65rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Download Work Order Blueprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedProjects;
