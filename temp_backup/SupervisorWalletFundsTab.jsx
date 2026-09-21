import React, { useState, useMemo } from 'react';
import {
  Search, Clock, CheckCircle2, X, MapPin,
  Download, FileSpreadsheet, Printer, ShieldCheck, IndianRupee
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfHeaderWithLogo, addPdfFooterWithLogo, getCompanyLogoBase64, escapeHtml } from '../../../Operations/utils/pdfHeaderHelper';

const SupervisorWalletFundsTab = ({
  projects = [],
  expenses = [],
  advances = [],
  onNavigateTab,
  onDisburseAdvance,
  onRejectAdvance,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // ── Map all relevant advances into rows ───────────────────────────────────
  const allRows = useMemo(() => {
    const pending = advances
      .filter(a => a.status === 'Pending Accounts Payment')
      .map(a => ({
        id: a.id,
        displayId: a.id ? `REQ-${a.id.slice(0, 6).toUpperCase()}` : '—',
        supervisor: a.supervisor || '—',
        supervisorId: a.supervisorId,
        site: a.siteName || a.projectName || '—',
        purpose: a.purpose || '—',
        urgency: a.urgency || 'Regular',
        date: a.date
          ? new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—',
        disbursedAt: null,
        amount: a.requestedAmount || a.approvedAmount || a.amount || 0,
        rowType: 'pending',
        sortKey: new Date(a.date || 0).getTime(),
      }));

    const disbursed = advances
      .filter(a => a.status === 'Disbursed')
      .map(a => ({
        id: a.id,
        displayId: a.id ? `REQ-${a.id.slice(0, 6).toUpperCase()}` : '—',
        supervisor: a.supervisor || '—',
        supervisorId: a.supervisorId,
        site: a.siteName || a.projectName || '—',
        purpose: a.purpose || '—',
        urgency: a.urgency || 'Regular',
        date: a.date
          ? new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—',
        disbursedAt: a.disbursedAt
          ? new Date(a.disbursedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : (a.updatedAt ? new Date(a.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'),
        amount: a.requestedAmount || a.approvedAmount || a.amount || 0,
        rowType: 'disbursed',
        sortKey: new Date(a.disbursedAt || a.updatedAt || 0).getTime(),
      }))
      .sort((a, b) => b.sortKey - a.sortKey);

    return [...pending, ...disbursed];
  }, [advances]);

  // ── Wallet balance per supervisor ─────────────────────────────────────────
  const supervisorWallets = useMemo(() => {
    const wallets = {};
    advances.forEach(a => {
      if (a.status === 'Disbursed') {
        const sId = a.supervisorId || a.supervisor;
        if (sId) {
          if (!wallets[sId]) wallets[sId] = { advance: 0, spent: 0 };
          wallets[sId].advance += (a.requestedAmount || a.approvedAmount || a.amount || 0);
        }
      }
    });
    expenses.forEach(e => {
      if (e.status === 'Accounts Verified & Paid') {
        const sId = e.supervisorId || e.supervisor;
        if (sId) {
          if (!wallets[sId]) wallets[sId] = { advance: 0, spent: 0 };
          wallets[sId].spent += (e.amount || 0);
        }
      }
    });
    return wallets;
  }, [advances, expenses]);

  // ── Search + pagination ───────────────────────────────────────────────────
  const filtered = allRows.filter(req => {
    const q = (searchQuery || '').toLowerCase();
    return !q ||
      req.id.toLowerCase().includes(q) ||
      (req.supervisor && req.supervisor.toLowerCase().includes(q)) ||
      req.site.toLowerCase().includes(q) ||
      req.purpose.toLowerCase().includes(q) ||
      req.amount.toString().includes(q) ||
      req.urgency.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const pendingCount = allRows.filter(r => r.rowType === 'pending').length;
  const disbursedCount = allRows.filter(r => r.rowType === 'disbursed').length;
  const pendingTotal = allRows.filter(r => r.rowType === 'pending').reduce((s, r) => s + r.amount, 0);

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    try {
      const rows = [
        ['SR', 'REQ ID', 'SUPERVISOR', 'SITE', 'PURPOSE', 'URGENCY', 'REQUESTED ON', 'DISBURSED ON', 'AMOUNT (INR)', 'STATUS'],
        ...filtered.map((req, idx) => [
          idx + 1,
          `"${req.displayId}"`,
          `"${req.supervisor}"`,
          `"${req.site}"`,
          `"${req.purpose}"`,
          `"${req.urgency}"`,
          `"${req.date}"`,
          `"${req.disbursedAt || '—'}"`,
          req.amount,
          `"${req.rowType === 'pending' ? 'Ops Approved - Pending Disbursal' : 'Disbursed'}"`,
        ])
      ];
      const csv = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(r => r.join(',')).join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csv));
      link.setAttribute('download', `ASEMS_Fund_Requests_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      toast.success('Excel downloaded!');
    } catch (err) { toast.error('Export failed'); }
  };

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      const startY = await addPdfHeaderWithLogo(doc, 'Advance Fund Requests', `Generated: ${new Date().toLocaleString()}`);
      autoTable(doc, {
        startY: startY + 2,
        head: [['REQ ID', 'SUPERVISOR', 'SITE', 'PURPOSE', 'URGENCY', 'DATE', 'DISBURSED ON', 'AMOUNT', 'STATUS']],
        body: filtered.map(r => [
          r.displayId, r.supervisor, r.site, r.purpose, r.urgency, r.date,
          r.disbursedAt || '—',
          `Rs. ${(r.amount || 0).toLocaleString('en-IN')}`,
          r.rowType === 'pending' ? 'Pending Disbursal' : 'Disbursed'
        ]),
        theme: 'grid',
        styles: { fontSize: 7.5 },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
        bodyStyles: (row) => row.rowType === 'disbursed' ? { fillColor: [240, 253, 244] } : {},
      });
      await addPdfFooterWithLogo(doc);
      doc.save(`ASEMS_Fund_Requests_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF downloaded!');
    } catch (err) { toast.error('PDF failed: ' + err.message); }
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = async () => {
    try {
      const logoBase64 = await getCompanyLogoBase64();
      const logoSrc = logoBase64 || `${window.location.origin}/logo_new.png`;
      const rows = filtered.map(r => {
        const isPending = r.rowType === 'pending';
        return `<tr style="background:${isPending ? '#fff' : '#f0fdf4'}">
          <td style="font-weight:800;color:#059669;">${escapeHtml(r.displayId)}</td>
          <td><strong>${escapeHtml(r.supervisor)}</strong></td>
          <td>${escapeHtml(r.site)}</td>
          <td>${escapeHtml(r.purpose)}</td>
          <td>${escapeHtml(r.urgency)}</td>
          <td>${r.date}</td>
          <td>${r.date}</td>
          <td style="text-align:right;font-weight:800;">&#8377;${(r.amount || 0).toLocaleString('en-IN')}</td>
          <td style="text-align:center;">
            <span style="padding:2px 8px;border-radius:9999px;font-weight:800;font-size:9px;
              background:${isPending ? '#fef9c3' : '#dcfce7'};color:${isPending ? '#a16207' : '#15803d'};">
              ${isPending ? 'Pending Disbursal' : 'Disbursed'}
            </span>
          </td>
        </tr>`;
      }).join('');
      const html = `<!DOCTYPE html><html><head><title>Fund Requests</title>
        <style>@page{size:A4 landscape;margin:12mm}body{font-family:sans-serif;font-size:10px;color:#0f172a}
        table{width:100%;border-collapse:collapse}th{background:#f1f5f9;padding:6px 8px;border:1px solid #cbd5e1;font-size:9px;text-transform:uppercase}
        td{padding:6px 8px;border:1px solid #e2e8f0;vertical-align:middle}
        .hdr{display:flex;justify-content:space-between;border-bottom:2px solid #059669;padding-bottom:10px;margin-bottom:14px;align-items:center}</style>
        </head><body>
        <div class="hdr">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${logoSrc}" style="height:40px;max-width:160px;object-fit:contain;"/>
            <div><div style="font-size:15px;font-weight:800;">Advance Fund Requests</div>
            <div style="font-size:9px;color:#64748b;">Generated: ${new Date().toLocaleString()}</div></div>
          </div>
          <div style="font-size:10px;text-align:right;">
            <strong>Pending:</strong> ${pendingCount} (&#8377;${pendingTotal.toLocaleString('en-IN')})<br/>
            <strong>Disbursed:</strong> ${disbursedCount}
          </div>
        </div>
        <table><thead><tr><th>REQ ID</th><th>SUPERVISOR</th><th>SITE</th><th>PURPOSE</th><th>URGENCY</th><th>REQUESTED ON</th><th style="text-align:right;">AMOUNT</th><th>STATUS</th></tr></thead>
        <tbody>${rows}</tbody></table></body></html>`;
      const w = window.open('', '_blank', 'width=1100,height=750');
      if (!w) { toast.error('Popup blocked!'); return; }
      w.document.open(); w.document.write(html); w.document.close();
      const doPrint = () => { try { w.focus(); w.print(); } catch (e) { console.error(e); } };
      w.onload = doPrint; setTimeout(doPrint, 400);
    } catch (err) { toast.error('Print failed: ' + err.message); }
  };

  const urgencyColors = (urgency) => {
    const t = (urgency || '').toLowerCase();
    const isHigh = t.includes('immediate');
    const isMed = t.includes('24');
    return { isHigh, isMed };
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Top bar: Stats Cards */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {/* Pending Card */}
        <div style={{
          flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: '1.25rem',
          padding: '1.25rem 1.5rem', borderRadius: '16px',
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
            backgroundColor: '#eab308'
          }} />
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            backgroundColor: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(234,179,8,0.2)'
          }}>
            <Clock size={24} color="#a16207" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending Disbursal
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary, #0f172a)', lineHeight: '1' }}>
                {pendingCount}
              </span>
              <span style={{ fontSize: '1rem', color: '#a16207', fontWeight: '800' }}>
                (₹{pendingTotal.toLocaleString('en-IN')})
              </span>
            </div>
          </div>
        </div>

        {/* Disbursed Card */}
        <div style={{
          flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: '1.25rem',
          padding: '1.25rem 1.5rem', borderRadius: '16px',
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
            backgroundColor: '#10b981'
          }} />
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(16,185,129,0.2)'
          }}>
            <CheckCircle2 size={24} color="#15803d" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Disbursed
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary, #0f172a)', lineHeight: '1' }}>
                {disbursedCount}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: '700' }}>
                records
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar: Search + export buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex', alignItems: 'center' }}>
            <Search size={17} />
          </div>
          <input
            type="text"
            placeholder="Search supervisor, site, purpose, amount..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem',
              paddingTop: '0.65rem', paddingBottom: '0.65rem',
              borderRadius: '12px', backgroundColor: 'var(--input-bg,#ffffff)',
              border: '1.5px solid var(--border-color,#cbd5e1)',
              color: 'var(--text-primary,#0f172a)', fontSize: '0.9rem',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button onClick={handleDownloadPDF} style={btnStyle('#4f46e5', '#eef2ff', '#c7d2fe')}>
            <Download size={15} style={{ color: '#4f46e5' }} /> PDF
          </button>
          
          
        </div>
      </div>


      {/* Combined Table */}
      <div style={{
        backgroundColor: 'var(--card-bg,#ffffff)', borderRadius: '16px',
        border: '1px solid var(--border-color,#e8ecf2)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden', width: '100%'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--table-header-bg,#fafbfc)',
                borderBottom: '2px solid var(--border-color,#e8ecf2)',
                color: 'var(--text-secondary,#475569)',
                fontSize: '0.74rem', fontWeight: '800',
                textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>
                <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>REQUISITION ID</th>
                <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>SUPERVISOR</th>
                <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>SITE LOCATION</th>
                <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>PURPOSE / REASON</th>
                <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>URGENCY</th>
                <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>REQUESTED ON</th>

                <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>WALLET (&#8377;)</th>
                <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap', textAlign: 'right' }}>AMOUNT (&#8377;)</th>
                <th style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap', textAlign: 'center' }}>STATUS / ACTION</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                      <CheckCircle2 size={40} style={{ color: '#10b981', opacity: 0.5 }} />
                      <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary,#334155)' }}>
                        No records found
                      </span>
                      <span style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                        {searchQuery ? `No results for "${searchQuery}"` : 'Advance requests will appear here once Operations approves them.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((req, idx, arr) => {
                  const isPending = req.rowType === 'pending';
                  const { isHigh, isMed } = urgencyColors(req.urgency);
                  const lookupKey = req.supervisorId || req.supervisor;
                  const wallet = lookupKey ? supervisorWallets[lookupKey] : null;
                  const walletBalance = wallet ? wallet.advance - wallet.spent : 0;

                  // separator line between pending and disbursed sections
                  const prevRow = idx > 0 ? paginated[idx - 1] : null;
                  const showSeparator = prevRow && prevRow.rowType === 'pending' && req.rowType === 'disbursed';

                  return (
                    <React.Fragment key={req.id}>
                      {showSeparator && (
                        <tr>
                          <td colSpan={9} style={{ padding: '0', height: '0' }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: '0.6rem',
                              padding: '0.6rem 0.75rem',
                              backgroundColor: '#f0fdf4',
                              borderTop: '2px solid #86efac',
                              borderBottom: '1px solid #bbf7d0'
                            }}>
                              <CheckCircle2 size={14} color="#15803d" />
                              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Disbursed History
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                      <tr
                        style={{
                          borderBottom: idx === arr.length - 1 ? 'none' : `1px solid ${isPending ? 'var(--border-color,#f1f5f9)' : '#f0fdf4'}`,
                          backgroundColor: isPending ? 'transparent' : 'rgba(240,253,244,0.35)',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = isPending ? 'var(--table-hover,rgba(241,245,249,0.5))' : 'rgba(220,252,231,0.5)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = isPending ? 'transparent' : 'rgba(240,253,244,0.35)'}
                      >
                        {/* REQ ID */}
                        <td style={{ padding: '0.75rem 0.75rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: '#059669', fontSize: '0.9rem', fontWeight: '800' }}>{req.displayId}</strong>
                        </td>

                        {/* SUPERVISOR */}
                        <td style={{ padding: '0.75rem 0.75rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: isPending ? '#eff6ff' : '#dcfce7', color: isPending ? '#2563eb' : '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.82rem', border: `1px solid ${isPending ? '#bfdbfe' : '#86efac'}`, flexShrink: 0 }}>
                              {(req.supervisor || 'S').charAt(0)}
                            </div>
                            <strong style={{ color: 'var(--text-primary,#0f172a)', fontSize: '0.9rem' }}>{req.supervisor}</strong>
                          </div>
                        </td>

                        {/* SITE */}
                        <td style={{ padding: '0.75rem 0.75rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <MapPin size={14} style={{ color: isPending ? '#2563eb' : '#059669', flexShrink: 0 }} />
                            <strong style={{ color: 'var(--text-primary,#0f172a)', fontSize: '0.9rem' }}>{req.site}</strong>
                          </div>
                        </td>

                        {/* PURPOSE */}
                        <td style={{ padding: '0.75rem 0.75rem', verticalAlign: 'middle' }}>
                          <span style={{ color: 'var(--text-secondary,#334155)', fontSize: '0.88rem' }}>{req.purpose}</span>
                        </td>

                        {/* URGENCY */}
                        <td style={{ padding: '0.75rem 0.75rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: isHigh ? 'var(--badge-danger-bg)' : isMed ? 'var(--badge-warning-bg)' : 'var(--badge-info-bg)', padding: '0.3rem 0.6rem', borderRadius: '10px', border: `1px solid ${isHigh ? 'var(--badge-danger-border)' : isMed ? 'var(--badge-warning-border)' : 'var(--badge-info-border)'}` }}>
                            <Clock size={12} style={{ color: isHigh ? 'var(--badge-danger-text)' : isMed ? 'var(--badge-warning-text)' : 'var(--badge-info-text)' }} />
                            <span style={{ fontSize: '0.76rem', fontWeight: '800', color: isHigh ? 'var(--badge-danger-text)' : isMed ? 'var(--badge-warning-text)' : 'var(--badge-info-text)' }}>{req.urgency}</span>
                          </div>
                        </td>

                        {/* REQUESTED ON */}
                        <td style={{ padding: '0.75rem 0.75rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{ color: 'var(--text-secondary,#475569)', fontSize: '0.87rem', fontWeight: '600' }}>{req.date}</span>
                        </td>


                        {/* WALLET */}
                        <td style={{ padding: '0.75rem 0.75rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: walletBalance < 0 ? 'var(--badge-danger-text)' : '#0ea5e9' }}>
                            &#8377;{(Number(walletBalance) || 0).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* AMOUNT */}
                        <td style={{ padding: '0.75rem 0.75rem', verticalAlign: 'middle', whiteSpace: 'nowrap', textAlign: 'right' }}>
                          <span style={{ fontSize: '1rem', fontWeight: '900', color: isPending ? 'var(--text-primary,#0f172a)' : '#059669' }}>
                            &#8377;{(Number(req.amount) || 0).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* STATUS / ACTION */}
                        <td style={{ padding: '0.75rem 0.75rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {isPending ? (
                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.22rem 0.55rem', borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '0.7rem', fontWeight: '800' }}>
                                <ShieldCheck size={10} strokeWidth={2.5} /> Ops Approved
                              </span>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                <button
                                  onClick={() => onDisburseAdvance && onDisburseAdvance(req)}
                                  style={{ padding: '0.38rem 0.7rem', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.28rem', fontSize: '0.78rem', fontWeight: '800', boxShadow: '0 2px 6px rgba(5,150,105,0.3)', transition: 'all 0.15s ease' }}
                                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#047857'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#059669'; e.currentTarget.style.transform = 'none'; }}
                                  title={`Disburse to ${req.supervisor}`}
                                >
                                  <IndianRupee size={12} strokeWidth={2.5} /> Disburse
                                </button>
                                <button
                                  onClick={() => onRejectAdvance && onRejectAdvance(req)}
                                  style={{ padding: '0.38rem', borderRadius: '8px', border: '1px solid #fecdd3', backgroundColor: '#fff1f2', color: '#e11d48', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}
                                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ffe4e6'}
                                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff1f2'}
                                  title="Reject"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontSize: '0.75rem', fontWeight: '800' }}>
                              <CheckCircle2 size={12} strokeWidth={2.5} /> Disbursed
                            </span>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
            style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', border: '1.5px solid var(--border-color,#cbd5e1)', backgroundColor: 'var(--card-bg,#fff)', color: 'var(--text-primary)', fontWeight: '700', cursor: safePage === 1 ? 'not-allowed' : 'pointer', opacity: safePage === 1 ? 0.4 : 1 }}>
            &larr; Prev
          </button>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Page {safePage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', border: '1.5px solid var(--border-color,#cbd5e1)', backgroundColor: 'var(--card-bg,#fff)', color: 'var(--text-primary)', fontWeight: '700', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', opacity: safePage === totalPages ? 0.4 : 1 }}>
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

const btnStyle = (color, bg, border) => ({
  padding: '0.45rem 1rem', borderRadius: '10px',
  border: `1.5px solid ${border}`, backgroundColor: bg, color,
  fontSize: '0.88rem', fontWeight: '800', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
});

export default SupervisorWalletFundsTab;
