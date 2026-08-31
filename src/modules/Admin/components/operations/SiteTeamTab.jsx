import React, { useState } from 'react';
import { 
  Users, User, Phone, Wrench, Building2, Search, Plus, 
  Printer, FileSpreadsheet, Download, Edit3, Trash2, ShieldCheck, 
  MapPin, CheckCircle2, UserCheck, HardHat, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { getCompanyLogoBase64, escapeHtml } from '../../utils/pdfHeaderHelper';
import './operations-dashboard.css';

export const SiteTeamTab = ({
  teamMembers = [],
  projects = [],
  supervisors = [],
  onOpenCreateMember,
  onEditMember,
  onDeleteMember
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');

  // Filter team members based on search, trade, and assigned site
  const filteredMembers = teamMembers.filter((member) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (
        member.name?.toLowerCase().includes(q) ||
        member.phone?.includes(q) ||
        member.role?.toLowerCase().includes(q) ||
        member.skills?.toLowerCase().includes(q)
      );
      if (!match) return false;
    }

    if (tradeFilter !== 'All') {
      if (!member.role?.toLowerCase().includes(tradeFilter.toLowerCase())) return false;
    }

    if (siteFilter !== 'All') {
      if (member.assignedProjectId !== siteFilter && member.assignedProject !== siteFilter) return false;
    }

    return true;
  });

  // 1-Click PDF Export with Logo
  const handleExportPDF = async () => {
    try {
      const columns = ['#', 'Member ID', 'Technician / Worker Name', 'Trade / Role', 'Contact Phone', 'Assigned Site', 'Status'];
      const rows = filteredMembers.map((m, index) => {
        const assignedProj = projects.find(p => p.id === m.assignedProjectId || p.code === m.assignedProjectId || p.name === m.assignedProject);
        return [
          index + 1,
          m.id,
          m.name,
          m.role || 'Field Technician',
          m.phone || '-',
          assignedProj ? assignedProj.name : 'Sangamner Eco Toilet Installation',
          m.status || 'On-Site'
        ];
      });
      await exportToPDF('AARYA_INNOVTECH_Site_Team_Directory', columns, rows, 'AI AARYA INNOVTECH PVT. LTD. • Official Field Crew & Technical Team Roster', 'landscape');
      toast.success(language === 'mr' ? 'साईट टीम PDF डाऊनलोड झाली!' : 'Site Team PDF exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  // 1-Click Excel / CSV Export
  const handleExportExcel = () => {
    try {
      const columns = ['Member ID', 'Technician Name', 'Role / Trade', 'Phone', 'Assigned Site', 'Status'];
      const rows = filteredMembers.map(m => {
        const assignedProj = projects.find(p => p.id === m.assignedProjectId || p.code === m.assignedProjectId || p.name === m.assignedProject);
        return [
          m.id,
          m.name,
          m.role,
          m.phone,
          assignedProj ? assignedProj.name : 'Sangamner Eco Toilet Installation',
          m.status || 'On-Site'
        ];
      });
      exportToExcel('AARYA_INNOVTECH_Site_Team', columns, rows);
      toast.success(language === 'mr' ? 'साईट टीम Excel डाऊनलोड झाली!' : 'Site Team Excel exported successfully!');
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

      const tableRowsHtml = filteredMembers.map((m, index) => {
        const assignedProj = projects.find(p => p.id === m.assignedProjectId || p.code === m.assignedProjectId || p.name === m.assignedProject);
        return `
          <tr>
            <td style="padding: 10px 8px; border: 1px solid #cbd5e1; font-weight: bold; text-align: center;">${index + 1}</td>
            <td style="padding: 10px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">
              <div style="font-size: 13px; font-weight: 800;">${escapeHtml(m.name)}</div>
              <div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 2px;">ID: ${escapeHtml(m.id)}</div>
            </td>
            <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #2563eb; font-weight: 700; font-size: 12px;">
              ${escapeHtml(m.role || 'Field Technician')}
            </td>
            <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #059669; font-weight: 700; font-size: 12px;">
              ${escapeHtml(m.phone || '-')}
            </td>
            <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #475569; font-size: 12px;">
              ${escapeHtml(assignedProj ? assignedProj.name : 'Sangamner Eco Toilet Installation')}
            </td>
            <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center;">
              <span style="background: #ecfdf5; color: #059669; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-size: 11px; border: 1px solid #a7f3d0; display: inline-block;">
                ${(m.status || 'ON-SITE').toUpperCase()}
              </span>
            </td>
          </tr>
        `;
      }).join('');

      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Aarya Innovtech - Site Team & Crew Roster</title>
          <style>
            @page { size: A4 landscape; margin: 10mm 12mm; }
            body { font-family: 'Cambria', 'Georgia', serif; color: #0f172a; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .header-container { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; margin-bottom: 16px; border-bottom: 2.5px solid #2563eb; }
            .logo-section { display: flex; align-items: center; gap: 16px; }
            .logo-img { height: 52px; max-width: 180px; object-fit: contain; }
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
              <img src="${logoSrc}" class="logo-img" alt="Aarya Innovtech" />
              <div class="company-info">
                <h1>AI AARYA INNOVTECH PVT. LTD.</h1>
                <p>Official Field Crew & Technical Team Roster</p>
              </div>
            </div>
            <div class="doc-meta">
              <div><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div><strong>Total Crew:</strong> ${filteredMembers.length} Technicians Active</div>
              <div><strong>Generated by:</strong> Operations Admin (ASEMS)</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 36px; text-align: center;">#</th>
                <th>Technician Name & ID</th>
                <th>Trade / Skill Role</th>
                <th>Contact Phone</th>
                <th>Assigned Project Site</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>Official & Confidential • AI AARYA INNOVTECH PVT. LTD. • Field Operations Roster</span>
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
    <div className="dash-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* 1. Header with Title & Action Tools */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
          }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0, lineHeight: 1.2 }}>
                Site Team (Ground Crew & Technicians)
              </h1>
              <span style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                fontSize: '0.82rem',
                fontWeight: '800',
                padding: '0.25rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #bfdbfe'
              }}>
                {filteredMembers.length} Technicians
              </span>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary, #64748b)', margin: '0.35rem 0 0 0', fontWeight: '500' }}>
              Manage on-site skilled workforce, electricians, plumbers, fitters & crew allocations.
            </p>
          </div>
        </div>

        {/* Action Tools: Print, Excel, PDF, Add Member */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* 🖨️ Print */}
          <button
            onClick={handlePrint}
            style={{
              padding: '0.55rem 1.05rem',
              borderRadius: '10px',
              border: '1.5px solid #0284c7',
              backgroundColor: '#ffffff',
              color: '#0284c7',
              fontSize: '0.92rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          {/* 📄 Excel */}
          <button
            onClick={handleExportExcel}
            style={{
              padding: '0.55rem 1.05rem',
              borderRadius: '10px',
              border: '1.5px solid #16a34a',
              backgroundColor: '#ffffff',
              color: '#16a34a',
              fontSize: '0.92rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>Excel</span>
          </button>

          {/* 📥 PDF */}
          <button
            onClick={handleExportPDF}
            style={{
              padding: '0.55rem 1.05rem',
              borderRadius: '10px',
              border: '1.5px solid #dc2626',
              backgroundColor: '#ffffff',
              color: '#dc2626',
              fontSize: '0.92rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Download size={16} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Controls Row: Search Input (50% Width) + Add Member Button */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Search Input (50% Width) */}
        <div style={{ position: 'relative', width: '50%', minWidth: '260px', boxSizing: 'border-box' }}>
          <Search size={18} style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder={language === 'mr' ? 'टेक्निशियन नाव, फोन, कौशल्य शोधा...' : 'Search crew by Name, Phone, Skill, or Site...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1.2rem 0.8rem 2.85rem',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.95rem',
              color: 'var(--text-primary, #0f172a)',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
            }}
          />
        </div>

        {/* ➕ Add Team Member Button (Gradient Pill on Right) */}
        <button
          onClick={onOpenCreateMember}
          style={{
            padding: '0.75rem 1.6rem',
            borderRadius: '20px',
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
            color: '#ffffff',
            fontSize: '0.96rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.4)';
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* 3. Technicians Table */}
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #e2e8f0)',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--table-header-bg, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '800', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', width: '50px', textAlign: 'center', whiteSpace: 'nowrap' }}>SR NO</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '800', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: '220px' }}>TECHNICIAN & CONTACT</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '800', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: '160px' }}>TRADE / ROLE</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '800', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: '220px' }}>ASSIGNED PROJECT & LOCATION</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '800', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }}>STATUS</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '800', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'center', width: '100px', whiteSpace: 'nowrap' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                    <Users size={36} style={{ margin: '0 auto 0.5rem auto', display: 'block', color: '#cbd5e1' }} />
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '1rem' }}>No team members found</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>Try adjusting your search query or trade filter.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, index) => {
                  const assignedProj = projects.find(p => p.id === member.assignedProjectId || p.code === member.assignedProjectId || p.name === member.assignedProject) || projects[index % projects.length];

                  return (
                    <tr 
                      key={member.id}
                      style={{ 
                        borderBottom: '1px solid var(--border-color, #f1f5f9)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-hover, #f8fafc)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {index + 1}
                      </td>

                      <td style={{ padding: '1rem', whiteSpace: 'nowrap', minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '0.95rem',
                            flexShrink: 0
                          }}>
                            {member.name?.charAt(0).toUpperCase() || 'T'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: '800', color: 'var(--text-primary, #0f172a)', fontSize: '0.96rem', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                              {member.name}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px', whiteSpace: 'nowrap' }}>
                              <Phone size={12} style={{ flexShrink: 0 }} />
                              <span>{member.phone || '+91 98111 22334'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary, #0f172a)', fontSize: '0.94rem' }}>
                          {member.role || 'Field Technician'}
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary, #0f172a)', fontSize: '0.9rem' }}>
                          {assignedProj ? assignedProj.name : 'Sangamner Eco Toilet Installation'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                          {assignedProj?.location || 'Maharashtra'}
                        </div>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          fontWeight: '800',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          border: '1px solid #a7f3d0',
                          display: 'inline-block'
                        }}>
                          {(member.status || 'ON-SITE').toUpperCase()}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                          <button
                            onClick={() => onEditMember && onEditMember(member)}
                            title="Edit Member"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
                                onDeleteMember && onDeleteMember(member.id);
                              }
                            }}
                            title="Delete Member"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: '#fee2e2',
                              color: '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SiteTeamTab;
