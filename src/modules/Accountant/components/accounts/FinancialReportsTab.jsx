import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer,
  Search,
  Building2,
  Filter,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyPDFHeader, applyPDFFooter, getLogoDataUrl } from '../../utils/exportUtils';
import PrintFooter from '../PrintFooter';

const REPORT_TYPES = [
  { id: 'PROJECT_WISE', title: 'Project Wise Expense Report', subtitle: 'Itemized expense & balance analysis per installation site' },
  { id: 'CATEGORY_WISE', title: 'Category Wise Expense Breakdown', subtitle: 'Materials, Labour, Lodging, Transport & Food expenses' },
  { id: 'SUPERVISOR_WISE', title: 'Site Supervisor Ledger & Advances', subtitle: 'Advances, expenses submitted & net reconciliation per supervisor' },
  { id: 'BUDGET_VS_ACTUAL', title: 'Budget vs Actual Variance Report', subtitle: 'Sanctioned budget vs actual expenditures & remaining buffer' },
  { id: 'PAYMENT_DISBURSAL', title: 'Payment Disbursal & UTR Ledger', subtitle: 'Audit log of all bank, UPI, NEFT, and cash payouts' }
];

const FinancialReportsTab = ({ 
  projects = [], 
  expenses = [], 
  advances = [], 
  payments = [], 
  settlements = [] 
}) => {
  const [filterType, setFilterType] = useState('FY'); // 'FY' or 'DATE_RANGE'
  const [selectedReport, setSelectedReport] = useState('PROJECT_WISE');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedSupervisor, setSelectedSupervisor] = useState('ALL');
  const [financialYear, setFinancialYear] = useState('CURRENT_FY');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const activeReportMeta = REPORT_TYPES.find(r => r.id === selectedReport) || REPORT_TYPES[0];

  // Cascading supervisors list based on selected project
  const availableSupervisors = selectedProject === 'ALL'
    ? [...new Set(projects.map(p => p.supervisor).filter(Boolean))]
    : [...new Set(projects.filter(p => p.id === selectedProject).map(p => p.supervisor).filter(Boolean))];

  const handleProjectChange = (projId) => {
    setSelectedProject(projId);
    if (projId !== 'ALL') {
      const projSupervisors = projects.filter(p => p.id === projId).map(p => p.supervisor);
      if (!projSupervisors.includes(selectedSupervisor)) {
        setSelectedSupervisor('ALL');
      }
    }
  };

  // Filtered Datasets based on Project, Supervisor, Search & Date Range
  const filteredProjects = projects.filter(p => {
    const matchesProj = selectedProject === 'ALL' || p.id === selectedProject;
    const matchesSup = selectedSupervisor === 'ALL' || p.supervisor === selectedSupervisor;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.supervisor && p.supervisor.toLowerCase().includes(q)) ||
      (p.site && p.site.toLowerCase().includes(q));

    const matchesDate = 
      filterType === 'FY' ||
      ((!startDate || (p.endDate || p.startDate || '') >= startDate) &&
      (!endDate || (p.startDate || p.endDate || '') <= endDate));

    return matchesProj && matchesSup && matchesSearch && matchesDate;
  });

  const filteredExpenses = expenses.filter(e => {
    const matchesProj = selectedProject === 'ALL' || e.projectId === selectedProject;
    const matchesSup = selectedSupervisor === 'ALL' || e.supervisor === selectedSupervisor;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      (e.id && e.id.toLowerCase().includes(q)) ||
      (e.itemDescription && e.itemDescription.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q)) ||
      (e.supervisor && e.supervisor.toLowerCase().includes(q));

    const expDate = e.billDate || e.date || '';
    const matchesDate = 
      filterType === 'FY' ||
      ((!startDate || expDate >= startDate) &&
      (!endDate || expDate <= endDate));

    return matchesProj && matchesSup && matchesSearch && matchesDate;
  });

  const filteredPayments = payments.filter(p => {
    const matchesProj = selectedProject === 'ALL' || p.projectId === selectedProject;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      (p.paidTo && p.paidTo.toLowerCase().includes(q)) ||
      (p.refNumber && p.refNumber.toLowerCase().includes(q)) ||
      (p.projectName && p.projectName.toLowerCase().includes(q));

    const matchesDate = 
      filterType === 'FY' ||
      ((!startDate || (p.date || '') >= startDate) &&
      (!endDate || (p.date || '') <= endDate));

    return matchesProj && matchesSearch && matchesDate;
  });

  const handlePrint = () => {
    window.print();
  };

  // Export PDF Handler
  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const logoDataUrl = await getLogoDataUrl();
    const dateScope = (startDate || endDate) ? ` | Period: ${startDate || 'Start'} to ${endDate || 'Latest'}` : '';

    applyPDFHeader(doc, {
      title: `Financial Audit Report: ${activeReportMeta.title}`,
      metaInfo: `Generated: ${new Date().toLocaleString()} | Scope: ${selectedProject === 'ALL' ? 'All Projects' : selectedProject}${dateScope}`,
      logoDataUrl
    });

    let headers = [];
    let data = [];

    if (selectedReport === 'PROJECT_WISE') {
      headers = [['Project ID & Name', 'Site & Units', 'Site Supervisor', 'Funds Released', 'Verified Expenses', 'Site Balance']];
      data = filteredProjects.map(p => [
        `${p.id} - ${p.name}`,
        `${p.site} (${p.toilets} U)`,
        p.supervisor,
        formatPDFINR(p.fundsReleased),
        formatPDFINR(p.expenses),
        formatPDFINR(p.balance)
      ]);
    } else if (selectedReport === 'CATEGORY_WISE') {
      headers = [['Expense Category', 'Item Count', 'Total Verified Amount (INR)', 'Share of Total']];
      const categoryMap = {};
      filteredExpenses.forEach(e => {
        if (!categoryMap[e.category]) categoryMap[e.category] = { count: 0, total: 0 };
        categoryMap[e.category].count += 1;
        categoryMap[e.category].total += (e.amount || 0);
      });
      const grandTotal = Object.values(categoryMap).reduce((acc, c) => acc + c.total, 0) || 1;
      data = Object.entries(categoryMap).map(([cat, val]) => [
        cat,
        val.count,
        formatPDFINR(val.total),
        `${((val.total / grandTotal) * 100).toFixed(1)}%`
      ]);
    } else if (selectedReport === 'SUPERVISOR_WISE') {
      headers = [['Supervisor', 'Assigned Site', 'Wallet Funds Released', 'Verified Expenses', 'Live Wallet Balance']];
      data = filteredProjects.map(p => [
        p.supervisor,
        p.name,
        formatPDFINR(p.fundsReleased),
        formatPDFINR(p.expenses),
        formatPDFINR(p.balance !== undefined ? p.balance : ((p.fundsReleased || 0) - (p.expenses || 0)))
      ]);
    } else if (selectedReport === 'BUDGET_VS_ACTUAL') {
      headers = [['Project ID', 'Project Name', 'Sanctioned Budget', 'Actual Spent', 'Variance (Remaining)', 'Status']];
      data = filteredProjects.map(p => [
        p.id,
        p.name,
        formatPDFINR(p.budget),
        formatPDFINR(p.expenses),
        formatPDFINR(p.budget - p.expenses),
        p.budget >= p.expenses ? 'Within Budget' : 'Exceeded'
      ]);
    } else {
      headers = [['Date', 'Txn Ref / UTR', 'Paid To', 'Mode', 'Type', 'Amount']];
      data = filteredPayments.map(p => [
        p.date,
        p.refNumber,
        p.paidTo,
        p.paymentMode,
        p.type,
        formatPDFINR(p.amount)
      ]);
    }

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
    doc.save(`ASEMS_${selectedReport}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    let rows = [];
    if (selectedReport === 'PROJECT_WISE') {
      rows.push(['Project ID', 'Project Name', 'Site', 'Units', 'Supervisor', 'Funds Released', 'Expenses', 'Balance']);
      filteredProjects.forEach(p => rows.push([p.id, p.name, p.site, p.toilets, p.supervisor, p.fundsReleased, p.expenses, p.balance]));
    } else if (selectedReport === 'CATEGORY_WISE') {
      rows.push(['Expense Category', 'Item Count', 'Total Verified Amount']);
      const catMap = {};
      filteredExpenses.forEach(e => {
        if (!catMap[e.category]) catMap[e.category] = { count: 0, total: 0 };
        catMap[e.category].count += 1;
        catMap[e.category].total += (e.amount || 0);
      });
      Object.entries(catMap).forEach(([k, v]) => rows.push([k, v.count, v.total]));
    } else if (selectedReport === 'SUPERVISOR_WISE') {
      rows.push(['Supervisor', 'Project', 'Advances Given', 'Expenses', 'Difference']);
      filteredProjects.forEach(p => rows.push([p.supervisor, p.name, p.advance, p.expenses, p.advance - p.expenses]));
    } else if (selectedReport === 'BUDGET_VS_ACTUAL') {
      rows.push(['Project ID', 'Project Name', 'Budget', 'Actual Spent', 'Variance']);
      filteredProjects.forEach(p => rows.push([p.id, p.name, p.budget, p.expenses, p.budget - p.expenses]));
    } else {
      rows.push(['ID', 'Date', 'Project', 'Payee', 'Mode', 'Ref No', 'Amount']);
      filteredPayments.forEach(p => rows.push([p.id, p.date, p.projectName, p.paidTo, p.paymentMode, p.refNumber, p.amount]));
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASEMS_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Category Aggregation
  const categoryData = React.useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      if (!map[e.category]) map[e.category] = { count: 0, total: 0 };
      map[e.category].count += 1;
      map[e.category].total += (e.amount || 0);
    });
    const grandTotal = Object.values(map).reduce((acc, c) => acc + c.total, 0) || 1;
    return Object.entries(map).map(([cat, val]) => ({
      category: cat,
      count: val.count,
      total: val.total,
      percentage: ((val.total / grandTotal) * 100).toFixed(1)
    }));
  }, [filteredExpenses]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Right Action Header (Hidden in Print) */}
      <div className="no-print top-action-header">
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

      {/* Search & Filter Card Box */}
      <div className="no-print" style={{
        backgroundColor: 'var(--surface-bg)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.25rem 1.4rem',
        boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Top: Filter Type Radio Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            Filter Type:
          </span>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            <input 
              type="radio" 
              name="reportsFilterType" 
              value="FY" 
              checked={filterType === 'FY'} 
              onChange={() => setFilterType('FY')}
              style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Financial Year
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            <input 
              type="radio" 
              name="reportsFilterType" 
              value="DATE_RANGE" 
              checked={filterType === 'DATE_RANGE'} 
              onChange={() => setFilterType('DATE_RANGE')}
              style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Date Range
          </label>
        </div>

        {/* Bottom: Dynamic Responsive Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* 1. Report Type */}
          <div style={{ minWidth: 0 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem', whiteSpace: 'nowrap' }}>
              Report Type
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '12px',
                border: '1.5px solid #2563eb',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: '700',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
                textOverflow: 'ellipsis'
              }}
            >
              {REPORT_TYPES.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

          {/* 2. Project Name */}
          <div style={{ minWidth: 0 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem', whiteSpace: 'nowrap' }}>
              Project Name
            </label>
            <select
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
                textOverflow: 'ellipsis'
              }}
            >
              <option value="ALL">-- Select Project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.site})</option>
              ))}
            </select>
          </div>

          {/* 3. Site Supervisor */}
          <div style={{ minWidth: 0 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem', whiteSpace: 'nowrap' }}>
              Site Supervisor
            </label>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
                textOverflow: 'ellipsis'
              }}
            >
              <option value="ALL">{selectedProject === 'ALL' ? '-- All Site Supervisors --' : '-- All Project Supervisors --'}</option>
              {availableSupervisors.map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
          </div>

          {/* 4. Financial Year / Date Range */}
          {filterType === 'FY' ? (
            <div style={{ minWidth: 0 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem', whiteSpace: 'nowrap' }}>
                Financial Year
              </label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  textOverflow: 'ellipsis'
                }}
              >
                <option value="CURRENT_FY">Current FY (2026-27 / Apr-Mar)</option>
                <option value="PREV_FY">FY 2025-26</option>
                <option value="ALL">All Financial Years</option>
              </select>
            </div>
          ) : (
            <>
              {/* From Date */}
              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem', whiteSpace: 'nowrap' }}>
                  From Date
                </label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.58rem 0.75rem',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* To Date */}
              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.45rem', whiteSpace: 'nowrap' }}>
                  To Date
                </label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.58rem 0.75rem',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Standalone Search Bar directly above the report table */}
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
            placeholder="Search in report table..."
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

        {(selectedProject !== 'ALL' || selectedSupervisor !== 'ALL' || searchQuery || startDate || endDate) && (
          <button
            onClick={() => {
              setSelectedProject('ALL');
              setSelectedSupervisor('ALL');
              setSearchQuery('');
              setStartDate('');
              setEndDate('');
            }}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Active Report Table Container */}
      <div style={{
        backgroundColor: 'var(--surface-bg)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {/* Table Subtitle Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {activeReportMeta.title}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0' }}>
              {activeReportMeta.subtitle}
            </p>
          </div>
          <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '12px' }}>
            Official Audit Log
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--table-header-bg)',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.76rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {selectedReport === 'PROJECT_WISE' && (
                  <>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Project ID & Name</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Site & Units</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Supervisor</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Funds Released</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Verified Expenses</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Remaining Site Bal</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'center' }}>Status</th>
                  </>
                )}

                {selectedReport === 'CATEGORY_WISE' && (
                  <>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Expense Category</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'center' }}>Claims Count</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Total Verified Amount</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>% Share of Budget</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'center' }}>Audit Status</th>
                  </>
                )}

                {selectedReport === 'SUPERVISOR_WISE' && (
                  <>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Supervisor Name</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Assigned Project Site</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Wallet Funds Released</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Verified Expenses</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Live Wallet Balance</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'center' }}>Wallet Float Status</th>
                  </>
                )}

                {selectedReport === 'BUDGET_VS_ACTUAL' && (
                  <>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Project ID</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Project Name</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Sanctioned Budget</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Actual Expenditure</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Variance (Remaining Buffer)</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'center' }}>Financial Health</th>
                  </>
                )}

                {selectedReport === 'PAYMENT_DISBURSAL' && (
                  <>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Txn Date</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Transaction Ref / UTR</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Beneficiary (Paid To)</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700' }}>Project</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'center' }}>Mode</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: '700', textAlign: 'right' }}>Disbursed Amount</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {/* 1. PROJECT WISE */}
              {selectedReport === 'PROJECT_WISE' && (
                filteredProjects.length > 0 ? (
                  filteredProjects.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        <span style={{ fontFamily: 'monospace', color: '#3b82f6', marginRight: '0.4rem' }}>{p.id}</span>
                        {p.name}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        {p.site} ({p.toilets} Units)
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {p.supervisor}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#3b82f6', fontFamily: 'monospace' }}>
                        {formatINR(p.fundsReleased)}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#10b981', fontFamily: 'monospace' }}>
                        {formatINR(p.expenses)}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#8b5cf6', fontFamily: 'monospace' }}>
                        {formatINR(p.balance)}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No project records found.</td></tr>
                )
              )}

              {/* 2. CATEGORY WISE */}
              {selectedReport === 'CATEGORY_WISE' && (
                categoryData.length > 0 ? (
                  categoryData.map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {c.category}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center', fontWeight: '600' }}>
                        {c.count} Bills
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '800', color: '#10b981', fontFamily: 'monospace' }}>
                        {formatINR(c.total)}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#3b82f6' }}>
                        {c.percentage}%
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                          Audited & Verified
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No category data available.</td></tr>
                )
              )}

              {/* 3. SUPERVISOR WISE */}
              {selectedReport === 'SUPERVISOR_WISE' && (
                filteredProjects.length > 0 ? (
                  filteredProjects.map(p => {
                    const walletBal = p.balance !== undefined ? p.balance : ((p.fundsReleased || 0) - (p.expenses || 0));
                    const isHealthy = walletBal >= 40000;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                        <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {p.supervisor}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-secondary)' }}>
                          {p.name}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#3b82f6', fontFamily: 'monospace' }}>
                          {formatINR(p.fundsReleased)}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#10b981', fontFamily: 'monospace' }}>
                          {formatINR(p.expenses)}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '800', color: '#8b5cf6', fontFamily: 'monospace' }}>
                          {formatINR(walletBal)}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            backgroundColor: isHealthy ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.15)',
                            color: isHealthy ? '#10b981' : '#d97706'
                          }}>
                            {isHealthy ? 'Send to Vendor' : 'Low Float'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No supervisor ledger records found.</td></tr>
                )
              )}

              {/* 4. BUDGET VS ACTUAL */}
              {selectedReport === 'BUDGET_VS_ACTUAL' && (
                filteredProjects.length > 0 ? (
                  filteredProjects.map(p => {
                    const variance = (p.budget || 0) - (p.expenses || 0);
                    const spentPct = p.budget > 0 ? Math.round((p.expenses / p.budget) * 100) : 0;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                        <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', fontFamily: 'monospace', color: '#3b82f6' }}>
                          {p.id}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {p.name}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '700', fontFamily: 'monospace' }}>
                          {formatINR(p.budget)}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#10b981', fontFamily: 'monospace' }}>
                          {formatINR(p.expenses)}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '800', color: variance >= 0 ? '#3b82f6' : '#ef4444', fontFamily: 'monospace' }}>
                          {formatINR(variance)} ({spentPct}% spent)
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            backgroundColor: variance >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: variance >= 0 ? '#10b981' : '#ef4444'
                          }}>
                            {variance >= 0 ? 'Within Budget' : 'Budget Overrun'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No variance records found.</td></tr>
                )
              )}

              {/* 5. PAYMENT DISBURSAL */}
              {selectedReport === 'PAYMENT_DISBURSAL' && (
                filteredPayments.length > 0 ? (
                  filteredPayments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {p.date}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', fontFamily: 'monospace', color: '#3b82f6' }}>
                        {p.refNumber}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {p.paidTo}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-secondary)' }}>
                        {p.projectName}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.55rem', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                          {p.paymentMode}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontWeight: '800', color: '#10b981', fontFamily: 'monospace' }}>
                        {formatINR(p.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No payment records found.</td></tr>
                )
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

export default FinancialReportsTab;
