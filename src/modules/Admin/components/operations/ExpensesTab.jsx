import React, { useState, useEffect } from 'react';
import {
  IndianRupee, CheckCircle2, XCircle, Clock, FileText,
  Search, Filter, Plus, Calendar, Building, User, Users,
  ExternalLink, ArrowUpRight, AlertCircle, Sparkles, Tag,
  Eye, Check, X, HardHat, MapPin, Printer, Download, ChevronDown,
  FileSpreadsheet, Ticket, Edit3, Edit2, Trash2, Mail, Phone, Briefcase
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { addPdfHeaderWithLogo, addPdfFooterWithPageNumbers, getCompanyLogoBase64 } from '../../utils/pdfHeaderHelper';
import './operations-dashboard.css';

const ExpensesTab = ({
  activeTab = 'expenses',
  expenses = [],
  projects = [],
  accountants = [],
  onApproveExpense,
  onRejectExpense,
  onOpenSubmitExpense,
  onInspectExpense,
  onOpenCreateAccountant,
  onEditAccountant,
  onDeleteAccountant
}) => {
  const { language } = useLanguage();
  const [activeSubView, setActiveSubView] = useState(activeTab === 'accountant' ? 'accountants' : 'bills'); // 'bills' | 'accountants'

  React.useEffect(() => {
    if (activeTab === 'accountant') {
      setActiveSubView('accountants');
    } else if (activeTab === 'expenses') {
      setActiveSubView('bills');
    }
  }, [activeTab]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectModalClaim, setInspectModalClaim] = useState(null);
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);

  // Calculations
  const totalAmount = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingClaims = expenses.filter(e => e.status === 'Pending');
  const pendingAmount = pendingClaims.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const approvedClaims = expenses.filter(e => e.status === 'Approved');
  const approvedAmount = approvedClaims.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const rejectedClaims = expenses.filter(e => e.status === 'Rejected');

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

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredAccountants = accountants.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      (a.name || '').toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.phone || '').toLowerCase().includes(q) ||
      (a.role || '').toLowerCase().includes(q) ||
      (a.branch || '').toLowerCase().includes(q)
    );
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

      // Add corporate footer with page numbers
      addPdfFooterWithPageNumbers(doc);

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
        <td><strong>${e.projectName}</strong></td>
        <td><code>${e.voucherNo || 'VCH-GEN'}</code></td>
        <td><strong>${e.category}</strong><br/><span style="color:#64748b; font-size:10px;">${e.description}</span></td>
        <td>${e.supervisorName}</td>
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
          .footer { border-top: 1px solid #cbd5e1; padding-top: 12px; margin-top: 20px; display: flex; justify-content: space-between; font-size: 10px; color: #475569; }
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
          <div>Verified By: <strong>Accounts & Operations Desk</strong></div>
          <div>Authorized Sign: _______________________ <strong>(Auditor / Operations Head)</strong></div>
        </div>
      </body>
      </html>
    `;
  };

  // 1-Click Accountant Excel CSV Export Handler
  const handleExportAccountantsCSV = () => {
    try {
      const csvRows = [
        ['SR NO', 'Accountant Name', 'Phone', 'Email', 'Office Branch / Location', 'Status'],
        ...filteredAccountants.map((acc, idx) => [
          idx + 1,
          `"${acc.name || ''}"`,
          `"${acc.phone || ''}"`,
          `"${acc.email || ''}"`,
          `"${acc.branch || 'Head Office - Pune'}"`,
          `"${acc.status || 'Active'}"`
        ])
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ASEMS_Accountants_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(language === 'mr' ? 'अकाउंटंट CSV डाऊनलोड झाली!' : 'Accountants CSV Exported successfully!');
    } catch (err) {
      toast.error('Failed to export CSV: ' + err.message);
    }
  };

  // 1-Click Accountant PDF Download
  const handleExportAccountantsPDF = async () => {
    try {
      const doc = new jsPDF();
      const startY = await addPdfHeaderWithLogo(
        doc,
        'Registered Accountants & Financial Auditors Roster',
        `Generated on: ${new Date().toLocaleDateString('en-GB')} | Total Accountants: ${filteredAccountants.length} | Official Operations Ledger`
      );

      const tableData = filteredAccountants.map((acc, idx) => [
        idx + 1,
        `${acc.name}\n${acc.email || '-'}`,
        acc.phone || '-',
        acc.branch || 'Head Office - Pune',
        (acc.status || 'Active').toUpperCase()
      ]);

      autoTable(doc, {
        startY: startY + 2,
        head: [['SR NO', 'ACCOUNTANT & EMAIL', 'PHONE', 'OFFICE BRANCH / LOCATION', 'STATUS']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' }
      });

      // Add corporate footer with page numbers
      addPdfFooterWithPageNumbers(doc);

      const filename = `ASEMS_Accountants_List_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success(language === 'mr' ? 'अकाउंटंट PDF यशस्वीरित्या डाऊनलोड झाली!' : 'Accountants PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF: ' + err.message);
    }
  };

  // 1-Click Accountant Print Handler
  const handlePrintAccountants = async () => {
    try {
      const logoBase64 = await getCompanyLogoBase64();
      const logoSrc = logoBase64 || '/logo_new.png';

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        window.print();
        return;
      }

      const tableRowsHtml = filteredAccountants.map((acc, index) => `
        <tr>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; font-weight: bold; text-align: center;">${index + 1}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">
            <div>${acc.name}</div>
            <div style="font-size: 10px; color: #64748b; font-weight: normal;">${acc.email || '-'}</div>
          </td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #059669; font-weight: bold;">${acc.phone || '-'}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; color: #334155;">${acc.branch || 'Head Office - Pune'}</td>
          <td style="padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center;">
            <span style="background: #ecfdf5; color: #059669; font-weight: 800; padding: 3px 8px; border-radius: 6px; font-size: 10px; border: 1px solid #a7f3d0;">
              ${(acc.status || 'ACTIVE').toUpperCase()}
            </span>
          </td>
        </tr>
      `).join('');

      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Aarya Innovtech - Accountants Directory</title>
          <style>
            @page { size: A4 landscape; margin: 10mm 12mm; }
            body { font-family: 'Cambria', 'Georgia', serif; color: #0f172a; margin: 0; padding: 0; }
            .header-container { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; margin-bottom: 16px; border-bottom: 2.5px solid #2563eb; }
            .logo-section { display: flex; align-items: center; gap: 16px; }
            .logo-img { height: 52px; max-width: 180px; object-fit: contain; }
            .company-info h1 { font-size: 19px; font-weight: 900; margin: 0; color: #0f172a; }
            .company-info p { font-size: 12px; color: #475569; margin: 3px 0 0 0; font-weight: 600; }
            .doc-meta { text-align: right; font-size: 11.5px; color: #334155; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { background-color: #0f172a !important; color: #ffffff !important; padding: 10px 8px; border: 1px solid #0f172a; font-weight: bold; text-align: left; }
            .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-section">
              <img src="${logoSrc}" class="logo-img" alt="Aarya Innovtech" />
              <div class="company-info">
                <h1>AI AARYA INNOVTECH PVT. LTD.</h1>
                <p>Official Accounts Executives & Financial Auditors Roster</p>
              </div>
            </div>
            <div class="doc-meta">
              <div><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div><strong>Total Accountants:</strong> ${filteredAccountants.length} Official Staff</div>
              <div><strong>Generated by:</strong> Operations Admin (ASEMS)</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 36px; text-align: center;">#</th>
                <th>Accountant Name & Email</th>
                <th>Phone Number</th>
                <th>Office Branch / Division</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>Official & Confidential • AI AARYA INNOVTECH PVT. LTD. • Accounts Operations System</span>
            <span>Printed on: ${new Date().toLocaleString('en-IN')}</span>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 300);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
    } catch (err) {
      console.error(err);
      window.print();
    }
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
      {/* 1. Dynamic Header with Title & Action Buttons (Print, Excel, PDF) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        paddingBottom: '0.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {activeSubView === 'accountants' ? (
              <Briefcase size={26} style={{ color: '#2563eb' }} />
            ) : (
              <IndianRupee size={26} style={{ color: '#10b981' }} />
            )}
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '900',
              color: 'var(--text-primary, #0f172a)',
              margin: 0,
              lineHeight: 1.2
            }}>
              {activeSubView === 'accountants'
                ? (language === 'mr' ? 'अकाउंटंट व्यवस्थापन' : 'Accountants')
                : (language === 'mr' ? 'बिल मंजुरी व खर्च' : 'Accountant & Bill Approvals')}
            </h1>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary, #64748b)', margin: '0.35rem 0 0 0', fontWeight: '500' }}>
            {activeSubView === 'accountants'
              ? (language === 'mr' ? 'सर्व सिस्टम अकाउंटंट्स, ऑफिस शाखा व लेखापरीक्षक व्यवस्थापित करा.' : 'Manage all system accountants, branch assignments, and financial auditors.')
              : (language === 'mr' ? 'दैनिक साईट खर्च तपासा, व्हाउचर ऑडिट करा व बिले मंजूर करा.' : 'Review daily field expenditures, audit supervisor invoices & authorize payment disbursements.')}
          </p>
        </div>

        {/* Top Header Buttons: Print, Excel & PDF */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* 🖨️ Print Button */}
          <button
            onClick={activeSubView === 'accountants' ? handlePrintAccountants : handlePrintExpenses}
            style={{
              padding: '0.55rem 1.05rem',
              borderRadius: '10px',
              border: '1.5px solid #0284c7',
              backgroundColor: '#ffffff',
              color: '#0284c7',
              fontSize: '0.92rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Printer size={16} />
            <span>{language === 'mr' ? 'प्रिंट' : 'Print'}</span>
          </button>

          {/* 📄 Excel Button (Green Outline) */}
          <button
            onClick={activeSubView === 'accountants' ? handleExportAccountantsCSV : handleExportCSV}
            style={{
              padding: '0.55rem 1.05rem',
              borderRadius: '10px',
              border: '1.5px solid #16a34a',
              backgroundColor: '#ffffff',
              color: '#16a34a',
              fontSize: '0.92rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>{language === 'mr' ? 'एक्सेल' : 'Excel'}</span>
          </button>

          {/* 📥 PDF Button (Red Outline) */}
          <button
            onClick={activeSubView === 'accountants' ? handleExportAccountantsPDF : handleExportPDF}
            style={{
              padding: '0.55rem 1.05rem',
              borderRadius: '10px',
              border: '1.5px solid #dc2626',
              backgroundColor: '#ffffff',
              color: '#dc2626',
              fontSize: '0.92rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Download size={16} />
            <span>{language === 'mr' ? 'पीडीएफ' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* View Switcher (Only shown in Expenses mode) */}
      {activeTab === 'expenses' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          borderBottom: '2px solid var(--border-color, #e2e8f0)',
          paddingBottom: '0.2rem',
          marginTop: '0.15rem'
        }}>
          <button
            onClick={() => setActiveSubView('bills')}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: '10px 10px 0 0',
              border: 'none',
              borderBottom: activeSubView === 'bills' ? '3px solid #10b981' : '3px solid transparent',
              backgroundColor: activeSubView === 'bills' ? '#ecfdf5' : 'transparent',
              color: activeSubView === 'bills' ? '#065f46' : '#64748b',
              fontWeight: activeSubView === 'bills' ? '800' : '600',
              fontSize: '0.96rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease'
            }}
          >
            <IndianRupee size={18} />
            <span>Bill Approvals ({expenses.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('accountants')}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: '10px 10px 0 0',
              border: 'none',
              borderBottom: activeSubView === 'accountants' ? '3px solid #2563eb' : '3px solid transparent',
              backgroundColor: activeSubView === 'accountants' ? '#eff6ff' : 'transparent',
              color: activeSubView === 'accountants' ? '#1d4ed8' : '#64748b',
              fontWeight: activeSubView === 'accountants' ? '800' : '600',
              fontSize: '0.96rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={18} />
            <span>Registered Accountants ({accountants.length})</span>
          </button>
        </div>
      )}

      {activeSubView === 'bills' && (
        <>
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
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>BILL ID</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>DATE</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>PROJECT / SITE</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>ITEM / REASON</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>CATEGORY</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>STATUS</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>SUPERVISOR</th>
                <th style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>AMOUNT</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary, #94a3b8)' }}>
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
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle' }}>
                      <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.94rem', fontWeight: '800', fontFamily: 'monospace' }}>
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

                    {/* STATUS */}
                    <td style={{ padding: '1.15rem 1.25rem', verticalAlign: 'middle' }}>
                      {isApproved ? (
                        <span style={{
                          fontSize: '0.82rem',
                          fontWeight: '800',
                          color: '#34d399',
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          Approved
                        </span>
                      ) : isPending ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color, #cbd5e1)',
                          backgroundColor: 'var(--input-bg, #ffffff)',
                          color: 'var(--text-primary, #334155)',
                          fontSize: '0.82rem',
                          fontWeight: '600'
                        }}>
                          <span>Pending</span>
                          <ChevronDown size={12} style={{ color: 'var(--text-secondary, #64748b)' }} />
                        </div>
                      ) : (
                        <span style={{
                          fontSize: '0.82rem',
                          fontWeight: '800',
                          color: '#f87171',
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          Rejected
                        </span>
                      )}
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
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', minWidth: '190px' }}>
                        {/* View Bill Button */}
                        <button
                          onClick={() => setInspectModalClaim(exp)}
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
                          View Bill
                        </button>

                        {/* + Approve Button or Approved Badge */}
                        {isPending ? (
                          <button
                            onClick={() => onApproveExpense && onApproveExpense(exp.id)}
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
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.45)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
                            }}
                          >
                            <span>+ Approve</span>
                          </button>
                        ) : isApproved ? (
                          <span style={{
                            padding: '0.42rem 0.75rem',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#10b981',
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            whiteSpace: 'nowrap'
                          }}>
                            <CheckCircle2 size={13} />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span style={{
                            padding: '0.42rem 0.75rem',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            whiteSpace: 'nowrap'
                          }}>
                            <span>Rejected</span>
                          </span>
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
    </>
  )}

      {/* 4. Registered Accountants Directory View */}
      {activeSubView === 'accountants' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
          {/* Controls Row: Search Input (Left) + Add Accountant Button (Right) */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Search Input (50% Width) */}
            <div style={{ position: 'relative', width: '50%', minWidth: '260px', boxSizing: 'border-box' }}>
              <Search size={18} style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder={language === 'mr' ? 'अकाउंटंट नाव, फोन, ईमेल किंवा शाखा शोधा...' : 'Search accountants by Name, Phone, Email, Branch, or Role...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1.2rem 0.8rem 2.85rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary, #0f172a)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                }}
              />
            </div>

            {/* ➕ Add Accountant Button (Gradient Pill Button on Right) */}
            <button
              onClick={() => {
                if (onOpenCreateAccountant) onOpenCreateAccountant();
              }}
              style={{
                padding: '0.75rem 1.6rem',
                borderRadius: '20px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
                color: '#ffffff',
                fontSize: '0.96rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.4)';
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Add Accountant</span>
            </button>
          </div>

          {/* Accountants Table */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e2e8f0)',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{
                    backgroundColor: 'var(--table-header-bg, #f8fafc)',
                    borderBottom: '1px solid var(--border-color, #e2e8f0)',
                    color: '#475569',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    <th style={{ padding: '0.9rem 1rem', width: '50px', textAlign: 'center', whiteSpace: 'nowrap' }}>ID</th>
                    <th style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap', minWidth: '220px' }}>ACCOUNTANT NAME ↕</th>
                    <th style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap', minWidth: '150px' }}>PHONE ↕</th>
                    <th style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap', minWidth: '220px' }}>OFFICE BRANCH / LOCATION ↕</th>
                    <th style={{ padding: '0.9rem 1.15rem', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }}>STATUS ↕</th>
                    <th style={{ padding: '0.9rem 1.15rem', textAlign: 'center', whiteSpace: 'nowrap', width: '120px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccountants.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
                        <Users size={38} style={{ margin: '0 auto 0.5rem auto', display: 'block', color: '#cbd5e1' }} />
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '1rem', color: '#475569' }}>
                          {language === 'mr' ? 'कोणतेही अकाउंटंट आढळले नाहीत.' : 'No accountants found'}
                        </p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                          {language === 'mr' ? 'कृपया शोध शब्द तपासा किंवा नवीन अकाउंटंट जोडा.' : 'Try adjusting your search query or add a new accountant.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAccountants.map((acc, index) => (
                      <tr 
                        key={acc.id || index}
                        style={{
                          borderBottom: '1px solid var(--border-color, #f1f5f9)',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-hover, #f8fafc)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* ID */}
                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', color: '#64748b', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
                          {index + 1}
                        </td>

                        {/* Accountant Name & Email */}
                        <td style={{ padding: '1rem', whiteSpace: 'nowrap', minWidth: '220px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '800',
                              fontSize: '0.95rem',
                              flexShrink: 0,
                              border: '1.5px solid #bfdbfe'
                            }}>
                              {acc.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.96rem', fontWeight: '800', display: 'block', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                                {acc.name}
                              </strong>
                              {acc.email && (
                                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '1px' }}>
                                  {acc.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                          <span style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: '700' }}>
                            {acc.phone || '+91 98220 77881'}
                          </span>
                        </td>

                        {/* Office Branch */}
                        <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary, #0f172a)', fontSize: '0.92rem', fontWeight: '600' }}>
                            <Building size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                            <span>{acc.branch || 'Head Office - Pune'}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '0.74rem',
                            fontWeight: '800',
                            letterSpacing: '0.04em',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            backgroundColor: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0',
                            display: 'inline-block'
                          }}>
                            {(acc.status || 'ACTIVE').toUpperCase()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                            {/* Edit Button */}
                            <button
                              onClick={() => onEditAccountant && onEditAccountant(acc)}
                              title={language === 'mr' ? 'अकाउंटंट माहिती बदला' : 'Edit Accountant Details'}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '7px',
                                border: '1.5px solid var(--border-color, #e2e8f0)',
                                backgroundColor: 'var(--input-bg, #ffffff)',
                                color: 'var(--text-secondary, #475569)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--table-hover, #f1f5f9)';
                                e.currentTarget.style.borderColor = '#94a3b8';
                                e.currentTarget.style.color = 'var(--text-primary, #0f172a)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--input-bg, #ffffff)';
                                e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
                                e.currentTarget.style.color = 'var(--text-secondary, #475569)';
                              }}
                            >
                              <Edit3 size={14} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => onDeleteAccountant && onDeleteAccountant(acc.id)}
                              title={language === 'mr' ? 'अकाउंटंट हटवा' : 'Delete Accountant'}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '7px',
                                border: 'none',
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.35)',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#dc2626';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ef4444';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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

            <button
              onClick={() => setInspectModalClaim(null)}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;
