import React, { useState } from 'react';
import {
  Building2, Users, IndianRupee, Layers, Monitor, CreditCard,
  ArrowRight, ArrowUpRight, ArrowDownRight, Activity, HardHat, Clock, ChevronRight,
  Tag, CheckCircle2, XCircle, Wrench, UserPlus, PlusCircle, Folder, Scale, PieChart as PieIcon,
  Calendar, FileText, X, Eye
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import './operations-dashboard.css';

/* ==========================================================================
   Modular Component 1: StatusBadge (Exact green positive & red danger pills)
   ========================================================================== */
export const StatusBadge = ({ text, type = 'positive' }) => {
  const isDanger = type === 'danger';
  return (
    <span
      className="dash-status-pill"
      style={{
        backgroundColor: isDanger ? '#fef2f2' : '#ecfdf5',
        color: isDanger ? '#dc2626' : '#059669',
        border: `1px solid ${isDanger ? '#fecaca' : '#a7f3d0'}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.85rem',
        fontWeight: '700',
        padding: '0.28rem 0.7rem',
        borderRadius: '9999px',
        width: 'fit-content'
      }}
    >
      {isDanger ? (
        <ArrowDownRight size={14} strokeWidth={2.5} />
      ) : (
        <ArrowUpRight size={14} strokeWidth={2.5} />
      )}
      <span>{text}</span>
    </span>
  );
};

/* ==========================================================================
   Modular Component 2: DashboardHeader
   ========================================================================== */
export const DashboardHeader = ({ title = 'Welcome to', highlight = 'Dashboard', subtitle = 'Hello Admin, here is your system overview.' }) => (
  <div className="dash-header" style={{ marginBottom: '0.5rem' }}>
    <h1 className="dash-header-title" style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0, letterSpacing: '-0.02em' }}>
      {title} <span style={{ color: '#2563eb' }}>{highlight}</span>
    </h1>
    <p className="dash-header-sub" style={{ fontSize: '0.92rem', color: '#64748b', margin: '0.35rem 0 0 0', fontWeight: '500' }}>
      {subtitle}
    </p>
  </div>
);

/* ==========================================================================
   Modular Component 3: StatCard (Exact pixel-perfect match to reference screenshot)
   ========================================================================== */
export const StatCard = ({ title, value, badgeText, badgeType = 'positive', icon: Icon, iconBg = '#2563eb', onClick }) => {
  const isDanger = badgeType === 'danger';
  return (
    <div
      onClick={onClick}
      className="dash-stat-card"
      style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #eef2f6)',
        borderRadius: '20px',
        padding: '1.35rem 1.6rem',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '138px',
        cursor: 'pointer',
        boxSizing: 'border-box',
        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Left Column: Label, Big Bold Value, Pill Badge */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '0.35rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', fontWeight: '600', letterSpacing: '-0.01em' }}>
          {title}
        </span>
        <h3 style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-primary, #1e293b)', margin: '0.2rem 0', lineHeight: 1 }}>
          {value}
        </h3>
        <div>
          <span
            className="dash-status-pill"
            style={{
              backgroundColor: isDanger ? '#fee2e2' : '#d1fae5',
              color: isDanger ? '#dc2626' : '#059669',
              border: `1px solid ${isDanger ? '#fca5a5' : '#a7f3d0'}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              fontWeight: '700',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              width: 'fit-content'
            }}
          >
            {isDanger ? (
              <ArrowDownRight size={14} strokeWidth={2.5} />
            ) : (
              <ArrowUpRight size={14} strokeWidth={2.5} />
            )}
            <span>{badgeText}</span>
          </span>
        </div>
      </div>

      {/* Right Column: Exact Saturated Rounded Squircle Icon Box */}
      <div
        style={{
          backgroundColor: iconBg,
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0,
          boxShadow: `0 8px 18px -3px ${iconBg}66`
        }}
      >
        <Icon size={26} strokeWidth={2.3} />
      </div>
    </div>
  );
};

/* ==========================================================================
   Modular Component 4: QuickActionCard (Exact reference screenshot action card)
   ========================================================================== */
export const QuickActionCard = ({ title, description, icon: Icon, iconBg, onClick }) => (
  <div
    className="dash-quick-card"
    onClick={onClick}
    style={{
      backgroundColor: 'var(--card-bg, #ffffff)',
      border: '1px solid var(--border-color, #eef2f6)',
      borderRadius: '20px',
      padding: '1.25rem 1.6rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '96px',
      cursor: 'pointer',
      boxSizing: 'border-box',
      transition: 'all 0.25s ease'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', minWidth: 0 }}>
      <div
        style={{
          backgroundColor: iconBg,
          width: '52px',
          height: '52px',
          minWidth: '52px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0,
          boxShadow: `0 6px 16px -2px ${iconBg}55`
        }}
      >
        <Icon size={24} strokeWidth={2.3} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.25 }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #64748b)', margin: '0.28rem 0 0 0', fontWeight: '500', lineHeight: 1.35 }}>
          {description}
        </p>
      </div>
    </div>
    <ArrowRight size={20} strokeWidth={2} style={{ color: '#cbd5e1', flexShrink: 0, marginLeft: '0.65rem' }} />
  </div>
);

/* ==========================================================================
   Modular Component 5: RevenueChart (Matching Screenshot 7-Day Revenue Graph)
   ========================================================================== */
export const RevenueChart = () => {
  const chartData = [
    { day: 'Aug 14', label: '₹2', height: 42, active: true },
    { day: 'Aug 15', label: '₹0', height: 6, active: false },
    { day: 'Aug 16', label: '₹6', height: 98, active: true },
    { day: 'Aug 17', label: '₹0', height: 6, active: false },
    { day: 'Aug 18', label: '₹6', height: 98, active: true },
    { day: 'Aug 19', label: '₹5', height: 82, active: true },
    { day: 'Aug 20', label: '₹0', height: 6, active: false },
  ];

  return (
    <div className="dash-analytics-card">
      <div className="dash-card-header">
        <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: '0 0 0.2rem 0' }}>
          7-Day Daily Revenue (₹)
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontWeight: '500' }}>
          Daily collection trend over the last 7 days
        </p>
      </div>

      {/* Bar Chart Area with Dashed Guide Lines */}
      <div className="dash-chart-container" style={{ position: 'relative', marginTop: '1.25rem', height: '170px' }}>
        {/* Dashed Horizontal Grid lines */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '10px', borderBottom: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', position: 'absolute', left: '0.25rem', top: '-10px', fontWeight: '600' }}>₹9</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50px', borderBottom: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', position: 'absolute', left: '0.25rem', top: '-10px', fontWeight: '600' }}>₹6</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '90px', borderBottom: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', position: 'absolute', left: '0.25rem', top: '-10px', fontWeight: '600' }}>₹3</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: '24px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', position: 'absolute', left: '0.25rem', top: '-10px', fontWeight: '600' }}>₹0</span>
        </div>

        {/* Bars Container */}
        <div style={{ position: 'absolute', left: '2.25rem', right: '0.5rem', top: 0, bottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 2 }}>
          {chartData.map((item) => (
            <div key={item.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', flex: 1, gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: item.active ? '#0f172a' : '#94a3b8' }}>
                {item.label}
              </span>
              <div
                style={{
                  width: '38px',
                  height: `${item.height}px`,
                  background: item.active
                    ? 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)'
                    : '#e2e8f0',
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.3s ease',
                  boxShadow: item.active ? '0 4px 14px rgba(59, 130, 246, 0.35)' : 'none'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', position: 'absolute', bottom: '-20px' }}>
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   Modular Component 6: SiteStatusGaugeChart (Matching Screenshot Donut Circle)
   ========================================================================== */
export const SiteStatusGaugeChart = ({ totalCount = 3, activeCount = 3, inactiveCount = 0, maintCount = 0, waterLowCount = 0 }) => (
  <div className="dash-analytics-card">
    <div className="dash-card-header">
      <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: '0 0 0.2rem 0' }}>
        Site Status Distribution
      </h2>
      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontWeight: '500' }}>
        Live operational status of all registered project sites
      </p>
    </div>

    {/* Exact Red/Coral Donut Ring with top green accent from Screenshot */}
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.25rem 0' }}>
      <div style={{
        position: 'relative',
        width: '165px',
        height: '165px',
        borderRadius: '50%',
        background: 'conic-gradient(#10b981 0% 8%, #ef4444 8% 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 20px rgba(239, 68, 68, 0.2)'
      }}>
        {/* Inner white circle hole */}
        <div style={{
          width: '122px',
          height: '122px',
          borderRadius: '50%',
          backgroundColor: 'var(--card-bg, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <span style={{ fontSize: '2.1rem', fontWeight: '900', color: 'var(--text-primary, #0f172a)', lineHeight: 1 }}>{totalCount}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginTop: '0.25rem' }}>Total Sites</span>
        </div>
      </div>
    </div>

    {/* 4 Status Pill Boxes from Screenshot */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
      {/* 1. Active */}
      <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '0.65rem 0.45rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#059669', display: 'block' }}>● Active</span>
        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#065f46' }}>{activeCount}</span>
      </div>

      {/* 2. Attention / Delay */}
      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '0.65rem 0.45rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#dc2626', display: 'block' }}>● Attention</span>
        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#991b1b' }}>{inactiveCount}</span>
      </div>

      {/* 3. In Planning */}
      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '0.65rem 0.45rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#d97706', display: 'block' }}>● Planning</span>
        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#92400e' }}>{maintCount}</span>
      </div>

      {/* 4. Completed (Replaced Water Low) */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.65rem 0.45rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#2563eb', display: 'block' }}>● Completed</span>
        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e40af' }}>{waterLowCount}</span>
      </div>
    </div>
  </div>
);

