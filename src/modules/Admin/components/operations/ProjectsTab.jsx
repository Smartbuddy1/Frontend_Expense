import React, { useState } from 'react';
import { 
  Search, Edit3, Trash2, ChevronLeft, ChevronRight, Printer, FileSpreadsheet, Download,
  HardHat, MapPin, User, Calendar, Tag, Building2, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { getCompanyLogoBase64 } from '../../utils/pdfHeaderHelper';

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
  const itemsPerPage = 12;

  const filteredProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase();
    const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false;
    const clientMatch = p.client ? p.client.toLowerCase().includes(q) : false;
    const idMatch = p.id ? p.id.toLowerCase().includes(q) : false;
    const locMatch = p.location ? p.location.toLowerCase().includes(q) : false;
    const supMatch = p.supervisorName ? p.supervisorName.toLowerCase().includes(q) : false;
    return !searchQuery || nameMatch || clientMatch || idMatch || locMatch || supMatch;
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

  // 1-Click PDF Export with Official Logo
  const handleExportPDF = async () => {
    try {
      const columns = ['#', 'Project Code', 'Project Name', 'Client / Authority', 'Location', 'Supervisor & Contact', 'Start Date', 'Status'];
      const rows = filteredProjects.map((p, index) => [
        index + 1,
        p.code || p.id,
        p.name,
        p.client || 'Municipal Authority',
        p.location || `${p.state || 'Maharashtra'}, India`,
        `${p.supervisorName || '-'}\n${p.supervisorPhone || ''}`,
        p.startDate ? p.startDate.split('-').reverse().join('/') : '01/08/2026',
        p.status || 'Ongoing'
      ]);
      await exportToPDF('AARYA_INNOVTECH_Site_Projects_Directory', columns, rows, 'AI AARYA INNOVTECH PVT. LTD. • Official Field Sites & Operations Directory', 'landscape');
      toast.success(language === 'mr' ? 'प्रोजेक्ट्स PDF डाऊनलोड झाली!' : 'Projects PDF exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  // 1-Click Excel / CSV Export
  const handleExportExcel = () => {
    try {
      const columns = ['Project ID', 'Code', 'Project Name', 'Client', 'Location', 'Supervisor', 'Phone', 'Team Count', 'Start Date', 'Status', 'Description'];
      const rows = filteredProjects.map(p => [
        p.id,
        p.code || p.id,
        p.name,
        p.client,
        p.location,
        p.supervisorName,
        p.supervisorPhone,
        p.teamCount || 8,
        p.startDate,
        p.status,
        p.description || p.remarks || '-'
      ]);
      exportToExcel('AARYA_INNOVTECH_Site_Projects', columns, rows);
      toast.success(language === 'mr' ? 'प्रोजेक्ट्स Excel/CSV डाऊनलोड झाली!' : 'Projects Excel exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export Excel');
    }
  };

  // Executive Printable Document with Official Aarya Logo
  const handlePrint = async () => {
    try {
      const logoBase64 = await getCompanyLogoBase64();
      const logoSrc = logoBase64 || '/logo_new.png';

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        window.print();
        return;
      }

      const tableRowsHtml = filteredProjects.map((p, index) => `
        <tr>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; font-weight: bold; text-align: center;">${index + 1}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">
            <div style="font-size: 13px; font-weight: 800;">${p.name}</div>
            <div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 2px;">Code: ${p.code || p.id}</div>
          </td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #334155; font-size: 12px;"><strong>${p.client || '-'}</strong></td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #334155; font-size: 12px;">
            <strong>${p.supervisorName || '-'}</strong>
            <div style="font-size: 11px; color: #059669; font-weight: bold; margin-top: 2px;">${p.supervisorPhone || ''}</div>
          </td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #475569; font-size: 12px;">
            ${p.location || '-'}
          </td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 12px; font-weight: bold;">
            ${p.startDate ? p.startDate.split('-').reverse().join('/') : '01/08/2026'}
          </td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center;">
            <span style="background: #ecfdf5; color: #059669; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-size: 11px; border: 1px solid #a7f3d0; display: inline-block;">
              ${(p.status || 'ONGOING').toUpperCase()}
            </span>
          </td>
        </tr>
      `).join('');

      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Aarya Innovtech - Site Projects Directory</title>
          <style>
            @page { size: A4 landscape; margin: 10mm 12mm; }
            body { font-family: 'Cambria', 'Georgia', serif; color: #0f172a; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .header-container { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; margin-bottom: 16px; border-bottom: 2.5px solid #2563eb; }
            .logo-section { display: flex; align-items: center; gap: 16px; }
            .logo-img { height: 52px; object-fit: contain; }
            .company-info h1 { font-size: 19px; font-weight: 900; margin: 0; color: #0f172a; }
            .company-info p { font-size: 12px; color: #475569; margin: 3px 0 0 0; font-weight: 600; }
            .doc-meta { text-align: right; font-size: 11.5px; color: #334155; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { background-color: #0f172a !important; color: #ffffff !important; padding: 10px 8px; border: 1px solid #0f172a; font-weight: bold; text-align: left; }
            .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-section">
              <img src="${logoSrc}" class="logo-img" alt="Aarya Innovtech" style="height: 52px; max-width: 180px; object-fit: contain;" />
              <div class="company-info">
                <h1>AI AARYA INNOVTECH PVT. LTD.</h1>
                <p>Official Field Sites & Projects Directory</p>
              </div>
            </div>
            <div class="doc-meta">
              <div><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div><strong>Total Projects:</strong> ${filteredProjects.length} Active Sites</div>
              <div><strong>Generated by:</strong> Operations Admin (ASEMS)</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 36px; text-align: center;">#</th>
                <th>Project Title & Code</th>
                <th>Client / Municipal Authority</th>
                <th>Site Supervisor</th>
                <th>Location / City</th>
                <th style="text-align: center;">Start Date</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>Official & Confidential • AI AARYA INNOVTECH PVT. LTD. • Site Operations System</span>
            <span>Printed on: ${new Date().toLocaleString('en-IN')}</span>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 300);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
      {/* 1. Top Header with Title & Action Tools */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
            Site Projects
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748b', margin: '0.35rem 0 0 0', fontWeight: '500' }}>
            Manage ongoing and completed site projects, supervisors, and client contracts.
          </p>
        </div>

        {/* Create Project Button (Only button on top right) */}
        <button
          onClick={() => onOpenCreateProject && onOpenCreateProject()}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '22px',
            padding: '0.8rem 2.2rem',
            fontSize: '1.02rem',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 8px 22px -2px rgba(124, 58, 237, 0.45)',
            letterSpacing: '0.01em',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 28px -2px rgba(124, 58, 237, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 22px -2px rgba(124, 58, 237, 0.45)';
          }}
        >
          Create Project
        </button>
      </div>

      {/* 2. Search Bar */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder={language === 'mr' ? 'प्रोजेक्ट किंवा क्लायंट नावाने शोधा...' : 'Search projects by Name or Client...'}
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

      {/* 3. Responsive Grid of Project Cards (Stretched with auto-fit) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.35rem', width: '100%', boxSizing: 'border-box' }}>
        {paginatedProjects.map((project) => {
          const isCompleted = project.status === 'Completed';
          const statusText = isCompleted 
            ? (language === 'mr' ? 'पूर्ण (COMPLETED)' : 'COMPLETED')
            : (language === 'mr' ? 'सक्रिय (ONGOING)' : 'ONGOING');

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
              {/* Card Top: Title & Status */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <h3 
                    onClick={() => onSelectProject && onSelectProject(project)} 
                    style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0, cursor: 'pointer', lineHeight: 1.25 }}
                  >
                    {project.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isCompleted ? '#10b981' : '#38bdf8', letterSpacing: '0.05em', flexShrink: 0 }}>
                    {statusText}
                  </span>
                </div>

                {/* Card Body: Client & Details */}
                <div style={{ marginTop: '0.85rem' }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary, #64748b)', lineHeight: 1.4 }}>
                    <span style={{ color: 'var(--text-secondary, #64748b)', fontWeight: '500' }}>{language === 'mr' ? 'क्लायंट: ' : 'Client: '}</span>
                    <strong style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '800' }}>{project.client || 'Sangamner Municipal Corporation'}</strong>
                  </p>
                  <p style={{ margin: '0.45rem 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary, #64748b)', lineHeight: 1.4 }}>
                    {project.description || (language === 'mr' ? 'काही टिप्पणी नाही.' : 'No remark provided.')}
                  </p>
                  <p style={{ margin: '0.45rem 0 0 0', fontSize: '0.82rem', color: '#2563eb', fontWeight: '700' }}>
                    {language === 'mr' ? 'सुपरवायझर:' : 'Supervisor:'} <span style={{ color: '#0f172a' }}>{project.supervisorName || 'Rohit Sharma'}</span>
                  </p>
                </div>
              </div>

              {/* Card Bottom: Start Date & Action Buttons (Edit + Delete) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color, #f8fafc)' }}>
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
