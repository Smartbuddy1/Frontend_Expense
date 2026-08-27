import React, { useState } from 'react';
import { 
  Building2, 
  Wallet,
  Search,
  User,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Printer,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyPDFHeader, applyPDFFooter, getLogoDataUrl } from '../../utils/exportUtils';
import aiLogo from '../../assets/ai_logo.jpg';
import PrintFooter from '../PrintFooter';

const BudgetManagementTab = ({ 
  projects = [], 
  onReleaseFund 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatPDFINR = (val) => {
    if (val === undefined || val === null) return 'Rs. 0';
    return `Rs. ${Number(val).toLocaleString('en-IN')}`;
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.site?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supervisor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalSanctioned = filteredProjects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalReleased = filteredProjects.reduce((acc, p) => acc + (p.fundsReleased || 0), 0);
  const totalExpenses = filteredProjects.reduce((acc, p) => acc + (p.expenses || 0), 0);
  const totalBalance = filteredProjects.reduce((acc, p) => acc + (p.balance || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Project ID', 'Project Name', 'Site Location', 'Toilets Count', 'Supervisor', 'Sanctioned Budget (INR)', 'Funds Released (INR)', 'Verified Expenses (INR)', 'Site Balance (INR)', 'Status'];
    const rows = filteredProjects.map(p => [
      p.id,
      p.name,
      p.site,
      p.toilets,
      p.supervisor,
      p.budget,
      p.fundsReleased,
      p.expenses,
      p.balance,
      p.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASEMS_Project_Budgets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const logoDataUrl = await getLogoDataUrl();

    applyPDFHeader(doc, {
      title: 'Project Sanctioned Budgets & Allocation Statement',
      metaInfo: `Generated: ${new Date().toLocaleString()} | Total Projects: ${filteredProjects.length} | Sanctioned: ${formatPDFINR(totalSanctioned)}`,
      logoDataUrl
    });

    const headers = [['Project ID & Name', 'Site & Units', 'Supervisor', 'Budget', 'Released', 'Expenses', 'Balance', 'Status']];
    const data = filteredProjects.map(p => [
      `${p.id} - ${p.name}`,
      `${p.site} (${p.toilets} U)`,
      p.supervisor,
      formatPDFINR(p.budget),
      formatPDFINR(p.fundsReleased),
      formatPDFINR(p.expenses),
      formatPDFINR(p.balance),
      p.status
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
    doc.save(`ASEMS_Project_Budgets_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Printable Letterhead Header */}
      <div className="print-only" style={{ display: 'none', marginBottom: '1rem', borderBottom: '2px solid #2563eb', paddingBottom: '0.6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src={aiLogo} alt="Aarya Innovtech Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: '800', margin: 0, color: '#1e293b' }}>
              ASEMS - AARYA SITE EXPENSE MANAGEMENT SYSTEM
            </h2>
            <p style={{ fontSize: '10pt', fontWeight: '700', color: '#2563eb', margin: '2px 0 0' }}>
              Project Sanctioned Budgets & Site Allocations Statement
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '8pt', color: '#64748b' }}>
            <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
            <div>Total Sanctioned: {formatINR(totalSanctioned)}</div>
          </div>
        </div>
      </div>

      {/* Top Right Action Header */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        {/* Print Button */}
        <button
          onClick={handlePrint}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-bg)',
            color: 'var(--text-primary)',
            border: '1.5px solid #cbd5e1',
            fontWeight: '600',
            fontSize: '0.86rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
        >
          <Printer size={17} style={{ color: 'var(--text-primary)' }} />
          Print
        </button>

        {/* Excel Button */}
        <button
          onClick={handleExportCSV}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-bg)',
            color: '#16a34a',
            border: '1.5px solid #16a34a',
            fontWeight: '600',
            fontSize: '0.86rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
        >
          <FileSpreadsheet size={17} color="#16a34a" />
          Excel
        </button>

        {/* PDF Button */}
        <button
          onClick={handleExportPDF}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-bg)',
            color: '#dc2626',
            border: '1.5px solid #dc2626',
            fontWeight: '600',
            fontSize: '0.86rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
        >
          <Download size={17} color="#dc2626" />
          PDF
        </button>
      </div>
      
      {/* Search & Filter Controls */}
      <div className="no-print" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--surface-bg)',
        padding: '1.25rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
      }}>
        {/* Search Input */}
        <div className="search-filter-item" style={{ maxWidth: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by project, site, supervisor, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              minWidth: 0,
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Dropdown Filters & Reset */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.65rem 1.2rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '170px'
              }}
            >
              <option value="ALL">All Projects ({projects.length})</option>
              <option value="In Progress">In Progress</option>
              <option value="Planning">Planning</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {(statusFilter !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setSearchTerm('');
              }}
              style={{
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Projects Table Container */}
      <div style={{
        backgroundColor: 'var(--surface-bg)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--bg-color)',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.76rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700' }}>Project ID</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700' }}>Project & Site</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700' }}>Supervisor</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Sanctioned Budget</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Funds Released</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Unreleased Balance</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700', textAlign: 'center', whiteSpace: 'nowrap' }}>Status</th>
                <th className="no-print" style={{ padding: '1rem 1.25rem', fontWeight: '700', textAlign: 'center', whiteSpace: 'nowrap' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => {
                  const unreleased = (project.budget || 0) - (project.fundsReleased || 0);

                  return (
                    <tr
                      key={project.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="table-row-hover"
                    >
                      {/* Project ID */}
                      <td style={{ padding: '1rem 1.25rem', fontWeight: '700', fontFamily: 'monospace', color: '#3b82f6' }}>
                        {project.id}
                      </td>

                      {/* Project Name & Site */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                          {project.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          {project.site} ({project.toilets} Eco-Toilets)
                        </div>
                      </td>

                      {/* Supervisor */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                          <User size={14} color="var(--text-secondary)" />
                          {project.supervisor}
                        </div>
                      </td>

                      {/* Sanctioned Budget */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {formatINR(project.budget)}
                      </td>

                      {/* Funds Released */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: '800', color: '#10b981', fontFamily: 'monospace' }}>
                        {formatINR(project.fundsReleased)}
                      </td>

                      {/* Unreleased Balance */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: '700', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {formatINR(unreleased)}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '20px',
                          backgroundColor: project.status === 'Completed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                          color: project.status === 'Completed' ? '#10b981' : '#3b82f6',
                          whiteSpace: 'nowrap',
                          display: 'inline-block'
                        }}>
                          {project.status || 'In Progress'}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="no-print" style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <button
                          onClick={() => onReleaseFund && onReleaseFund(project)}
                          style={{
                            padding: '0.5rem 0.95rem',
                            borderRadius: '8px',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Wallet size={14} />
                          Allocate Fund
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: '600' }}>No projects match your current search/filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Printable Footer with Signatures */}
      <PrintFooter />
    </div>
  );
};

export default BudgetManagementTab;
