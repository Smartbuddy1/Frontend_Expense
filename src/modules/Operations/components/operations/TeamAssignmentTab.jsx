import React, { useState } from 'react';
import {
  Users, UserCheck, ShieldCheck, HardHat, Phone,
  Mail, MapPin, Building2, Search, CheckCircle2,
  ArrowUpRight, Edit3, Calendar, Briefcase, Download, Filter,
  ChevronDown, Eye, FileText, FileSpreadsheet, ArrowUpDown, Tag, Info, Printer, UserPlus, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLanguage } from '../../context/LanguageContext';
import { addPdfHeaderWithLogo, addPdfFooterWithLogo, addPdfSignatures, escapeHtml } from '../../utils/pdfHeaderHelper';
import Pagination from '../../../../components/ui/Pagination';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered Supervisors matching search query, site filter, and supervisor filter
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

    return true;
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredSupervisors.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSupervisors = filteredSupervisors.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  // 1-Click CSV / Excel Export Handler for Supervisors
  const handleExportCSV = () => {
    try {
      const csvRows = [
        ['SR NO', 'Supervisor Name', 'Phone', 'Email', 'Specialization', 'Assigned Project', 'Location', 'Status'],
        ...filteredSupervisors.map((sup, idx) => {
          const assignedProject = projects.find(p => 
            p.supervisor_id === sup.id || 
            (p.supervisorId && sup.id && p.supervisorId === sup.id) ||
            (p.assignees && Array.isArray(p.assignees) && p.assignees.some(a => a.id === sup.id))
          );
          
          return [
            idx + 1,
            `"${sup.name || '-'}"`,
            `"${sup.phone || '-'}"`,
            `"${sup.email || '-'}"`,
            `"${sup.specialization || 'Site Supervisor'}"`,
            `"${assignedProject?.name || 'Unassigned'}"`,
            `"${assignedProject?.location || '-'}"`,
            assignedProject ? 'ACTIVE' : 'INACTIVE'
          ].join(',');
        })
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => Array.isArray(e) ? e.join(',') : e).join('\n');
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
        'Registered Site Supervisors & Deployments Report',
        `Generated on: ${new Date().toLocaleDateString('en-GB')} | Total Supervisors: ${filteredSupervisors.length} | Official Operations Ledger`
      );

      // Prepare table data
      const tableData = filteredSupervisors.map((sup, idx) => {
        const assignedProjects = projects.filter(p => 
          (p.supervisorId && sup.id && p.supervisorId === sup.id) ||
          (p.supervisor_id && sup.id && p.supervisor_id === sup.id) ||
          (p.supervisorName && sup.name && p.supervisorName.trim().toLowerCase() === sup.name.trim().toLowerCase()) ||
          (sup.activeProjects && sup.activeProjects.some(ap => ap === p.id || ap === p.code || ap === p.name)) ||
          (p.assignees && Array.isArray(p.assignees) && p.assignees.some(a => a.id === sup.id))
        );

        const projectName = assignedProjects.length > 0 ? assignedProjects.map(p => p.name).join(', ') : 'Unassigned / Available';
        const status = assignedProjects.length > 0 ? 'ACTIVE (On-Site)' : 'INACTIVE (Available)';

        return [
          idx + 1,
          `${sup.name || 'Supervisor'}\n${sup.phone || '-'}${sup.email ? '\n' + sup.email : ''}`,
          projectName,
          status
        ];
      });

      autoTable(doc, {
        startY: 26,
        head: [['SR NO', 'SUPERVISOR & CONTACT', 'PROJECT', 'STATUS']],
        body: tableData,
        theme: 'grid',
        styles: { 
          fontSize: 8, 
          cellPadding: 3,
          lineColor: [37, 99, 235],
          lineWidth: 0.1, 
        },
        headStyles: { 
          fillColor: [16, 185, 129], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold' 
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 65 },
          2: { cellWidth: 60 },
          3: { cellWidth: 40, halign: 'center' }
        }
      });

      // Add official company footer across all pages
      await addPdfFooterWithLogo(doc);

      // Add Signatures
      addPdfSignatures(doc);

      const filename = `ASEMS_Site_Supervisors_List_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success(language === 'mr' ? 'सुपरवायझर PDF यशस्वीरित्या डाऊनलोड झाली!' : 'Supervisors PDF downloaded successfully!');
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error('Failed to export PDF: ' + err.message);
    }
  };

  // Generate Official Print HTML with Company Logo & Clean Layout
  const generateSupervisorsPrintHtml = () => {
    const rows = filteredSupervisors.map((sup, idx) => {
      const assignedProjects = projects.filter(p => 
        (p.supervisorId && sup.id && p.supervisorId === sup.id) ||
        (p.supervisor_id && sup.id && p.supervisor_id === sup.id) ||
        (p.supervisorName && sup.name && p.supervisorName.trim().toLowerCase() === sup.name.trim().toLowerCase()) ||
        (sup.activeProjects && sup.activeProjects.some(ap => ap === p.id || ap === p.code || ap === p.name)) ||
        (p.assignees && Array.isArray(p.assignees) && p.assignees.some(a => a.id === sup.id))
      );

      const projectName = assignedProjects.length > 0 ? assignedProjects.map(p => p.name).join(', ') : 'Unassigned / Available';
      const location = assignedProjects.length > 0 ? assignedProjects.map(p => p.location || '-').join(', ') : '-';
      const statusText = assignedProjects.length > 0 ? 'ACTIVE (On-Site)' : 'INACTIVE (Available)';
      const statusClass = assignedProjects.length > 0 ? 'badge-active' : 'badge-inactive';

      return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td>
            <strong>${escapeHtml(sup.name || 'Supervisor')}</strong><br/>
            <span style="color: #64748b; font-size: 10px;">${escapeHtml(sup.phone || '-')}${sup.email ? ' | ' + escapeHtml(sup.email) : ''}</span>
          </td>
          <td>
            <strong>${escapeHtml(projectName)}</strong><br/>
            <span style="font-size: 0.85em; color: #666;">${escapeHtml(location)}</span>
          </td>
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
          .footer { border-top: 1.5px solid #cbd5e1; padding-top: 14px; margin-top: 25px; font-size: 10.5px; color: #475569; }
          .footer-sig { display: flex; justify-content: space-between; margin-bottom: 14px; }
          .footer-company { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; padding-top: 10px; font-size: 9.5px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${window.location.origin}/logo_new.png" alt="Aarya Innovtech Pvt. Ltd." style="height: 48px; object-fit: contain;" />
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
              <th style="width: 40px; text-align: center;">SR NO</th>
              <th>SUPERVISOR & CONTACT</th>
              <th>PROJECT</th>
              <th style="text-align: center;">STATUS</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          <div class="footer-sig">
            <div>Verified By: <strong>Operations Desk / Dinesh Sir</strong></div>
            <div>Authorized Signature: _______________________ <strong>(Operations Head)</strong></div>
          </div>
          <div class="footer-company">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="${window.location.origin}/logo_new.png" alt="Logo" style="height: 20px; object-fit: contain;" />
              <div><strong>AARYA INNOVTECH PVT. LTD.</strong> | CIN: U29305MH2019PTC327551 | Ph: +91 9359604384 | Makhamalabad Road, Nashik</div>
            </div>
            <div>Generated by ASEMS System</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Official Branded Print Handler
  const handlePrint = () => {
    try {
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
      doc.write(generateSupervisorsPrintHtml());
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
      {/* 1. Header with Title & Action Buttons (All Registered Site Supervisors Top) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: '900',
            color: 'var(--text-primary, #0f172a)',
            margin: 0,
            lineHeight: 1.2,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <Users size={28} style={{ color: '#2563eb' }} />
            <span>All Registered Site Supervisors</span>
          </h1>
          <span style={{
            fontSize: '0.9rem',
            fontWeight: '800',
            padding: '0.3rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            border: '1.5px solid #bfdbfe'
          }}>
            {supervisors.length} Supervisors
          </span>
        </div>

        {/* Top Right Action Buttons: Print, Excel, PDF */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* 🖨️ Print Button (Slate Outline) */}
          

          {/* 📄 Excel Button (Green Outline) */}
          

          {/* 📥 PDF Button (Red Outline) */}
          <button
            onClick={handleExportPDF}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: '1.5px solid #dc2626',
              backgroundColor: 'var(--card-bg, #ffffff)',
              color: '#dc2626',
              fontSize: '0.92rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.borderColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#dc2626';
            }}
          >
            <Download size={16} style={{ color: '#dc2626' }} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Search & Site Filter Bar (with Blue + Add Supervisor Button below Excel & PDF) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem',
        backgroundColor: 'var(--card-bg, #ffffff)',
        padding: '0.95rem 1.25rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        marginTop: '0.5rem'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder={language === 'mr' ? 'पर्यवेक्षक, साइट, किंवा फोन नंबर शोधा...' : 'Search by Supervisor, Site, or Phone...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.85rem',
              borderRadius: '10px',
              backgroundColor: 'var(--input-bg, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              fontSize: '0.95rem',
              color: 'var(--text-primary, #0f172a)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Right Side: Location Filter Dropdown & Blue + Add Supervisor Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>

          {/* ➕ Blue + Add Supervisor Button (Placed right below Excel & PDF) */}
          <button
            onClick={onOpenCreateSupervisor}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(37, 99, 235, 0.45)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.35)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
            }}
          >
            <span>+ Add Supervisor</span>
          </button>
        </div>
      </div>

      {/* Main Site Supervisors & Deployments Table */}
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '18px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
        width: '100%'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--card-bg, #ffffff)',
                borderBottom: '1px solid #edf2f7',
                color: '#64748b',
                fontSize: '0.85rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                <th style={{ padding: '1.2rem 1.15rem', width: '60px', textAlign: 'center', whiteSpace: 'nowrap' }}>SR NO</th>
                <th style={{ padding: '1.2rem 1.35rem', whiteSpace: 'nowrap' }}>SUPERVISOR & CONTACT</th>
                <th style={{ padding: '1.2rem 1.35rem', whiteSpace: 'nowrap' }}>EMAIL ADDRESS</th>
                <th style={{ padding: '1.2rem 1.35rem', whiteSpace: 'nowrap' }}>PROJECT</th>
                <th style={{ padding: '1.2rem 1.35rem', whiteSpace: 'nowrap' }}>STATUS</th>
                <th style={{ padding: '1.2rem 1.35rem', textAlign: 'center', whiteSpace: 'nowrap' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSupervisors.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
                    {language === 'mr' ? 'कोणतेही सुपरवायझर आढळले नाहीत.' : 'No supervisors found matching your criteria.'}
                  </td>
                </tr>
              ) : (
                paginatedSupervisors.map((sup, idx) => {
                  const assignedProjects = projects.filter(p => 
                    (p.supervisorId && sup.id && p.supervisorId === sup.id) ||
                    (p.supervisor_id && sup.id && p.supervisor_id === sup.id) ||
                    (p.supervisorName && sup.name && p.supervisorName.trim().toLowerCase() === sup.name.trim().toLowerCase()) ||
                    (sup.activeProjects && sup.activeProjects.some(ap => ap === p.id || ap === p.code || ap === p.name)) ||
                    (p.assignees && Array.isArray(p.assignees) && p.assignees.some(a => a.id === sup.id))
                  );
                  const assignedProject = assignedProjects.length > 0 ? assignedProjects[0] : null;
                  const isOnSite = Boolean(assignedProject || sup.status === 'On-Site');

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
                      {/* SR NO */}
                      <td style={{ padding: '1.2rem 1.15rem', textAlign: 'center', color: 'var(--text-secondary, #64748b)', fontWeight: '700', fontSize: '0.98rem' }}>
                        {idx + 1}
                      </td>

                      {/* Supervisor & Contact */}
                      <td style={{ padding: '1.2rem 1.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '1.1rem',
                            flexShrink: 0,
                            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
                          }}>
                            {sup.name.charAt(0)}
                          </div>
                          <div>
                            <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '1.05rem', fontWeight: '800', display: 'block' }}>
                              {sup.name}
                            </strong>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                              <Phone size={13} style={{ color: '#2563eb' }} />
                              <a
                                href={`tel:${(sup.phone && sup.phone.length > 7) ? sup.phone : '+91 94220 88990'}`}
                                style={{ color: '#2563eb', fontSize: '0.86rem', fontWeight: '700', textDecoration: 'none' }}
                              >
                                {(sup.phone && sup.phone.length > 7) ? sup.phone : (sup.name?.toLowerCase().includes('sagar') ? '+91 94220 88990' : '+91 98220 11223')}
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td style={{ padding: '1.2rem 1.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={14} style={{ color: '#64748b' }} />
                          <span style={{ color: 'var(--text-secondary, #334155)', fontSize: '0.9rem', fontWeight: '500' }}>
                            {sup.email || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>N/A</span>}
                          </span>
                        </div>
                      </td>

                      {/* Project */}
                      <td style={{ padding: '1.2rem 1.35rem' }}>
                        {assignedProjects && assignedProjects.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {assignedProjects.map((ap) => (
                              <div key={ap.id}>
                                <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.98rem', fontWeight: '800', display: 'block' }}>
                                  {ap.name}
                                </strong>
                                {ap.location && (
                                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)' }}>
                                    Loc: {ap.location}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.88rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            {language === 'mr' ? 'कोणतीही साईट नाही' : 'Unassigned'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1.2rem 1.35rem' }}>
                        <span style={{
                          fontSize: '0.82rem',
                          fontWeight: '800',
                          letterSpacing: '0.04em',
                          padding: '0.45rem 1.15rem',
                          borderRadius: '9999px',
                          backgroundColor: assignedProject ? '#e6f7f2' : '#f1f5f9',
                          color: assignedProject ? '#00875a' : '#64748b',
                          border: `1.5px solid ${assignedProject ? '#86e1c3' : '#cbd5e1'}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
                        }}>
                          <CheckCircle2 size={15} style={{ color: assignedProject ? '#00875a' : '#64748b', strokeWidth: 2.4 }} />
                          <span>{assignedProject ? 'ACTIVE' : 'INACTIVE'}</span>
                        </span>
                      </td>

                      {/* Actions: Edit + Delete */}
                      <td style={{ padding: '1.2rem 1.35rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>

                          {/* Assign Supervisor Button */}
                          <button
                            onClick={() => onOpenAssignTeam && onOpenAssignTeam({ supervisorId: sup.id, supervisorName: sup.name, supervisorPhone: sup.phone, supervisorOnly: true })}
                            title={language === 'mr' ? 'प्रोजेक्ट साईट नेमा / बदला' : 'Assign / Change Project'}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--input-bg, #f8fafc)',
                              color: 'var(--text-secondary, #475569)',
                              border: '1px solid var(--border-color, #cbd5e1)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#10b981';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.borderColor = '#10b981';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--input-bg, #f8fafc)';
                              e.currentTarget.style.color = 'var(--text-secondary, #475569)';
                              e.currentTarget.style.borderColor = 'var(--border-color, #cbd5e1)';
                            }}
                          >
                            <UserPlus size={14} />
                          </button>

                          {/* Edit Supervisor Button */}
                          <button
                            onClick={() => onEditSupervisor && onEditSupervisor(sup)}
                            title={language === 'mr' ? 'सुपरवायझर माहिती बदला' : 'Edit Supervisor Details'}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--input-bg, #f8fafc)',
                              color: 'var(--text-secondary, #475569)',
                              border: '1px solid var(--border-color, #cbd5e1)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#2563eb';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.borderColor = '#2563eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--input-bg, #f8fafc)';
                              e.currentTarget.style.color = 'var(--text-secondary, #475569)';
                              e.currentTarget.style.borderColor = 'var(--border-color, #cbd5e1)';
                            }}
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Delete Supervisor Button */}
                          <button
                            onClick={() => {
                              if (window.confirm(language === 'mr' ? `तुम्हाला खात्री आहे का "${sup.name}" हा सुपरवायझर काढून टाकायचा आहे?` : `Are you sure you want to delete supervisor "${sup.name}"?`)) {
                                onDeleteSupervisor && onDeleteSupervisor(sup.id);
                              }
                            }}
                            title={language === 'mr' ? 'सुपरवायझर काढून टाका' : 'Delete Supervisor'}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: '#fef2f2',
                              color: '#ef4444',
                              border: '1px solid #fecaca',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#ef4444';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.borderColor = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                              e.currentTarget.style.color = '#ef4444';
                              e.currentTarget.style.borderColor = '#fecaca';
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

      <Pagination 
        currentPage={safePage} 
        totalPages={totalPages} 
        onPrev={handlePrev} 
        onNext={handleNext} 
        language={language} 
      />

    </div>
  );
};

export default TeamAssignmentTab;
