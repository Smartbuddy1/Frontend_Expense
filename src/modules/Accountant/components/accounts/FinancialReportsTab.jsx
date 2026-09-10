import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer,
  Search,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyPDFHeader, applyPDFFooter, getLogoDataUrl } from '../../utils/exportUtils';
import PrintFooter from '../PrintFooter';

const FinancialReportsTab = ({ 
  projects = [],
  payments = [],
  expenses = []
}) => {
  const [reportMode, setReportMode] = useState('ADVANCED_PAYOUT'); // 'EXPENSE_VERIFICATION' or 'ADVANCED_PAYOUT'
  const [filterType, setFilterType] = useState('FY'); // 'FY' or 'DATE_RANGE'
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedSupervisor, setSelectedSupervisor] = useState('ALL');
  const [financialYear, setFinancialYear] = useState('CURRENT_FY');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const availableSupervisors = selectedProject === 'ALL'
    ? [...new Set(projects.map(p => p.supervisor).filter(Boolean))]
    : [...new Set(projects.filter(p => p.id === selectedProject).map(p => p.supervisor).filter(Boolean))];

  const handleProjectChange = (projId) => {
    setSelectedProject(projId);
    if (projId !== 'ALL') {
      const projSupervisors = projects.filter(p => p.id === projId).map(p => p.supervisor);
      if (!projSupervisors.includes(selectedSupervisor)) {
        setSelectedSupervisor('ALL');
      }
    }
  };

  const filteredPayments = payments.filter(p => {
    const q = searchQuery.toLowerCase();
    
    // Project Match
    const matchesProj = selectedProject === 'ALL' || p.projectId === selectedProject;
    
    // Supervisor Match (p.paidTo is the supervisor name for advance payments)
    const matchesSup = selectedSupervisor === 'ALL' || p.paidTo === selectedSupervisor;

    // Search Query Match
    const matchesSearch = 
      !searchQuery ||
      (p.paidTo && p.paidTo.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q)) ||
      (p.projectName && p.projectName.toLowerCase().includes(q)) ||
      (p.notes && p.notes.toLowerCase().includes(q));

    // Date Match
    const matchesDate = 
      filterType === 'FY' ||
      ((!startDate || (p.date || '') >= startDate) &&
      (!endDate || (p.date || '') <= endDate));

    return matchesProj && matchesSup && matchesSearch && matchesDate;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const logoDataUrl = await getLogoDataUrl();

    applyPDFHeader(doc, {
      title: `Financial Report: Live Payment Records`,
      metaInfo: `Generated: ${new Date().toLocaleString()}`,
      logoDataUrl
    });

    const headers = [['ID', 'Site Supervisor', 'Date/Time', 'Amount (INR)', 'Details']];
    const data = filteredPayments.map(p => [
      p.id,
      p.paidTo || 'N/A',
      formatDateTime(p.date),
      p.amount,
      `${p.projectName || 'General'}${p.notes || p.category ? ` - ${p.notes || p.category}` : ''}`
    ]);

    doc.autoTable({
      startY: 35,
      margin: { bottom: 30 },
      head: headers,
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8.5 }
    });

    applyPDFFooter(doc);
    doc.save(`ASEMS_FinancialReport_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportCSV = () => {
    let rows = [];
    rows.push(['ID', 'Site Supervisor', 'Date/Time', 'Amount', 'Details']);
    filteredPayments.forEach(p => {
      rows.push([
        p.id, 
        p.paidTo || 'N/A', 
        formatDateTime(p.date).replace(/,/g, ''), 
        p.amount, 
        `${p.projectName || 'General'}${p.notes || p.category ? ` - ${p.notes || p.category}` : ''}`.replace(/,/g, ';')
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASEMS_FinancialReport_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Report Mode Dropdown Toggle */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.85rem 1.25rem',
        backgroundColor: 'var(--surface-bg)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          Report Type:
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setReportMode('EXPENSE_VERIFICATION')}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              border: `2px solid ${reportMode === 'EXPENSE_VERIFICATION' ? '#3b82f6' : 'var(--border-color)'}`,
              backgroundColor: reportMode === 'EXPENSE_VERIFICATION' ? '#3b82f6' : 'transparent',
              color: reportMode === 'EXPENSE_VERIFICATION' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            Expense Verification
          </button>
          <button
            onClick={() => setReportMode('ADVANCED_PAYOUT')}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              border: `2px solid ${reportMode === 'ADVANCED_PAYOUT' ? '#3b82f6' : 'var(--border-color)'}`,
              backgroundColor: reportMode === 'ADVANCED_PAYOUT' ? '#3b82f6' : 'transparent',
              color: reportMode === 'ADVANCED_PAYOUT' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            Advanced Payout
          </button>
        </div>
      </div>
      
      {/* Top Right Action Header */}
      <div className="no-print top-action-header">
        <button
          onClick={handlePrint}
          style={{
            padding: '0.55rem 1.15rem', borderRadius: '12px', backgroundColor: 'var(--surface-bg)',
            color: 'var(--text-primary)', border: '1.5px solid #cbd5e1', fontWeight: '600',
            fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'all 0.15s ease'
          }}
        >
          <Printer size={17} /> Print
        </button>
        <button
          onClick={handleExportCSV}
          style={{
            padding: '0.55rem 1.15rem', borderRadius: '12px', backgroundColor: 'var(--surface-bg)',
            color: '#16a34a', border: '1.5px solid #16a34a', fontWeight: '600',
            fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'all 0.15s ease'
          }}
        >
          <FileSpreadsheet size={17} color="#16a34a" /> Excel
        </button>
        <button
          onClick={handleExportPDF}
          style={{
            padding: '0.55rem 1.15rem', borderRadius: '12px', backgroundColor: 'var(--surface-bg)',
            color: '#dc2626', border: '1.5px solid #dc2626', fontWeight: '600',
            fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', transition: 'all 0.15s ease'
          }}
        >
          <Download size={17} color="#dc2626" /> PDF
        </button>
      </div>

      {/* Search & Filter Card Box */}
      <div className="no-print" style={{
        backgroundColor: 'var(--surface-bg)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.25rem 1.4rem',
        boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Top: Filter Type Radio Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            Filter Type:
          </span>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            <input 
              type="radio" 
              name="reportsFilterType" 
              value="FY" 
              checked={filterType === 'FY'} 
              onChange={() => setFilterType('FY')}
              style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Financial Year
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            <input 
              type="radio" 
              name="reportsFilterType" 
              value="DATE_RANGE" 
              checked={filterType === 'DATE_RANGE'} 
              onChange={() => setFilterType('DATE_RANGE')}
              style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Date Range
          </label>
        </div>

        {/* Bottom: Dynamic Responsive Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end',
          width: '100%',
          boxSizing: 'border-box'
        }}>

          {/* 1. Project Name */}
          <div style={{ minWidth: 0 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem', whiteSpace: 'nowrap' }}>
              Project Name
            </label>
            <select
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
                textOverflow: 'ellipsis'
              }}
            >
              <option value="ALL">-- Select Project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.site})</option>
              ))}
            </select>
          </div>

          {/* 2. Site Supervisor */}
          <div style={{ minWidth: 0 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem', whiteSpace: 'nowrap' }}>
              Site Supervisor
            </label>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
                textOverflow: 'ellipsis'
              }}
            >
              <option value="ALL">{selectedProject === 'ALL' ? '-- All Site Supervisors --' : '-- All Project Supervisors --'}</option>
              {availableSupervisors.map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
          </div>

          {/* 3. Financial Year / Date Range */}
          {filterType === 'FY' ? (
            <div style={{ minWidth: 0 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem', whiteSpace: 'nowrap' }}>
                Financial Year
              </label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  textOverflow: 'ellipsis'
                }}
              >
                <option value="CURRENT_FY">Current FY (2026-27 / Apr-Mar)</option>
                <option value="PREV_FY">FY 2025-26</option>
                <option value="ALL">All Financial Years</option>
              </select>
            </div>
          ) : (
            <>
              {/* From Date */}
              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem', whiteSpace: 'nowrap' }}>
                  From Date
                </label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.58rem 0.75rem',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* To Date */}
              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem', whiteSpace: 'nowrap' }}>
                  To Date
                </label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.58rem 0.75rem',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="no-print" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: 'var(--surface-bg)',
          padding: '0.6rem 0.95rem', borderRadius: '12px', border: '1.5px solid var(--border-color)',
          width: '100%', maxWidth: '380px', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <Search size={16} strokeWidth={1.8} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '0.86rem', padding: 0
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex', alignItems: 'center' }}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      {reportMode === 'EXPENSE_VERIFICATION' ? (
        /* EXPENSE VERIFICATION TABLE */
        <div style={{
          backgroundColor: 'var(--surface-bg)', borderRadius: '16px', border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Expense Verification Records
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0' }}>
                Operations-approved expense submissions
              </p>
            </div>
            <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#059669', backgroundColor: 'rgba(5, 150, 105, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '12px' }}>
              Ops Approved
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--table-header-bg)', borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>ID / Date</th>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Project &amp; Site</th>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Supervisor</th>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Category</th>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Vendor</th>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'center' }}>View Bills</th>
                </tr>
              </thead>
              <tbody>
                {expenses.filter(e => e.status !== 'Pending Operations Approval').length > 0 ? (
                  expenses
                    .filter(e => e.status !== 'Pending Operations Approval')
                    .map(e => (
                      <tr key={e.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div style={{ fontWeight: '700', fontFamily: 'monospace', color: '#3b82f6', fontSize: '0.75rem' }}>
                            {e.id?.slice(0, 8)?.toUpperCase()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            {e.billDate ? formatDateTime(e.billDate) : '—'}
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{e.projectName || '—'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{e.siteName || ''}</div>
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {e.supervisor || '—'}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-secondary)' }}>
                          {e.category || '—'}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-secondary)' }}>
                          {e.vendorName || '—'}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '800', color: '#10b981', fontFamily: 'monospace' }}>
                          {formatINR(e.amount)}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>
                          {e.billUrl ? (
                            <a
                              href={e.billUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                fontSize: '0.78rem', fontWeight: '700', color: '#3b82f6',
                                textDecoration: 'none', padding: '0.3rem 0.7rem',
                                borderRadius: '8px', border: '1.5px solid #3b82f6',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              View
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No Bill</span>
                          )}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr><td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No verified expense records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ADVANCED PAYOUT TABLE (existing) */
        <div style={{
          backgroundColor: 'var(--surface-bg)', borderRadius: '16px', border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Live Payment Records
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0' }}>
                Funds released to Site Supervisors
              </p>
            </div>
            <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '12px' }}>
              Real-Time Audit Log
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--table-header-bg)', borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>ID</th>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Site Supervisor</th>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Date/Time</th>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', fontFamily: 'monospace', color: '#3b82f6' }}>
                        {p.id}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {p.paidTo || 'N/A'}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-secondary)' }}>
                        {formatDateTime(p.date)}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '800', color: '#10b981', fontFamily: 'monospace' }}>
                        {formatINR(p.amount)}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-secondary)' }}>
                        {p.projectName ? <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.projectName}</span> : <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>General</span>}
                        {p.notes || p.category ? ` - ${p.notes || p.category}` : ''}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No live payment records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PrintFooter />
    </div>
  );
};

export default FinancialReportsTab;
