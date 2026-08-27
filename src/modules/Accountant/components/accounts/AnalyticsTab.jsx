import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  Printer, 
  Download, 
  Calendar, 
  Folder, 
  CreditCard, 
  Percent, 
  ShieldCheck, 
  Building2,
  Wallet,
  Users,
  CheckCircle2,
  AlertCircle,
  Zap,
  Layers
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { applyPDFHeader, applyPDFFooter, getLogoDataUrl } from '../../utils/exportUtils';
import aiLogo from '../../assets/ai_logo.jpg';
import PrintFooter from '../PrintFooter';

const MODE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

const AnalyticsTab = ({ 
  projects = [], 
  expenses = [], 
  advances = [], 
  payments = [], 
  settlements = [] 
}) => {
  const [filterType, setFilterType] = useState('FY'); // 'FY' or 'DATE_RANGE'
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedSupervisor, setSelectedSupervisor] = useState('ALL');
  const [financialYear, setFinancialYear] = useState('CURRENT_FY');
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

  // Get master list of all unique supervisors across all projects (Fixed baseline for X-axis)
  const allMasterSupervisors = [...new Set(projects.map(p => p.supervisor).filter(Boolean))];

  // Cascading supervisors list based on selected project
  const availableSupervisors = selectedProject === 'ALL'
    ? allMasterSupervisors
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

  // Filter projects by selection
  const filteredProjects = projects.filter(p => {
    const matchesProject = selectedProject === 'ALL' || p.id === selectedProject;
    const matchesSupervisor = selectedSupervisor === 'ALL' || p.supervisor === selectedSupervisor;
    return matchesProject && matchesSupervisor;
  });
  const activeProjectIds = new Set(filteredProjects.map(p => p.id));

  // Filtered expenses & payments
  const filteredExpenses = expenses.filter(e => activeProjectIds.has(e.projectId));
  const filteredAdvances = advances.filter(a => activeProjectIds.has(a.projectId));
  const filteredPayments = payments.filter(p => activeProjectIds.has(p.projectId));

  // High level KPIs
  const totalBudget = filteredProjects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalReleased = filteredProjects.reduce((acc, p) => acc + (p.fundsReleased || 0), 0);
  const totalExpenses = filteredProjects.reduce((acc, p) => acc + (p.expenses || 0), 0);
  const totalBalance = filteredProjects.reduce((acc, p) => acc + (p.balance || 0), 0);
  const utilizationRate = totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(1) : 0;
  const releaseRate = totalBudget > 0 ? ((totalReleased / totalBudget) * 100).toFixed(1) : 0;

  // Chart 1: Cumulative Cash Flow & Monthly Velocity Trend (Data up to current month Aug, future months blank)
  const monthlyFlowData = [
    { month: 'Jan', fullMonth: 'January 2026', Advances: 95000, Expenses: 40000, Released: 120000 },
    { month: 'Feb', fullMonth: 'February 2026', Advances: 110000, Expenses: 65000, Released: 140000 },
    { month: 'Mar', fullMonth: 'March 2026', Advances: 130000, Expenses: 80000, Released: 160000 },
    { month: 'Apr', fullMonth: 'April 2026', Advances: 145000, Expenses: 92000, Released: 180000 },
    { month: 'May', fullMonth: 'May 2026', Advances: 160000, Expenses: 105000, Released: 200000 },
    { month: 'Jun', fullMonth: 'June 2026', Advances: 175000, Expenses: 110000, Released: 215000 },
    { month: 'Jul', fullMonth: 'July 2026', Advances: 190000, Expenses: 125000, Released: 240000 },
    { month: 'Aug', fullMonth: 'August 2026 (Current)', Advances: 220000, Expenses: 145000, Released: 280000 },
    { month: 'Sep', fullMonth: 'September 2026 (Upcoming)', Advances: null, Expenses: null, Released: null },
    { month: 'Oct', fullMonth: 'October 2026 (Upcoming)', Advances: null, Expenses: null, Released: null },
    { month: 'Nov', fullMonth: 'November 2026 (Upcoming)', Advances: null, Expenses: null, Released: null },
    { month: 'Dec', fullMonth: 'December 2026 (Upcoming)', Advances: null, Expenses: null, Released: null }
  ];

  // Chart 2: Supervisor Disbursal vs Claim Efficiency (Fixed positions on X-axis, unselected items hidden with null so position never shifts)
  const supervisorData = allMasterSupervisors.map(supName => {
    const isIncluded = filteredProjects.some(p => p.supervisor === supName);
    if (!isIncluded) {
      return {
        name: supName,
        advance: null,
        expenses: null
      };
    }

    const projs = filteredProjects.filter(p => p.supervisor === supName);
    const totalAdv = projs.reduce((acc, p) => acc + (p.advance || p.fundsReleased || 0), 0);
    const totalExp = projs.reduce((acc, p) => acc + (p.expenses || 0), 0);

    return {
      name: supName,
      advance: totalAdv,
      expenses: totalExp
    };
  });

  // Custom Angled Tick Component for No-Overlap Layout (Hides label if supervisor data is filtered out/null)
  const renderStraightTick = ({ x, y, payload }) => {
    if (!payload || !payload.value) return null;
    const text = String(payload.value);

    // If supervisor is filtered out (advance and expenses are null), hide the bottom name
    const supItem = supervisorData.find(s => s.name === text);
    if (supItem && supItem.advance === null && supItem.expenses === null) {
      return null;
    }

    return (
      <g transform={`translate(${x},${y + 6})`}>
        <text 
          x={0} 
          y={0} 
          dy={6}
          textAnchor="end" 
          transform="rotate(-35)" 
          fill="var(--text-secondary)" 
          fontSize={10.5} 
          fontWeight={600}
        >
          {text}
        </text>
      </g>
    );
  };

  // Chart 3: Project Budget Utilization & Burn Rate %
  const burnRateData = filteredProjects.map(p => {
    const burn = p.budget > 0 ? Number(((p.expenses / p.budget) * 100).toFixed(1)) : 0;
    return {
      name: p.name.length > 15 ? p.name.substring(0, 13) + '...' : p.name,
      fullName: p.name,
      'Burn Rate %': burn,
      'Remaining Buffer %': Math.max(0, Number((100 - burn).toFixed(1)))
    };
  });

  // Chart 4: Payment Disbursal Modes & Transaction Channels
  const paymentModeMap = {};
  filteredPayments.forEach(p => {
    const mode = p.paymentMode || 'Bank Transfer';
    paymentModeMap[mode] = (paymentModeMap[mode] || 0) + (p.amount || 0);
  });
  const totalPaymentAmount = Object.values(paymentModeMap).reduce((a, b) => a + b, 0) || 1;
  const paymentModeData = Object.entries(paymentModeMap).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / totalPaymentAmount) * 100).toFixed(1)
  }));

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Export Handler
  const handleExportPDF = async () => {
    const doc = new jsPDF('landscape');
    const logoDataUrl = await getLogoDataUrl();

    applyPDFHeader(doc, {
      title: 'Executive Financial Analytics & Operational Charts Report',
      metaInfo: `Generated: ${new Date().toLocaleString()} | Scope: ${selectedProject === 'ALL' ? 'All Installation Sites' : selectedProject} | Sanctioned BOQ: ${formatPDFINR(totalBudget)}`,
      logoDataUrl
    });

    // Executive Metrics Table
    const summaryHeaders = [['Total Sanctioned Budget', 'Total Funds Released', 'Verified Site Expenses', 'Unspent Site Balance', 'Budget Utilization Rate']];
    const summaryData = [[
      formatPDFINR(totalBudget),
      formatPDFINR(totalReleased),
      formatPDFINR(totalExpenses),
      formatPDFINR(totalBalance),
      `${utilizationRate}%`
    ]];

    doc.autoTable({
      startY: 34,
      head: summaryHeaders,
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], fontSize: 8.5, fontStyle: 'bold' },
      styles: { fontSize: 8.5, halign: 'center' }
    });

    // Supervisor Audit Table
    const supHeaders = [['Site Supervisor', 'Assigned Advances (INR)', 'Verified Claims (INR)', 'Reconciliation Buffer (INR)']];
    const supRows = supervisorData.filter(s => s.advance !== null || s.expenses !== null).map(s => [
      s.name,
      formatPDFINR(s.advance || 0),
      formatPDFINR(s.expenses || 0),
      formatPDFINR((s.advance || 0) - (s.expenses || 0))
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 8,
      margin: { bottom: 30 },
      head: supHeaders,
      body: supRows,
      theme: 'grid',
      headStyles: { fillColor: [6, 182, 212], fontSize: 8 },
      styles: { fontSize: 7.5 }
    });

    // Payment Mode Breakdown Table
    const payHeaders = [['Payment Disbursal Channel', 'Disbursed Volume (INR)', '% Channel Share']];
    const payRows = paymentModeData.map(p => [
      p.name,
      formatPDFINR(p.value),
      `${p.percentage}%`
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 8,
      margin: { bottom: 30 },
      head: payHeaders,
      body: payRows,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
      styles: { fontSize: 7.5 }
    });

    applyPDFFooter(doc);
    doc.save(`ASEMS_Visual_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Printable Letterhead Header (Only visible on Print) */}
      <div className="print-only" style={{ display: 'none', marginBottom: '1rem', borderBottom: '2px solid #2563eb', paddingBottom: '0.6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src={aiLogo} alt="Aarya Innovtech Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '13pt', fontWeight: '800', margin: 0, color: '#1e293b' }}>
              ASEMS - AARYA SITE EXPENSE MANAGEMENT SYSTEM
            </h2>
            <p style={{ fontSize: '10pt', fontWeight: '700', color: '#2563eb', margin: '2px 0 0' }}>
              Executive Visual Analytics & Operational Run-Rate Report
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '8pt', color: '#64748b' }}>
            <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
            <div>Projects Analyzed: {filteredProjects.length}</div>
          </div>
        </div>
      </div>

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
              name="analyticsFilterType" 
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
              name="analyticsFilterType" 
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* 1. Project Name */}
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

          {/* 2. Site Supervisor */}
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

          {/* 3. Financial Year / Date Range */}
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



      {/* Full-Width Stacked Visual Charts (One Below The Other) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        width: '100%'
      }}>
        {/* Chart 1: Cumulative Cash Flow & Monthly Velocity */}
        <div style={{
          backgroundColor: 'var(--surface-bg)',
          borderRadius: '16px',
          padding: '1.4rem 1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="#3b82f6" />
              <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Cumulative Cashflow & Expenditure Velocity
              </h3>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '10px' }}>
              Monthly Run-Rate
            </span>
          </div>

          <div style={{ height: '360px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFlowData} maxBarSize={32} barGap={4} margin={{ top: 15, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11.5px', paddingBottom: '14px' }} />
                <XAxis 
                  dataKey="month" 
                  interval={0} 
                  stroke="var(--text-secondary)" 
                  fontSize={11} 
                  fontWeight={600}
                  tick={{ dy: 6 }}
                  tickLine={false} 
                />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} tickLine={false} />
                <Tooltip 
                  formatter={(val) => (val !== null && val !== undefined) ? formatINR(val) : '— (Pending)'}
                  labelFormatter={(label, items) => {
                    const item = monthlyFlowData.find(m => m.month === label);
                    return item?.fullMonth || label;
                  }}
                  contentStyle={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--border-color)', borderRadius: '10px' }}
                />
                <Bar dataKey="Released" name="Funds Disbursed" fill="#3b82f6" maxBarSize={32} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" name="Verified Expenses" fill="#10b981" maxBarSize={32} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Supervisor Disbursal & Claim Efficiency */}
        <div style={{
          backgroundColor: 'var(--surface-bg)',
          borderRadius: '16px',
          padding: '1.4rem 1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="#06b6d4" />
              <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Site Supervisor Advance vs Claims
              </h3>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '10px' }}>
              Supervisor Ledger
            </span>
          </div>

          <div style={{ height: '390px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supervisorData} maxBarSize={36} barGap={6} margin={{ top: 15, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11.5px', paddingBottom: '14px' }} />
                <XAxis 
                  dataKey="name" 
                  interval={0} 
                  tick={renderStraightTick}
                  height={65}
                  stroke="var(--text-secondary)" 
                  tickLine={false} 
                />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} tickLine={false} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const validItems = payload.filter(p => p.value !== null && p.value !== undefined);
                      if (validItems.length === 0) return null;
                      return (
                        <div style={{
                          backgroundColor: 'var(--surface-bg)',
                          border: '1.5px solid var(--border-color)',
                          borderRadius: '12px',
                          padding: '0.75rem 1rem',
                          boxShadow: '0 4px 18px rgba(0,0,0,0.1)'
                        }}>
                          <p style={{ margin: '0 0 0.35rem 0', fontWeight: '800', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            {label}
                          </p>
                          {validItems.map((entry, idx) => (
                            <p key={idx} style={{ margin: '0.2rem 0', fontSize: '0.82rem', color: entry.color, fontWeight: '700' }}>
                              {entry.name}: {formatINR(entry.value)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="advance" name="Advance Disbursed" fill="#06b6d4" maxBarSize={36} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Verified Expenses" fill="#10b981" maxBarSize={36} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Corporate Printable Footer with Signatures */}
      <PrintFooter />
    </div>
  );
};

export default AnalyticsTab;
