import React, { useState, useEffect } from 'react';
import {
  IndianRupee, CheckCircle2, XCircle, Clock, FileText,
  Search, Filter, Plus, Calendar, Building, User,
  ExternalLink, ArrowUpRight, AlertCircle, Sparkles, Tag,
  Eye, Check, X, HardHat, MapPin, Printer, Download, ChevronDown,
  FileSpreadsheet, Ticket, Send
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { addPdfHeaderWithLogo, addPdfFooterWithLogo, escapeHtml } from '../../utils/pdfHeaderHelper';
import './operations-dashboard.css';

const ExpensesTab = ({
  expenses = [],
  projects = [],
  supervisors = [],
  onApproveExpense,
  onForwardExpense,
  onRejectExpense,
  onOpenSubmitExpense,
  onInspectExpense
}) => {
  const { language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [supervisorFilter, setSupervisorFilter] = useState('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectModalClaim, setInspectModalClaim] = useState(null);
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);

  // Forward Modal State
  const [forwardModalClaim, setForwardModalClaim] = useState(null);
  const [forwardTargetDept, setForwardTargetDept] = useState('Accounts & Finance');
  const [forwardNotes, setForwardNotes] = useState('');
  const [forwardPriority, setForwardPriority] = useState('Standard');

  // Unified Action Dropdown State
  const [openActionDropdownId, setOpenActionDropdownId] = useState(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setOpenActionDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Calculations
  const totalAmount = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingClaims = expenses.filter(e => e.status === 'Pending');
  const pendingAmount = pendingClaims.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const approvedClaims = expenses.filter(e => e.status === 'Approved');
  const approvedAmount = approvedClaims.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const rejectedClaims = expenses.filter(e => e.status === 'Rejected');

  // Unique supervisors list for filter dropdown
  const uniqueSupervisors = Array.from(new Set([
    ...supervisors.map(s => s.name).filter(Boolean),
    ...expenses.map(e => e.supervisorName || e.submittedBy).filter(Boolean)
  ])).sort();

  // Filtering
  const filteredExpenses = expenses.filter(e => {
    const titleStr = e.description || e.title || '';
    const projectStr = e.projectName || '';
    const supStr = e.supervisorName || e.submittedBy || '';
    const vendorStr = e.vendorName || e.vendor || '';
    const idStr = e.id || '';
    const voucherStr = e.voucherNo || e.invoiceNumber || '';

    const matchesSearch =
      titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projectStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendorStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucherStr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesSupervisor = supervisorFilter === 'All' || (e.supervisorName || e.submittedBy) === supervisorFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesSupervisor;
  });

  const categories = ['All', 'Material Purchase', 'Local Conveyance', 'Labor Wages', 'Site Food & Refreshment', 'Equipment Rental'];

  // 1-Click Excel CSV Exporter
  const handleExportCSV = () => {
    const headers = ['Expense ID', 'Date', 'Project Name', 'Voucher No', 'Category', 'Supervisor', 'Vendor', 'Amount (INR)', 'Status', 'Description'];
    const rows = filteredExpenses.map(e => [
      `"${e.id || ''}"`,
      `"${e.date || ''}"`,
      `"${(e.projectName || '').replace(/"/g, '""')}"`,
      `"${e.voucherNo || ''}"`,
      `"${e.category || ''}"`,
      `"${e.supervisorName || ''}"`,
      `"${(e.vendorName || '').replace(/"/g, '""')}"`,
      `"${e.amount || 0}"`,
      `"${e.status || ''}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ASEMS_Bill_Approve_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1-Click Direct Official PDF Download
  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF();
      const startY = await addPdfHeaderWithLogo(
        doc,
        'Operational Expenses & Bill Approvals Audit Report',
        `Generated on: ${new Date().toLocaleDateString('en-GB')} | Total Records: ${filteredExpenses.length} | Official Operations Ledger`
      );

      // Summary Box
      autoTable(doc, {
        startY: startY + 2,
        head: [['TOTAL EXPENSES', 'APPROVED AMOUNT', 'PENDING REVIEW']],
        body: [[
          `Rs. ${totalAmount.toLocaleString('en-IN')}`,
          `Rs. ${approvedAmount.toLocaleString('en-IN')}`,
          `Rs. ${pendingAmount.toLocaleString('en-IN')}`
        ]],
        theme: 'grid',
        styles: { fontSize: 9, fontStyle: 'bold', halign: 'center' },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] }
      });

      const expData = filteredExpenses.map(e => [
        e.id,
        e.date,
        e.projectName,
        e.voucherNo || 'VCH-GEN',
        `[${e.category}]\n${e.description}`,
        e.supervisorName,
        `Rs. ${(e.amount || 0).toLocaleString('en-IN')}`,
        e.status
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [['ID', 'DATE', 'PROJECT / SITE', 'VOUCHER NO', 'CATEGORY & DESC', 'SUPERVISOR', 'AMOUNT', 'STATUS']],
        body: expData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] }
      });

      // Add official company footer across all pages
      await addPdfFooterWithLogo(doc);

      const filename = `ASEMS_Expenses_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success('Expenses PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download PDF: ' + err.message);
    }
  };

  // Generate Official Print HTML with Company Logo & Clean Ledger Table
  const generateExpensesPrintHtml = () => {
    const rows = filteredExpenses.map(e => `
      <tr>
        <td style="font-weight: 800; font-family: monospace; text-align: center;">${e.id}</td>
        <td>${e.date}</td>
        <td><strong>${escapeHtml(e.projectName)}</strong></td>
        <td><code>${escapeHtml(e.voucherNo || 'VCH-GEN')}</code></td>
        <td><strong>${escapeHtml(e.category)}</strong><br/><span style="color:#64748b; font-size:10px;">${escapeHtml(e.description)}</span></td>
        <td>${escapeHtml(e.supervisorName)}</td>
        <td style="font-weight: 800; color: #1e3a8a; text-align: right;">₹${(e.amount || 0).toLocaleString('en-IN')}</td>
        <td style="text-align: center;"><span class="badge ${e.status === 'Approved' ? 'badge-approved' : e.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}">${e.status}</span></td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Operational Expenses Audit Report - Aarya Innovtech</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 15px; color: #0f172a; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 15px; }
          .title { font-size: 17px; font-weight: 800; color: #0f172a; margin: 0; }
          .subtitle { font-size: 10px; color: #64748b; margin-top: 3px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px; }
          .stat-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; background: #f8fafc; }
          .stat-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; }
          .stat-val { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10px; }
          th { background: #f1f5f9; padding: 7px 9px; border: 1px solid #cbd5e1; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 9px; color: #334155; }
          td { padding: 7px 9px; border: 1px solid #e2e8f0; vertical-align: middle; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 9999px; font-weight: 800; font-size: 9px; }
          .badge-approved { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
          .badge-pending { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
          .badge-rejected { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
          .footer { border-top: 1.5px solid #cbd5e1; padding-top: 12px; margin-top: 20px; font-size: 10px; color: #475569; }
          .footer-sig { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .footer-company { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; padding-top: 8px; font-size: 9.5px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${window.location.origin}/logo_new.png" alt="Aarya Innovtech Pvt. Ltd." style="height: 44px; object-fit: contain;" />
            <div>
              <h1 class="title">Operational Expenses & Bill Approvals Audit Report</h1>
              <div class="subtitle">AARYA INNOVTECH PVT. LTD. | Official Site Operations Ledger</div>
            </div>
          </div>
          <div style="text-align: right; font-size: 10px; color: #64748b;">
            <strong>Generated Date:</strong> ${new Date().toLocaleDateString('en-GB')}<br/>
            ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box" style="border-left: 4px solid #6366f1;">
            <div class="stat-label">Total Expenses</div>
            <div class="stat-val">₹${totalAmount.toLocaleString('en-IN')}</div>
          </div>
          <div class="stat-box" style="border-left: 4px solid #10b981;">
            <div class="stat-label">Approved Amount</div>
            <div class="stat-val" style="color:#10b981;">₹${approvedAmount.toLocaleString('en-IN')}</div>
          </div>
          <div class="stat-box" style="border-left: 4px solid #ef4444;">
            <div class="stat-label">Pending Review</div>
            <div class="stat-val" style="color:#ef4444;">₹${pendingAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: center;">ID</th>
              <th>DATE</th>
              <th>PROJECT / SITE</th>
              <th>VOUCHER NO</th>
              <th>CATEGORY & DESC</th>
              <th>SUPERVISOR</th>
              <th style="text-align: right;">AMOUNT</th>
              <th style="text-align: center;">STATUS</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          <div class="footer-sig">
            <div>Verified By: <strong>Accounts & Operations Desk</strong></div>
            <div>Authorized Sign: _______________________ <strong>(Auditor / Operations Head)</strong></div>
          </div>
          <div class="footer-company">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="${window.location.origin}/logo_new.png" alt="Logo" style="height: 20px; object-fit: contain;" />
              <div><strong>AARYA INNOVTECH PVT. LTD.</strong> | CIN: U29305MH2019PTC327551 | Ph: +91 9359604384 | Makhamalabad Road, Nashik</div>
            </div>
            <div>Generated by ASEMS System</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintExpenses = () => {
    try {
      let iframe = document.getElementById('exp-print-frame');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'exp-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(generateExpensesPrintHtml());
      doc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }, 300);
    } catch (err) {
      console.error("Print Error:", err);
      window.print();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
      {/* 1. Header with Title & Action Buttons (Print, Excel, PDF & + Submit Expense) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '900',
            color: 'var(--text-primary, #0f172a)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            lineHeight: 1.2
          }}>
            <IndianRupee style={{ color: '#10b981' }} size={28} />
            <span>Bill Approve</span>
          </h1>
          <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary, #64748b)', margin: '0.25rem 0 0 0', fontWeight: '500' }}>
            Review daily field expenditures, audit supervisor bills & authorize disbursements.
          </p>
        </div>

        {/* Top Header Buttons: Print, Excel & PDF */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* 🖨️ Print Button */}
          <button
            onClick={handlePrintExpenses}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: '1.5px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--card-bg, #ffffff)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.92rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--input-bg, #f8fafc)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--card-bg, #ffffff)';
            }}
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          {/* 📄 Excel Button (Green Outline) */}
          <button
            onClick={handleExportCSV}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: '1.5px solid #16a34a',
              backgroundColor: 'var(--card-bg, #ffffff)',
              color: '#16a34a',
              fontSize: '0.92rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(22, 163, 74, 0.12)';
              e.currentTarget.style.borderColor = '#15803d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--card-bg, #ffffff)';
              e.currentTarget.style.borderColor = '#16a34a';
            }}
          >
            <FileSpreadsheet size={16} style={{ color: '#16a34a' }} />
            <span>Excel</span>
          </button>

          {/* 📥 PDF Button (Red Outline) */}
          <button
            onClick={handleExportPDF}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: '1.5px solid #dc2626',
              backgroundColor: 'var(--card-bg, #ffffff)',
              color: '#dc2626',
              fontSize: '0.92rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease'
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

      {/* 2. Four Clean Interactive Stat Cards (Live Filter & Active Highlight) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        width: '100%'
      }}>
        {/* Card 1: Total Bills (Purple Left Border - Filters All) */}
        <div
          onClick={() => {
            setStatusFilter('All');
            setShowBudgetBreakdown(false);
          }}
          style={{
            backgroundColor: statusFilter === 'All' && !showBudgetBreakdown ? 'rgba(99, 102, 241, 0.16)' : 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: statusFilter === 'All' && !showBudgetBreakdown ? '2px solid #6366f1' : '1px solid var(--border-color, #e8ecf2)',
            borderLeft: '5px solid #6366f1',
            boxShadow: statusFilter === 'All' && !showBudgetBreakdown ? '0 8px 20px -4px rgba(99, 102, 241, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            cursor: 'pointer',
            transform: statusFilter === 'All' && !showBudgetBreakdown ? 'translateY(-2px)' : 'none',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = statusFilter === 'All' && !showBudgetBreakdown ? 'translateY(-2px)' : 'translateY(0)'}
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
            <FileText size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', lineHeight: 1.1 }}>
              {expenses.length}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary, #64748b)', marginTop: '0.2rem' }}>
              Total Bills
            </div>
          </div>
        </div>

        {/* Card 2: Pending Review (Red Left Border - Filters Pending) */}
        <div
          onClick={() => {
            setStatusFilter('Pending');
            setShowBudgetBreakdown(false);
          }}
          style={{
            backgroundColor: statusFilter === 'Pending' && !showBudgetBreakdown ? 'rgba(239, 68, 68, 0.16)' : 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: statusFilter === 'Pending' && !showBudgetBreakdown ? '2px solid #ef4444' : '1px solid var(--border-color, #e8ecf2)',
            borderLeft: '5px solid #ef4444',
            boxShadow: statusFilter === 'Pending' && !showBudgetBreakdown ? '0 8px 20px -4px rgba(239, 68, 68, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            cursor: 'pointer',
            transform: statusFilter === 'Pending' && !showBudgetBreakdown ? 'translateY(-2px)' : 'none',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = statusFilter === 'Pending' && !showBudgetBreakdown ? 'translateY(-2px)' : 'translateY(0)'}
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
            <Clock size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', lineHeight: 1.1 }}>
              {pendingClaims.length}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary, #64748b)', marginTop: '0.2rem' }}>
              Pending Review
            </div>
          </div>
        </div>

        {/* Card 3: Active Sites (Blue Left Border - Toggles Site Budget Breakdown) */}
        <div
          onClick={() => {
            setShowBudgetBreakdown(!showBudgetBreakdown);
          }}
          style={{
            backgroundColor: showBudgetBreakdown ? 'rgba(59, 130, 246, 0.16)' : 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: showBudgetBreakdown ? '2px solid #3b82f6' : '1px solid var(--border-color, #e8ecf2)',
            borderLeft: '5px solid #3b82f6',
            boxShadow: showBudgetBreakdown ? '0 8px 20px -4px rgba(59, 130, 246, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            cursor: 'pointer',
            transform: showBudgetBreakdown ? 'translateY(-2px)' : 'none',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = showBudgetBreakdown ? 'translateY(-2px)' : 'translateY(0)'}
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
            <Building size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', lineHeight: 1.1 }}>
              {projects.length || 3}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary, #64748b)', marginTop: '0.2rem' }}>
              Active Sites
            </div>
          </div>
        </div>

        {/* Card 4: Approved Bills (Green Left Border - Filters Approved) */}
        <div
          onClick={() => {
            setStatusFilter('Approved');
            setShowBudgetBreakdown(false);
          }}
          style={{
            backgroundColor: statusFilter === 'Approved' && !showBudgetBreakdown ? 'rgba(16, 185, 129, 0.16)' : 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: statusFilter === 'Approved' && !showBudgetBreakdown ? '2px solid #10b981' : '1px solid var(--border-color, #e8ecf2)',
            borderLeft: '5px solid #10b981',
            boxShadow: statusFilter === 'Approved' && !showBudgetBreakdown ? '0 8px 20px -4px rgba(16, 185, 129, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem',
            cursor: 'pointer',
            transform: statusFilter === 'Approved' && !showBudgetBreakdown ? 'translateY(-2px)' : 'none',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = statusFilter === 'Approved' && !showBudgetBreakdown ? 'translateY(-2px)' : 'translateY(0)'}
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
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', lineHeight: 1.1 }}>
              {approvedClaims.length}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary, #64748b)', marginTop: '0.2rem' }}>
              Approved Bills
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Expandable Active Projects Expense Breakdown */}
      {showBudgetBreakdown && (
        <div style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '16px',
          border: '1.5px solid var(--border-color, #bfdbfe)',
          boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.12)',
          padding: '1.25rem 1.45rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-primary, #0f172a)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={20} style={{ color: '#2563eb' }} />
                Active Projects & Site Expenses
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #64748b)', margin: '0.2rem 0 0 0' }}>
                Active site locations, assigned supervisors & total incurred expenses.
              </p>
            </div>
            <button
              onClick={() => setShowBudgetBreakdown(false)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: 'var(--input-bg, #f8fafc)',
                color: 'var(--text-secondary, #64748b)',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* Project Sites Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}>
            {[
              { name: 'Sangamner Eco Toilet', supervisor: 'Mr. Rohit Sharma', spent: 42000, bills: 2, color: '#2563eb' },
              { name: 'Pune Metro Station P2', supervisor: 'Mr. Amit Deshmukh', spent: 68000, bills: 3, color: '#10b981' },
              { name: 'Nashik Highway Hub P3', supervisor: 'Mr. Sagar Patil', spent: 29550, bills: 1, color: '#f59e0b' }
            ].map((p) => {
              return (
                <div key={p.name} style={{
                  padding: '1.1rem',
                  borderRadius: '14px',
                  backgroundColor: 'var(--input-bg, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.96rem', color: 'var(--text-primary, #0f172a)' }}>{p.name}</strong>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: p.color, backgroundColor: 'var(--card-bg, #ffffff)', border: `1px solid ${p.color}`, padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                      {p.bills} Bills
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem', color: 'var(--text-secondary, #475569)', borderTop: '1px dashed var(--border-color, #e2e8f0)', paddingTop: '0.6rem' }}>
                    <span>Supervisor: <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{p.supervisor}</strong></span>
                    <span style={{ fontSize: '1rem', fontWeight: '900', color: p.color }}>
                      ₹{p.spent.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
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
            placeholder="Search by Bill ID, Site Project, or Category..."
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

        {/* Right: Dropdown Filters (All Statuses & All Categories / Priorities) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          flexWrap: 'wrap'
        }}>
          {/* Supervisor Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={supervisorFilter}
              onChange={(e) => setSupervisorFilter(e.target.value)}
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
              <option value="All">All Supervisors</option>
              {uniqueSupervisors.map((sup) => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
            <Filter size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #64748b)', pointerEvents: 'none' }} />
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #64748b)', pointerEvents: 'none' }} />
          </div>

          {/* Status Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Forwarded">Forwarded to Accounts</option>
              <option value="Approved">Approved Bills</option>
              <option value="Rejected">Rejected Bills</option>
            </select>
            <Filter size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #64748b)', pointerEvents: 'none' }} />
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #64748b)', pointerEvents: 'none' }} />
          </div>

          {/* Category Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
            <Filter size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #64748b)', pointerEvents: 'none' }} />
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #64748b)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* 4. Sleek Expenses Table */}
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #e8ecf2)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        width: '100%'
      }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', minWidth: '1080px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
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
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', minWidth: '145px', width: '145px' }}>BILL ID</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', minWidth: '135px' }}>DATE</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', minWidth: '180px' }}>PROJECT</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', minWidth: '170px' }}>ITEM</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', minWidth: '130px' }}>CATEGORY</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', minWidth: '140px' }}>SUPERVISOR</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', minWidth: '110px' }}>AMOUNT</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '140px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary, #94a3b8)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                      <FileText size={36} style={{ color: 'var(--text-secondary, #cbd5e1)' }} />
                      <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-secondary, #64748b)' }}>
                        {language === 'mr' ? 'कोणतेही खर्च सापडले नाहीत.' : 'No expenses logged yet.'}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>
                        {language === 'mr' ? 'नवीन खर्च नोंदवण्यासाठी "+ Log New Expense" बटणावर क्लिक करा.' : 'Click "+ Log New Expense" to record a new site expense.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp, idx) => {
                  const isPending = exp.status === 'Pending';
                  const isApproved = exp.status === 'Approved';
                  const isForwarded = exp.status === 'Forwarded';
                  const isRejected = exp.status === 'Rejected';

                return (
                  <tr
                    key={exp.id}
                    style={{
                      borderBottom: idx === filteredExpenses.length - 1 ? 'none' : '1px solid var(--border-color, #f1f5f9)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-hover, rgba(241, 245, 249, 0.6))'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* BILL ID */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', whiteSpace: 'nowrap', minWidth: '145px', width: '145px' }}>
                      <strong style={{ 
                        color: 'var(--text-primary, #0f172a)', 
                        fontSize: '0.94rem', 
                        fontWeight: '800', 
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                        letterSpacing: '0.03em'
                      }}>
                        {exp.id}
                      </strong>
                    </td>

                    {/* DATE */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={13} style={{ color: '#2563eb', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '700', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                          {exp.date ? new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '23 Aug 2026'}
                        </span>
                      </div>
                      {exp.time && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', marginTop: '0.15rem', paddingLeft: '1.1rem' }}>
                          {exp.time}
                        </div>
                      )}
                    </td>

                    {/* PROJECT / SITE */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle' }}>
                      <div style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '700', fontSize: '0.92rem' }}>
                        {exp.projectName || 'Site Project'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #64748b)', marginTop: '0.15rem', fontWeight: '500' }}>
                        {exp.voucherNo || 'VCH-GEN'}
                      </div>
                    </td>

                    {/* ITEM / REASON */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', maxWidth: '200px' }}>
                      {(() => {
                        const desc = exp.description || exp.title || '';
                        const d = desc.toLowerCase();
                        let shortName = desc;

                        if (d.includes('cement') || d.includes('pvc') || d.includes('pipe') || d.includes('foundation') || d.includes('bags')) {
                          shortName = 'Cement & Pipes';
                        } else if (d.includes('tempo') || d.includes('freight') || d.includes('swargate') || d.includes('travel') || d.includes('transport')) {
                          shortName = 'Tempo / Transport';
                        } else if (d.includes('excavation') || d.includes('labor') || d.includes('helper') || d.includes('wages') || d.includes('workers')) {
                          shortName = 'Labor Wages';
                        } else if (d.includes('food') || d.includes('tea') || d.includes('refreshment')) {
                          shortName = 'Food & Tea';
                        } else if (d.includes('generator') || d.includes('equipment') || d.includes('machine')) {
                          shortName = 'Equipment Rental';
                        } else if (desc.length > 25) {
                          shortName = desc.split(' ').slice(0, 3).join(' ');
                        }

                        return (
                          <div style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '700', fontSize: '0.92rem' }}>
                            {shortName || 'Site Expense'}
                          </div>
                        );
                      })()}
                    </td>

                    {/* CATEGORY */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle' }}>
                      {(() => {
                        const cat = exp.category || 'Material';
                        const isTransport = cat.toLowerCase().includes('conveyance') || cat.toLowerCase().includes('transport') || cat.toLowerCase().includes('travel') || cat.toLowerCase().includes('local');
                        const isLabor = cat.toLowerCase().includes('labor') || cat.toLowerCase().includes('wages');
                        const isFood = cat.toLowerCase().includes('food') || cat.toLowerCase().includes('tea');
                        const isEquip = cat.toLowerCase().includes('equipment') || cat.toLowerCase().includes('rental');

                        let label = 'MATERIAL';
                        let bg = 'rgba(239, 68, 68, 0.12)';
                        let color = '#f87171';
                        let border = 'rgba(239, 68, 68, 0.3)';

                        if (isTransport) {
                          label = 'TRANSPORT';
                          bg = 'rgba(34, 197, 94, 0.12)';
                          color = '#4ade80';
                          border = 'rgba(34, 197, 94, 0.3)';
                        } else if (isLabor) {
                          label = 'LABOR';
                          bg = 'rgba(59, 130, 246, 0.12)';
                          color = '#60a5fa';
                          border = 'rgba(59, 130, 246, 0.3)';
                        } else if (isFood) {
                          label = 'FOOD & TEA';
                          bg = 'rgba(245, 158, 11, 0.12)';
                          color = '#fbbf24';
                          border = 'rgba(245, 158, 11, 0.3)';
                        } else if (isEquip) {
                          label = 'EQUIPMENT';
                          bg = 'rgba(168, 85, 247, 0.12)';
                          color = '#c084fc';
                          border = 'rgba(168, 85, 247, 0.3)';
                        }

                        return (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            backgroundColor: bg,
                            color: color,
                            border: `1px solid ${border}`,
                            display: 'inline-block',
                            letterSpacing: '0.04em'
                          }}>
                            {label}
                          </span>
                        );
                      })()}
                    </td>

                    {/* SUPERVISOR */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle' }}>
                      <span style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '600', fontSize: '0.9rem' }}>
                        {exp.supervisorName || 'Supervisor'}
                      </span>
                    </td>

                    {/* AMOUNT */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)' }}>
                        ₹{(exp.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'center' }}>
                        {/* View Bill Button */}
                        <button
                          onClick={() => setInspectModalClaim(exp)}
                          style={{
                            padding: '0.45rem 0.8rem',
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
                          View Bill
                        </button>

                        {/* Pending / Forwarded State: Single Approve & Forward Button + Separate Reject Button */}
                        {isPending || isForwarded ? (
                          <>
                            {/* Single Approve & Forward Button */}
                            <button
                              onClick={() => {
                                if (onApproveExpense) {
                                  onApproveExpense(exp.id, 'Approved and forwarded to Accounts');
                                }
                              }}
                              title="Approve and Forward to Accounts"
                              style={{
                                padding: '0.45rem 0.85rem',
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
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.45)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
                              }}
                            >
                              <CheckCircle2 size={13} />
                              <span>+ Approve & Forward</span>
                            </button>

                            {/* Separate Reject Button */}
                            <button
                              onClick={() => {
                                if (onRejectExpense) {
                                  onRejectExpense(exp.id, 'Claim rejected by operations');
                                }
                              }}
                              title="Reject Claim"
                              style={{
                                padding: '0.45rem 0.75rem',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                fontSize: '0.82rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.18)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : isApproved ? (
                          <button
                            onClick={() => {
                              if (onApproveExpense) {
                                onApproveExpense(exp.id, 'Reset to Pending', 'Pending');
                              }
                            }}
                            title="Click to reset back to Pending"
                            style={{
                              padding: '0.45rem 0.85rem',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(16, 185, 129, 0.12)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: '#10b981',
                              fontSize: '0.82rem',
                              fontWeight: '800',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              whiteSpace: 'nowrap',
                              minWidth: '120px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.22)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
                            }}
                          >
                            <CheckCircle2 size={14} />
                            <span>Approved</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (onApproveExpense) {
                                onApproveExpense(exp.id, 'Reset to Pending', 'Pending');
                              }
                            }}
                            title="Click to reset back to Pending"
                            style={{
                              padding: '0.45rem 0.85rem',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              fontSize: '0.82rem',
                              fontWeight: '800',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              whiteSpace: 'nowrap',
                              minWidth: '120px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.22)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                            }}
                          >
                            <X size={14} />
                            <span>Rejected</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 Forward Expense Claim Modal */}
      {forwardModalClaim && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            maxWidth: '540px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color, #f1f5f9)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Send size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                    Forward Expense Claim
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', margin: '0.15rem 0 0 0' }}>
                    Route claim <strong style={{ color: '#0284c7' }}>{forwardModalClaim.id}</strong> to recipient department
                  </p>
                </div>
              </div>
              <button
                onClick={() => setForwardModalClaim(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary, #64748b)',
                  padding: '0.4rem',
                  borderRadius: '8px',
                  display: 'flex'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Claim Summary Card */}
            <div style={{
              backgroundColor: 'var(--input-bg, #f8fafc)',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase' }}>Project / Site</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', marginTop: '0.15rem' }}>{forwardModalClaim.projectName || 'Site Project'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase' }}>Claim Amount</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#2563eb', marginTop: '0.15rem' }}>₹{(forwardModalClaim.amount || 0).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase' }}>Voucher No</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary, #0f172a)', marginTop: '0.15rem' }}>{forwardModalClaim.voucherNo || 'VCH-GEN'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase' }}>Supervisor</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary, #0f172a)', marginTop: '0.15rem' }}>{forwardModalClaim.supervisorName || 'Supervisor'}</div>
              </div>
            </div>

            {/* Form: Forward Destination */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)' }}>
                Forward To Department / Team <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={forwardTargetDept}
                onChange={(e) => setForwardTargetDept(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  color: 'var(--text-primary, #0f172a)',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  outline: 'none'
                }}
              >
                <option value="Accounts & Finance">🏢 Accounts & Finance (Disbursement & Settlement)</option>
                <option value="Head Office / Management">👔 Head Office / General Management</option>
                <option value="Internal Audit Desk">📋 Internal Audit & Compliance Desk</option>
                <option value="Project Director">🏗️ Project Director / Technical Lead</option>
              </select>
            </div>

            {/* Form: Priority */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)' }}>
                Priority Level
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['Standard', 'Urgent / Express'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForwardPriority(p)}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      border: forwardPriority === p ? '2px solid #2563eb' : '1px solid var(--border-color, #cbd5e1)',
                      backgroundColor: forwardPriority === p ? 'rgba(37, 99, 235, 0.08)' : 'var(--input-bg, #ffffff)',
                      color: forwardPriority === p ? '#2563eb' : 'var(--text-primary, #475569)',
                      fontWeight: '800',
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Form: Notes / Instructions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)' }}>
                Forwarding Notes & Remarks (Optional)
              </label>
              <textarea
                placeholder="e.g. Verified site voucher. Please process RTGS payment to vendor directly."
                value={forwardNotes}
                onChange={(e) => setForwardNotes(e.target.value)}
                rows={2}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--input-bg, #ffffff)',
                  color: 'var(--text-primary, #0f172a)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setForwardModalClaim(null)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--input-bg, #f1f5f9)',
                  color: 'var(--text-primary, #475569)',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onForwardExpense) {
                    onForwardExpense(forwardModalClaim.id, forwardTargetDept, forwardNotes);
                  } else {
                    toast.success(`Expense ${forwardModalClaim.id} forwarded to ${forwardTargetDept}!`);
                  }
                  setForwardModalClaim(null);
                }}
                style={{
                  flex: 1.5,
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
                }}
              >
                <Send size={15} />
                <span>Confirm & Forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Preview Modal */}
      {inspectModalClaim && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #334155)',
            maxWidth: '520px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                Vendor Bill Preview ({inspectModalClaim.voucherNo})
              </h3>
              <button onClick={() => setInspectModalClaim(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary, #64748b)' }}>
                <X size={20} />
              </button>
            </div>

            <img
              src={inspectModalClaim.billPhotoUrl}
              alt="Bill Voucher"
              style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary, #475569)' }}>
              <span>{inspectModalClaim.projectName}</span>
              <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '1rem' }}>₹{inspectModalClaim.amount?.toLocaleString('en-IN')}</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {inspectModalClaim.status !== 'Approved' && inspectModalClaim.status !== 'Rejected' && (
                <>
                  <button
                    onClick={() => {
                      const claimId = inspectModalClaim.id;
                      if (onApproveExpense) {
                        onApproveExpense(claimId, 'Approved and forwarded to Accounts');
                      }
                      setInspectModalClaim(null);
                    }}
                    style={{
                      flex: 1.4,
                      padding: '0.65rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>+ Approve & Forward</span>
                  </button>

                  <button
                    onClick={() => {
                      const claimId = inspectModalClaim.id;
                      if (onRejectExpense) {
                        onRejectExpense(claimId, 'Claim rejected from bill review');
                      }
                      setInspectModalClaim(null);
                    }}
                    style={{
                      flex: 0.9,
                      padding: '0.65rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <X size={14} />
                    <span>Reject</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setInspectModalClaim(null)}
                style={{
                  flex: 0.8,
                  padding: '0.65rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--input-bg, #f1f5f9)',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  color: 'var(--text-primary, #475569)',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;
