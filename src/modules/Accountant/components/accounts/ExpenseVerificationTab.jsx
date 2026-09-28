import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Eye, 
  Search, 
  ShieldCheck, 
  Clock, 
  User, 
  Check,
  RotateCcw,
  Printer,
  FileSpreadsheet,
  Download,
  X,
  AlertCircle,
  XCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfHeaderWithLogo, addPdfFooterWithLogo, addPdfSignatures, escapeHtml } from '../../../Operations/utils/pdfHeaderHelper';
import aiLogo from '../../assets/ai_logo.jpg';
import PrintFooter from '../PrintFooter';
import Pagination from '../../../../components/ui/Pagination';

const ExpenseVerificationTab = ({ 
  expenses, 
  projects, 
  onInspectExpense, 
  onQuickApprove, 
  onRejectExpense 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSupervisor, setSelectedSupervisor] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedSupervisor, selectedProject, selectedCategory, expenses]);

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

  const filteredExpenses = expenses.filter(exp => {
    // Only show expenses that have passed operations verification OR were rejected by accounts
    if (exp.opsVerificationStatus !== 'Verified') {
      return false;
    }

    const matchesSearch = 
      (exp.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.itemDescription || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.supervisor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.amount != null && exp.amount.toString().replace(/,/g, '').includes(searchQuery.replace(/,/g, '')));

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && exp.status === 'Pending Accounts Verification') ||
      (statusFilter === 'VERIFIED' && exp.status === 'Accounts Verified & Paid') ||
      (statusFilter === 'REJECTED' && (exp.status === 'Rejected' || exp.accountsRejected));

    const matchesSupervisor = selectedSupervisor === 'ALL' || exp.supervisor === selectedSupervisor;
    const matchesProject = selectedProject === 'ALL' || exp.projectId === selectedProject;
    const matchesCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesSupervisor && matchesProject && matchesCategory;
  });

  const supervisors = [...new Set(expenses.map(e => e.supervisor).filter(Boolean))];
  const categories = [...new Set(expenses.map(e => e.category))];
  const pendingCount = expenses.filter(e => e.status === 'Pending Accounts Verification').length;
  const verifiedCount = expenses.filter(e => e.status === 'Accounts Verified & Paid').length;
  const rejectedCount = expenses.filter(e => e.accountsRejected === true).length;

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const currentExpenses = filteredExpenses.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

  const handleNextPage = () => {
    if (validCurrentPage < totalPages) setCurrentPage(validCurrentPage + 1);
  };

  const handlePrevPage = () => {
    if (validCurrentPage > 1) setCurrentPage(validCurrentPage - 1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let rows = [
      ['Expense ID', 'Category', 'Project', 'Supervisor', 'Vendor Name', 'Bill No', 'Amount (INR)', 'GST Included', 'Status']
    ];
    filteredExpenses.forEach(e => {
      rows.push([
        `"${e.id?.slice(0, 8)?.toUpperCase() || ''}"`,
        e.category,
        e.projectName,
        e.supervisor,
        e.vendorName || 'N/A',
        e.billNumber || 'N/A',
        e.amount,
        e.gstIncluded ? 'Yes' : 'No',
        e.status
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASEMS_Expense_Verification_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    await addPdfHeaderWithLogo(
      doc,
      'Site Expenses Verification & Audit Queue Statement',
      `Generated on: ${new Date().toLocaleString('en-GB')} | Total Verified/Pending Claims: ${filteredExpenses.length}`
    );

    const headers = [['INVOICE ID', 'DATE', 'PROJECT', 'SUPERVISOR', 'CATEGORY', 'PAYEE (VENDOR)', 'AMOUNT', 'OPS VERIFICATION', 'ACCOUNTS STATUS']];
    const data = filteredExpenses.map(e => {
      let dateStr = '';
      const rawDate = e.billDate || e.submittedAt;
      if (rawDate) {
        try {
          dateStr = new Date(rawDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (err) {
          dateStr = rawDate.split('T')[0];
        }
      }
      const approval = e.opsApproval || e.dineshApproval || e.operationsApproval;
      const isOpsApproved = approval?.status === 'Approved' || (!approval?.status && approval?.approvedBy);
      const isOpsRejected = approval?.status === 'Rejected';
      let opsStatus = 'Pending';
      if (isOpsApproved) opsStatus = 'Approved';
      if (isOpsRejected) opsStatus = 'Rejected';
      // If opsVerificationStatus field is available and Verified
      if (e.opsVerificationStatus === 'Verified') opsStatus = 'Approved';

      let accountsStatus = 'Pending';
      if (e.status === 'Accounts Verified & Paid') accountsStatus = 'Verified';
      if (e.status === 'Rejected' || e.accountsRejected) accountsStatus = 'Rejected';

      return [
        (e.id || '').slice(0, 8).toUpperCase(),
        dateStr || '—',
        e.projectName,
        e.supervisor,
        e.category || 'Uncategorized',
        e.vendorName || '-',
        formatPDFINR(e.amount),
        opsStatus,
        accountsStatus
      ];
    });

    autoTable(doc, {
      startY: 28,
      margin: { bottom: 35, top: 20 },
      head: headers,
      body: data,
      theme: 'grid',
      styles: { 
        fontSize: 8,
        lineColor: [37, 99, 235],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    await addPdfFooterWithLogo(doc);
    addPdfSignatures(doc);
    doc.save(`ASEMS_Expense_Verification_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Printable Letterhead Header (Only visible on Print) */}
      <div className="print-only" style={{ display: 'none', marginBottom: '1rem', borderBottom: '2px solid #2563eb', paddingBottom: '0.6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src={aiLogo} alt="Aarya Innovtech Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: '800', margin: 0, color: '#1e293b' }}>
              ASEMS - AARYA SITE EXPENSE MANAGEMENT SYSTEM
            </h2>
            <p style={{ fontSize: '10pt', fontWeight: '700', color: '#2563eb', margin: '2px 0 0' }}>
              Site Expense Verification & Vendor Invoices Statement
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '8pt', color: '#64748b' }}>
            <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
            <div>Total Records: {filteredExpenses.length}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-cards-grid no-print" style={{ marginBottom: '-0.5rem' }}>
        <div 
          onClick={() => setStatusFilter('ALL')}
          style={{
          backgroundColor: 'var(--surface-bg, #ffffff)',
          borderRadius: '18px',
          padding: '1.15rem 1.25rem',
          border: statusFilter === 'ALL' ? '2px solid #4f46e5' : '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '135px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Invoices from Ops</p>
              <h3 style={{ color: 'var(--text-primary, #0f172a)', fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>{expenses.filter(e => e.opsVerificationStatus === 'Verified').length}</h3>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '14px', backgroundColor: '#e0e7ff' }}>
              <FileSpreadsheet size={24} color="#4f46e5" />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.65rem', borderRadius: '20px',
              backgroundColor: '#e0e7ff', color: '#4f46e5',
              fontSize: '0.75rem', fontWeight: '700'
            }}>
              <CheckCircle2 size={12} /> Operations Verified
            </span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('PENDING')}
          style={{
          backgroundColor: 'var(--surface-bg, #ffffff)',
          borderRadius: '18px',
          padding: '1.15rem 1.25rem',
          border: statusFilter === 'PENDING' ? '2px solid #d97706' : '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '135px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Your Approval</p>
              <h3 style={{ color: 'var(--text-primary, #0f172a)', fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>{pendingCount}</h3>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '14px', backgroundColor: '#fef3c7' }}>
              <Clock size={24} color="#d97706" />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.65rem', borderRadius: '20px',
              backgroundColor: pendingCount > 0 ? '#fef3c7' : '#dcfce7',
              color: pendingCount > 0 ? '#d97706' : '#15803d',
              fontSize: '0.75rem', fontWeight: '700'
            }}>
              {pendingCount > 0 ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />} 
              {pendingCount > 0 ? `${pendingCount} action required` : 'All caught up!'}
            </span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('VERIFIED')}
          style={{
          backgroundColor: 'var(--surface-bg, #ffffff)',
          borderRadius: '18px',
          padding: '1.15rem 1.25rem',
          border: statusFilter === 'VERIFIED' ? '2px solid #15803d' : '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '135px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Approved & Paid</p>
              <h3 style={{ color: 'var(--text-primary, #0f172a)', fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>{verifiedCount}</h3>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '14px', backgroundColor: '#dcfce7' }}>
              <ShieldCheck size={24} color="#15803d" />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.65rem', borderRadius: '20px',
              backgroundColor: '#dcfce7', color: '#15803d',
              fontSize: '0.75rem', fontWeight: '700'
            }}>
              <CheckCircle2 size={12} /> Processed
            </span>
          </div>
        </div>

        {/* Rejected Card */}
        <div 
          onClick={() => setStatusFilter('REJECTED')}
          style={{
          backgroundColor: 'var(--surface-bg, #ffffff)',
          borderRadius: '18px',
          padding: '1.15rem 1.25rem',
          border: statusFilter === 'REJECTED' ? '2px solid #dc2626' : '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '135px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rejected</p>
              <h3 style={{ color: 'var(--text-primary, #0f172a)', fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>{rejectedCount}</h3>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '14px', backgroundColor: '#fee2e2' }}>
              <XCircle size={24} color="#dc2626" />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.65rem', borderRadius: '20px',
              backgroundColor: '#fee2e2', color: '#dc2626',
              fontSize: '0.75rem', fontWeight: '700'
            }}>
              <XCircle size={12} /> Accounts Rejected
            </span>
          </div>
        </div>
      </div>

      {/* Top Right Action Header (Hidden in Print) */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        {/* Print Button */}
        

        {/* Excel Button */}
        

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
      
      {/* Search Bar + Site Supervisor & Accountant Status Dropdowns Row */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        marginBottom: '-0.2rem'
      }}>
        {/* Left: Search Input Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          backgroundColor: 'var(--surface-bg)',
          padding: '0.55rem 0.95rem',
          borderRadius: '12px',
          border: '1.5px solid var(--border-color)',
          width: '100%',
          maxWidth: '360px',
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <Search size={16} strokeWidth={1.8} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by ID, Vendor, Supervisor, Amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.86rem',
              padding: 0
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Right: Site Supervisor & Accountant Status Dropdown Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* 1. Site Supervisor Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Site Supervisor:
            </label>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--surface-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <option value="ALL">All Site Supervisors</option>
              {supervisors.map((sup, idx) => (
                <option key={idx} value={sup}>{sup}</option>
              ))}
            </select>
          </div>

          {/* 2. Accountant Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Accountant Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--surface-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending Accounts Verification</option>
              <option value="VERIFIED">Accounts Verified & Paid</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div style={{
        backgroundColor: 'var(--surface-bg)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--table-header-bg)',
                borderBottom: '1px solid var(--border-color)',
                textAlign: 'left',
                color: 'var(--text-secondary)'
              }}>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Invoice ID & Date</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Project & Site</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Site Supervisor</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Category</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Payee (Vendor / Contractor)</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Amount</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Ops Verification</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Accounts Status</th>
                <th className="no-print" style={{ padding: '0.9rem 1rem', fontWeight: '700', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No vendor invoices or procurement bills found.
                  </td>
                </tr>
              ) : (
                currentExpenses.map((exp) => {
                  const isPending = exp.status === 'Pending Accounts Verification';
                  const isVerified = exp.status === 'Accounts Verified & Paid';
                  const isRejected = exp.status === 'Rejected' || exp.accountsRejected === true;

                  return (
                    <tr 
                      key={exp.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: isPending ? 'rgba(245, 158, 11, 0.02)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                          {exp.id ? exp.id.slice(0, 8).toUpperCase() : ''}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {(() => {
                            const dateStr = exp.billDate || exp.submittedAt;
                            if (!dateStr) return '';
                            try {
                              return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                            } catch (e) {
                              return dateStr.split('T')[0];
                            }
                          })()}
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                          {exp.projectName}
                        </div>
                      </td>

                      <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {exp.supervisor}
                        </div>
                      </td>

                      <td style={{ padding: '1rem', maxWidth: '240px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(59, 130, 246, 0.12)',
                          color: '#3b82f6',
                          display: 'inline-block'
                        }}>
                          {exp.category}
                        </span>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                          {exp.vendorName || 'Direct Site Vendor'}
                        </div>
                      </td>

                      <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                          {formatINR(exp.amount)}
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        {(() => {
                          const approval = exp.opsApproval || exp.dineshApproval || exp.operationsApproval;
                          const isApproved = approval?.status === 'Approved' || (!approval?.status && approval?.approvedBy);
                          const isRejected = approval?.status === 'Rejected';
                          
                          if (isRejected) {
                            return (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                color: '#ef4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '20px'
                              }}>
                                <AlertCircle size={13} />
                                Ops Rejected
                              </div>
                            );
                          }

                          if (isApproved) {
                            const rawName = approval?.approvedBy || 'Operations';
                            const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
                            return (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                color: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '20px'
                              }}>
                                <ShieldCheck size={13} />
                                {cleanName} Approved
                              </div>
                            );
                          }

                          return (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              color: '#f59e0b',
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '20px'
                            }}>
                              <Clock size={13} />
                              Pending Ops
                            </div>
                          );
                        })()}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        {isPending && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            color: '#d97706'
                          }}>
                            <Clock size={12} /> Pending Accounts
                          </span>
                        )}
                        {isVerified && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981'
                          }}>
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        )}
                        {isRejected && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444'
                          }}>
                            <XCircle size={12} /> Accounts Rejected
                          </span>
                        )}
                      </td>

                      <td className="no-print" style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => onInspectExpense(exp)}
                            style={{
                              padding: '0.45rem 0.85rem',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              color: '#3b82f6',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={14} /> View Bills
                          </button>

                          {isPending && (
                            <button
                              onClick={() => onQuickApprove(exp)}
                              style={{
                                padding: '0.45rem 0.75rem',
                                borderRadius: '8px',
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                cursor: 'pointer'
                              }}
                              title="Accept Vendor Invoice"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {isPending && (
                            <button
                              onClick={() => onRejectExpense(exp)}
                              style={{
                                padding: '0.45rem 0.6rem',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                cursor: 'pointer'
                              }}
                              title="Reject Vendor Invoice"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Control */}
        {totalPages > 0 && (
          <div className="no-print" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Pagination 
              currentPage={validCurrentPage}
              totalPages={totalPages}
              onNext={handleNextPage}
              onPrev={handlePrevPage}
            />
          </div>
        )}
      </div>

      {/* Corporate Printable Footer with Signatures */}
      <PrintFooter />
    </div>
  );
};

export default ExpenseVerificationTab;
