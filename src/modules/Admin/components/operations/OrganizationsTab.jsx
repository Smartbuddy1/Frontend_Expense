import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, Plus, Printer, FileSpreadsheet, Download, 
  Edit3, Trash2, MapPin, Phone, Mail, User, CheckCircle2, Award,
  Briefcase, IndianRupee, HardHat, Users, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { getCompanyLogoBase64, escapeHtml } from '../../utils/pdfHeaderHelper';
import CreateOperationalHeadModal from './modals/CreateOperationalHeadModal';
import './operations-dashboard.css';

export const OrganizationsTab = ({
  operationalHeads: propOperationalHeads,
  projects = [],
  supervisors = [],
  expenses = [],
  onOpenCreateOperationalHead,
  onEditOperationalHead,
  onDeleteOperationalHead,
  onSaveOperationalHead,
  onNavigateTab
}) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Internal state with localStorage fallback
  const [headsList, setHeadsList] = useState(() => {
    if (propOperationalHeads && propOperationalHeads.length > 0) return propOperationalHeads;
    return [];
  });

  // Keep internal list in sync if prop changes
  useEffect(() => {
    if (propOperationalHeads && propOperationalHeads.length > 0) {
      setHeadsList(propOperationalHeads);
    }
  }, [propOperationalHeads]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('asems_v2_operational_heads', JSON.stringify(headsList));
    } catch (e) {
      console.error(e);
    }
  }, [headsList]);

  // Local modal state for standalone or integrated operation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHead, setEditingHead] = useState(null);

  const handleOpenAddModal = () => {
    if (onOpenCreateOperationalHead) {
      onOpenCreateOperationalHead();
    } else {
      setEditingHead(null);
      setIsModalOpen(true);
    }
  };

  const handleOpenEditModal = (head) => {
    if (onEditOperationalHead) {
      onEditOperationalHead(head);
    } else {
      setEditingHead(head);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete Operational Head "${name}"?`)) {
      if (onDeleteOperationalHead) {
        onDeleteOperationalHead(id);
      } else {
        setHeadsList(prev => prev.filter(h => h.id !== id));
        toast.success(language === 'mr' ? 'ऑपरेशनल हेड यशस्वीरित्या हटवले!' : 'Operational Head deleted successfully!');
      }
    }
  };

  const handleSaveHead = (headToSave) => {
    if (onSaveOperationalHead) {
      onSaveOperationalHead(headToSave);
      return;
    }
    setHeadsList(prev => {
      const exists = prev.some(h => h.id === headToSave.id);
      if (exists) {
        toast.success(language === 'mr' ? 'माहिती यशस्वीरित्या अपडेट झाली!' : 'Operational Head updated successfully!');
        return prev.map(h => h.id === headToSave.id ? headToSave : h);
      } else {
        toast.success(language === 'mr' ? 'नवीन ऑपरेशनल हेड जोडले!' : 'New Operational Head added successfully!');
        return [headToSave, ...prev];
      }
    });
  };

  const filteredHeads = headsList.filter(head => {
    const q = (searchTerm || '').toLowerCase();
    const nameMatch = head.name ? head.name.toLowerCase().includes(q) : false;
    const roleMatch = head.role ? head.role.toLowerCase().includes(q) : false;
    const deptMatch = head.department ? head.department.toLowerCase().includes(q) : false;
    const idMatch = head.employeeId ? head.employeeId.toLowerCase().includes(q) : false;
    const locMatch = head.location ? head.location.toLowerCase().includes(q) : false;
    const phoneMatch = head.phone ? head.phone.toLowerCase().includes(q) : false;
    return !searchTerm || nameMatch || roleMatch || deptMatch || idMatch || locMatch || phoneMatch;
  });

  // 1-Click PDF Export with Official Logo
  const handleExportPDF = async () => {
    try {
      const columns = ['#', 'Full Name', 'Phone Number', 'Email Address'];
      const rows = filteredHeads.map((h, index) => [
        index + 1,
        h.name,
        h.phone || '-',
        h.email || '-'
      ]);
      await exportToPDF('AARYA_INNOVTECH_Operational_Heads', columns, rows, 'AI AARYA INNOVTECH PVT. LTD. • Executive Operational Heads Directory', 'portrait');
      toast.success(language === 'mr' ? 'ऑपरेशनल हेड PDF डाऊनलोड झाली!' : 'Operational Heads PDF exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  // 1-Click Excel / CSV Export
  const handleExportExcel = () => {
    try {
      const columns = ['#', 'Full Name', 'Phone Number', 'Email Address'];
      const rows = filteredHeads.map((h, index) => [
        index + 1,
        h.name,
        h.phone || '-',
        h.email || '-'
      ]);
      exportToExcel('AARYA_INNOVTECH_Operational_Heads', columns, rows);
      toast.success(language === 'mr' ? 'ऑपरेशनल हेड Excel डाऊनलोड झाली!' : 'Operational Heads Excel exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export Excel');
    }
  };

  // 1-Click Print Handler with guaranteed embedded Base64 Company Logo
  const handlePrint = async () => {
    try {
      const logoBase64 = await getCompanyLogoBase64();
      const logoSrc = logoBase64 || '/logo_new.png';

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        window.print();
        return;
      }

      const tableRowsHtml = filteredHeads.map((h, index) => `
        <tr>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; font-weight: bold; text-align: center;">${index + 1}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${escapeHtml(h.name)}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #059669; font-weight: bold;">${escapeHtml(h.phone || '-')}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #475569;">${escapeHtml(h.email || '-')}</td>
        </tr>
      `).join('');

      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Aarya Innovtech - Operational Heads Directory</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm 12mm;
            }
            body {
              font-family: 'Cambria', 'Georgia', serif;
              color: #0f172a;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-container {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-bottom: 12px;
              margin-bottom: 16px;
              border-bottom: 2.5px solid #2563eb;
            }
            .logo-section {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .logo-img {
              height: 52px;
              max-width: 180px;
              object-fit: contain;
            }
            .company-info h1 {
              font-size: 19px;
              font-weight: 900;
              margin: 0;
              color: #0f172a;
              letter-spacing: 0.02em;
            }
            .company-info p {
              font-size: 12px;
              color: #475569;
              margin: 3px 0 0 0;
              font-weight: 600;
            }
            .doc-meta {
              text-align: right;
              font-size: 11.5px;
              color: #334155;
              line-height: 1.4;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 12px;
            }
            th {
              background-color: #0f172a !important;
              color: #ffffff !important;
              padding: 10px 8px;
              border: 1px solid #0f172a;
              font-weight: bold;
              text-align: left;
            }
            .footer {
              margin-top: 24px;
              padding-top: 12px;
              border-top: 1px solid #cbd5e1;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #64748b;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-section">
              <img src="${logoSrc}" class="logo-img" alt="Aarya Innovtech" />
              <div class="company-info">
                <h1>AI AARYA INNOVTECH PVT. LTD.</h1>
                <p>Executive Operational Heads & Field Operations Roster</p>
              </div>
            </div>
            <div class="doc-meta">
              <div><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div><strong>Total Heads:</strong> ${filteredHeads.length} Official Leaders</div>
              <div><strong>Generated by:</strong> Operations Admin (ASEMS)</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 36px; text-align: center;">#</th>
                <th>Operational Head Name & ID</th>
                <th>Designation & Division</th>
                <th>Official Contact Details</th>
                <th>Headquarters / Base</th>
                <th style="text-align: center;">Budget Authority</th>
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
              setTimeout(function() {
                window.print();
              }, 300);
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
    <div className="dash-container">
      {/* 1. Header with Title & Action Tools */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '0.5rem'
      }}>
        <div>
          <h1 className="dash-header-title" style={{ margin: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#0f172a' }}>
            <ShieldCheck size={32} style={{ color: '#2563eb' }} />
            <span style={{ color: '#0f172a' }}>
              {language === 'mr' ? 'ऑपरेशनल हेड' : 'Operational Head'}
            </span>
          </h1>
          <p className="dash-header-sub" style={{ margin: '0.25rem 0 0 0' }}>
            {language === 'mr'
              ? 'सर्व अधिकृत ऑपरेशनल हेड, फील्ड सुपरव्हिजन आणि बजेट मंजुरी.'
              : 'Executive Operational Heads, Project Authorizations & Field Supervision.'}
          </p>
        </div>

        {/* Action Tools: Print, Excel, PDF (On Top Right) */}
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

      {/* 2. Controls Row: Search Bar (Left) + Add Operational Head Button (Right) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Search Bar (50% Width) */}
        <div style={{
          position: 'relative',
          width: '50%',
          minWidth: '260px',
          boxSizing: 'border-box'
        }}>
          <Search size={18} style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input 
            type="text"
            placeholder={language === 'mr' ? "ऑपरेशनल हेड नाव, फोन, स्थान शोधा..." : "Search operational heads by Name, Phone, Email, Location..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1.2rem 0.8rem 2.85rem',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.95rem',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
            }}
          />
        </div>

        {/* ➕ Add Operational Head Button (Gradient Pill placed below next to search) */}
        <button
          onClick={handleOpenAddModal}
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
          <span>Add Operational Head</span>
        </button>
      </div>

      {/* Operational Heads Executive Table */}
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #e2e8f0)',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
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
                <th style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap', minWidth: '220px' }}>HEAD NAME ↕</th>
                <th style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap', minWidth: '150px' }}>PHONE ↕</th>
                <th style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap', minWidth: '220px' }}>LOCATION ↕</th>
                <th style={{ padding: '0.9rem 1.15rem', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }}>STATUS ↕</th>
                <th style={{ padding: '0.9rem 1.15rem', textAlign: 'center', whiteSpace: 'nowrap', width: '120px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredHeads.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
                    <ShieldCheck size={38} style={{ margin: '0 auto 0.5rem auto', display: 'block', color: '#cbd5e1' }} />
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '1rem', color: '#475569' }}>
                      {language === 'mr' ? 'कोणतेही ऑपरेशनल हेड आढळले नाहीत' : 'No Operational Heads found'}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                      {language === 'mr' ? 'कृपया शोध शब्द तपासा किंवा नवीन जोडा.' : 'Try adjusting your search query or add a new one.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredHeads.map((head, index) => {
                  return (
                    <tr 
                      key={head.id || index}
                      style={{ 
                        borderBottom: '1px solid var(--border-color, #f1f5f9)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-hover, #f8fafc)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* ID */}
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', color: '#64748b', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
                        {index + 1}
                      </td>

                      {/* Head Name & Email */}
                      <td style={{ padding: '1rem', whiteSpace: 'nowrap', minWidth: '220px' }}>
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
                            border: '1.5px solid #bfdbfe',
                            flexShrink: 0
                          }}>
                            {head.name?.charAt(0).toUpperCase() || 'D'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.96rem', fontWeight: '800', display: 'block', whiteSpace: 'nowrap' }}>
                              {head.name}
                            </strong>
                            {head.email && (
                              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '1px' }}>
                                {head.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: '700' }}>
                          {head.phone || '+91 93596 04384'}
                        </span>
                      </td>

                      {/* Location */}
                      <td style={{ padding: '1rem', whiteSpace: 'nowrap', color: '#334155', fontWeight: '600' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                          <span>{head.location || 'Head Office - Pune, Maharashtra'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          letterSpacing: '0.04em',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          display: 'inline-block'
                        }}>
                          {(head.status || 'ACTIVE').toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                          {/* Edit Button */}
                          <button 
                            onClick={() => handleOpenEditModal(head)} 
                            title={language === 'mr' ? 'ऑपरेशनल हेड माहिती बदला' : 'Edit Operational Head Details'}
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

                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDelete(head.id, head.name)} 
                            title={language === 'mr' ? 'ऑपरेशनल हेड हटवा' : 'Delete Operational Head'}
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

      {/* Modal for Creating / Editing Operational Head */}
      <CreateOperationalHeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHead(null);
        }}
        onSave={handleSaveHead}
        editingHead={editingHead}
      />
    </div>
  );
};

export default OrganizationsTab;