/* ==========================================================================
   Modular Component 7: TopRevenueProjectsChart (5 Horizontal Bars Graph)
   ========================================================================== */
export const TopRevenueProjectsChart = ({ projects = [], expenses = [], advances = [], onViewAll, onSelectProject, setActiveTab }) => {
  const { language } = useLanguage();
  
  // Calculate site-wise financials
  const actualItems = projects.map(proj => {
    let displayName = proj.name || 'Unnamed Project';
    let supervisor = proj.supervisorName || 'Unassigned';
    
    // Expenses
    const projectExpenses = expenses.filter(e => e.projectId === proj.id || e.projectName === proj.name);
    const totalExpensesCount = projectExpenses.length;
    // Only approved expenses are considered "Spent" from float
    const approvedExpSum = projectExpenses.filter(e => e.status === 'Approved').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Advances
    const projectAdvances = advances.filter(a => a.projectId === proj.id && a.rawStatus === 'disbursed');
    const totalAdvance = projectAdvances.reduce((sum, a) => sum + a.amount, 0);

    const cashInHand = totalAdvance - approvedExpSum;

    return {
      name: displayName,
      supervisor,
      rawProject: proj,
      totalAdvance,
      spent: approvedExpSum,
      cashInHand,
      totalExpensesCount,
      // used for sorting
      sortKey: totalAdvance + approvedExpSum
    };
  });

  // Sort by highest activity
  actualItems.sort((a, b) => b.sortKey - a.sortKey);
  const topProjects = actualItems.slice(0, 5); // Show top 5 to fit nicely

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#fff', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-primary, #0f172a)' }}>{label}</p>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#64748b' }}>Supervisor: <strong>{data.supervisor}</strong></p>
          <div style={{ fontSize: '0.8rem' }}>
            <p style={{ margin: '2px 0', color: '#3b82f6' }}>Advance Given: <strong>₹{data.totalAdvance.toLocaleString()}</strong></p>
            <p style={{ margin: '2px 0', color: '#ef4444' }}>Amount Spent: <strong>₹{data.spent.toLocaleString()}</strong></p>
            <p style={{ margin: '2px 0', color: '#10b981' }}>Cash In Hand: <strong>₹{data.cashInHand.toLocaleString()}</strong></p>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary, #475569)', fontSize: '0.75rem' }}>Total Expenses: <strong>{data.totalExpensesCount}</strong></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dash-panel-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <div className="dash-panel-header">
        <div>
          <h2 className="dash-panel-title">{language === 'mr' ? 'प्रोजेक्ट्स खर्च आणि निधी' : 'Expense Projects Financials'}</h2>
          <p className="dash-panel-sub">{language === 'mr' ? 'साईटनिहाय दिलेला ऍडव्हान्स, खर्च आणि शिल्लक रक्कम' : 'Site-wise Advance, Spent, and Cash in Hand'}</p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: '280px', marginTop: '1rem', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topProjects} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => val >= 1000 ? `₹${(val/1000).toFixed(0)}k` : `₹${val}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }} />
            <Bar dataKey="totalAdvance" name="Advance Given" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="spent" name="Amount Spent" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="cashInHand" name="Cash In Hand" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ==========================================================================
   Modular Component 8: RecentActivityFeed (With 1-Click Quick Approve/Reject)
   ========================================================================== */
export const RecentActivityFeed = ({ expenses = [], onApproveExpense, onRejectExpense, onViewAll }) => {
  const [inspectModalClaim, setInspectModalClaim] = useState(null);
  const pendingExpenses = expenses.filter(e => e.status === 'Pending').slice(0, 5);

  return (
    <div className="dash-panel-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="dash-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="dash-panel-title">Recent Bill Approvals</h2>
          <p className="dash-panel-sub">Pending supervisor site expense submissions requiring verification</p>
        </div>
        <button 
          onClick={onViewAll}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--input-bg, #f8fafc)',
            border: '1.5px solid var(--border-color, #cbd5e1)',
            color: '#2563eb',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#2563eb'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--input-bg, #f8fafc)'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.borderColor = 'var(--border-color, #cbd5e1)'; }}
        >
          View All
        </button>
      </div>

      <div style={{ overflowX: 'auto', width: '100%', marginTop: '0.5rem' }}>
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
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
              <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>VOUCHER ID</th>
              <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>DATE</th>
              <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>PROJECT</th>
              <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>CATEGORY</th>
              <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>SUPERVISOR</th>
              <th style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>AMOUNT</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {pendingExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary, #94a3b8)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                    <FileText size={32} style={{ color: 'var(--text-secondary, #cbd5e1)' }} />
                    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary, #64748b)' }}>
                      No pending bills to approve.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              pendingExpenses.map((exp, idx) => (
                <tr
                  key={exp.id}
                  style={{
                    borderBottom: idx === pendingExpenses.length - 1 ? 'none' : '1px solid var(--border-color, #f1f5f9)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-hover, rgba(241, 245, 249, 0.6))'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* VOUCHER ID */}
                  <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.9rem', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
                      {exp.voucherNo || exp.id}
                    </strong>
                  </td>

                  {/* DATE */}
                  <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={13} style={{ color: '#2563eb', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '700', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {exp.date ? new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '23 Aug 2026'}
                      </span>
                    </div>
                  </td>

                  {/* PROJECT / SITE */}
                  <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                    <div style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '700', fontSize: '0.88rem' }}>
                      {exp.projectName || 'Site Project'}
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                    <span style={{ color: 'var(--text-secondary, #475569)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                      {exp.category || 'Material'}
                    </span>
                  </td>

                  {/* SUPERVISOR */}
                  <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                    <div style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '700', fontSize: '0.88rem' }}>
                      {exp.supervisorName || 'Unknown'}
                    </div>
                  </td>

                  {/* AMOUNT */}
                  <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                    <div style={{ color: 'var(--text-primary, #0f172a)', fontWeight: '800', fontSize: '0.95rem' }}>
                      ₹{(exp.amount || 0).toLocaleString('en-IN')}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      <button
                        title="View Bill"
                        onClick={() => setInspectModalClaim(exp)}
                        style={{
                          padding: '0.45rem',
                          borderRadius: '8px',
                          backgroundColor: 'var(--input-bg, #f1f5f9)',
                          border: '1px solid var(--border-color, #cbd5e1)',
                          color: 'var(--text-primary, #0f172a)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-hover, #e2e8f0)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--input-bg, #f1f5f9)'}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="Approve & Forward"
                        onClick={() => onApproveExpense && onApproveExpense(exp.id, 'Approved and forwarded to Accounts')}
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.45rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        title="Reject"
                        onClick={() => onRejectExpense && onRejectExpense(exp.id, 'Rejected by operations')}
                        style={{ backgroundColor: 'var(--card-bg, #ffffff)', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.45rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.borderColor = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
              src={inspectModalClaim.billPhotoUrl 
                ? (inspectModalClaim.billPhotoUrl.startsWith('http') ? inspectModalClaim.billPhotoUrl : `${import.meta.env.VITE_API_BASE_URL || ''}${inspectModalClaim.billPhotoUrl.startsWith('/') ? '' : '/'}${inspectModalClaim.billPhotoUrl}`)
                : 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'}
              alt="Bill Voucher"
              style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary, #475569)' }}>
              <span>{inspectModalClaim.projectName}</span>
              <strong style={{ color: 'var(--text-primary, #0f172a)', fontSize: '1rem' }}>₹{inspectModalClaim.amount?.toLocaleString('en-IN')}</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
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
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
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

/* ==========================================================================
   Modular Component 9: RecentLogsFeed (ASEMS Site Supervisor Logs)
   ========================================================================== */
export const RecentLogsFeed = ({ onViewAll }) => {
  const logs = [
    { id: 1, title: 'Sangamner-P1 • Stainless Steel Enclosure Bolted', desc: '4 units of prefab shell bolted to concrete plinth by Rohit crew.', status: 'Active', isRed: true, time: 'Today, 11:16 AM' },
    { id: 2, title: 'Pune-P2 • SCADA Telemetry & Coin Board Tested', desc: 'MQTT packets transmitting coin count & water level to server verified by Amit.', status: 'Resolved', isRed: false, time: 'Today, 10:45 AM' },
    { id: 3, title: 'Nashik-P3 • 2000L Bio-Digester Tank Plumbed', desc: 'Microbial bio-tank placed with inlet/outlet manifold by Sagar.', status: 'Resolved', isRed: false, time: 'Yesterday, 04:30 PM' },
    { id: 4, title: 'Sambhajinagar-P4 • Foundation Excavation Passed', desc: 'Plinth trenching 1.8m inspected and passed by Structural Engineer.', status: 'Resolved', isRed: false, time: 'Yesterday, 11:20 AM' },
  ];

  return (
    <div className="dash-panel-card">
      <div className="dash-panel-header">
        <div>
          <h2 className="dash-panel-title">Site Supervisor Daily Work Logs</h2>
          <p className="dash-panel-sub">Real-time daily installation milestones reported by supervisors</p>
        </div>
      </div>

      <div className="dash-list-col">
        {logs.map((log) => (
          <div key={log.id} className="dash-log-item">
            <div className="dash-log-left">
              <div className="dash-log-icon">
                <Activity size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="dash-log-title">{log.title}</p>
                <p className="dash-log-desc">{log.desc}</p>
              </div>
            </div>
            <div className="dash-log-right">
              <span className={`dash-log-tag ${log.isRed ? 'active' : 'resolved'}`}>{log.status}</span>
              <span className="dash-log-time">{log.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   Modular Component 10: SiteAlertsFeed (ASEMS Site Quality & Stock Alerts)
   ========================================================================== */
export const SiteAlertsFeed = ({ onViewSites }) => {
  const alerts = [
    { id: 1, title: 'Sangamner-P1 • Municipal Water Hookup Line Delayed', desc: 'Excavation complete. Awaiting municipal junction connection approval.' },
    { id: 2, title: 'Nashik-P3 • Bio-Digester Valve Seal Pressure Check Due', desc: 'Hydrostatic pressure check scheduled before backfilling.' },
    { id: 3, title: 'Pune-P2 • Additional 4-Core Armored Cable Required', desc: 'Site supervisor Amit requested 40m cable for main panel hookup.' },
  ];

  return (
    <div className="dash-panel-card">
      <div className="dash-panel-header">
        <div>
          <h2 className="dash-panel-title">Site Operations & Material Alerts</h2>
          <p className="dash-panel-sub">Live site safety, material shortages, and municipal clearance checks</p>
        </div>
        <button onClick={onViewSites} className="dash-panel-btn">View Sites</button>
      </div>

      <div className="dash-list-col">
        {alerts.map((alert) => (
          <div key={alert.id} className="dash-alert-item">
            <div className="dash-alert-left">
              <div className="dash-alert-icon">
                <Activity size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="dash-alert-title">{alert.title}</p>
                <p className="dash-alert-desc">{alert.desc}</p>
              </div>
            </div>
            <button className="dash-alert-open-btn">Open</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BudgetDistributionPieChart = ({ 
  expenses = [], 
  projects = [], 
  onViewAll, 
  onSelectProject, 
  setActiveTab 
}) => {
  const { language } = useLanguage();

  const projectColors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#e11d48'];

  // Project-wise total expense data for the Pie Chart
  const pieData = projects.length > 0 ? projects.map((p, idx) => {
    let shortName = p.name || `Project ${idx + 1}`;

    // Calculate actual expenses for this project from expenses list or p.spent
    const projectExpenses = expenses.filter(e => e.projectId === p.id || e.projectName === p.name);
    const expSum = projectExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const spentVal = expSum > 0 ? expSum : (Number(p.spent) || 0);

    return {
      name: shortName,
      fullName: p.name || shortName,
      rawProject: p,
      value: spentVal,
      color: projectColors[idx % projectColors.length]
    };
  }) : [];

  const totalExpenseVal = pieData.reduce((acc, item) => acc + item.value, 0);

  const handleProjectRedirect = (item) => {
    const foundPrj = item.rawProject || projects.find(p => p.name === item.fullName || p.name === item.name || (p.code && p.code.includes(item.name)));
    if (foundPrj && onSelectProject) {
      onSelectProject(foundPrj);
    }
    if (setActiveTab) {
      setActiveTab('expenses');
    } else if (onViewAll) {
      onViewAll();
    }
  };

  return (
    <div className="dash-panel-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
      <div className="dash-panel-header" style={{ marginBottom: '0.5rem' }}>
        <div>
          <h2 className="dash-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <PieIcon size={18} style={{ color: '#2563eb' }} />
            <span>{language === 'mr' ? 'प्रोजेक्ट्स एकूण खर्च (Pie Chart)' : 'Projects Total Expense'}</span>
          </h2>
          <p className="dash-panel-sub">
            {language === 'mr' ? 'प्रत्येक प्रोजेक्ट साईटनिहाय झालेला एकूण खर्च' : 'Site-wise total project operational expenditure'}
          </p>
        </div>
      </div>

      {/* Interactive Donut Pie Chart with Recharts */}
      <div style={{ width: '100%', height: 260, position: 'relative', marginTop: '0.25rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={6}
              dataKey="value"
              cursor="pointer"
              onClick={(entry) => handleProjectRedirect(entry)}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(val, name, item) => [`₹${Number(val).toLocaleString('en-IN')}`, item?.payload?.fullName || name]}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '700',
                boxShadow: '0 10px 20px -3px rgba(0, 0, 0, 0.35)',
                padding: '0.6rem 0.9rem'
              }}
              itemStyle={{ color: '#ffffff' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Amount Badge (Clickable to view Expenses) */}
        <div 
          onClick={() => setActiveTab ? setActiveTab('expenses') : (onViewAll && onViewAll())}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%'
          }}
          title="Click to view all expenses"
        >
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', display: 'block', letterSpacing: '0.05em' }}>
            Total Expense
          </span>
          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-primary, #0f172a)', lineHeight: 1.1 }}>
            {totalExpenseVal >= 100000
              ? `₹${(totalExpenseVal / 100000).toFixed(2)}L`
              : `₹${(totalExpenseVal / 1000).toFixed(0)}k`}
          </span>
        </div>
      </div>

      {/* Color-Coded Project Legend Badges (Clickable to redirect) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        marginTop: '0.5rem',
        paddingTop: '0.85rem',
        borderTop: '1px solid var(--border-color, #e2e8f0)'
      }}>
        {pieData.map((item) => (
          <div
            key={item.name}
            onClick={() => handleProjectRedirect(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.45rem 0.65rem',
              borderRadius: '8px',
              backgroundColor: 'var(--input-bg, #f8fafc)',
              border: '1px solid var(--border-color, #f1f5f9)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.08)';
              e.currentTarget.style.borderColor = '#93c5fd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--input-bg, #f8fafc)';
              e.currentTarget.style.borderColor = 'var(--border-color, #f1f5f9)';
            }}
            title={`Click to view expenses for ${item.fullName || item.name}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary, #334155)', fontWeight: '700', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
            </div>
            <span style={{ fontWeight: '800', color: 'var(--text-primary, #0f172a)', fontSize: '0.85rem', marginLeft: '0.4rem', whiteSpace: 'nowrap' }}>
              ₹{item.value >= 100000 ? `${(item.value / 100000).toFixed(2)}L` : `${(item.value / 1000).toFixed(1)}k`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   Main Component: OperationsOverview (100% Pure ASEMS Operations Head Dashboard)
   ========================================================================== */
const OperationsOverview = ({
  projects = [],
  supervisors = [],
  expenses = [],
  advances = [],
  categories = [],

  setActiveTab,
  onOpenCreateProject,
  onSelectProject,
  onApproveExpense,
  onRejectExpense,
  onOpenCreateSupervisor,
  onOpenSubmitExpense,
  onOpenRequestAdvance
}) => {
  const { language } = useLanguage();
  const pendingBillsCount = expenses.filter(e => e.status === 'Pending').length;

  // Supervisor-wise chart data (matching Accountant overview bar chart)
  const supervisorMap = {};
  projects.forEach(p => {
    const sName = p.supervisorName || 'Unassigned';
    if (!supervisorMap[sName]) {
      supervisorMap[sName] = { name: sName, Released: 0, Expenses: 0, WalletBalance: 0 };
    }
  });

  advances.forEach(a => {
    if (a.rawStatus === 'disbursed') {
      const sName = a.supervisor || 'Unassigned';
      if (!supervisorMap[sName]) supervisorMap[sName] = { name: sName, Released: 0, Expenses: 0, WalletBalance: 0 };
      supervisorMap[sName].Released += (a.amount || 0);
    }
  });

  expenses.forEach(e => {
    if (e.status === 'Approved' || e.status === 'Paid') {
      const sName = e.supervisorName || e.submittedBy || 'Unassigned';
      if (!supervisorMap[sName]) supervisorMap[sName] = { name: sName, Released: 0, Expenses: 0, WalletBalance: 0 };
      supervisorMap[sName].Expenses += (e.amount || 0);
    }
  });

  Object.values(supervisorMap).forEach(s => {
    s.WalletBalance = s.Released - s.Expenses;
  });

  const supervisorChartData = Object.values(supervisorMap).filter(s => s.Released > 0 || s.Expenses > 0);

  // Category-wise chart data (matching Accountant overview pie chart)
  const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
  const categoryMap = {};
  if (categories && categories.length > 0) {
    categories.forEach(c => { categoryMap[c.name] = 0; });
  }
  expenses.forEach(e => {
    if (e.status === 'Approved' || e.status === 'Paid') {
      if (e.category) categoryMap[e.category] = (categoryMap[e.category] || 0) + (e.amount || 0);
    }
  });
  const categoryChartData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }));

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="dash-container">
      {/* 1. Header: Welcome to Dashboard */}
      <DashboardHeader
        title="Welcome to"
        highlight="Dashboard"
        subtitle="Hello Admin, here is your system overview."
      />

      {/* 2. Top Statistics Cards */}
      <div className="dash-stats-grid">
        {/* Row 1, Card 2: Total Projects */}
        <StatCard
          title="Total Projects"
          value={String(projects.length)}
          badgeText={`${projects.length} Site Projects`}
          badgeType="positive"
          icon={Folder}
          iconBg="#ea580c"
          onClick={() => setActiveTab && setActiveTab('projects')}
        />
        {/* Row 1, Card 3: Supervisors */}
        <StatCard
          title="Supervisors"
          value={String(supervisors.length)}
          badgeText={`${supervisors.length} Active`}
          badgeType="positive"
          icon={Users}
          iconBg="#8b5cf6"
          onClick={() => setActiveTab && setActiveTab('team')}
        />
        {/* Row 1, Card 4: Pending Bills */}
        <StatCard
          title="Pending Bills"
          value={String(pendingBillsCount)}
          badgeText={pendingBillsCount === 0 ? 'All Clear' : `${pendingBillsCount} To Approve`}
          badgeType={pendingBillsCount === 0 ? 'positive' : 'danger'}
          icon={Clock}
          iconBg="#f59e0b"
          onClick={() => setActiveTab && setActiveTab('expenses')}
        />

      </div>

      {/* 3. Quick Actions (4 Wide Cards matching 4-column grid) */}
      <div>
        <h2 className="dash-section-title">
          Quick Actions
        </h2>

        <div className="dash-quick-grid">
          {/* Card 1: Create & Manage Projects */}
          <QuickActionCard
            title="Create & Manage Projects"
            description="Register and track site projects & operations"
            icon={Building2}
            iconBg="#059669"
            onClick={onOpenCreateProject}
          />

          {/* Card 2: Assign Supervisors & Team */}
          <QuickActionCard
            title="Create Supervisor"
            description="Register new supervisors & field crew"
            icon={Users}
            iconBg="#2563eb"
            onClick={onOpenCreateSupervisor}
          />

          {/* Card 3: Submit Expense */}
          <QuickActionCard
            title="Submit Expense"
            description="Submit a new expense or claim"
            icon={IndianRupee}
            iconBg="#ea580c"
            onClick={onOpenSubmitExpense}
          />

          {/* Card 4: Request Advance */}
          <QuickActionCard
            title="Request Advance"
            description="View advance requests and reconciliations"
            icon={Scale}
            iconBg="#10b981"
            onClick={onOpenRequestAdvance}
          />

        </div>
      </div>

      {/* 4. Analytics & Charts Row (2 Balanced Columns: matching Accountant charts) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1.25rem',
        marginTop: '1.25rem'
      }}>
        {/* Left: Funds Released vs Expenses vs Site Wallets (Bar Chart) */}
        <div style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid var(--border-color, #eef2f6)',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                Funds Released vs Expenses vs Site Wallets
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                Site-by-site expenditure and wallet fund comparison
              </p>
            </div>
            <button
              onClick={() => setActiveTab && setActiveTab('expenses')}
              style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer', flexShrink: 0 }}
            >
              Bill Approve <ArrowUpRight size={14} />
            </button>
          </div>
          <div style={{ width: '100%', height: '330px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supervisorChartData} maxBarSize={28} barGap={4} margin={{ top: 15, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '0.78rem', paddingBottom: '14px' }} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={({ x, y, payload }) => {
                    if (!payload || !payload.value) return null;
                    return (
                      <g transform={`translate(${x},${y + 6})`}>
                        <text x={0} y={0} dy={6} textAnchor="end" transform="rotate(-35)" fill="var(--text-secondary)" fontSize={10.5} fontWeight={600}>
                          {String(payload.value)}
                        </text>
                      </g>
                    );
                  }}
                  height={56}
                  stroke="var(--text-secondary)"
                  tickLine={false}
                />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} tickLine={false} />
                <Tooltip
                  formatter={(value, name) => [formatINR(value), name]}
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <Bar dataKey="Released" fill="#3b82f6" maxBarSize={28} radius={[4, 4, 0, 0]} name="Funds Released" />
                <Bar dataKey="Expenses" fill="#7c3aed" maxBarSize={28} radius={[4, 4, 0, 0]} name="Approved Expenses" />
                <Bar dataKey="WalletBalance" fill="#10b981" maxBarSize={28} radius={[4, 4, 0, 0]} name="Site Wallet Balance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Expense Breakdown by Category (Donut Pie Chart) */}
        <div style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '1px solid var(--border-color, #eef2f6)',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Expense Breakdown by Category
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Top expense categories across all sites
              </p>
            </div>
            <button
              onClick={() => setActiveTab && setActiveTab('expenses')}
              style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
            >
              View Bills <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Pie + Legend container */}
          <div className="overview-pie-container">
            <div className="overview-pie-chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={74}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [formatINR(value), name]}
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="overview-pie-legend">
              {categoryChartData.map((cat, idx) => (
                <div key={idx} className="overview-pie-legend-row">
                  <div className="overview-pie-legend-label">
                    <span className="overview-pie-legend-dot" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                    <span className="overview-pie-legend-name">{cat.name}</span>
                  </div>
                  <strong className="overview-pie-legend-amount">{formatINR(cat.value)}</strong>
                </div>
              ))}
              {categoryChartData.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '1rem 0' }}>No expense data yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Live Operations Activity (Expense Claims Review) */}
      <div style={{ marginTop: '1.25rem' }}>
        <RecentActivityFeed 
          expenses={expenses} 
          onApproveExpense={onApproveExpense} 
          onRejectExpense={onRejectExpense} 
          onViewAll={() => setActiveTab && setActiveTab('expenses')} 
        />
      </div>
    </div>
  );
};

export default OperationsOverview;


