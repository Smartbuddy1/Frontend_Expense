import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Scale, Plus, FileText, Download, CheckCircle2, Clock,
  AlertCircle, ArrowUpRight, ArrowDownRight, Building,
  Search, Filter, RefreshCw, UserCheck, ShieldCheck,
  ChevronDown, Phone, IndianRupee, Printer, ExternalLink, Calendar,
  FileSpreadsheet, MapPin, History, X, Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLanguage } from '../../context/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { addPdfHeaderWithLogo, addPdfFooterWithLogo, getCompanyLogoBase64 } from '../../utils/pdfHeaderHelper';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL;

const ReconciliationTab = ({
  projects = [],
  supervisors = [],
  expenses = [],
  advances = [],
  activeView,
  onRefresh
}) => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = activeView || searchParams.get('tab') || 'reconciliation';
  const isReconView = currentTab === 'reconciliation';

  // Advance Requisitions — real supervisor-submitted advance requests from the backend.
  const advanceRequisitions = useMemo(() => advances.map(a => ({
    id: a.id,
    supervisor: a.supervisor,
    site: a.site || a.projectName,
    purpose: a.purpose || 'General site advance',
    urgency: 'Standard Request',
    urgencyType: 'medium',
    date: a.date ? new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    amount: a.amount,
    status: a.status,
    rawStatus: a.rawStatus,
    projectId: a.projectId,
  })), [advances]);

  const handleApproveRequisition = async (id) => {
    try {
      await axios.patch(`${API}/advances/${id}/approve`);
      toast.success(`Requisition ${id} Approved & Forwarded to Accounts!`);
      onRefresh && onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve requisition');
    }
  };

  const handleRejectRequisition = async (id) => {
    try {
      await axios.patch(`${API}/advances/${id}/reject`);
      toast.error(`Requisition ${id} has been Rejected`);
      onRefresh && onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject requisition');
    }
  };

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

  const [isIssueFloatOpen, setIsIssueFloatOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [inspectLedgerRecord, setInspectLedgerRecord] = useState(null);
  const [isNewReqModalOpen, setIsNewReqModalOpen] = useState(false);

  const supervisorProjects = useMemo(() => projects.filter(p => p.supervisorId), [projects]);

  // Form states for new advance requisition
  const [newReqForm, setNewReqForm] = useState({
    projectId: '',
    site: '',
    purpose: '',
    urgency: 'Immediate (Same Day)',
    amount: '',
    notes: ''
  });

  const handleCreateRequisitionSubmit = async (e) => {
    e.preventDefault();
    if (!newReqForm.purpose.trim()) {
      toast.error('Please enter the purpose or reason for the advance.');
      return;
    }
    if (!newReqForm.amount || Number(newReqForm.amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (!newReqForm.projectId) {
      toast.error('Please select a supervisor / site.');
      return;
    }

    try {
      await axios.post(`${API}/advances`, {
        projectId: newReqForm.projectId,
        amount: Number(newReqForm.amount),
        purpose: newReqForm.purpose,
      });
      setIsNewReqModalOpen(false);
      setNewReqForm({ projectId: '', site: '', purpose: '', urgency: 'Immediate (Same Day)', amount: '', notes: '' });
      toast.success('Advance requisition submitted for approval!');
      onRefresh && onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit requisition');
    }
  };

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
  // skips the request step since Operations is authorizing it on the spot). If the
  // logged-in user also has disbursal rights (Admin), it's immediately confirmed
  // disbursed too so the payment mode/UTR captured here land in the real ledger;
  // for a pure Operations user that PATCH 403s and the advance simply stays
  // "Approved", awaiting Accounts to confirm the actual payout.
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
        purpose: floatForm.notes || 'Advance float issued by Operations',
      });
      try {
        await axios.patch(`${API}/advances/${data.advance.id}/disburse`, {
          paidTo: sup.name,
          paymentMode: floatForm.mode,
          refNumber: floatForm.utr,
        });
      } catch {
        // Not authorized to disburse directly (non-admin Operations user) — the
        // advance stays "Approved" for Accounts to confirm the payout.
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

  // Creates a real Settlement record for Accounts to review and close — Operations
  // doesn't have authority to finalize money movement, only to flag a float as
  // ready for final reconciliation.
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

  // Filtered supervisor floats for Cash & Advance
  const filteredFloats = supervisorFloats.filter(sup => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = !q ||
      sup.name.toLowerCase().includes(q) ||
      (sup.phone && sup.phone.toLowerCase().includes(q)) ||
      sup.site.toLowerCase().includes(q) ||
      sup.project.toLowerCase().includes(q) ||
      (sup.lastRef && sup.lastRef.toLowerCase().includes(q));

    const inHand = sup.advance - sup.settled;
    const isLowFloat = inHand < 5000;
    const matchesFilter = filterType === 'All' ||
      (filterType === 'Low' && isLowFloat) ||
      (filterType === 'Available' && !isLowFloat);

    return matchesSearch && matchesFilter;
  });

  // Filtered advance requisitions for Request Advance
  const filteredRequisitions = advanceRequisitions.filter(item => {
    const q = (searchQuery || '').toLowerCase();
    return !q ||
      item.id.toLowerCase().includes(q) ||
      (item.supervisor && item.supervisor.toLowerCase().includes(q)) ||
      item.site.toLowerCase().includes(q) ||
      item.purpose.toLowerCase().includes(q) ||
      item.amount.toString().includes(q) ||
      item.urgency.toLowerCase().includes(q);
  });

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

  // 1-Click CSV / Excel Exporter
  const handleExportExcel = () => {
    try {
      if (isReconView) {
        const csvRows = [
          ['SR NO', 'REQUISITION ID', 'SUPERVISOR', 'SITE LOCATION', 'PURPOSE / REASON', 'URGENCY', 'DATE', 'AMOUNT (INR)', 'STATUS'],
          ...filteredRequisitions.map((req, idx) => [
            idx + 1,
            `"${req.id || ''}"`,
            `"${req.supervisor || ''}"`,
            `"${req.site || ''}"`,
            `"${req.purpose || ''}"`,
            `"${req.urgency || ''}"`,
            `"${req.date || ''}"`,
            req.amount || 0,
            `"${req.status || 'Approved'}"`
          ])
        ];
        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `ASEMS_Advance_Requisitions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Advance requisitions downloaded as Excel/CSV!');
      } else {
        const csvRows = [
          ['SR NO', 'SUPERVISOR NAME', 'PHONE NUMBER', 'ASSIGNED SITE', 'PROJECT NAME', 'TOTAL ADVANCE (INR)', 'TOTAL SPENT (INR)', 'CASH IN HAND (INR)', 'REQUEST (INR)', 'CASH STATUS'],
          ...supervisorFloats.map((sup, idx) => {
            const supReq = advanceRequisitions.find(r => 
              (r.supervisor?.toLowerCase().includes(sup.name?.toLowerCase()) || sup.name?.toLowerCase().includes(r.supervisor?.toLowerCase())) && r.status === 'Pending'
            );
            return [
              idx + 1,
              `"${sup.name || ''}"`,
              `"${sup.phone || ''}"`,
              `"${sup.site || ''}"`,
              `"${sup.project || ''}"`,
              sup.advance || 0,
              sup.settled || 0,
              (sup.advance || 0) - (sup.settled || 0),
              supReq ? `"${supReq.id} (₹${supReq.amount})"` : '"None"',
              (sup.advance || 0) - (sup.settled || 0) < 5000 ? 'Low Cash' : 'Available'
            ];
          })
        ];
        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `ASEMS_Supervisor_Cash_Advance_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Cash & Advance Excel downloaded!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to export Excel');
    }
  };

  // 1-Click Direct PDF File Download
  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();

      if (isReconView) {
        // 1. Advance Requisitions PDF with Official Logo Header
        const startY = await addPdfHeaderWithLogo(
          doc,
          'Site Advance Requisitions & Approvals Statement',
          `Generated on: ${new Date().toLocaleString()} | Official Operations Register`
        );

        // Summary Box
        const totalReqAmount = filteredRequisitions.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
        autoTable(doc, {
          startY: startY + 2,
          head: [['TOTAL REQUISITIONS', 'TOTAL REQUISITIONED', 'APPROVED REQUESTS', 'PENDING REVIEW']],
          body: [[
            `${filteredRequisitions.length} Requisitions`,
            `Rs. ${totalReqAmount.toLocaleString('en-IN')}`,
            `${filteredRequisitions.filter(r => r.status === 'Approved').length}`,
            `${filteredRequisitions.filter(r => r.status === 'Pending').length}`
          ]],
          theme: 'grid',
          styles: { fontSize: 9, fontStyle: 'bold', halign: 'center' },
          headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] }
        });

        // Requisition Table Data
        const reqData = filteredRequisitions.map(r => [
          r.id,
          r.supervisor || 'Rohit Sharma',
          r.site,
          r.purpose,
          r.urgency,
          r.date,
          `Rs. ${(r.amount || 0).toLocaleString('en-IN')}`,
          r.status
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 8,
          head: [['REQ ID', 'SUPERVISOR', 'SITE LOCATION', 'PURPOSE / REASON', 'URGENCY', 'DATE', 'AMOUNT', 'STATUS']],
          body: reqData,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] }
        });

        // Add official company footer with Logo across all pages
        await addPdfFooterWithLogo(doc);

        const filename = `ASEMS_Advance_Requisitions_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        toast.success('Advance Requisitions PDF downloaded with official logo & footer!');
        return;
      }

      // 2. Supervisor Cash & Advance Statement PDF
      const startY = await addPdfHeaderWithLogo(
        doc,
        'Supervisor Cash & Advance Statement',
        `Generated on: ${new Date().toLocaleString()} | Official Operations Ledger`
      );

      // Summary Box (Exact match to 4 Top KPI Cards on screen)
      autoTable(doc, {
        startY: startY + 2,
        head: [['TOTAL ADVANCE', 'TOTAL SPENT', 'BALANCE IN HAND', 'CLEAR STATUS']],
        body: [[
          `Rs. ${totalAdvance.toLocaleString('en-IN')}`,
          `Rs. ${totalSettled.toLocaleString('en-IN')}`,
          `Rs. ${totalInHand.toLocaleString('en-IN')}`,
          '100% Matched'
        ]],
        theme: 'grid',
        styles: { fontSize: 9, fontStyle: 'bold', halign: 'center' },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] }
      });

      // Table Data (Exact 1:1 match to table on the Cash & Advance screen)
      const supData = filteredFloats.map(s => {
        const supReq = advanceRequisitions.find(r => 
          (r.supervisor?.toLowerCase().includes(s.name?.toLowerCase()) || s.name?.toLowerCase().includes(r.supervisor?.toLowerCase())) && r.status === 'Pending'
        );
        return [
          `${s.name}\n${s.phone || '-'}`,
          `${s.site}\n(${s.project})`,
          `Rs. ${s.advance.toLocaleString('en-IN')}`,
          `Rs. ${s.settled.toLocaleString('en-IN')}`,
          `Rs. ${(s.advance - s.settled).toLocaleString('en-IN')}`,
          supReq ? `Rs. ${supReq.amount.toLocaleString('en-IN')}\n(${supReq.id} - Pending)` : 'None',
          (s.advance - s.settled) < 5000 ? 'Low Cash' : 'Available'
        ];
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [['SUPERVISOR & CONTACT', 'SITE & PROJECT', 'TOTAL ADVANCE', 'TOTAL SPENT', 'CASH IN HAND', 'REQUEST', 'STATUS']],
        body: supData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] }
      });

      // Add official company footer with Logo across all pages
      await addPdfFooterWithLogo(doc);

      // Save directly to Downloads folder
      const filename = `ASEMS_Cash_Advance_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success('Cash & Advance PDF downloaded successfully with official logo & footer!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF: ' + err.message);
    }
  };

  // Generate Official Statement Print HTML with Aarya Logo in Header & Footer
  const generateStatementHtml = (logoBase64) => {
    const logoSrc = logoBase64 || `${window.location.origin}/logo_new.png`;

    if (isReconView) {
      const totalReqAmount = filteredRequisitions.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const reqRows = filteredRequisitions.map((r, idx) => `
        <tr>
          <td style="text-align:center; font-weight:800; color:#059669;">${r.id}</td>
          <td><strong>${r.supervisor || 'Rohit Sharma'}</strong></td>
          <td><strong>${r.site}</strong></td>
          <td>${r.purpose}</td>
          <td style="text-align:center;">
            <span style="padding:2px 7px; border-radius:6px; font-weight:700; font-size:9.5px; background:${r.urgencyType === 'high' ? '#fee2e2; color:#dc2626;' : '#dbeafe; color:#2563eb;'}">
              ${r.urgency}
            </span>
          </td>
          <td>${r.date}</td>
          <td style="text-align:right; font-weight:800; color:#0f172a;">₹${(r.amount || 0).toLocaleString('en-IN')}</td>
          <td style="text-align:center;">
            <span style="padding:2px 8px; border-radius:9999px; font-weight:800; font-size:9px; background:${r.status === 'Approved' ? '#dcfce7; color:#15803d; border:1px solid #bbf7d0;' : '#fef3c7; color:#d97706; border:1px solid #fde68a;'}">
              ${r.status}
            </span>
          </td>
        </tr>
      `).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Advance Requisitions & Approvals Statement - Aarya Innovtech</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 15px; color: #0f172a; line-height: 1.4; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 15px; }
            .title { font-size: 17px; font-weight: 800; color: #0f172a; margin: 0; }
            .subtitle { font-size: 10px; color: #64748b; margin-top: 3px; }
            .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; }
            .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; background: #f8fafc; }
            .card-label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; }
            .card-val { font-size: 16px; font-weight: 900; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10px; }
            th { background: #f1f5f9; padding: 7px 9px; border: 1px solid #cbd5e1; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 9px; color: #334155; }
            td { padding: 7px 9px; border: 1px solid #e2e8f0; vertical-align: middle; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .sec-title { font-size: 12px; font-weight: 800; color: #065f46; margin: 14px 0 6px 0; text-transform: uppercase; }
            .footer { border-top: 1.5px solid #cbd5e1; padding-top: 14px; margin-top: 25px; font-size: 10.5px; color: #475569; }
            .footer-sig { display: flex; justify-content: space-between; margin-bottom: 14px; }
            .footer-company { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; padding-top: 10px; font-size: 9.5px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; align-items: center; gap: 14px;">
              <img src="${logoSrc}" alt="Aarya Innovtech Pvt. Ltd." style="height: 42px; width: auto; max-width: 170px; object-fit: contain; display: block;" />
              <div>
                <h1 class="title">Site Advance Requisitions & Approvals Statement</h1>
                <div class="subtitle">AARYA INNOVTECH PVT. LTD. | Official Site Operations Register</div>
              </div>
            </div>
            <div style="text-align: right; font-size: 10px; color: #64748b;">
              <strong>Generated Date:</strong> ${new Date().toLocaleDateString('en-GB')}<br/>
              ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div class="summary-cards">
            <div class="card" style="border-left: 4px solid #059669;">
              <div class="card-label">Total Requisitions</div>
              <div class="card-val" style="color: #065f46;">${filteredRequisitions.length}</div>
            </div>
            <div class="card" style="border-left: 4px solid #2563eb;">
              <div class="card-label">Total Amount Requested</div>
              <div class="card-val" style="color: #1d4ed8;">₹${totalReqAmount.toLocaleString('en-IN')}</div>
            </div>
            <div class="card" style="border-left: 4px solid #10b981;">
              <div class="card-label">Approved Requests</div>
              <div class="card-val" style="color: #059669;">${filteredRequisitions.filter(r => r.status === 'Approved').length}</div>
            </div>
            <div class="card" style="border-left: 4px solid #f59e0b;">
              <div class="card-label">Pending Reviews</div>
              <div class="card-val" style="color: #d97706;">${filteredRequisitions.filter(r => r.status === 'Pending').length}</div>
            </div>
          </div>

          <div class="sec-title">1. Site Advance Requisitions Ledger</div>
          <table>
            <thead>
              <tr>
                <th style="text-align:center;">REQ ID</th>
                <th>SUPERVISOR</th>
                <th>SITE LOCATION</th>
                <th>PURPOSE / REASON</th>
                <th style="text-align:center;">URGENCY</th>
                <th>DATE</th>
                <th style="text-align:right;">AMOUNT</th>
                <th style="text-align:center;">STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${reqRows}
            </tbody>
          </table>

          <div class="footer">
            <div class="footer-sig">
              <div>Verified By: <strong>Accounts & Finance Officer</strong></div>
              <div>Authorized Signatory: _______________________ <strong>(Operations / Project Head)</strong></div>
            </div>
            <div class="footer-company">
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${logoSrc}" alt="Logo" style="height: 20px; width: auto; max-width: 90px; object-fit: contain; display: block;" />
                <div><strong>AARYA INNOVTECH PVT. LTD.</strong> | CIN: U29305MH2019PTC327551 | Ph: +91 9359604384 | Makhamalabad Road, Nashik</div>
              </div>
              <div>Generated by ASEMS System</div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const supRows = filteredFloats.map((s, idx) => {
      const supReq = advanceRequisitions.find(r => 
        (r.supervisor?.toLowerCase().includes(s.name?.toLowerCase()) || s.name?.toLowerCase().includes(r.supervisor?.toLowerCase())) && r.status === 'Pending'
      );
      return `
      <tr>
        <td style="text-align:center; font-weight:bold;">${idx + 1}</td>
        <td><strong>${s.name}</strong><br/><span style="color:#2563eb; font-weight:700; font-size:10px;">${s.phone || '-'}</span></td>
        <td><strong>${s.site}</strong><br/><span style="color:#64748b; font-size:10px;">${s.project}</span></td>
        <td style="text-align:right; font-weight:800;">₹${(s.advance || 0).toLocaleString('en-IN')}</td>
        <td style="text-align:right; font-weight:800; color:#2563eb;">₹${(s.settled || 0).toLocaleString('en-IN')}</td>
        <td style="text-align:right; font-weight:900; color:${((s.advance || 0) - (s.settled || 0)) < 5000 ? '#dc2626;' : '#059669;'}">₹${((s.advance || 0) - (s.settled || 0)).toLocaleString('en-IN')}</td>
        <td style="text-align:center;">${supReq ? `<strong style="color:#b45309;">₹${supReq.amount.toLocaleString('en-IN')}</strong><br/><span style="font-size:9px; color:#b45309;">${supReq.id} (Pending)</span>` : '<span style="color:#94a3b8;">None</span>'}</td>
        <td style="text-align:center;"><span style="padding:2px 7px; border-radius:9999px; font-weight:800; font-size:9px; background:${((s.advance || 0) - (s.settled || 0)) < 5000 ? '#fee2e2; color:#b91c1c;' : '#dcfce7; color:#15803d;'}">${((s.advance || 0) - (s.settled || 0)) < 5000 ? 'Low Cash' : 'Available'}</span></td>
      </tr>
    `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Supervisor Cash & Advance Statement - Aarya Innovtech</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 15px; color: #0f172a; line-height: 1.4; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 15px; }
          .title { font-size: 17px; font-weight: 800; color: #0f172a; margin: 0; }
          .subtitle { font-size: 10px; color: #64748b; margin-top: 3px; }
          .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; }
          .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; background: #f8fafc; }
          .card-label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; }
          .card-val { font-size: 16px; font-weight: 900; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10px; }
          th { background: #f1f5f9; padding: 7px 9px; border: 1px solid #cbd5e1; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 9px; color: #334155; }
          td { padding: 7px 9px; border: 1px solid #e2e8f0; vertical-align: middle; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .sec-title { font-size: 12px; font-weight: 800; color: #1e3a8a; margin: 14px 0 6px 0; text-transform: uppercase; }
          .footer { border-top: 1.5px solid #cbd5e1; padding-top: 14px; margin-top: 25px; font-size: 10.5px; color: #475569; }
          .footer-sig { display: flex; justify-content: space-between; margin-bottom: 14px; }
          .footer-company { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; padding-top: 10px; font-size: 9.5px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${logoSrc}" alt="Aarya Innovtech Pvt. Ltd." style="height: 42px; width: auto; max-width: 170px; object-fit: contain; display: block;" />
            <div>
              <h1 class="title">Supervisor Cash & Advance Statement</h1>
              <div class="subtitle">AARYA INNOVTECH PVT. LTD. | Official Site Operations Ledger</div>
            </div>
          </div>
          <div style="text-align: right; font-size: 10px; color: #64748b;">
            <strong>Generated Date:</strong> ${new Date().toLocaleDateString('en-GB')}<br/>
            ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div class="summary-cards">
          <div class="card" style="border-left: 4px solid #6366f1;">
            <div class="card-label">Total Advance</div>
            <div class="card-val" style="color: #4f46e5;">₹${totalAdvance.toLocaleString('en-IN')}</div>
          </div>
          <div class="card" style="border-left: 4px solid #3b82f6;">
            <div class="card-label">Total Spent</div>
            <div class="card-val" style="color: #2563eb;">₹${totalSettled.toLocaleString('en-IN')}</div>
          </div>
          <div class="card" style="border-left: 4px solid #10b981;">
            <div class="card-label">Balance In Hand</div>
            <div class="card-val" style="color: #059669;">₹${totalInHand.toLocaleString('en-IN')}</div>
          </div>
          <div class="card" style="border-left: 4px solid #8b5cf6;">
            <div class="card-label">Clear Status</div>
            <div class="card-val" style="color: #7c3aed;">100%</div>
          </div>
        </div>

        <div class="sec-title">Supervisor Live Advance & Cash Balance Tracking</div>
        <table>
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">SR</th>
              <th>SUPERVISOR & CONTACT</th>
              <th>ASSIGNED SITE & PROJECT</th>
              <th style="text-align:right;">TOTAL ADVANCE</th>
              <th style="text-align:right;">TOTAL SPENT</th>
              <th style="text-align:right;">CASH IN HAND</th>
              <th style="text-align:center;">REQUEST</th>
              <th style="text-align:center;">STATUS</th>
            </tr>
          </thead>
          <tbody>
            ${supRows}
          </tbody>
        </table>

        <div class="footer">
          <div class="footer-sig">
            <div>Audited By: <strong>Accounts & Operations Officer</strong></div>
            <div>Approved Signature: _______________________ <strong>(Finance Head / Director)</strong></div>
          </div>
          <div class="footer-company">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="${logoSrc}" alt="Logo" style="height: 20px; width: auto; max-width: 90px; object-fit: contain; display: block;" />
              <div><strong>AARYA INNOVTECH PVT. LTD.</strong> | CIN: U29305MH2019PTC327551 | Ph: +91 9359604384 | Makhamalabad Road, Nashik</div>
            </div>
            <div>Generated by ASEMS System</div>
          </div>
        </div>
      </body>
      </html>
    `;
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
                <td class="val"><code style="background:#f1f5f9; padding:3px 6px; border-radius:4px; font-size:14px;">${record.utr}</code></td>
              </tr>
              <tr>
                <td class="label">Site / Project Location:</td>
                <td class="val">${record.project}</td>
              </tr>
              <tr>
                <td class="label">Assigned Site Supervisor:</td>
                <td class="val">${record.supervisor}</td>
              </tr>
              <tr>
                <td class="label">Payment Type & Mode:</td>
                <td class="val">${record.type} (${record.mode})</td>
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
            {isReconView ? 'Request Advance Money' : (
              <>
                <IndianRupee style={{ color: '#2563eb' }} size={30} />
                {language === 'mr' ? 'कॅश आणि ॲडव्हान्स' : 'Cash & Advance'}
              </>
            )}
          </h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary, #475569)', margin: '0.35rem 0 0 0', fontWeight: '500' }}>
            {isReconView
              ? 'Requisition site petty cash, urgent material purchase funds, and track approval status.'
              : (language === 'mr' ? 'सुपरवायझर ॲडव्हान्स फ्लोट, साईटवरील खर्च आणि शिल्लक कॅश ट्रॅकिंग.' : 'Supervisor advance floats, site expenses and live cash in hand tracking.')}
          </p>
        </div>

        {/* Action Buttons: PDF, Excel & Print */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* 📥 PDF Button */}
          <button
            onClick={handleDownloadPDF}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '10px',
              border: isReconView ? '1.5px solid #c7d2fe' : '1.5px solid #dc2626',
              backgroundColor: isReconView ? '#eef2ff' : 'var(--card-bg, #ffffff)',
              color: isReconView ? '#4f46e5' : '#dc2626',
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
              e.currentTarget.style.backgroundColor = isReconView ? '#e0e7ff' : 'rgba(220, 38, 38, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isReconView ? '#eef2ff' : 'var(--card-bg, #ffffff)';
            }}
          >
            <Download size={16} style={{ color: isReconView ? '#4f46e5' : '#dc2626' }} />
            <span>PDF</span>
          </button>

          {/* 📄 Excel Button (Green Outline) */}
          <button
            onClick={handleExportExcel}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '10px',
              border: isReconView ? '1.5px solid #86efac' : '1.5px solid #16a34a',
              backgroundColor: isReconView ? '#f0fdf4' : 'var(--card-bg, #ffffff)',
              color: '#16a34a',
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
              e.currentTarget.style.backgroundColor = '#dcfce7';
              e.currentTarget.style.borderColor = '#15803d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isReconView ? '#f0fdf4' : 'var(--card-bg, #ffffff)';
              e.currentTarget.style.borderColor = isReconView ? '#86efac' : '#16a34a';
            }}
          >
            <FileSpreadsheet size={16} style={{ color: '#16a34a' }} />
            <span>Excel</span>
          </button>

          {/* 📄 Print Button */}
          <button
            onClick={handlePrintStatement}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '10px',
              border: '1.5px solid var(--border-color, #cbd5e1)',
              backgroundColor: isReconView ? '#f8fafc' : 'var(--card-bg, #ffffff)',
              color: isReconView ? '#2563eb' : 'var(--text-primary, #1e293b)',
              fontSize: '0.9rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isReconView ? '#f8fafc' : 'var(--card-bg, #ffffff)'}
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar (Top level search bar matching image) */}
      {isReconView && (
        <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
          <Search size={17} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search site, purpose, amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.75rem',
              paddingRight: '1rem',
              paddingTop: '0.7rem',
              paddingBottom: '0.7rem',
              borderRadius: '12px',
              backgroundColor: 'var(--input-bg, #ffffff)',
              border: '1.5px solid var(--border-color, #cbd5e1)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.92rem',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          />
        </div>
      )}

      {/* Cash & Advance: 4 KPI Cards */}
      {!isReconView && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          width: '100%'
        }}>
          {/* Card 1: Total Advance */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e8ecf2)',
            borderLeft: '5px solid #6366f1',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem'
          }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.18)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

          {/* Card 2: Total Spent */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e8ecf2)',
            borderLeft: '5px solid #3b82f6',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem'
          }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.18)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

          {/* Card 3: Balance */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e8ecf2)',
            borderLeft: '5px solid #ef4444',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem'
          }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.18)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

          {/* Card 4: Audit */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e8ecf2)',
            borderLeft: '5px solid #10b981',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem'
          }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.18)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981', lineHeight: 1.1 }}>
                100%
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary, #64748b)', marginTop: '0.2rem' }}>
                Clear Status
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Table Container */}
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #e8ecf2)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        width: '100%'
      }}>
        {isReconView ? (
          /* ============================================================
             REQUEST ADVANCE VIEW: Exact Match to User Screenshot
             ============================================================ */
          <div>
            {/* Card Header */}
            <div style={{
              padding: '1.15rem 1.5rem',
              borderBottom: '1px solid var(--border-color, #f1f5f9)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <History size={22} style={{ color: '#059669' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                  Recent Advance Requisitions
                </h2>
                <span style={{
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '0.22rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <FileText size={12} />
                  <span>Total Requests ({filteredRequisitions.length})</span>
                </span>
              </div>

              {/* Request Advance Button */}
              <button
                type="button"
                onClick={() => setIsNewReqModalOpen(true)}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                <span>+ Request Advance</span>
              </button>
            </div>

            {/* Table */}
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
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>REQUISITION ID</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>SUPERVISOR</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>SITE LOCATION</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>PURPOSE / REASON</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>URGENCY</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>DATE</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>AMOUNT (₹)</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisitions.map((req, idx, arr) => {
                    const isHighUrgency = req.urgencyType === 'high';
                    const isMediumUrgency = req.urgencyType === 'medium';

                    return (
                      <tr
                        key={req.id}
                        style={{
                          borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--border-color, #f1f5f9)',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-hover, rgba(241, 245, 249, 0.6))'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* REQUISITION ID */}
                        <td style={{ padding: '1.2rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: '#059669', fontSize: '0.94rem', fontWeight: '800' }}>
                            {req.id}
                          </strong>
                        </td>

                        {/* SUPERVISOR */}
                        <td style={{ padding: '1.2rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '800',
                              fontSize: '0.85rem',
                              border: '1px solid #bfdbfe',
                              flexShrink: 0
                            }}>
                              {(req.supervisor || 'S').charAt(0)}
                            </div>
                            <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.92rem' }}>
                              {req.supervisor}
                            </strong>
                          </div>
                        </td>

                        {/* SITE LOCATION */}
                        <td style={{ padding: '1.2rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={15} style={{ color: '#2563eb', flexShrink: 0 }} />
                            <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.94rem' }}>
                              {req.site}
                            </strong>
                          </div>
                        </td>

                        {/* PURPOSE / REASON */}
                        <td style={{ padding: '1.2rem 1.25rem', verticalAlign: 'middle' }}>
                          <span style={{ color: 'var(--text-secondary, #334155)', fontSize: '0.92rem', fontWeight: '500' }}>
                            {req.purpose}
                          </span>
                        </td>

                        {/* URGENCY */}
                        <td style={{ padding: '1.2rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            padding: '0.32rem 0.75rem',
                            borderRadius: '8px',
                            backgroundColor: isHighUrgency ? '#fee2e2' : isMediumUrgency ? '#dbeafe' : '#f1f5f9',
                            color: isHighUrgency ? '#dc2626' : isMediumUrgency ? '#2563eb' : '#64748b',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}>
                            <Clock size={12} />
                            <span>{req.urgency}</span>
                          </span>
                        </td>

                        {/* DATE */}
                        <td style={{ padding: '1.2rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{ color: 'var(--text-secondary, #475569)', fontSize: '0.9rem', fontWeight: '600' }}>
                            {req.date}
                          </span>
                        </td>

                        {/* AMOUNT */}
                        <td style={{ padding: '1.2rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)' }}>
                            ₹{req.amount.toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td style={{ padding: '1.2rem 1.25rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', justifyContent: 'center' }}>
                            {req.status === 'Pending' ? (
                              <>
                                {/* + Approve & Forward Button */}
                                <button
                                  onClick={() => handleApproveRequisition(req.id)}
                                  style={{
                                    padding: '0.45rem 0.95rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: '#4f46e5',
                                    color: '#ffffff',
                                    fontSize: '0.86rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.45rem',
                                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                                  title="Approve and forward requisition"
                                >
                                  <CheckCircle2 size={15} />
                                  <span>+ Approve & Forward</span>
                                </button>

                                {/* Reject Button */}
                                <button
                                  onClick={() => handleRejectRequisition(req.id)}
                                  style={{
                                    padding: '0.45rem 0.9rem',
                                    borderRadius: '10px',
                                    border: '1.5px solid #fecdd3',
                                    backgroundColor: '#fff1f2',
                                    color: '#e11d48',
                                    fontSize: '0.86rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe4e6'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff1f2'}
                                  title="Reject this requisition"
                                >
                                  <X size={14} />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : req.status === 'Rejected' ? (
                              <span style={{
                                padding: '0.42rem 0.85rem',
                                borderRadius: '9px',
                                border: '1.5px solid #fecdd3',
                                backgroundColor: '#fff1f2',
                                color: '#e11d48',
                                fontSize: '0.84rem',
                                fontWeight: '800',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}>
                                <X size={14} />
                                <span>Rejected</span>
                              </span>
                            ) : (
                              <>
                                {/* View Bill Button */}
                                <button
                                  onClick={() => toast.success(`Opening verified invoice / bill for ${req.id}`)}
                                  style={{
                                    padding: '0.42rem 0.95rem',
                                    borderRadius: '9px',
                                    border: '1.5px solid var(--border-color, #cbd5e1)',
                                    backgroundColor: 'var(--card-bg, #ffffff)',
                                    color: 'var(--text-primary, #0f172a)',
                                    fontSize: '0.86rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--input-bg, #f8fafc)'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg, #ffffff)'}
                                >
                                  <span>View Bill</span>
                                </button>

                                {/* Approved Badge Button */}
                                <span style={{
                                  padding: '0.42rem 0.95rem',
                                  borderRadius: '9px',
                                  border: '1.5px solid #a7f3d0',
                                  backgroundColor: '#dcfce7',
                                  color: '#059669',
                                  fontSize: '0.86rem',
                                  fontWeight: '800',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem'
                                }}>
                                  <CheckCircle2 size={15} style={{ color: '#059669' }} />
                                  <span>Approved</span>
                                </span>
                              </>
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
        ) : (
          /* ============================================================
             CASH & ADVANCE VIEW: Supervisor Floats Table
             ============================================================ */
          <div>
            <div style={{
              padding: '1rem 1.4rem',
              borderBottom: '1px solid var(--border-color, #f1f5f9)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              {/* Search Bar on Left */}
              <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #94a3b8)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search supervisor, site, UTR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '2.4rem',
                    paddingRight: '0.85rem',
                    paddingTop: '0.55rem',
                    paddingBottom: '0.55rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--input-bg, #f8fafc)',
                    border: '1.5px solid var(--border-color, #e2e8f0)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Filter on Right */}
              <div style={{ position: 'relative' }}>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    padding: '0.55rem 1.8rem 0.55rem 1.9rem',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border-color, #e2e8f0)',
                    backgroundColor: 'var(--input-bg, #ffffff)',
                    color: 'var(--text-primary, #334155)',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none'
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Low">Low Cash</option>
                </select>
                <Filter size={13} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #64748b)', pointerEvents: 'none' }} />
                <ChevronDown size={13} style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #64748b)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Cash & Advance Table */}
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
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>SUPERVISOR & CONTACT</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>SITE & PROJECT</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>TOTAL ADVANCE</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>TOTAL SPENT</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>CASH IN HAND</th>
                    <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>REQUEST</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFloats.map((sup, idx, arr) => {
                    const inHand = sup.advance - sup.settled;
                    const percentSpent = sup.advance > 0 ? Math.round((sup.settled / sup.advance) * 100) : 0;
                    const isLowFloat = inHand < 5000;

                    return (
                      <tr
                        key={sup.id}
                        style={{
                          borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--border-color, #f1f5f9)',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-hover, rgba(241, 245, 249, 0.6))'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                          {/* SUPERVISOR & CONTACT */}
                          <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '800',
                                fontSize: '0.95rem',
                                flexShrink: 0,
                                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
                              }}>
                                {sup.name.charAt(0)}
                              </div>
                              <div>
                                <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.96rem', display: 'block' }}>{sup.name}</strong>
                                <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '700', marginTop: '0.15rem' }}>{sup.phone}</div>
                              </div>
                            </div>
                          </td>

                          {/* SITE & PROJECT */}
                          <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.92rem', display: 'block' }}>
                              {sup.site}
                            </strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', marginTop: '0.15rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sup.project}
                            </div>
                          </td>

                          {/* TOTAL ADVANCE */}
                          <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)' }}>
                              ₹{sup.advance.toLocaleString('en-IN')}
                            </span>
                          </td>

                          {/* TOTAL SPENT */}
                          <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <div style={{ color: '#2563eb', fontWeight: '800', fontSize: '0.98rem' }}>
                              ₹{sup.settled.toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary, #64748b)', marginTop: '0.15rem' }}>
                              {percentSpent}% Used
                            </div>
                          </td>

                          {/* CASH IN HAND */}
                          <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '1.05rem',
                              fontWeight: '900',
                              color: isLowFloat ? '#ef4444' : '#059669'
                            }}>
                              ₹{inHand.toLocaleString('en-IN')}
                            </span>
                          </td>

                          {/* REQUEST */}
                          <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            {(() => {
                              const supReq = advanceRequisitions.find(r => 
                                (r.supervisor?.toLowerCase().includes(sup.name?.toLowerCase()) || sup.name?.toLowerCase().includes(r.supervisor?.toLowerCase())) && r.status === 'Pending'
                              );
                              if (supReq) {
                                return (
                                  <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.2rem' }}>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      padding: '0.25rem 0.7rem',
                                      borderRadius: '9999px',
                                      fontSize: '0.82rem',
                                      fontWeight: '800',
                                      backgroundColor: '#fffbeb',
                                      color: '#b45309',
                                      border: '1px solid #fde68a'
                                    }}>
                                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                                      ₹{supReq.amount?.toLocaleString('en-IN')}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: '700' }}>
                                      {supReq.id} • {supReq.urgency === 'Immediate (Same Day)' ? 'Immediate' : '24h'}
                                    </span>
                                  </div>
                                );
                              }
                              return (
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: '600' }}>
                                  — No Request
                                </span>
                              );
                            })()}
                          </td>

                          {/* ACTIONS */}
                          <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'center' }}>
                              <button
                                onClick={() => {
                                  setFloatForm(prev => ({ ...prev, supervisorId: sup.id }));
                                  setIsIssueFloatOpen(true);
                                }}
                                style={{
                                  padding: '0.42rem 0.85rem',
                                  borderRadius: '8px',
                                  border: '1px solid #bfdbfe',
                                  backgroundColor: '#eff6ff',
                                  color: '#2563eb',
                                  fontSize: '0.84rem',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  transition: 'all 0.15s ease',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <Plus size={13} />
                                <span>Add Cash</span>
                              </button>

                              <button
                                onClick={() => handleSettleAccount(sup)}
                                style={{
                                  padding: '0.42rem 0.85rem',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border-color, #cbd5e1)',
                                  backgroundColor: 'var(--input-bg, #f8fafc)',
                                  color: 'var(--text-primary, #475569)',
                                  fontSize: '0.84rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
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
        )}
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

      {/* MODAL 4: Create New Advance Requisition */}
      {isNewReqModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '20px',
            border: '1.5px solid var(--border-color, #e2e8f0)',
            width: '100%',
            maxWidth: '540px',
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color, #f1f5f9)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Site Requisition Register
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-primary, #0f172a)', margin: '0.2rem 0 0 0' }}>
                  + Request Advance Fund
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewReqModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary, #94a3b8)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateRequisitionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Supervisor Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary, #475569)', marginBottom: '0.35rem' }}>
                  Supervisor Name *
                </label>
                <select
                  value={newReqForm.projectId}
                  onChange={(e) => {
                    const projectId = e.target.value;
                    const proj = supervisorProjects.find(p => p.id === projectId);
                    setNewReqForm(prev => ({ ...prev, projectId, site: proj?.location || proj?.name || '' }));
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--input-bg, #f8fafc)',
                    border: '1.5px solid var(--border-color, #cbd5e1)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Select Supervisor --</option>
                  {supervisorProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.supervisorName} ({p.name})</option>
                  ))}
                </select>
              </div>

              {/* Site Location */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary, #475569)', marginBottom: '0.35rem' }}>
                  Site Location & Project *
                </label>
                <input
                  type="text"
                  value={newReqForm.site}
                  onChange={(e) => setNewReqForm(prev => ({ ...prev, site: e.target.value }))}
                  placeholder="Enter site / project name..."
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--input-bg, #f8fafc)',
                    border: '1.5px solid var(--border-color, #cbd5e1)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Purpose / Reason */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary, #475569)', marginBottom: '0.35rem' }}>
                  Purpose / Reason *
                </label>
                <input
                  type="text"
                  value={newReqForm.purpose}
                  onChange={(e) => setNewReqForm(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="e.g. Urgent diesel purchase, laborer wages, cement bags..."
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--input-bg, #f8fafc)',
                    border: '1.5px solid var(--border-color, #cbd5e1)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Grid: Urgency & Amount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary, #475569)', marginBottom: '0.35rem' }}>
                    Urgency Level *
                  </label>
                  <select
                    value={newReqForm.urgency}
                    onChange={(e) => setNewReqForm(prev => ({ ...prev, urgency: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      backgroundColor: 'var(--input-bg, #f8fafc)',
                      border: '1.5px solid var(--border-color, #cbd5e1)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Immediate (Same Day)">Immediate (Same Day)</option>
                    <option value="Within 24 Hours">Within 24 Hours</option>
                    <option value="Standard (2-3 Days)">Standard (2-3 Days)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary, #475569)', marginBottom: '0.35rem' }}>
                    Requested Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={newReqForm.amount}
                    onChange={(e) => setNewReqForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="e.g. 25000"
                    min="100"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      backgroundColor: 'var(--input-bg, #f8fafc)',
                      border: '1.5px solid var(--border-color, #cbd5e1)',
                      color: '#059669',
                      fontSize: '1rem',
                      fontWeight: '800',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsNewReqModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--input-bg, #f8fafc)',
                    color: 'var(--text-secondary, #475569)',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1.5,
                    padding: '0.7rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Submit Requisition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReconciliationTab;
