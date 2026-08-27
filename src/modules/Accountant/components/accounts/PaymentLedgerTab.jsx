import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  CheckCircle2,
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

const PaymentLedgerTab = ({ payments, onRecordNewPayment }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL');

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

  const filteredPayments = (payments || []).filter(p => {
    if (!p) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (p.paidTo || '').toLowerCase().includes(q) ||
      (p.refNumber || '').toLowerCase().includes(q) ||
      (p.projectName || '').toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q);

    const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
    const matchesMode = modeFilter === 'ALL' || p.paymentMode === modeFilter;

    return matchesSearch && matchesType && matchesMode;
  });

  const totalPaymentsAmount = filteredPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Txn ID', 'Date', 'Type', 'Paid To / Beneficiary', 'Project Name', 'Payment Mode', 'Reference / UTR', 'Amount (INR)', 'Status'];
    const rows = filteredPayments.map(p => [
      p.id,
      p.date,
      p.type,
      p.paidTo,
      p.projectName,
      p.paymentMode,
      p.refNumber,
      p.amount,
      p.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASEMS_Payment_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const logoDataUrl = await getLogoDataUrl();

    applyPDFHeader(doc, {
      title: 'Payment Disbursal & UTR Ledger Statement',
      metaInfo: `Generated: ${new Date().toLocaleString()} | Total Transactions: ${filteredPayments.length} | Total Amount: ${formatPDFINR(totalPaymentsAmount)}`,
      logoDataUrl
    });

    const headers = [['Txn ID', 'Date', 'Type', 'Beneficiary', 'Project', 'Mode', 'UTR / Ref', 'Amount']];
    const data = filteredPayments.map(p => [
      p.id,
      p.date,
      p.type,
      p.paidTo,
      p.projectName,
      p.paymentMode,
      p.refNumber,
      formatPDFINR(p.amount)
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
    doc.save(`ASEMS_Payment_Ledger_${new Date().toISOString().split('T')[0]}.pdf`);
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
              Payment Disbursal & UTR Ledger Statement
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '8pt', color: '#64748b' }}>
            <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
            <div>Total Amount: {formatINR(totalPaymentsAmount)}</div>
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

      {/* Search and Filters */}
      {/* Standalone Search Bar on top of table (No extra wrapper card) */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '-0.35rem'
      }}>
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
            placeholder="Search by UTR / Ref No, Payee, Project..."
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
      </div>

      {/* Ledger Table */}
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
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Txn ID & Date</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Payment Type</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Project & Recipient</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Payment Mode</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Reference / UTR No</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Amount</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No payment transactions found in ledger.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {p.id}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {p.date}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        color: '#3b82f6'
                      }}>
                        {p.type}
                      </span>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {p.paidTo}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {p.projectName}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        <CreditCard size={14} color="#3b82f6" />
                        {p.paymentMode}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {p.refNumber}
                      </span>
                    </td>

                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {formatINR(p.amount)}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981'
                      }}>
                        <CheckCircle2 size={12} /> Settled
                      </span>
                    </td>
                  </tr>
                ))
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

export default PaymentLedgerTab;
