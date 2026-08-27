import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  Search, 
  Phone, 
  ShieldCheck,
  Printer,
  FileSpreadsheet,
  Download,
  User,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyPDFHeader, applyPDFFooter, getLogoDataUrl } from '../../utils/exportUtils';
import aiLogo from '../../assets/ai_logo.jpg';
import PrintFooter from '../PrintFooter';

const AdvanceDisbursalTab = ({ 
  advances = [], 
  projects = [], 
  onDisburseAdvance, 
  onRejectAdvance 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatPDFINR = (val) => {
    if (val === undefined || val === null) return 'Rs. 0';
    return `Rs. ${Number(val).toLocaleString('en-IN')}`;
  };

  const filteredAdvances = (advances || []).filter(adv => {
    if (!adv) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (adv.id || '').toLowerCase().includes(q) ||
      (adv.supervisor || '').toLowerCase().includes(q) ||
      (adv.projectName || '').toLowerCase().includes(q) ||
      (adv.purpose || '').toLowerCase().includes(q);

    const matchesStatus = 
      filterStatus === 'ALL' ||
      (filterStatus === 'PENDING' && (adv.status === 'Pending Accounts Payment' || adv.status === 'Approved by Ops')) ||
      (filterStatus === 'DISBURSED' && adv.status === 'Disbursed');

    return matchesSearch && matchesStatus;
  });

  const pendingCount = (advances || []).filter(a => a?.status === 'Pending Accounts Payment' || a?.status === 'Approved by Ops').length;
  const disbursedCount = (advances || []).filter(a => a?.status === 'Disbursed').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let rows = [
      ['Request ID', 'Date', 'Supervisor', 'Contact', 'Project', 'Amount (INR)', 'Purpose', 'Disbursal Mode', 'UTR Ref', 'Status']
    ];
    filteredAdvances.forEach(a => {
      rows.push([
        a.id,
        a.requestDate || a.date || '-',
        a.supervisor,
        a.supervisorMobile || a.phone || 'N/A',
        a.projectName,
        a.approvedAmount,
        a.purpose,
        a.paymentDetails?.paymentMode || 'Pending',
        a.paymentDetails?.refNumber || 'Pending',
        a.status
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASEMS_Advance_Disbursals_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const logoDataUrl = await getLogoDataUrl();

    applyPDFHeader(doc, {
      title: 'Site Advances & Disbursal Queue Statement',
      metaInfo: `Generated: ${new Date().toLocaleString()} | Total Records: ${filteredAdvances.length}`,
      logoDataUrl
    });

    const headers = [['Request ID', 'Date', 'Supervisor', 'Project', 'Amount', 'Purpose', 'Status']];
    const data = filteredAdvances.map(a => [
      a.id,
      a.requestDate || a.date || '-',
      a.supervisor,
      a.projectName,
      formatPDFINR(a.approvedAmount),
      a.purpose,
      a.status === 'Disbursed' ? 'Disbursed' : 'Pending Payout'
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
    doc.save(`ASEMS_Advance_Disbursals_${new Date().toISOString().split('T')[0]}.pdf`);
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
              Site Advances & Disbursal Queue Statement
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '8pt', color: '#64748b' }}>
            <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
            <div>Total Records: {filteredAdvances.length}</div>
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
            placeholder="Search supervisor, project, or purpose..."
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

      {/* Advances Grid / Table */}
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
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Req ID & Date</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Project & Indenter</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Payee / Beneficiary Account</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Procurement Purpose</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Sanctioned Amount</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Ops Verification</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: '700' }}>Disbursal Status</th>
                <th className="no-print" style={{ padding: '0.9rem 1rem', fontWeight: '700', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdvances.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No site procurement or advance requests found.
                  </td>
                </tr>
              ) : (
                filteredAdvances.map((adv) => {
                  const isPending = adv.status === 'Approved by Ops' || adv.status === 'Pending Accounts Payment';

                  return (
                    <tr 
                      key={adv.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: isPending ? 'rgba(139, 92, 246, 0.03)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: '600' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{adv.id}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{adv.requestDate || adv.date || 'N/A'}</div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{adv.projectName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                          <User size={12} /> {adv.supervisor}
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                          {adv.bankDetails?.bankName ? `${adv.bankDetails.bankName}` : (adv.paymentDetails?.paidTo || adv.supervisor)}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {adv.bankDetails?.accountNo ? `A/c: ${adv.bankDetails.accountNo}` : (adv.supervisorMobile || adv.phone || '-')}
                        </div>
                      </td>

                      <td style={{ padding: '1rem', maxWidth: '240px' }}>
                        <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem', lineHeight: '1.3' }}>
                          {adv.purpose || 'Site mobilization advance'}
                        </div>
                      </td>

                      <td style={{ padding: '1rem', fontWeight: '800', color: '#8b5cf6', fontSize: '0.95rem', fontFamily: 'monospace' }}>
                        {formatINR(adv.approvedAmount)}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#10b981'
                        }}>
                          <ShieldCheck size={13} />
                          Approved
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        {isPending ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(139, 92, 246, 0.15)',
                            color: '#8b5cf6'
                          }}>
                            <Clock size={12} /> Ready for Disbursal
                          </span>
                        ) : (
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
                            <CheckCircle2 size={12} /> Disbursed ({adv.paymentDetails?.paymentMode})
                          </span>
                        )}
                      </td>

                      <td className="no-print" style={{ padding: '1rem', textAlign: 'right' }}>
                        {isPending && (
                          <button
                            onClick={() => onDisburseAdvance && onDisburseAdvance(adv)}
                            style={{
                              padding: '0.5rem 0.95rem',
                              borderRadius: '8px',
                              backgroundColor: '#8b5cf6',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Send size={14} />
                            Disburse
                          </button>
                        )}
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

export default AdvanceDisbursalTab;
