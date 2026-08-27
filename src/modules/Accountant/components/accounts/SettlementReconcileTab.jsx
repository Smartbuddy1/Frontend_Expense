import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  User,
  Search,
  Filter,
  Building2,
  Download,
  AlertCircle,
  ChevronDown,
  Printer,
  FileSpreadsheet,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyPDFHeader, applyPDFFooter, getLogoDataUrl } from '../../utils/exportUtils';
import aiLogo from '../../assets/ai_logo.jpg';
import PrintFooter from '../PrintFooter';

const SettlementReconcileTab = ({ 
  settlements, 
  projects = [], 
  onExecuteSettlement 
}) => {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredSettlements = settlements.filter(s => {
    const matchesSearch = 
      s.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.supervisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.site?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = 
      filterType === 'ALL' ? true :
      filterType === 'COMPLETED' ? s.status === 'Completed' :
      s.settlementType === filterType;

    return matchesSearch && matchesType;
  });

  const refundCount = settlements.filter(s => s.settlementType === 'REFUND_DUE').length;
  const payableCount = settlements.filter(s => s.settlementType === 'ADDITIONAL_PAYABLE').length;
  const completedCount = settlements.filter(s => s.status === 'Completed').length;

  const totalRefundAmount = settlements
    .filter(s => s.settlementType === 'REFUND_DUE' && s.status !== 'Completed')
    .reduce((acc, s) => acc + (s.difference || 0), 0);

  const totalPayableAmount = settlements
    .filter(s => s.settlementType === 'ADDITIONAL_PAYABLE' && s.status !== 'Completed')
    .reduce((acc, s) => acc + (s.difference || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Settlement ID', 'Project Name', 'Site Location', 'Site Supervisor', 'Sanctioned Budget (INR)', 'Funds Released (INR)', 'Verified Expenses (INR)', 'Net Difference (INR)', 'Type', 'Status'];
    const rows = filteredSettlements.map(s => [
      s.id,
      s.projectName,
      s.site,
      s.supervisor,
      s.budget,
      s.advanceGiven,
      s.expensesVerified,
      s.difference,
      s.settlementType === 'REFUND_DUE' ? 'Unspent Buffer Refund' : 'Vendor Liability Payable',
      s.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASEMS_Site_Settlements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const logoDataUrl = await getLogoDataUrl();

    applyPDFHeader(doc, {
      title: 'Site Final Settlement & Reconciliation Statement',
      metaInfo: `Generated: ${new Date().toLocaleString()} | Total Settlements: ${filteredSettlements.length}`,
      logoDataUrl
    });

    const headers = [['Settlement ID', 'Project', 'Supervisor', 'Advance Given', 'Expenses Verified', 'Net Balance', 'Type', 'Status']];
    const data = filteredSettlements.map(s => [
      s.id,
      s.projectName,
      s.supervisor,
      formatPDFINR(s.advanceGiven),
      formatPDFINR(s.expensesVerified),
      formatPDFINR(s.difference),
      s.settlementType === 'REFUND_DUE' ? 'Unspent Buffer' : 'Vendor Liability',
      s.status
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
    doc.save(`ASEMS_Site_Settlements_${new Date().toISOString().split('T')[0]}.pdf`);
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
              Site Final Settlement & Financial Closure Statement
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '8pt', color: '#64748b' }}>
            <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
            <div>Total Settlements: {filteredSettlements.length}</div>
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
      
      {/* Search and Dropdown Filters Bar */}
      <div style={{
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          backgroundColor: 'var(--surface-bg)',
          padding: '0.6rem 0.95rem',
          borderRadius: '12px',
          border: '1.5px solid var(--border-color)',
          width: '100%',
          maxWidth: '380px',
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <Search size={16} strokeWidth={1.8} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by project, supervisor, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Dropdown: Settlement Type / Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Status:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
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
                minWidth: '200px'
              }}
            >
              <option value="ALL">All Settlements ({settlements.length})</option>
              <option value="REFUND_DUE">Refunds Due ({refundCount})</option>
              <option value="ADDITIONAL_PAYABLE">Additional Payable ({payableCount})</option>
              <option value="COMPLETED">Settled & Closed ({completedCount})</option>
            </select>
          </div>

          {/* Reset Filters button if filtered */}
          {(filterType !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setFilterType('ALL');
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

      {/* Settlements Table Container */}
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
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700' }}>Settlement ID</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700' }}>Project & Site</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700' }}>Site In-Charge</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Site Funds Released</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Verified Vendor Invoices</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700', textAlign: 'center' }}>Settlement Type</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Net Buffer / Variance</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: '700', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSettlements.length > 0 ? (
                filteredSettlements.map((settlement) => {
                  const isRefundDue = settlement.settlementType === 'REFUND_DUE';
                  const isCompleted = settlement.status === 'Completed';

                  return (
                    <tr
                      key={settlement.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="table-row-hover"
                    >
                      {/* Settlement ID */}
                      <td style={{ padding: '1rem 1.25rem', fontWeight: '700', fontFamily: 'monospace', color: isRefundDue ? '#10b981' : '#d97706' }}>
                        {settlement.id}
                      </td>

                      {/* Project Name */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                          {settlement.projectName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          ID: {settlement.projectId}
                        </div>
                      </td>

                      {/* Site In-Charge */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                          <User size={14} color="#3b82f6" />
                          {settlement.supervisor}
                        </div>
                      </td>

                      {/* Advances Given */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {formatINR(settlement.totalAdvanceGiven)}
                      </td>

                      {/* Verified Expenses */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#3b82f6' }}>
                        {formatINR(settlement.totalApprovedExpenses)}
                      </td>

                      {/* Settlement Type Badge */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '20px',
                          backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.12)' : isRefundDue ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.15)',
                          color: isCompleted ? '#10b981' : isRefundDue ? '#10b981' : '#d97706',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          {isRefundDue ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          {isRefundDue ? 'Unspent Buffer' : 'Vendor Payable'}
                        </span>
                      </td>

                      {/* Net Difference */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '800',
                          fontFamily: 'monospace',
                          color: isRefundDue ? '#10b981' : '#d97706',
                          whiteSpace: 'nowrap'
                        }}>
                          {isRefundDue ? `+${formatINR(settlement.difference)}` : `-${formatINR(settlement.difference)}`}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {isRefundDue ? 'Unspent Site Buffer' : 'Vendor Liability'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '20px',
                          backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isCompleted ? '#10b981' : '#f59e0b',
                          whiteSpace: 'nowrap',
                          display: 'inline-block'
                        }}>
                          {isCompleted ? '✓ Settled & Closed' : 'Pending Settlement'}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        {!isCompleted ? (
                          <button
                            onClick={() => onExecuteSettlement && onExecuteSettlement(settlement)}
                            style={{
                              padding: '0.5rem 0.95rem',
                              borderRadius: '8px',
                              backgroundColor: isRefundDue ? '#10b981' : '#d97706',
                              color: '#ffffff',
                              border: 'none',
                              fontWeight: '700',
                              fontSize: '0.78rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              boxShadow: isRefundDue ? '0 4px 10px rgba(16, 185, 129, 0.25)' : '0 4px 10px rgba(217, 119, 6, 0.25)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <CheckCircle2 size={14} />
                            {isRefundDue ? 'Reconcile Buffer & Close' : 'Release Balance & Close'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981' }}>
                            ✓ Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: '600' }}>No settlements match your current search/filter.</p>
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

export default SettlementReconcileTab;
