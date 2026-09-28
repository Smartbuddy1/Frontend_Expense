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
import { exportToPDF } from '../utils/exportUtils';
import { toast } from '../../../components/Toast';
import Pagination from '../../../components/ui/Pagination';

const AssignedProjects = () => {
  const { t, language } = useLanguage();
  const { projects: myProjects } = useWallet();

  // Real data from the backend — all projects assigned to this supervisor.
  const projects = myProjects.map((p) => ({
    id: p.code,
    name: p.name,
    location: p.location || p.site || '—',
    status: p.status,
    supervisor: 'You',
    budgetAllocated: `Rs. ${Number(p.budget).toLocaleString('en-IN')}`,
    description: p.description || 'No description provided yet.'
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);

  const filteredProjects = projects.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      p.id.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term)
    );
  });
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const currentProjects = filteredProjects.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

  const handleNextPage = () => {
    if (validCurrentPage < totalPages) setCurrentPage(validCurrentPage + 1);
  };

  const handlePrevPage = () => {
    if (validCurrentPage > 1) setCurrentPage(validCurrentPage - 1);
  };

  const handleExportPDF = () => {
    const headers = ['Project ID', 'Project Name'];
    const rows = filteredProjects.map(p => [
      p.id,
      p.name
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
              : language === 'hi'
              ? 'आपकी सभी नियुक्त साइटों की जानकारी व बजट विवरण।'
              : 'Complete directory and specifications of assigned construction sites and allocated budgets.'}
          </p>
        </div>

        {/* Action Buttons: PDF */}
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
          placeholder={language === 'mr' ? 'प्रोजेक्ट ID किंवा साइट शोधा...' : language === 'hi' ? 'प्रोजेक्ट ID या साइट खोजें...' : 'Search project id, site...'}
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

      {/* Projects Grid Container */}
      <div style={{ width: '100%', boxSizing: 'border-box' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Building2 size={20} color="#3b82f6" />
            {language === 'mr' ? 'सर्व प्रोजेक्ट्सची माहिती' : language === 'hi' ? 'सभी प्रोजेक्ट्स की जानकारी' : 'Assigned Sites & Projects'}
          </h2>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: '800',
            color: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            padding: '0.35rem 0.85rem',
            borderRadius: '2rem',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.05)'
          }}>
            {filteredProjects.length} {language === 'mr' ? 'प्रोजेक्ट्स' : language === 'hi' ? 'प्रोजेक्ट्स' : 'Projects Active'}
          </span>
        </div>

        {/* CSS Grid of Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
          width: '100%'
        }}>
          {filteredProjects.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface-bg)', borderRadius: '1rem', border: '1px dashed var(--border-color)' }}>
              {language === 'mr' ? 'कोणताही जुळणारा प्रोजेक्ट सापडला नाही.' : language === 'hi' ? 'कोई मिलता-जुलता प्रोजेक्ट नहीं मिला।' : 'No matching projects found.'}
            </div>
          ) : (
            currentProjects.map((proj) => (
              <div
                key={proj.id}
                style={{
                  background: 'var(--surface-bg)',
                  borderRadius: '1.15rem',
                  border: '1px solid var(--border-color)',
                  padding: '1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.1rem',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px -2px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
                onClick={() => setSelectedProjectModal(proj)}
              >
                {/* Subtle top border accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />

                {/* Card Header: ID */}
                <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '0.2rem' }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '0.5rem',
                    letterSpacing: '0.03em',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    {proj.id}
                  </div>
                </div>

                {/* Project Name & Location */}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', lineHeight: '1.3' }}>
                    {proj.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <MapPin size={15} color="#64748b" />
                    <span style={{ fontWeight: '500' }}>{proj.location}</span>
                  </div>
                </div>

                {/* Quick Info / Divider */}
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                    <HardHat size={16} color="#94a3b8" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Assigned to You</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination Controls */}
        <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <Pagination
            currentPage={validCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredProjects.length}
            onPageChange={setCurrentPage}
          />
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



              <button
                onClick={() => {
                  toast.info(`Downloading Work Order & Blueprint PDF for ${selectedProjectModal.name}...`);
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
