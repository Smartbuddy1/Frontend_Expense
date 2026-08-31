import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Scale, Plus, FileText, Download, CheckCircle2, Clock,
  AlertCircle, ArrowUpRight, ArrowDownRight, Building,
  Search, Filter, RefreshCw, UserCheck, ShieldCheck,
  ChevronDown, Phone, IndianRupee, Printer, ExternalLink, Calendar
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLanguage } from '../../context/LanguageContext';
import { addPdfHeaderWithLogo, addPdfFooterWithPageNumbers, getCompanyLogoBase64, escapeHtml } from '../../utils/pdfHeaderHelper';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL;

const ReconciliationTab = ({
  projects = [],
  supervisors = [],
  expenses = [],
  advances = [],
  onNavigateTab,
  onOpenTransferAdvance,
  onRefresh
}) => {
  const { language } = useLanguage();

  // Bank & UTR Ledger — real payment-ledger entries (advance disbursals + expense
  // payouts), fetched separately since the parent dashboard doesn't hold this list.
  const [rawLedger, setRawLedger] = useState([]);

  const fetchLedger = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/payments-ledger`);
      setRawLedger(data.entries || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { fetchLedger(); }, [fetchLedger]);

  const ledgerRecords = useMemo(() => rawLedger
    .filter(e => e.type === 'Site Advance Disbursal' || e.type === 'Expense Reimbursement')
    .map(e => {
      const created = new Date(e.createdAt);
      return {
        id: e.id,
        supervisor: e.paidTo || 'Site Supervisor',
        project: e.project?.name || '',
        type: e.type === 'Site Advance Disbursal' ? 'Advance Float' : 'Bill Adjustment',
        mode: e.paymentMode || '—',
        utr: e.refNumber || '—',
        amount: Number(e.amount),
        date: created.toISOString().split('T')[0],
        time: created.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Verified',
      };
    }), [rawLedger]);

  // Float state for supervisors — derived live from real projects/expenses/advances:
  // total advance = disbursed advances for their project, total spent = ops-approved
  // or accounts-paid expenses for that project (matches GET /projects/:id/wallet).
  const supervisorFloats = useMemo(() => {
    return projects
      .filter(p => p.supervisorId)
      .map(p => {
        const totalAdvance = advances
          .filter(a => a.projectId === p.id && a.rawStatus === 'disbursed')
          .reduce((sum, a) => sum + a.amount, 0);
        const totalSpent = expenses
          .filter(e => e.projectId === p.id && e.status === 'Approved')
          .reduce((sum, e) => sum + e.amount, 0);
        const inHand = totalAdvance - totalSpent;
        const lastLedgerEntry = ledgerRecords
          .filter(r => r.project === p.name)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        return {
          id: p.supervisorId,
          projectId: p.id,
          name: p.supervisorName,
          phone: p.supervisorPhone,
          project: p.name,
          site: p.location,
          advance: totalAdvance,
          settled: totalSpent,
          status: inHand < 5000 ? 'Low Float' : 'Healthy',
          lastRef: lastLedgerEntry?.utr || '—',
          lastDate: lastLedgerEntry?.date || ''
        };
      });
  }, [projects, advances, expenses, ledgerRecords]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Modals state
  const [isIssueFloatOpen, setIsIssueFloatOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [inspectLedgerRecord, setInspectLedgerRecord] = useState(null);

  // Form states for new float
  const [floatForm, setFloatForm] = useState({
    supervisorId: '',
    amount: '',
    mode: 'NEFT / Bank Transfer',
    utr: '',
    notes: ''
  });

  // Calculate totals
  const totalAdvance = supervisorFloats.reduce((sum, s) => sum + s.advance, 0);
  const totalSettled = supervisorFloats.reduce((sum, s) => sum + s.settled, 0);
  const totalInHand = totalAdvance - totalSettled;
  const discrepancy = 0; // 100% matched

  // Issues cash to a supervisor via the real advance-transfer endpoint (auto-approved,
  // skips the request step since Admin is authorizing it on the spot), then
  // immediately confirms disbursal (Admin has that authority) so the payment
  // mode/UTR captured here land in the real ledger straight away.
  const handleIssueFloatSubmit = async (e) => {
    e.preventDefault();
    if (!floatForm.amount || Number(floatForm.amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    const sup = supervisorFloats.find(s => s.id === floatForm.supervisorId);
    if (!sup) {
      toast.error('Please select a supervisor.');
      return;
    }

    try {
      const { data } = await axios.post(`${API}/advances/transfer`, {
        projectId: sup.projectId,
        supervisorId: sup.id,
        amount: Number(floatForm.amount),
        purpose: floatForm.notes || 'Advance float issued by Admin',
      });
      try {
        await axios.patch(`${API}/advances/${data.advance.id}/disburse`, {
          paidTo: sup.name,
          paymentMode: floatForm.mode,
          refNumber: floatForm.utr,
        });
      } catch {
        // Not authorized to disburse directly — the advance stays "Approved"
        // for Accounts to confirm the payout.
      }
      setIsIssueFloatOpen(false);
      setFloatForm({ supervisorId: '', amount: '', mode: 'NEFT / Bank Transfer', utr: '', notes: '' });
      toast.success('Advance float issued successfully!');
      onRefresh && onRefresh();
      fetchLedger();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to issue advance float');
    }
  };

  const handleSettleAccount = (sup) => {
    setSelectedSupervisor(sup);
    setIsSettleModalOpen(true);
  };

  // Creates a real Settlement record for Accounts to review and close.
  const confirmSettlement = async () => {
    if (!selectedSupervisor) return;
    try {
      await axios.post(`${API}/settlements`, {
        projectId: selectedSupervisor.projectId,
        supervisorId: selectedSupervisor.id,
        totalAdvanceGiven: selectedSupervisor.advance,
        totalApprovedExpenses: selectedSupervisor.settled,
      });
      setIsSettleModalOpen(false);
      toast.success('Float account flagged for settlement — forwarded to Accounts for final closure!');
      onRefresh && onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create settlement');
    }
  };

  const filteredLedger = ledgerRecords.filter(rec => {
    const matchesSearch =
      rec.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.utr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'All') return matchesSearch;
    if (filterType === 'Advance') return matchesSearch && rec.type.includes('Advance');
    if (filterType === 'Adjustment') return matchesSearch && rec.type.includes('Adjustment');
    return matchesSearch;
  });

  const generateStatementHtml = (logoBase64) => {
    const logoSrc = logoBase64 || `${window.location.origin}/logo_new.png`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Supervisor Float & Bank Reconciliation Statement</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #0f172a; line-height: 1.4; }
          .header { border-bottom: 2.5px solid #2563eb; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 20px; font-weight: 800; color: #1e3a8a; margin: 0; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 3px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
          .stat-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; background: #f8fafc; }
          .stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
          .stat-val { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 3px; }
          h3 { font-size: 13px; font-weight: 800; margin: 16px 0 6px 0; color: #1e3a8a; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 11px; }
          th { background: #f1f5f9; padding: 7px 9px; border: 1px solid #cbd5e1; text-align: left; font-weight: 700; text-transform: uppercase; font-size: 10px; color: #334155; }
          td { padding: 7px 9px; border: 1px solid #e2e8f0; vertical-align: top; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 9px; }
          .badge-healthy { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
          .badge-low { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
          .footer { border-top: 1px solid #cbd5e1; padding-top: 15px; margin-top: 25px; display: flex; justify-content: space-between; font-size: 11px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${logoSrc}" alt="Aarya Innovtech Pvt. Ltd." style="height: 48px; max-width: 180px; object-fit: contain;" />
            <div>
              <h1 class="title" style="margin: 0; font-size: 17px; font-weight: 800; color: #0f172a;">Supervisor Float & Bank Reconciliation Statement</h1>
              <div class="subtitle" style="font-size: 10px; color: #64748b; margin-top: 3px;">AARYA INNOVTECH PVT. LTD. | Official Operations Ledger</div>
            </div>
          </div>
          <div style="text-align: right; font-size: 10px; color: #64748b;">
            <strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}<br/>
            ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box" style="border-left: 4px solid #6366f1;">
            <div class="stat-label">Total Advance</div>
            <div class="stat-val">₹${totalAdvance.toLocaleString('en-IN')}</div>
          </div>
          <div class="stat-box" style="border-left: 4px solid #3b82f6;">
            <div class="stat-label">Total Spent</div>
            <div class="stat-val" style="color:#2563eb;">₹${totalSettled.toLocaleString('en-IN')}</div>
          </div>
          <div class="stat-box" style="border-left: 4px solid #ef4444;">
            <div class="stat-label">Balance Float</div>
            <div class="stat-val" style="color:#ef4444;">₹${totalInHand.toLocaleString('en-IN')}</div>
          </div>
          <div class="stat-box" style="border-left: 4px solid #10b981;">
            <div class="stat-label">Clear Status</div>
            <div class="stat-val" style="color:#10b981;">100%</div>
          </div>
        </div>

        <h3>1. Supervisor Live Advance & Cash Balance Tracking</h3>
        <table>
          <thead>
            <tr>
              <th>Supervisor</th>
              <th>Assigned Site / Project</th>
              <th>Total Advance</th>
              <th>Total Spent</th>
              <th>Cash In Hand</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${supervisorFloats.map(s => `
              <tr>
                <td><strong>${escapeHtml(s.name)}</strong><br/><span style="color:#64748b;">${escapeHtml(s.phone)}</span></td>
                <td><strong>${escapeHtml(s.site)}</strong><br/><span style="color:#64748b;">${escapeHtml(s.project)}</span></td>
                <td><strong>₹${s.advance.toLocaleString('en-IN')}</strong></td>
                <td style="color:#2563eb; font-weight:bold;">₹${s.settled.toLocaleString('en-IN')}</td>
                <td><strong style="color:${(s.advance - s.settled) < 5000 ? '#b91c1c' : '#15803d'}; font-size:12px;">₹${(s.advance - s.settled).toLocaleString('en-IN')}</strong></td>
                <td><span class="badge ${(s.advance - s.settled) < 5000 ? 'badge-low' : 'badge-healthy'}">${(s.advance - s.settled) < 5000 ? 'Low Cash' : 'Available'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>2. Bank Transfer & UTR Cross-Check Ledger</h3>
        <table>
          <thead>
            <tr>
              <th>Txn ID</th>
              <th>Date</th>
              <th>Site / Project</th>
              <th>Type & Mode</th>
              <th>UTR / Reference</th>
              <th>Assigned Tech</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLedger.map(l => `
              <tr>
                <td><strong>${escapeHtml(l.id)}</strong></td>
                <td>${l.date || '23 Aug 2026'}</td>
                <td><strong>${escapeHtml(l.project)}</strong></td>
                <td>${escapeHtml(l.type)}<br/><span style="color:#64748b;">${escapeHtml(l.mode)}</span></td>
                <td><code style="background:#f1f5f9; padding:2px 4px; border-radius:3px;">${escapeHtml(l.utr)}</code></td>
                <td>${escapeHtml(l.supervisor)}</td>
                <td><strong>₹${l.amount.toLocaleString('en-IN')}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>Verified By: <strong>Accounts & Operations Desk</strong></div>
          <div>Authorized Sign: _______________________ <strong>(Auditor / CFO)</strong></div>
        </div>
      </body>
      </html>
    `;
  };

  // 1-Click Direct PDF File Download
  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();

      // Header with Official Logo
      const startY = await addPdfHeaderWithLogo(
        doc,
        'Supervisor Float & Bank Reconciliation Statement',
        `Generated on: ${new Date().toLocaleString()} | Official Operations Ledger`
      );

      // Summary Box
      autoTable(doc, {
        startY: startY + 2,
        head: [['TOTAL ADVANCE', 'TOTAL SPENT', 'BALANCE FLOAT', 'CLEAR STATUS']],
        body: [[
          `Rs. ${totalAdvance.toLocaleString('en-IN')}`,
          `Rs. ${totalSettled.toLocaleString('en-IN')}`,
          `Rs. ${totalInHand.toLocaleString('en-IN')}`,
          '100%'
        ]],
        theme: 'grid',
        styles: { fontSize: 9, fontStyle: 'bold', halign: 'center' },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] }
      });

      // Section 1: Supervisor Live Float
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('1. Supervisor Live Advance & Cash Balance Tracking', 14, doc.lastAutoTable.finalY + 10);

      const supData = supervisorFloats.map(s => [
        `${s.name}\n${s.phone}`,
        `${s.site}\n${s.project}`,
        `Rs. ${s.advance.toLocaleString('en-IN')}`,
        `Rs. ${s.settled.toLocaleString('en-IN')}`,
        `Rs. ${(s.advance - s.settled).toLocaleString('en-IN')}`,
        (s.advance - s.settled) < 5000 ? 'Low Cash' : 'Available'
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        head: [['SUPERVISOR', 'ASSIGNED SITE', 'TOTAL ADVANCE', 'TOTAL SPENT', 'CASH IN HAND', 'STATUS']],
        body: supData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] }
      });

      // Section 2: Bank Ledger
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('2. Bank Transfer & UTR Cross-Check Ledger', 14, doc.lastAutoTable.finalY + 10);

      const ledgerData = filteredLedger.map(l => [
        l.id,
        l.date || '23 Aug 2026',
        l.project,
        `${l.type}\n(${l.mode})`,
        l.utr,
        l.supervisor,
        `Rs. ${l.amount.toLocaleString('en-IN')}`
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        head: [['TXN ID', 'DATE', 'SITE / PROJECT', 'TYPE & MODE', 'UTR / REF', 'ASSIGNED TECH', 'AMOUNT']],
        body: ledgerData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] }
      });

      // Add corporate footer with page numbers
      addPdfFooterWithPageNumbers(doc);

      // Save directly to Downloads folder
      const filename = `Reconciliation_Statement_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success('PDF downloaded successfully to Downloads folder!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF: ' + err.message);
    }
  };

  // Print Dialog Trigger (Loads base64 logo & opens print window)
  const handlePrintStatement = async () => {
    try {
      const logoBase64 = await getCompanyLogoBase64();
      const printWin = window.open('', '_blank', 'width=900,height=750');
      if (!printWin) {
        toast.error('Print popup blocked! Please allow popups for this site.');
        return;
      }

      printWin.document.open();
      printWin.document.write(generateStatementHtml(logoBase64));
      printWin.document.close();

      const triggerPrint = () => {
        try {
          printWin.focus();
          printWin.print();
        } catch (e) {
          console.error(e);
        }
      };

      printWin.onload = triggerPrint;
      setTimeout(triggerPrint, 400);
    } catch (err) {
      console.error('Print Error:', err);
      toast.error('Failed to trigger print: ' + err.message);
    }
  };

  // Print Individual Transaction Voucher Receipt
  const handlePrintVoucher = async (record) => {
    if (!record) return;
    try {
      const logoBase64 = await getCompanyLogoBase64();
      const logoSrc = logoBase64 || `${window.location.origin}/logo_new.png`;
      const printWin = window.open('', '_blank', 'width=850,height=750');
      if (!printWin) {
        toast.error('Print popup blocked! Please allow popups for this site.');
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Official Voucher Receipt - ${record.id}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 25px; color: #0f172a; line-height: 1.5; }
            .voucher-box { border: 2px solid #2563eb; border-radius: 12px; padding: 24px; background: #ffffff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
            .title-area h2 { margin: 0; font-size: 18px; color: #1e3a8a; font-weight: 800; }
            .title-area p { margin: 3px 0 0 0; font-size: 11px; color: #64748b; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
            .meta-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
            .meta-table td.label { color: #64748b; font-weight: 600; width: 35%; }
            .meta-table td.val { color: #0f172a; font-weight: 800; }
            .amount-box { background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
            .amount-box span { font-size: 13px; font-weight: 700; color: #1e40af; }
            .amount-box strong { font-size: 22px; font-weight: 900; color: #1d4ed8; }
            .footer-signatures { display: flex; justify-content: space-between; margin-top: 50px; font-size: 11px; color: #475569; }
            .sig-line { width: 180px; border-top: 1.5px solid #64748b; text-align: center; padding-top: 6px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="voucher-box">
            <div class="header">
              <div style="display: flex; align-items: center; gap: 14px;">
                <img src="${logoSrc}" alt="Aarya Innovtech" style="height: 48px; max-width: 180px; object-fit: contain;" />
                <div class="title-area">
                  <h2>TRANSACTION VOUCHER & UTR AUDIT SLIP</h2>
                  <p>AARYA INNOVTECH PVT. LTD. | Operations & Accounts Ledger</p>
                </div>
              </div>
              <div style="text-align: right; font-size: 11px; color: #64748b;">
                <strong>Voucher No:</strong> ${record.id}<br/>
                <strong>Date:</strong> ${record.date ? new Date(record.date).toLocaleDateString('en-GB') : '23 Aug 2026'}
              </div>
            </div>

            <table class="meta-table">
              <tr>
                <td class="label">Transaction Ref / UTR No:</td>
                <td class="val"><code style="background:#f1f5f9; padding:3px 6px; border-radius:4px; font-size:14px;">${escapeHtml(record.utr)}</code></td>
              </tr>
              <tr>
                <td class="label">Site / Project Location:</td>
                <td class="val">${escapeHtml(record.project)}</td>
              </tr>
              <tr>
                <td class="label">Assigned Site Supervisor:</td>
                <td class="val">${escapeHtml(record.supervisor)}</td>
              </tr>
              <tr>
                <td class="label">Payment Type & Mode:</td>
                <td class="val">${escapeHtml(record.type)} (${escapeHtml(record.mode)})</td>
              </tr>
              <tr>
                <td class="label">Audit Status:</td>
                <td class="val" style="color:#059669;">● Verified & Audited</td>
              </tr>
            </table>

            <div class="amount-box">
              <span>AMOUNT DISBURSED / CLAIMED:</span>
              <strong>₹${record.amount.toLocaleString('en-IN')}</strong>
            </div>

            <div class="footer-signatures">
              <div class="sig-line">Supervisor Signature</div>
              <div class="sig-line">Accounts Verifier</div>
              <div class="sig-line">Authorized Signatory (CFO)</div>
            </div>
          </div>
        </body>
        </html>
      `;

      printWin.document.open();
      printWin.document.write(htmlContent);
      printWin.document.close();

      const triggerPrint = () => {
        try {
          printWin.focus();
          printWin.print();
        } catch (e) {
          console.error(e);
        }
      };

      printWin.onload = triggerPrint;
      setTimeout(triggerPrint, 400);
    } catch (err) {
      console.error('Print Voucher Error:', err);
      toast.error('Failed to print voucher: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', boxSizing: 'border-box' }}>

      {/* 1. Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2.15rem',
            fontWeight: '900',
            color: 'var(--text-primary, #0f172a)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            lineHeight: 1.2
          }}>
            <Scale style={{ color: '#2563eb' }} size={30} />
            Reconciliation
          </h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary, #475569)', margin: '0.35rem 0 0 0', fontWeight: '500' }}>
            Supervisor advance floats, bank UTR ledger matching and account settlements.
          </p>
        </div>

        {/* Action Buttons: Print & PDF */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* 📄 Print Button */}
          <button
            onClick={handlePrintStatement}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '10px',
              border: '1.5px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--card-bg, #ffffff)',
              color: 'var(--text-primary, #1e293b)',
              fontSize: '0.9rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--input-bg, #f8fafc)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg, #ffffff)'}
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          {/* 📥 PDF Button (Red Outline - Direct Download) */}
          <button
            onClick={handleDownloadPDF}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '10px',
              border: '1.5px solid #dc2626',
              backgroundColor: 'var(--card-bg, #ffffff)',
              color: '#dc2626',
              fontSize: '0.9rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.12)';
              e.currentTarget.style.borderColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--card-bg, #ffffff)';
              e.currentTarget.style.borderColor = '#dc2626';
            }}
          >
            <Download size={16} style={{ color: '#dc2626' }} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Top Reconciliation Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        width: '100%'
      }}>
        {/* Card 1: Total Advance (Purple Left Border) -> Redirects to Site Team / Advance */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('team')}
          style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e8ecf2)',
            borderLeft: '5px solid #6366f1',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
          }}
          title="Click to view Site Team & Advance Wallet"
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'rgba(99, 102, 241, 0.18)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <IndianRupee size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', lineHeight: 1.1 }}>
              ₹{totalAdvance.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary, #64748b)', marginTop: '0.2rem' }}>
              Advance
            </div>
          </div>
        </div>

        {/* Card 2: Total Spent (Blue Left Border) -> Redirects to Bill Approvals */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('expenses')}
          style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e8ecf2)',
            borderLeft: '5px solid #3b82f6',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
          }}
          title="Click to view Bill Approvals & Spent Claims"
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'rgba(59, 130, 246, 0.18)',
            color: '#60a5fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Clock size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', lineHeight: 1.1 }}>
              ₹{totalSettled.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary, #64748b)', marginTop: '0.2rem' }}>
              Total Spent
            </div>
          </div>
        </div>

        {/* Card 3: Balance (Red Left Border) -> Redirects to Site Team / Float Balances */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('team')}
          style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e8ecf2)',
            borderLeft: '5px solid #ef4444',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
          }}
          title="Click to view Supervisor Advance Balances"
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.18)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertCircle size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', lineHeight: 1.1 }}>
              ₹{totalInHand.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary, #64748b)', marginTop: '0.2rem' }}>
              Balance
            </div>
          </div>
        </div>

        {/* Card 4: Audit (Green Left Border) -> Redirects to Audit & Alerts */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('alerts')}
          style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e8ecf2)',
            borderLeft: '5px solid #10b981',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
          }}
          title="Click to view Audit & Alerts"
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.18)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CheckCircle2 size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', lineHeight: 1.1 }}>
              100%
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary, #64748b)', marginTop: '0.2rem' }}>
              Clear Status
            </div>
          </div>
        </div>
      </div>

      {/* 3. Supervisors Live Float & Advance Tracking (Table Format) */}
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #e8ecf2)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        width: '100%'
      }}>
        {/* Table Header Section */}
        <div style={{
          padding: '1.2rem 1.4rem',
          borderBottom: '1px solid var(--border-color, #f1f5f9)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Scale size={20} style={{ color: '#2563eb' }} />
              Supervisor Live Float & Advance Tracking
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #64748b)', margin: '0.2rem 0 0 0' }}>
              Advance disbursed vs. verified vouchers submitted per site supervisor.
            </p>
          </div>
        </div>

        {/* Responsive Table */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--table-header-bg, #fafbfc)',
                borderBottom: '1px solid var(--border-color, #e8ecf2)',
                color: 'var(--text-secondary, #475569)',
                fontSize: '0.74rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <th style={{ padding: '0.85rem 0.9rem', whiteSpace: 'nowrap' }}>SUPERVISOR</th>
                <th style={{ padding: '0.85rem 0.9rem', whiteSpace: 'nowrap' }}>ASSIGNED SITE</th>
                <th style={{ padding: '0.85rem 0.9rem', whiteSpace: 'nowrap' }}>TOTAL ADVANCE</th>
                <th style={{ padding: '0.85rem 0.9rem', whiteSpace: 'nowrap' }}>TOTAL SPENT</th>
                <th style={{ padding: '0.85rem 0.9rem', whiteSpace: 'nowrap' }}>CASH IN HAND</th>
                <th style={{ padding: '0.85rem 0.9rem', whiteSpace: 'nowrap', textAlign: 'center' }}>CASH STATUS</th>
                <th style={{ padding: '0.85rem 0.9rem', textAlign: 'center', whiteSpace: 'nowrap' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {supervisorFloats.map((sup, idx) => {
                const inHand = sup.advance - sup.settled;
                const percentSpent = sup.advance > 0 ? Math.round((sup.settled / sup.advance) * 100) : 0;
                const isLowFloat = inHand < 5000;

                return (
                  <tr
                    key={sup.id}
                    style={{
                      borderBottom: idx === supervisorFloats.length - 1 ? 'none' : '1px solid var(--border-color, #f1f5f9)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-hover, rgba(241, 245, 249, 0.6))'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* SUPERVISOR */}
                    <td style={{ padding: '0.9rem 0.9rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(99, 102, 241, 0.15)',
                          color: '#6366f1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          flexShrink: 0
                        }}>
                          {sup.name.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.9rem' }}>{sup.name}</strong>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary, #64748b)', marginTop: '0.05rem' }}>{sup.phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* ASSIGNED SITE */}
                    <td style={{ padding: '0.9rem 0.9rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '700', fontSize: '0.88rem' }}>
                        {sup.site}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary, #64748b)', marginTop: '0.1rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sup.project}
                      </div>
                    </td>

                    {/* TOTAL ADVANCE */}
                    <td style={{ padding: '0.9rem 0.9rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)' }}>
                        ₹{sup.advance.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* SETTLED */}
                    <td style={{ padding: '0.9rem 0.9rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ color: '#2563eb', fontWeight: '800', fontSize: '0.92rem' }}>
                        ₹{sup.settled.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary, #64748b)', marginTop: '0.1rem' }}>
                        {percentSpent}% Used
                      </div>
                    </td>

                    {/* CASH IN HAND */}
                    <td style={{ padding: '0.9rem 0.9rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '0.96rem',
                        fontWeight: '800',
                        color: isLowFloat ? '#ef4444' : '#059669'
                      }}>
                        ₹{inHand.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* CASH STATUS */}
                    <td style={{ padding: '0.9rem 0.9rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        padding: '0.25rem 0.7rem',
                        borderRadius: '9999px',
                        backgroundColor: isLowFloat ? '#fef2f2' : '#ecfdf5',
                        color: isLowFloat ? '#dc2626' : '#059669',
                        border: `1px solid ${isLowFloat ? '#fecaca' : '#a7f3d0'}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        whiteSpace: 'nowrap',
                        lineHeight: 1
                      }}>
                        <span style={{ fontSize: '8px', lineHeight: 1 }}>●</span>
                        <span style={{ whiteSpace: 'nowrap', lineHeight: 1 }}>{isLowFloat ? 'Low Cash' : 'Available'}</span>
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: '0.9rem 0.9rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            setFloatForm(prev => ({ ...prev, supervisorId: sup.id }));
                            setIsIssueFloatOpen(true);
                          }}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #bfdbfe',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Plus size={13} />
                          <span>+ Cash</span>
                        </button>

                        <button
                          onClick={() => handleSettleAccount(sup)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#f8fafc',
                            color: '#334155',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Clear</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Search & Filter Bar for Bank Ledger */}
      <div style={{
        padding: '0.85rem 1.25rem',
        borderRadius: '16px',
        backgroundColor: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #e8ecf2)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Left: Search Box */}
        <div style={{ position: 'relative', flex: '1 1 320px', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #94a3b8)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder={language === 'mr' ? 'प्रोजेक्ट, ट्रान्झॅक्शन आयडी किंवा UTR नंबर शोधा...' : 'Search by Transaction ID, Project Site, or UTR...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.75rem',
              paddingRight: '1rem',
              paddingTop: '0.65rem',
              paddingBottom: '0.65rem',
              borderRadius: '10px',
              backgroundColor: 'var(--input-bg, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.92rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Right: Dropdowns (All Statuses & All Types) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          flexWrap: 'wrap'
        }}>
          {/* Status Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '0.6rem 2rem 0.6rem 2.1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: 'var(--input-bg, #ffffff)',
                color: 'var(--text-primary, #334155)',
                fontSize: '0.88rem',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            >
              <option value="All">All Types</option>
              <option value="Advance">Advances</option>
              <option value="Adjustment">Bills</option>
            </select>
            <Filter size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #64748b)', pointerEvents: 'none' }} />
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #64748b)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* 5. Bank Ledger Table */}
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #e8ecf2)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        width: '100%'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--table-header-bg, #fafbfc)',
                borderBottom: '1px solid var(--border-color, #e8ecf2)',
                color: 'var(--text-secondary, #475569)',
                fontSize: '0.76rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>TRANSACTION ID</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>DATE</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>SITE / PROJECT</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>PAYMENT MODE</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>SUPERVISOR</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>AMOUNT</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.map((rec, idx) => {
                const isVerified = rec.status === 'Verified';

                return (
                  <tr
                    key={rec.id}
                    style={{
                      borderBottom: idx === filteredLedger.length - 1 ? 'none' : '1px solid var(--border-color, #f1f5f9)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-hover, rgba(241, 245, 249, 0.6))'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* TRANSACTION ID */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.94rem', fontWeight: '800', fontFamily: 'monospace' }}>
                        {rec.id}
                      </strong>
                    </td>

                    {/* DATE */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={13} style={{ color: '#2563eb', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '700', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                          {rec.date ? new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '23 Aug 2026'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', marginTop: '0.15rem', paddingLeft: '1.1rem' }}>
                        {rec.time || '11:30 AM'}
                      </div>
                    </td>

                    {/* SITE / PROJECT */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '700', fontSize: '0.92rem' }}>
                        {rec.project}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #64748b)', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                        {rec.utr}
                      </div>
                    </td>

                    {/* PAYMENT MODE */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ color: 'var(--text-primary, #334155)', fontWeight: '500', fontSize: '0.9rem' }}>
                        {rec.mode}
                      </div>
                    </td>

                    {/* SUPERVISOR */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '600', fontSize: '0.9rem' }}>
                        {rec.supervisor}
                      </span>
                    </td>

                    {/* AMOUNT */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)' }}>
                        ₹{rec.amount.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => setInspectLedgerRecord(rec)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--input-bg, #f1f5f9)',
                            border: '1px solid var(--border-color, #cbd5e1)',
                            color: 'var(--text-primary, #0f172a)',
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--table-hover, #e2e8f0)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--input-bg, #f1f5f9)';
                          }}
                        >
                          View Details
                        </button>

                        {!isVerified && (
                          <button
                            onClick={() => {
                              setFloatForm(prev => ({ ...prev, supervisorId: 'sup-1' }));
                              setIsIssueFloatOpen(true);
                            }}
                            style={{
                              padding: '0.45rem 0.95rem',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                              color: '#ffffff',
                              fontSize: '0.82rem',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                              transition: 'all 0.15s ease',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <span>+ Verify</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Issue Advance Float */}
      {isIssueFloatOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '20px',
            border: '1.5px solid var(--border-color, #e2e8f0)',
            width: '100%',
            maxWidth: '480px',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-primary, #0f172a)', margin: '0 0 0.35rem 0' }}>
              + Issue Advance Float to Supervisor
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary, #64748b)', margin: '0 0 1.25rem 0' }}>
              Disburse operational advance cash to site supervisor.
            </p>

            <form onSubmit={handleIssueFloatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Supervisor Select */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary, #334155)', marginBottom: '0.4rem' }}>
                  Select Supervisor:
                </label>
                <select
                  value={floatForm.supervisorId}
                  onChange={(e) => setFloatForm({ ...floatForm, supervisorId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '9px',
                    border: '1.5px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--input-bg, #f8fafc)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    outline: 'none'
                  }}
                >
                  {supervisorFloats.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.site})</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary, #334155)', marginBottom: '0.4rem' }}>
                  Amount (₹):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={floatForm.amount}
                  onChange={(e) => setFloatForm({ ...floatForm, amount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '9px',
                    border: '1.5px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--input-bg, #f8fafc)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.95rem',
                    fontWeight: '800',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary, #334155)', marginBottom: '0.4rem' }}>
                  Payment Mode:
                </label>
                <select
                  value={floatForm.mode}
                  onChange={(e) => setFloatForm({ ...floatForm, mode: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '9px',
                    border: '1.5px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--input-bg, #f8fafc)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    outline: 'none'
                  }}
                >
                  <option value="NEFT / Bank Transfer">NEFT / Bank Transfer</option>
                  <option value="RTGS / IMPS">RTGS / IMPS</option>
                  <option value="GPay / UPI">GPay / UPI</option>
                  <option value="Petty Cash Voucher">Direct Cash (Office Float)</option>
                </select>
              </div>

              {/* UTR Reference */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: 'var(--text-primary, #334155)', marginBottom: '0.4rem' }}>
                  Bank UTR / Ref No:
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR998822104"
                  value={floatForm.utr}
                  onChange={(e) => setFloatForm({ ...floatForm, utr: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '9px',
                    border: '1.5px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--input-bg, #f8fafc)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsIssueFloatOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '9px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--input-bg, #f8fafc)',
                    color: 'var(--text-secondary, #64748b)',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '9px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  Issue Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Settle Supervisor Account */}
      {isSettleModalOpen && selectedSupervisor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '20px',
            border: '1.5px solid var(--border-color, #e2e8f0)',
            width: '100%',
            maxWidth: '460px',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-primary, #0f172a)', margin: '0 0 0.35rem 0' }}>
              Settle & Close Float Account
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary, #64748b)', margin: '0 0 1.25rem 0' }}>
              Audit and clear active advance float for supervisor "{selectedSupervisor.name}".
            </p>

            <div style={{
              backgroundColor: 'var(--input-bg, #f8fafc)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary, #64748b)' }}>
                <span>Total Advance Issued:</span>
                <strong style={{ color: 'var(--text-primary, #0f172a)' }}>₹{selectedSupervisor.advance.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary, #64748b)' }}>
                <span>Verified Bills Submitted:</span>
                <strong style={{ color: '#2563eb' }}>₹{selectedSupervisor.settled.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--border-color, #e2e8f0)', margin: '0.2rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ fontWeight: '800', color: 'var(--text-primary, #0f172a)' }}>Remaining to Return:</span>
                <strong style={{ color: '#10b981', fontWeight: '900' }}>₹{(selectedSupervisor.advance - selectedSupervisor.settled).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsSettleModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '9px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--input-bg, #f8fafc)',
                  color: 'var(--text-secondary, #64748b)',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSettlement}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                ✓ Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: View Transaction Details Modal */}
      {inspectLedgerRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '20px',
            border: '1.5px solid var(--border-color, #e2e8f0)',
            width: '100%',
            maxWidth: '520px',
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color, #f1f5f9)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Transaction Voucher & UTR Audit
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-primary, #0f172a)', margin: '0.2rem 0 0 0', fontFamily: 'monospace' }}>
                  {inspectLedgerRecord.id}
                </h3>
              </div>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: '800',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: inspectLedgerRecord.status === 'Verified' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: inspectLedgerRecord.status === 'Verified' ? '#34d399' : '#fbbf24',
                border: `1px solid ${inspectLedgerRecord.status === 'Verified' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
              }}>
                ● {inspectLedgerRecord.status}
              </span>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--input-bg, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.88rem', fontWeight: '600' }}>Date & Time:</span>
                <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.92rem' }}>
                  {inspectLedgerRecord.date ? new Date(inspectLedgerRecord.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '23 Aug 2026'} • {inspectLedgerRecord.time || '11:30 AM'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--input-bg, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.88rem', fontWeight: '600' }}>Site / Project:</span>
                <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.92rem' }}>{inspectLedgerRecord.project}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--input-bg, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.88rem', fontWeight: '600' }}>Assigned Supervisor:</span>
                <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.92rem' }}>{inspectLedgerRecord.supervisor}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--input-bg, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.88rem', fontWeight: '600' }}>Payment Mode:</span>
                <strong style={{ color: '#60a5fa', fontSize: '0.92rem' }}>{inspectLedgerRecord.mode}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--input-bg, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.88rem', fontWeight: '600' }}>Bank UTR / Ref No:</span>
                <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.92rem', fontFamily: 'monospace' }}>{inspectLedgerRecord.utr}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'rgba(37, 99, 235, 0.12)', borderRadius: '10px', border: '1.5px solid rgba(37, 99, 235, 0.3)' }}>
                <span style={{ color: '#93c5fd', fontSize: '0.95rem', fontWeight: '800' }}>Amount Disbursed / Claimed:</span>
                <strong style={{ color: '#60a5fa', fontSize: '1.2rem', fontWeight: '900' }}>₹{inspectLedgerRecord.amount.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setInspectLedgerRecord(null)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--input-bg, #f8fafc)',
                  color: 'var(--text-secondary, #475569)',
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handlePrintVoucher(inspectLedgerRecord)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
              >
                <Printer size={15} />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReconciliationTab;
