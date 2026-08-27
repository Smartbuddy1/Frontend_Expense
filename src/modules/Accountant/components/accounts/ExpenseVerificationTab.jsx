import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyPDFHeader, applyPDFFooter, getLogoDataUrl } from '../../utils/exportUtils';
import aiLogo from '../../assets/ai_logo.jpg';
import PrintFooter from '../PrintFooter';

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
    const matchesSearch = 
      exp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.vendorName && exp.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exp.billNumber && exp.billNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && exp.status === 'Pending Accounts Verification') ||
      (statusFilter === 'VERIFIED' && exp.status === 'Accounts Verified & Paid') ||
      (statusFilter === 'CORRECTION' && exp.status === 'Sent for Correction');

    const matchesSupervisor = selectedSupervisor === 'ALL' || exp.supervisor === selectedSupervisor;
    const matchesProject = selectedProject === 'ALL' || exp.projectId === selectedProject;
    const matchesCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesSupervisor && matchesProject && matchesCategory;
  });

  const supervisors = [...new Set(expenses.map(e => e.supervisor).filter(Boolean))];
  const categories = [...new Set(expenses.map(e => e.category))];
  const pendingCount = expenses.filter(e => e.status === 'Pending Accounts Verification').length;
  const verifiedCount = expenses.filter(e => e.status === 'Accounts Verified & Paid').length;
  const correctionCount = expenses.filter(e => e.status === 'Sent for Correction').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let rows = [
      ['Expense ID', 'Category', 'Project', 'Supervisor', 'Vendor Name', 'Bill No', 'Amount (INR)', 'GST Included', 'Status']
    ];
    filteredExpenses.forEach(e => {
      rows.push([
        e.id,
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
    const doc = new jsPDF();
    const logoDataUrl = await getLogoDataUrl();

    applyPDFHeader(doc, {
      title: 'Site Expenses Verification & Audit Queue Statement',
      metaInfo: `Generated: ${new Date().toLocaleString()} | Total Verified/Pending Claims: ${filteredExpenses.length}`,
      logoDataUrl
    });

    const headers = [['Expense ID', 'Category', 'Project', 'Supervisor', 'Vendor', 'Amount', 'Status']];
    const data = filteredExpenses.map(e => [
      e.id,
      e.category,
      e.projectName,
      e.supervisor,
      e.vendorName || '-',
      formatPDFINR(e.amount),
      e.status === 'Accounts Verified & Paid' ? 'Verified' : e.status === 'Sent for Correction' ? 'Correction' : 'Pending'
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

      {/* Top Right Action Header (Hidden in Print) */}
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
            placeholder="Search by Bill No, ID, Vendor, Supervisor..."
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
              <option value="ALL">All Accounts Status</option>
              <option value="PENDING">Pending Verification</option>
              <option value="VERIFIED">Approved</option>
              <option value="CORRECTION">Correction Requested</option>
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
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Category & Description</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Payee (Vendor / Contractor)</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Amount</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Ops Verification</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Accounts Status</th>
                <th className="no-print" style={{ padding: '0.9rem 1rem', fontWeight: '700', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No vendor invoices or procurement bills found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const isPending = exp.status === 'Pending Accounts Verification';
                  const isVerified = exp.status === 'Accounts Verified & Paid';
                  const isCorrection = exp.status === 'Sent for Correction';

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
                          {exp.id}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {exp.billDate || exp.submittedAt}
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                          {exp.projectName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Site Procurement
                        </div>
                      </td>

                      <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {exp.supervisor}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <User size={11} color="#3b82f6" /> Site In-Charge
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
                          display: 'inline-block',
                          marginBottom: '4px'
                        }}>
                          {exp.category}
                        </span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={exp.itemDescription}>
                          {exp.itemDescription}
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                          {exp.vendorName || 'Direct Site Vendor'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          Invoice #{exp.billNumber || 'N/A'}
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
                        {isCorrection && (
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
                            Correction Requested
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
                            <Eye size={14} /> Verify Bill
                          </button>

                          {isPending && (
                            <>
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
                                title="Quick Approve Vendor Invoice"
                              >
                                <Check size={14} />
                              </button>

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
                                title="Send for Correction"
                              >
                                <RotateCcw size={14} />
                              </button>
                            </>
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
      </div>

      {/* Corporate Printable Footer with Signatures */}
      <PrintFooter />
    </div>
  );
};

export default ExpenseVerificationTab;
