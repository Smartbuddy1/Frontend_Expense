import React, { useState } from 'react';
import {
  Users, UserCheck, ShieldCheck, HardHat, Phone,
  Mail, MapPin, Building2, Search, CheckCircle2,
  ArrowUpRight, Edit3, Calendar, Briefcase, Download, Filter,
  ChevronDown, Eye, FileText, FileSpreadsheet, ArrowUpDown, Tag, Info, Printer, UserPlus, Trash2, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLanguage } from '../../context/LanguageContext';
import { addPdfHeaderWithLogo, addPdfFooterWithPageNumbers, getCompanyLogoBase64, escapeHtml } from '../../utils/pdfHeaderHelper';

const TeamAssignmentTab = ({
  projects = [],
  supervisors = [],
  teamMembers = [],
  onOpenCreateSupervisor,
  onEditSupervisor,
  onDeleteSupervisor,
  onOpenAssignTeam,
  onSelectProject
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState('All'); // 'All', 'Sangamner', 'Pune', 'Nashik'
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);

  const siteOptions = [
    { value: 'All', label: language === 'mr' ? 'सर्व साईट्स' : 'All Sites (All Locations)' },
    { value: 'Sangamner', label: language === 'mr' ? 'संगमनेर साईट (Sangamner)' : 'Sangamner Site' },
    { value: 'Pune', label: language === 'mr' ? 'पुणे साईट (Pune)' : 'Pune Site' },
    { value: 'Nashik', label: language === 'mr' ? 'नाशिक साईट (Nashik)' : 'Nashik Site' },
  ];

  // Filtered Supervisors matching search query and site filter
  const filteredSupervisors = supervisors.filter((sup) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (
        sup.name?.toLowerCase().includes(q) ||
        sup.phone?.includes(q) ||
        sup.specialization?.toLowerCase().includes(q) ||
        sup.email?.toLowerCase().includes(q)
      );
      if (!match) return false;
    }

    if (siteFilter !== 'All') {
      const assignedProject = projects.find(p => 
        (p.supervisorId && sup.id && p.supervisorId === sup.id) ||
        (p.supervisorName && sup.name && p.supervisorName.trim().toLowerCase() === sup.name.trim().toLowerCase()) ||
        (sup.activeProjects && sup.activeProjects.some(ap => ap === p.id || ap === p.code || ap === p.name))
      );
      if (!assignedProject) return false;
      const matchesSite = assignedProject.name.toLowerCase().includes(siteFilter.toLowerCase()) ||
        assignedProject.location?.toLowerCase().includes(siteFilter.toLowerCase());
      if (!matchesSite) return false;
    }

    return true;
  });

  // 1-Click CSV / Excel Export Handler for Supervisors
  const handleExportCSV = () => {
    try {
      const csvRows = [
        ['SR NO', 'Supervisor Name', 'Phone', 'Email', 'Specialization', 'Assigned Project', 'Location', 'Team Count', 'Status'],
        ...filteredSupervisors.map((sup, idx) => {
          const assignedProject = projects.find(p => 
            (p.supervisorId && sup.id && p.supervisorId === sup.id) ||
            (p.supervisorName && sup.name && p.supervisorName.trim().toLowerCase() === sup.name.trim().toLowerCase()) ||
            (sup.activeProjects && sup.activeProjects.some(ap => ap === p.id || ap === p.code || ap === p.name))
          );
          return [
            idx + 1,
            `"${sup.name || ''}"`,
            `"${sup.phone || ''}"`,
            `"${sup.email || ''}"`,
            `"${sup.specialization || 'Site Supervisor'}"`,
            `"${assignedProject?.name || 'Unassigned'}"`,
            `"${assignedProject?.location || '-'}"`,
            assignedProject ? (assignedProject.teamCount || assignedProject.assignedTeam?.length || 0) : 0,
            assignedProject ? 'ACTIVE' : 'INACTIVE'
          ];
        })
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ASEMS_Site_Supervisors_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(language === 'mr' ? 'सुपरवायझर CSV डाऊनलोड झाली!' : 'Supervisors CSV Exported successfully!');
    } catch (err) {
      console.error("CSV Export Error:", err);
      toast.error('Failed to export CSV: ' + err.message);
    }
  };

  // 1-Click Direct Official PDF Download for Site Supervisors
  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Header & Title with Logo
      const startY = await addPdfHeaderWithLogo(
        doc,
        'Registered Site Supervisors & Team Deployment Report',
        `Generated on: ${new Date().toLocaleDateString('en-GB')} | Total Supervisors: ${filteredSupervisors.length} | Official Operations Ledger`
      );

      // Prepare table data
      const tableData = filteredSupervisors.map((sup, idx) => {
        const assignedProject = projects.find(p => 
          (p.supervisorId && sup.id && p.supervisorId === sup.id) ||
          (p.supervisorName && sup.name && p.supervisorName.trim().toLowerCase() === sup.name.trim().toLowerCase()) ||
          (sup.activeProjects && sup.activeProjects.some(ap => ap === p.id || ap === p.code || ap === p.name))
        );

        const projectInfo = assignedProject 
          ? `${assignedProject.name}\nLoc: ${assignedProject.location || '-'}`
          : 'No site assigned (Available)';

        const teamCount = assignedProject ? `${assignedProject.teamCount || assignedProject.assignedTeam?.length || 0} Members` : '-';
        const status = assignedProject ? 'ACTIVE (On-Site)' : 'INACTIVE (Available)';

        return [
          idx + 1,
          `${sup.name || 'Supervisor'}\nTel: ${sup.phone || '-'}${sup.email ? '\n' + sup.email : ''}`,
          projectInfo,
          teamCount,
          status
        ];
      });

      autoTable(doc, {
        startY: startY + 2,
        head: [['SR NO', 'SUPERVISOR & CONTACT', 'ASSIGNED PROJECT', 'TEAM MEMBERS', 'STATUS']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 55 },
          2: { cellWidth: 65 },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 30, halign: 'center' }
        }
      });

      // Add corporate footer with page numbers
      addPdfFooterWithPageNumbers(doc);

      const filename = `ASEMS_Site_Supervisors_List_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success(language === 'mr' ? 'सुपरवायझर PDF यशस्वीरित्या डाऊनलोड झाली!' : 'Supervisors PDF downloaded successfully!');
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error('Failed to export PDF: ' + err.message);
    }
  };

  // Generate Official Print HTML with Company Logo & Clean Layout
  const generateSupervisorsPrintHtml = (logoSrc) => {
    const resolvedLogo = logoSrc || `${window.location.origin}/logo_new.png`;
    const rows = filteredSupervisors.map((sup, idx) => {
      const assignedProject = projects.find(p => 
        (p.supervisorId && sup.id && p.supervisorId === sup.id) ||
        (p.supervisorName && sup.name && p.supervisorName.trim().toLowerCase() === sup.name.trim().toLowerCase()) ||
        (sup.activeProjects && sup.activeProjects.some(ap => ap === p.id || ap === p.code || ap === p.name))
      );

      const projectName = assignedProject ? assignedProject.name : 'Unassigned / Available';
      const location = assignedProject?.location || '-';
      const teamCount = assignedProject ? `${assignedProject.teamCount || assignedProject.assignedTeam?.length || 0} Members` : '-';
      const statusText = assignedProject ? 'ACTIVE (On-Site)' : 'INACTIVE (Available)';
      const statusClass = assignedProject ? 'badge-active' : 'badge-inactive';

      return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td>
            <strong>${escapeHtml(sup.name || 'Supervisor')}</strong><br/>
            <span style="color: #64748b; font-size: 10px;">${escapeHtml(sup.phone || '-')}${sup.email ? ' | ' + escapeHtml(sup.email) : ''}</span>
          </td>
          <td>
            <strong>${escapeHtml(projectName)}</strong><br/>
            <span style="color: #64748b; font-size: 10px;">Loc: ${escapeHtml(location)}</span>
          </td>
          <td style="text-align: center; font-weight: 700; color: #2563eb;">${teamCount}</td>
          <td style="text-align: center;">
            <span class="badge ${statusClass}">${statusText}</span>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Registered Site Supervisors Report - Aarya Innovtech</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #0f172a; line-height: 1.4; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 18px; }
          .title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
          .subtitle { font-size: 11px; color: #64748b; margin-top: 3px; }
          .summary-bar { display: flex; gap: 15px; margin-bottom: 18px; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; }
          .summary-item { font-weight: 600; color: #475569; }
          .summary-item strong { color: #0f172a; font-weight: 800; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
          th { background: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 10px; color: #334155; }
          td { padding: 8px 10px; border: 1px solid #e2e8f0; vertical-align: middle; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-weight: 800; font-size: 9px; }
          .badge-active { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
          .badge-inactive { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
          .footer { border-top: 1px solid #cbd5e1; padding-top: 15px; margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${resolvedLogo}" alt="Aarya Innovtech Pvt. Ltd." style="height: 48px; max-width: 180px; object-fit: contain;" />
            <div>
              <h1 class="title">Registered Site Supervisors & Team Roster</h1>
              <div class="subtitle">AARYA INNOVTECH PVT. LTD. | Operations & Project Management System</div>
            </div>
          </div>
          <div style="text-align: right; font-size: 10px; color: #64748b;">
            <strong>Generated Date:</strong> ${new Date().toLocaleDateString('en-GB')}<br/>
            ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div class="summary-bar">
          <div class="summary-item">Total Supervisors: <strong>${filteredSupervisors.length}</strong></div>
          <div class="summary-item">Active On-Site: <strong>${filteredSupervisors.filter(sup => projects.some(p => (p.supervisorId && sup.id && p.supervisorId === sup.id) || (p.supervisorName && sup.name && p.supervisorName.trim().toLowerCase() === sup.name.trim().toLowerCase()))).length}</strong></div>
          <div class="summary-item">Available: <strong>${filteredSupervisors.length - filteredSupervisors.filter(sup => projects.some(p => (p.supervisorId && sup.id && p.supervisorId === sup.id) || (p.supervisorName && sup.name && p.supervisorName.trim().toLowerCase() === sup.name.trim().toLowerCase()))).length}</strong></div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">SR</th>
              <th>SUPERVISOR & CONTACT</th>
              <th>ASSIGNED PROJECT</th>
              <th style="text-align: center;">TEAM</th>
              <th style="text-align: center;">STATUS</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          <div>Verified By: <strong>Operations Desk / Dinesh Sir</strong></div>
          <div>Authorized Signature: _______________________ <strong>(Operations Head)</strong></div>
        </div>
      </body>
      </html>
    `;
  };

  // Official Branded Print Handler
  const handlePrint = async () => {
    try {
      const logoBase64 = await getCompanyLogoBase64();
      const logoSrc = logoBase64 || '/logo_new.png';

      let iframe = document.getElementById('sup-print-frame');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'sup-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(generateSupervisorsPrintHtml(logoSrc));
      doc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }, 300);
    } catch (err) {
      console.error("Print Error:", err);
      window.print();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* 1. Header with Title & Action Tools (Print, Excel, PDF on Top Right) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        paddingBottom: '0.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Users size={26} style={{ color: '#2563eb' }} />
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '900',
              color: 'var(--text-primary, #0f172a)',
              margin: 0,
              lineHeight: 1.2
            }}>
              {language === 'mr' ? 'सुपरवायझर व्यवस्थापन' : 'Site Supervisors'}
            </h1>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary, #64748b)', margin: '0.35rem 0 0 0', fontWeight: '500' }}>
            {language === 'mr' ? 'सर्व साईट सुपरवायझर्स, प्रकल्प नेमणूक व संपर्क तपशील व्यवस्थापित करा.' : 'Manage all system site supervisors, active site assignments, and operations staff.'}
          </p>
        </div>

        {/* Top Right Action Buttons: Print, Excel, PDF */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* 🖨️ Print Button */}
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
            <span>{language === 'mr' ? 'प्रिंट' : 'Print'}</span>
          </button>

          {/* 📄 Excel Button */}
          <button
            onClick={handleExportCSV}
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
            <span>{language === 'mr' ? 'एक्सेल' : 'Excel'}</span>
          </button>

          {/* 📥 PDF Button */}
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
            <span>{language === 'mr' ? 'पीडीएफ' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* 2. Controls Row: Search Input (Left) + Site Filter + Add Supervisor Button (Right) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Search Bar & Site Filter Group (50% Width) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '50%', minWidth: '280px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder={language === 'mr' ? 'सुपरवायझर नाव, फोन, ईमेल किंवा लोकेशन शोधा...' : 'Search supervisors by Name, Phone, Email, or City...'}
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

          {/* Location Filter Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
              style={{
                padding: '0.8rem 1.15rem 0.8rem 2.3rem',
                borderRadius: '12px',
                backgroundColor: isSiteDropdownOpen ? '#dbeafe' : '#ffffff',
                border: `1.5px solid ${isSiteDropdownOpen ? '#2563eb' : '#cbd5e1'}`,
                color: '#2563eb',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              <MapPin size={15} style={{ position: 'absolute', left: '0.75rem', color: '#2563eb' }} />
              <span>{siteOptions.find(o => o.value === siteFilter)?.label || 'All Sites'}</span>
              <ChevronDown size={15} style={{ color: '#2563eb', transform: isSiteDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Floating Dropdown Menu */}
            {isSiteDropdownOpen && (
              <>
                <div 
                  style={{ position: 'fixed', inset: 0, zIndex: 9998 }} 
                  onClick={() => setIsSiteDropdownOpen(false)} 
                />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  minWidth: '240px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                  zIndex: 9999,
                  padding: '0.45rem',
                  overflow: 'hidden'
                }}>
                  {siteOptions.map((opt) => {
                    const isSelected = siteFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSiteFilter(opt.value);
                          setIsSiteDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.95rem',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#0f172a',
                          fontSize: '0.9rem',
                          fontWeight: isSelected ? '800' : '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textAlign: 'left',
                          transition: 'all 0.12s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#eff6ff';
                            e.currentTarget.style.color = '#2563eb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.color = '#0f172a';
                          }
                        }}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <CheckCircle2 size={16} style={{ color: '#ffffff' }} />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ➕ Add Supervisor Button (Gradient Pill Button on Right) */}
        <button
          onClick={onOpenCreateSupervisor}
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
          <span>Add Supervisor</span>
        </button>
      </div>

      {/* 3. Main Site Supervisors Table */}
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--table-header-bg, #f8fafc)',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                color: '#475569',
                fontSize: '0.8rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '0.9rem 1rem', width: '50px', textAlign: 'center', whiteSpace: 'nowrap' }}>ID</th>
                <th style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap', minWidth: '220px' }}>SUPERVISOR NAME ↕</th>
                <th style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap', minWidth: '150px' }}>PHONE ↕</th>
                <th style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap', minWidth: '220px' }}>LOCATION ↕</th>
                <th style={{ padding: '0.9rem 1.15rem', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }}>STATUS ↕</th>
                <th style={{ padding: '0.9rem 1.15rem', textAlign: 'center', whiteSpace: 'nowrap', width: '150px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSupervisors.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
                    <Users size={38} style={{ margin: '0 auto 0.5rem auto', display: 'block', color: '#cbd5e1' }} />
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '1rem', color: '#475569' }}>
                      {language === 'mr' ? 'कोणतेही सुपरवायझर आढळले नाहीत.' : 'No supervisors found'}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                      {language === 'mr' ? 'कृपया शोध शब्द तपासा किंवा नवीन सुपरवायझर जोडा.' : 'Try adjusting your search query or add a new supervisor.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSupervisors.map((sup, idx) => {
                  const assignedProject = projects.find(p => 
                    (p.supervisorId && sup.id && p.supervisorId === sup.id) ||
                    (p.supervisorName && sup.name && p.supervisorName.trim().toLowerCase() === sup.name.trim().toLowerCase()) ||
                    (sup.activeProjects && sup.activeProjects.some(ap => ap === p.id || ap === p.code || ap === p.name))
                  );
                  const isOnSite = Boolean(assignedProject || sup.status === 'On-Site' || sup.status === 'Active');

                  return (
                    <tr
                      key={sup.id || idx}
                      style={{
                        borderBottom: '1px solid var(--border-color, #f1f5f9)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-hover, #f8fafc)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* ID / SR NO */}
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontWeight: '700', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
                        {idx + 1}
                      </td>

                      {/* Supervisor Name & Contact */}
                      <td style={{ padding: '1rem', minWidth: '220px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '0.95rem',
                            flexShrink: 0,
                            border: '1.5px solid #bfdbfe'
                          }}>
                            {sup.name ? sup.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.96rem', fontWeight: '800', display: 'block', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                              {sup.name}
                            </strong>
                            {sup.email && (
                              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '1px' }}>
                                {sup.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: '700' }}>
                          {(sup.phone && sup.phone.length > 7) ? sup.phone : (sup.name?.toLowerCase().includes('sagar') ? '9422088990' : '9822011223')}
                        </span>
                      </td>

                      {/* Location / Assigned Site */}
                      <td style={{ padding: '1rem' }}>
                        {assignedProject ? (
                          <div>
                            <span style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.92rem', fontWeight: '700', display: 'block' }}>
                              {assignedProject.name}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '1px' }}>
                              {assignedProject.location || 'Maharashtra, India'}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                            {sup.location || 'Maharashtra, India'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          letterSpacing: '0.04em',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          backgroundColor: isOnSite ? '#ecfdf5' : '#f1f5f9',
                          color: isOnSite ? '#059669' : '#64748b',
                          border: `1px solid ${isOnSite ? '#a7f3d0' : '#cbd5e1'}`,
                          display: 'inline-block'
                        }}>
                          {isOnSite ? 'ACTIVE' : 'AVAILABLE'}
                        </span>
                      </td>

                      {/* Actions: Assign Button + Edit + Delete */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                          {/* Assign / Change Site Button */}
                          <button
                            onClick={() => onOpenAssignTeam && onOpenAssignTeam(assignedProject ? { ...assignedProject } : { supervisorId: sup.id, supervisorName: sup.name, supervisorPhone: sup.phone, supervisorOnly: true })}
                            title={language === 'mr' ? 'प्रोजेक्ट साईट नेमा / बदला' : 'Assign / Change Project'}
                            style={{
                              padding: '0.45rem 0.75rem',
                              borderRadius: '7px',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              border: '1.5px solid #bfdbfe',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#2563eb';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#eff6ff';
                              e.currentTarget.style.color = '#2563eb';
                            }}
                          >
                            <UserCheck size={13} />
                            <span>{language === 'mr' ? 'नेमणूक' : 'Assign'}</span>
                          </button>

                          {/* Edit Supervisor Button (Square Icon) */}
                          <button
                            onClick={() => onEditSupervisor && onEditSupervisor(sup)}
                            title={language === 'mr' ? 'सुपरवायझर माहिती बदला' : 'Edit Supervisor Details'}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '7px',
                              border: '1.5px solid var(--border-color, #e2e8f0)',
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
                            <Edit3 size={14} />
                          </button>

                          {/* Delete Button (Red Box) */}
                          <button
                            onClick={() => onDeleteSupervisor && onDeleteSupervisor(sup.id, sup.name)}
                            title={language === 'mr' ? 'सुपरवायझर हटवा' : 'Delete Supervisor'}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '7px',
                              border: 'none',
                              backgroundColor: '#ef4444',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.35)',
                              transition: 'all 0.2s ease'
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

export default TeamAssignmentTab;
