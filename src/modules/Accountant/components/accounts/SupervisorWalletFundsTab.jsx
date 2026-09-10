import React, { useState } from 'react';
import { 
  Wallet, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Phone, 
  ShieldCheck,
  Printer, 
  FileSpreadsheet, 
  Download, 
  User,
  AlertCircle,
  Building2,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  X,
  CreditCard,
  Eye,
  FileText,
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyPDFHeader, applyPDFFooter, getLogoDataUrl } from '../../utils/exportUtils';
import PrintFooter from '../PrintFooter';

const SupervisorWalletFundsTab = ({
  projects = [],
  expenses = [],
  advances = [],
  onNavigateTab,
  onQuickApprove,
  onRejectExpense,
  onDisburseAdvance,
  onTopUpWallet
}) => {
  const [searchQuery, setSearchQuery] = useState('');

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

  // Group and map supervisor wallet data
  const supervisorMap = {};
  projects.forEach(p => {
    const sName = p.supervisor || 'Unassigned';
    if (!supervisorMap[sName]) {
      supervisorMap[sName] = {
        supervisor: sName,
        mobile: p.supervisorMobile || '+91 98221 00000',
        projectName: '',
        siteName: '',
        toilets: 0,
        totalLoaded: 0,
        totalSpent: 0,
        currentBalance: 0,
      };
    }
    const w = supervisorMap[sName];
    w.projectName += (w.projectName ? ', ' : '') + p.name;
    w.siteName += (w.siteName ? ', ' : '') + (p.site || '');
    w.toilets += (p.toilets || 0);
    w.totalLoaded += (p.fundsReleased || 0);
    w.totalSpent += (p.expenses || 0);
    w.currentBalance += (p.balance !== undefined ? p.balance : ((p.fundsReleased || 0) - (p.expenses || 0)));
  });

  const supervisorWallets = Object.values(supervisorMap).map(w => {
    const supervisorExpenses = expenses.filter(e => e.supervisor === w.supervisor);
    const supervisorAdvances = advances.filter(a => a.supervisor === w.supervisor && a.status !== 'Pending Operations Approval');
    
    const pendingExpense = supervisorExpenses.find(e => e.status === 'Pending Operations Approval' || e.status === 'Pending Accounts Verification');
    const pendingAdvance = supervisorAdvances.find(a => a.status === 'Pending Accounts Payment');
    const pendingRequest = pendingAdvance || pendingExpense;
    const rejectedExpense = supervisorExpenses.find(e => e.status === 'Sent for Correction' || e.status === 'Rejected');
    const verifiedExpense = supervisorExpenses.find(e => e.status === 'Accounts Verified & Paid');

    let status = 'HEALTHY';
    if (pendingExpense) {
      status = 'REQUEST_PENDING';
    } else if (rejectedExpense) {
      status = 'REJECTED';
    } else if (w.currentBalance < 40000) {
      status = 'LOW_FLOAT';
    } else {
      status = 'HEALTHY';
    }

    return {
      ...w,
      status,
      pendingRequest: pendingRequest,
      rejectedRequest: rejectedExpense,
      verifiedRequest: verifiedExpense,
      siteExpenses: supervisorExpenses,
      siteAdvances: supervisorAdvances
    };
  });

  const filteredWallets = supervisorWallets.filter(w => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (w.supervisor || '').toLowerCase().includes(q) ||
      (w.mobile || '').toLowerCase().includes(q) ||
      (w.projectName || '').toLowerCase().includes(q) ||
      (w.siteName || '').toLowerCase().includes(q)
    );
  });

  // KPI Calculations
  const totalWalletFloat = supervisorWallets.reduce((acc, w) => acc + w.currentBalance, 0);
  const totalFundsLoaded = supervisorWallets.reduce((acc, w) => acc + w.totalLoaded, 0);
  const totalSpentAcrossSites = supervisorWallets.reduce((acc, w) => acc + w.totalSpent, 0);
  const totalPendingRequestsCount = supervisorWallets.filter(w => w.pendingRequest).length;
  const totalPendingRequestsAmount = supervisorWallets
    .filter(w => w.pendingRequest)
    .reduce((acc, w) => acc + (w.pendingRequest.amount || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Supervisor Name', 'Contact Mobile', 'Assigned Site / Project', 'Total Funds Released (INR)', 'Total Spent (INR)', 'Current Live Wallet Balance (INR)', 'Pending Bill Claim (INR)', 'Status'];
    const rows = filteredWallets.map(w => [
      w.supervisor,
      w.mobile,
      `${w.projectName} (${w.siteName})`,
      w.totalLoaded,
      w.totalSpent,
      w.currentBalance,
      w.pendingRequest ? w.pendingRequest.amount : 0,
      w.status === 'REQUEST_PENDING' ? 'Bill Claim Pending' : (w.status === 'LOW_FLOAT' ? 'Low Wallet Float' : 'Send to Vendor')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASEMS_Supervisor_Wallets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const logoDataUrl = await getLogoDataUrl();

    applyPDFHeader(doc, {
      title: 'Site Supervisor Wallet Funds & Float Ledger',
      subtitle: 'Live Site Balance, Disbursal Records & Top-Up Approvals Statement',
      category: 'AUDIT & DISBURSAL REPORT',
      docRef: `WALLET-AUDIT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
      logoDataUrl
    });

    const tableColumns = ['Supervisor', 'Site / Project', 'Total Released', 'Total Spent', 'Wallet Balance', 'Req. Pending'];
    const tableRows = filteredWallets.map(w => [
      `${w.supervisor}\n${w.mobile}`,
      `${w.projectName}\n${w.siteName}`,
      formatPDFINR(w.totalLoaded),
      formatPDFINR(w.totalSpent),
      formatPDFINR(w.currentBalance),
      w.pendingRequest ? formatPDFINR(w.pendingRequest.approvedAmount || w.pendingRequest.requestedAmount) : 'Nil'
    ]);

    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 56,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    });

    applyPDFFooter(doc, {
      preparedBy: 'Accounts Department',
      verifiedBy: 'Dinesh Sir (Operations Head)'
    });

    doc.save(`ASEMS_Supervisor_Wallets_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportSingleSupervisorPDF = async (w) => {
    const doc = new jsPDF();
    const logoDataUrl = await getLogoDataUrl();

    applyPDFHeader(doc, {
      title: `Site Wallet Statement - ${w.supervisor}`,
      subtitle: `${w.projectName} (${w.siteName}) | Live Balance: ${formatPDFINR(w.currentBalance)}`,
      category: 'SITE FINANCIAL STATEMENT',
      docRef: `SITE-STMT-${w.project.id}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
      logoDataUrl
    });

    doc.autoTable({
      head: [['Expense ID', 'Date', 'Category', 'Vendor / Payee', 'Amount', 'Status']],
      body: (w.siteExpenses || []).map(e => [
        e.id,
        e.date || '-',
        e.category,
        e.vendor || e.payee || '-',
        formatPDFINR(e.amount),
        e.status
      ]),
      startY: 56,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8.5 }
    });

    applyPDFFooter(doc, {
      preparedBy: 'Accounts Dept',
      verifiedBy: 'Dinesh Sir'
    });

    doc.save(`Site_Statement_${w.supervisor.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
      
      {/* Top Right Actions Row (Print, Excel, PDF) */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '0.75rem',
        marginTop: '-0.5rem'
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

        {/* PDF Statement Button */}
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

      {/* Standalone Search Bar on top of table (No extra wrapper card, no filter pills) */}
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
            placeholder="Search supervisor name, site location, mobile..."
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

      {/* 3. SUPERVISORS WALLET FUNDS MAIN DATA TABLE */}
      <div style={{
        backgroundColor: 'var(--surface-bg)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--table-header-bg, rgba(241,245,249,0.7))',
                borderBottom: '1px solid var(--border-color)',
                fontSize: '0.78rem',
                fontWeight: '800',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                 <th style={{ padding: '1rem 1.25rem' }}>ID</th>
                 <th style={{ padding: '1rem 1.25rem' }}>Site Supervisor</th>
                 <th style={{ padding: '1rem 1.25rem' }}>Assigned Project & Site</th>
                 <th style={{ padding: '1rem 1.25rem' }}>Total Advanced</th>
                 <th style={{ padding: '1rem 1.25rem' }}>Total Spent</th>
                 <th style={{ padding: '1rem 1.25rem', color: '#059669' }}>Live Wallet Balance</th>
                 <th style={{ padding: '1rem 1.25rem' }}>Ops Verification</th>
                 <th style={{ padding: '1rem 1.25rem' }}>Pending Fund Request</th>
                 <th className="no-print" style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWallets.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Wallet size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>No supervisor wallets found</div>
                    <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>No records match your current search query "{searchQuery}".</div>
                  </td>
                </tr>
              ) : (
                filteredWallets.map((w, idx) => {
                  const hasPending = Boolean(w.pendingRequest);
                  const isRejected = Boolean(w.rejectedRequest) && !hasPending;
                  const req = w.pendingRequest;
                  const spentPercent = w.totalLoaded > 0 ? Math.min(100, Math.round((w.totalSpent / w.totalLoaded) * 100)) : 0;
                  const isLow = w.currentBalance < 40000;

                  return (
                    <tr 
                      key={w.supervisor}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: hasPending ? 'rgba(234, 88, 12, 0.025)' : (idx % 2 === 1 ? 'rgba(0,0,0,0.015)' : 'transparent'),
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* 0. ID Column */}
                      <td style={{ padding: '1.15rem 1.25rem' }}>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', fontWeight: '700', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req ? req.id.slice(0, 8).toUpperCase() : '—'}
                        </div>
                      </td>

                      {/* 1. Supervisor Profile */}
                      <td style={{ padding: '1.15rem 1.25rem' }}>
                        <div>
                          <div style={{ fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                            {w.supervisor}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            <Phone size={12} /> {w.mobile}
                          </div>
                        </div>
                      </td>

                       {/* 2. Assigned Project & Site */}
                       <td style={{ padding: '1.15rem 1.25rem' }}>
                         <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                           {w.projectName}
                         </div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                           {w.siteName}
                         </div>
                       </td>

                       {/* NEW: Total Advanced Column */}
                       <td style={{ padding: '1.15rem 1.25rem' }}>
                         <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                           {formatINR(w.totalLoaded)}
                         </div>
                       </td>

                       {/* NEW: Total Spent Column */}
                       <td style={{ padding: '1.15rem 1.25rem' }}>
                         <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#ef4444' }}>
                           {formatINR(w.totalSpent)}
                         </div>
                       </td>

                       {/* NEW: Live Wallet Balance Column */}
                       <td style={{ padding: '1.15rem 1.25rem' }}>
                         <div style={{ fontWeight: '800', fontSize: '0.92rem', color: w.currentBalance < 40000 ? '#ef4444' : '#059669' }}>
                           {formatINR(w.currentBalance)}
                         </div>
                         {w.currentBalance < 40000 && (
                           <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600', marginTop: '0.15rem' }}>Low Float</div>
                         )}
                       </td>

                       {/* 5. Ops Verification Column */}
                       <td style={{ padding: '1.15rem 1.25rem' }}>
                         {req ? (
                           <span style={{
                             display: 'inline-flex',
                             alignItems: 'center',
                             gap: '0.35rem',
                             fontSize: '0.78rem',
                             fontWeight: '800',
                             padding: '0.35rem 0.75rem',
                             borderRadius: '20px',
                             backgroundColor: req.opsVerificationStatus === 'Verified' ? 'rgba(16, 185, 129, 0.12)' : (req.opsVerificationStatus === 'Rejected' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)'),
                             color: req.opsVerificationStatus === 'Verified' ? '#10b981' : (req.opsVerificationStatus === 'Rejected' ? '#dc2626' : '#d97706')
                           }}>
                             {req.opsVerificationStatus === 'Verified' ? <CheckCircle2 size={13} strokeWidth={2.5} /> : (req.opsVerificationStatus === 'Rejected' ? <XCircle size={13} strokeWidth={2.5} /> : <Clock size={13} strokeWidth={2.5} />)}
                             {req.opsVerificationStatus === 'Verified' ? 'Verified' : (req.opsVerificationStatus === 'Rejected' ? 'Rejected' : 'Pending')}
                           </span>
                         ) : (
                           <span style={{ color: 'var(--text-secondary)' }}>—</span>
                         )}
                       </td>

                       {/* 6. Pending Fund Request Column */}
                       <td style={{ padding: '1.15rem 1.25rem' }}>
                         {hasPending ? (
                           <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ea580c' }}>
                             {formatINR(req.amount || req.approvedAmount || req.requestedAmount)}
                           </div>
                         ) : (
                           <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                             —
                           </span>
                         )}
                       </td>

                      {/* 7. Action Column (Approve/Reject when pending and ops verified) */}
                      <td className="no-print" style={{ padding: '1.15rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {hasPending ? (
                          req.opsVerificationStatus === 'Verified' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => req.purpose ? (onDisburseAdvance && onDisburseAdvance(req)) : (onQuickApprove && onQuickApprove(req))}
                                style={{
                                  padding: '0.45rem 0.85rem',
                                  borderRadius: '8px',
                                  backgroundColor: '#10b981',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '0.78rem',
                                  fontWeight: '700',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                                  transition: 'transform 0.1s ease'
                                }}
                                title={`Approve Claim ₹${((req.amount || req.approvedAmount) || 0).toLocaleString()} for ${w.supervisor}`}
                              >
                                <Check size={14} strokeWidth={2.5} />
                                Approve
                              </button>

                              <button
                                onClick={() => req.purpose ? null : (onRejectExpense && onRejectExpense(req))}
                                style={{
                                  padding: '0.45rem 0.85rem',
                                  borderRadius: '8px',
                                  backgroundColor: '#ef4444',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '0.78rem',
                                  fontWeight: '700',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  cursor: req.purpose ? 'not-allowed' : 'pointer',
                                  opacity: req.purpose ? 0.5 : 1,
                                  boxShadow: req.purpose ? 'none' : '0 2px 6px rgba(239, 68, 68, 0.25)',
                                  transition: 'transform 0.1s ease'
                                }}
                                disabled={!!req.purpose}
                                title={`Reject for ${w.supervisor}`}
                              >
                                <X size={14} strokeWidth={2.5} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                Awaiting Ops Verification
                              </span>
                            </div>
                          )
                        ) : isRejected ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.78rem',
                              fontWeight: '800',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '20px',
                              backgroundColor: 'rgba(239, 68, 68, 0.12)',
                              color: '#dc2626'
                            }}>
                              <XCircle size={13} strokeWidth={2.5} /> Rejected
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.78rem',
                              fontWeight: '800',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '20px',
                              backgroundColor: 'rgba(16, 185, 129, 0.12)',
                              color: '#10b981'
                            }}>
                              <CheckCircle2 size={13} strokeWidth={2.5} /> Send to Vendor
                            </span>
                          </div>
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

      {/* Print Footer for official printing */}
      <PrintFooter />
    </div>
  );
};

export default SupervisorWalletFundsTab;
