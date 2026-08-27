import React, { useState } from 'react';
import { Search, Edit3, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ProjectsTab = ({ 
  projects = [], 
  onOpenCreateProject, 
  onEditProject, 
  onDeleteProject, 
  onSelectProject 
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase();
    const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false;
    const clientMatch = p.client ? p.client.toLowerCase().includes(q) : false;
    const idMatch = p.id ? p.id.toLowerCase().includes(q) : false;
    const locMatch = p.location ? p.location.toLowerCase().includes(q) : false;
    return !searchQuery || nameMatch || clientMatch || idMatch || locMatch;
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProjects = filteredProjects.slice(
    (safePage - 1) * itemsPerPage, 
    safePage * itemsPerPage
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
      {/* 1. Top Header (Matching Reference Screenshot) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0, lineHeight: 1.2 }}>
            Projects
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary, #64748b)', margin: '0.35rem 0 0 0', fontWeight: '500' }}>
            Manage ongoing and completed site projects & operations.
          </p>
        </div>

        {/* Create Project Button (Opens Modal with Form) */}
        <button
          onClick={() => onOpenCreateProject && onOpenCreateProject()}
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem 1.65rem',
            fontSize: '0.88rem',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35)';
          }}
        >
          + Create Project
        </button>
      </div>

      {/* 2. Search Bar */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search projects by Name or Supervisor..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.75rem',
            borderRadius: '12px',
            backgroundColor: 'var(--input-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            fontSize: '0.88rem',
            color: 'var(--text-primary, #0f172a)',
            outline: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* 3. 3-Column Grid of Project Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.35rem', width: '100%' }}>
        {paginatedProjects.map((project) => {
          return (
            <div
              key={project.id}
              style={{
                background: 'var(--card-bg, #ffffff)',
                backgroundColor: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '20px',
                padding: '1.65rem 1.75rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '215px',
                boxSizing: 'border-box',
                transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.03)';
                e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
              }}
            >
              {/* Card Top: Title */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <h3 
                    onClick={() => onSelectProject && onSelectProject(project)} 
                    style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0, cursor: 'pointer', lineHeight: 1.25 }}
                  >
                    {project.name}
                  </h3>
                </div>

                {/* Card Body: Supervisor & Details */}
                <div style={{ marginTop: '0.85rem' }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary, #64748b)', lineHeight: 1.4 }}>
                    <span style={{ color: 'var(--text-secondary, #64748b)', fontWeight: '500' }}>Supervisor: </span>
                    <strong style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '800' }}>{project.client || 'Rohit Sharma'}</strong>
                  </p>
                  <p style={{ margin: '0.45rem 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary, #64748b)', lineHeight: 1.4 }}>
                    {project.description || (language === 'mr' ? 'काही टिप्पणी नाही.' : 'No remark provided.')}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Start Date & Action Buttons (Edit + Delete) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color, #f8fafc)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', fontWeight: '600' }}>
                  {language === 'mr' ? 'सुरुवात:' : 'Start:'} {project.startDate || '01/08/2026'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {/* Edit Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProject && onEditProject(project);
                    }} 
                    title={language === 'mr' ? 'प्रोजेक्ट बदला (Edit)' : 'Edit Project'}
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color, #e2e8f0)', 
                      backgroundColor: 'var(--input-bg, #ffffff)', 
                      color: 'var(--text-secondary, #475569)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--table-hover, #f1f5f9)';
                      e.currentTarget.style.borderColor = '#94a3b8';
                      e.currentTarget.style.color = 'var(--text-primary, #0f172a)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--input-bg, #ffffff)';
                      e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
                      e.currentTarget.style.color = 'var(--text-secondary, #475569)';
                    }}
                  >
                    <Edit3 size={15} />
                  </button>

                  {/* Delete Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(language === 'mr' ? `तुम्हाला खात्री आहे का "${project.name}" हा प्रोजेक्ट काढून टाकायचा आहे?` : `Are you sure you want to delete project "${project.name}"?`)) {
                        onDeleteProject && onDeleteProject(project.id);
                      }
                    }} 
                    title={language === 'mr' ? 'प्रोजेक्ट हटवा (Delete)' : 'Delete Project'}
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '8px', 
                      border: 'none', 
                      backgroundColor: '#ef4444', 
                      color: '#ffffff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Pagination Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.35rem 1.5rem',
        backgroundColor: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '20px',
        marginTop: '0.75rem',
        gap: '0.85rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Centered Square Buttons Row with '1 of 3' in the middle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            style={{
              height: '44px',
              padding: '0 1.35rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: currentPage === 1 ? 'var(--bg-color, #f8fafc)' : 'var(--card-bg, #ffffff)',
              color: currentPage === 1 ? 'var(--text-secondary, #94a3b8)' : 'var(--text-primary, #0f172a)',
              fontSize: '0.92rem',
              fontWeight: '800',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease',
              boxShadow: currentPage === 1 ? 'none' : '0 1px 3px rgba(0,0,0,0.06)'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.color = '#2563eb';
                e.currentTarget.style.backgroundColor = 'var(--table-hover, #eff6ff)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.borderColor = 'var(--border-color, #cbd5e1)';
                e.currentTarget.style.color = 'var(--text-primary, #0f172a)';
                e.currentTarget.style.backgroundColor = 'var(--card-bg, #ffffff)';
              }
            }}
          >
            <ChevronLeft size={18} strokeWidth={2.4} />
            {language === 'mr' ? 'मागे (Previous)' : 'Previous'}
          </button>

          {/* '1 of 3' Middle Display Box */}
          <div style={{
            height: '44px',
            padding: '0 1.45rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color, #e2e8f0)',
            backgroundColor: 'var(--input-bg, #f8fafc)',
            color: 'var(--text-primary, #0f172a)',
            fontSize: '0.95rem',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
          }}>
            <span style={{ color: '#38bdf8' }}>{currentPage}</span>
            <span style={{ color: 'var(--text-secondary, #64748b)', fontWeight: '700' }}>{language === 'mr' ? 'पैकी' : 'of'}</span>
            <span style={{ color: 'var(--text-primary, #0f172a)' }}>{totalPages}</span>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            style={{
              height: '44px',
              padding: '0 1.35rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: currentPage === totalPages ? 'var(--bg-color, #f8fafc)' : 'var(--card-bg, #ffffff)',
              color: currentPage === totalPages ? 'var(--text-secondary, #94a3b8)' : 'var(--text-primary, #0f172a)',
              fontSize: '0.92rem',
              fontWeight: '800',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease',
              boxShadow: currentPage === totalPages ? 'none' : '0 1px 3px rgba(0,0,0,0.06)'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.color = '#2563eb';
                e.currentTarget.style.backgroundColor = 'var(--table-hover, #eff6ff)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.borderColor = 'var(--border-color, #cbd5e1)';
                e.currentTarget.style.color = 'var(--text-primary, #0f172a)';
                e.currentTarget.style.backgroundColor = 'var(--card-bg, #ffffff)';
              }
            }}
          >
            {language === 'mr' ? 'पुढे (Next)' : 'Next'}
            <ChevronRight size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTab;
