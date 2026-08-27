import React, { useState } from 'react';
import {
  Building2, Users, IndianRupee, Layers, Monitor, CreditCard,
  ArrowRight, ArrowUpRight, ArrowDownRight, Activity, HardHat, Clock, ChevronRight,
  Tag, CheckCircle2, XCircle, Wrench, UserPlus, PlusCircle, Folder, Scale, PieChart as PieIcon
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
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
    <h1 className="dash-header-title" style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
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
        <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.2rem 0' }}>
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
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
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
      <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.2rem 0' }}>
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
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <span style={{ fontSize: '2.1rem', fontWeight: '900', color: '#0f172a', lineHeight: 1 }}>{totalCount}</span>
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
export const TopRevenueProjectsChart = ({ projects = [], onViewAll, onSelectProject, setActiveTab }) => {
  const { language } = useLanguage();
  const mockItems = [
    { name: 'Site Supervisor Advances (Floats)', spent: 40000 },
    { name: 'Material Buffer & Contingency', spent: 10000 },
  ];

  // Map actual projects to chart item structure
  const actualItems = projects.map(proj => {
    let displayName = proj.name || 'Unnamed Project';
    const codeStr = proj.code || proj.id || '';
    if (codeStr.includes('Sangamner-P1') || proj.id === 'PRJ-SGM-01') {
      displayName = 'Sangamner Eco Toilet (Site P1)';
    } else if (codeStr.includes('Nashik-P3') || proj.id === 'PRJ-NSK-03') {
      displayName = 'Nashik Highway Sanitation (Site P3)';
    } else if (codeStr.includes('Pune-P2') || proj.id === 'PRJ-PUN-02') {
      displayName = 'Pune Smart E-Toilets (Site P2)';
    }
    return {
      name: displayName,
      rawProject: proj,
      spent: Number(proj.spent) || 0
    };
  });

  // Combine and sort by spent descending
  let combinedItems = [...actualItems];
  combinedItems.sort((a, b) => b.spent - a.spent);

  // Pad with mock items if we have fewer than 5 items
  if (combinedItems.length < 5) {
    mockItems.forEach(mock => {
      if (combinedItems.length < 5 && !combinedItems.some(item => item.name === mock.name)) {
        combinedItems.push(mock);
      }
    });
  }

  // Re-sort after padding
  combinedItems.sort((a, b) => b.spent - a.spent);

  // Take top 5
  const topFive = combinedItems.slice(0, 5);

  // Find max spent value to compute proportional bar widths
  const maxSpent = Math.max(...topFive.map(item => item.spent), 1000);

  const projectBars = topFive.map(item => {
    const widthPercent = maxSpent > 0 ? (item.spent / maxSpent) * 85 : 0;
    let valStr = '';
    if (item.spent >= 100000) {
      valStr = `₹${(item.spent / 100000).toFixed(1)}L`;
    } else {
      valStr = `₹${(item.spent / 1000).toFixed(1)}k`;
    }
    return {
      name: item.name,
      rawProject: item.rawProject,
      width: `${Math.max(widthPercent, 15)}%`,
      val: valStr
    };
  });

  const handleRowClick = (proj) => {
    if (proj.rawProject && onSelectProject) {
      onSelectProject(proj.rawProject);
    }
    if (setActiveTab) {
      setActiveTab('projects');
    } else if (onViewAll) {
      onViewAll();
    }
  };

  return (
    <div className="dash-panel-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
      <div className="dash-panel-header">
        <div>
          <h2 className="dash-panel-title">{language === 'mr' ? 'प्रोजेक्ट्स खर्च' : 'Expense Projects'}</h2>
          <p className="dash-panel-sub">{language === 'mr' ? 'साईटनिहाय नोंदवलेला एकूण खर्च' : 'Site-wise operational expenses logged'}</p>
        </div>
      </div>

      {/* 5 Evenly-Spaced Horizontal Bar Chart Rows Filling the Entire Card */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        flex: 1,
        gap: '0.9rem',
        margin: '1rem 0 0.5rem 0'
      }}>
        {projectBars.map((proj) => (
          <div 
            key={proj.name} 
            onClick={() => handleRowClick(proj)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.85rem',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            title={`Click to view ${proj.name}`}
          >
            <span style={{
              width: '215px',
              fontSize: '0.84rem',
              fontWeight: '700',
              color: 'var(--text-primary, #1e293b)',
              textAlign: 'right',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 0
            }}>
              {proj.name}
            </span>
            <div style={{ flex: 1, height: '26px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: proj.width,
                  height: '24px',
                  background: 'linear-gradient(90deg, #38bdf8 0%, #2563eb 100%)',
                  borderRadius: '9999px',
                  boxShadow: '0 3px 8px rgba(37, 99, 235, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '0.65rem',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: '55px'
                }}
              >
                {proj.val}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dashed Scale Guideline at Bottom */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingLeft: '225px',
        borderTop: '1px dashed var(--border-color, #e2e8f0)',
        paddingTop: '0.5rem',
        fontSize: '0.74rem',
        color: 'var(--text-secondary, #94a3b8)',
        fontWeight: '700'
      }}>
        <span>0</span>
        <span>100</span>
        <span>200</span>
        <span>300</span>
        <span>400</span>
      </div>
    </div>
  );
};

/* ==========================================================================
   Modular Component 8: RecentActivityFeed (With 1-Click Quick Approve/Reject)
   ========================================================================== */
export const RecentActivityFeed = ({ expenses = [], onApproveExpense, onRejectExpense, onViewAll }) => {
  // Map actual expenses to activities
  const activities = expenses.slice(0, 4).map(e => {
    const projName = e.projectName || 'Site';
    const cleanProj = projName.includes('Site') ? projName.replace(' Site ', '-') : projName;
    const supFirstName = e.supervisorName ? e.supervisorName.split(' ')[0] : 'Staff';
    return {
      id: e.id,
      title: `${cleanProj} ${e.category || 'Expense'} (${supFirstName})`,
      sub: e.description || 'inhouse site work',
      val: `₹${(e.amount || 0).toLocaleString('en-IN')}`,
      time: e.time || '12:00 PM',
      status: e.status ? e.status.toLowerCase() : 'pending',
      isRed: e.status === 'Pending'
    };
  });

  return (
    <div className="dash-panel-card">
      <div className="dash-panel-header">
        <div>
          <h2 className="dash-panel-title">Recent Activity (Expense Review)</h2>
          <p className="dash-panel-sub">Supervisor site expense submissions requiring verification & approval</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
        {activities.map((item) => {
          const status = item.status;
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                backgroundColor: status === 'approved'
                  ? 'rgba(16, 185, 129, 0.12)'
                  : status === 'rejected'
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'var(--input-bg, #f8fafc)',
                border: `1px solid ${status === 'approved' ? '#10b981' : status === 'rejected' ? '#ef4444' : 'var(--border-color, #f1f5f9)'}`,
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: status === 'approved' ? '#10b981' : status === 'rejected' ? '#64748b' : item.isRed ? '#f43f5e' : '#10b981',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '1rem',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
                }}>
                  ₹
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </p>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-secondary, #64748b)', fontWeight: '500' }}>
                    {item.sub}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: '800', color: status === 'rejected' ? 'var(--text-secondary, #94a3b8)' : item.isRed ? '#f43f5e' : '#10b981' }}>
                    {item.val}
                  </p>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: '600' }}>
                    {item.time}
                  </p>
                </div>

                {/* 1-Click Quick Approve & Forward / Reject Action Buttons */}
                {status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <button
                      onClick={() => onApproveExpense && onApproveExpense(item.id, 'Approved and forwarded to Accounts')}
                      title="Approve and Forward to Accounts"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '7px',
                        padding: '0.32rem 0.65rem',
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        boxShadow: '0 2px 6px rgba(99, 102, 241, 0.35)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <CheckCircle2 size={12} />
                      + Approve & Forward
                    </button>
                    <button
                      onClick={() => onRejectExpense && onRejectExpense(item.id, 'Rejected by operations')}
                      title="Reject Claim"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '7px',
                        padding: '0.32rem 0.55rem',
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onApproveExpense && onApproveExpense(item.id, 'Reset to Pending', 'Pending')}
                    title="Click to reset back to Pending"
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '0.28rem 0.6rem',
                      borderRadius: '8px',
                      backgroundColor: status === 'approved' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      border: `1px solid ${status === 'approved' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      color: status === 'approved' ? '#10b981' : '#f87171',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    {status === 'approved' ? (
                      <>
                        <CheckCircle2 size={12} />
                        Approved
                      </>
                    ) : (
                      <>
                        <XCircle size={12} />
                        Rejected
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
    if (shortName.includes('Sangamner')) shortName = 'Sangamner-P1';
    else if (shortName.includes('Nashik')) shortName = 'Nashik-P3';
    else if (shortName.includes('Pune')) shortName = 'Pune-P2';

    // Calculate actual expenses for this project from expenses list or p.spent
    const projectExpenses = expenses.filter(e => e.projectId === p.id || e.projectName === p.name);
    const expSum = projectExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const fallbackSpent = idx === 0 ? 72500 : idx === 1 ? 48300 : 62500;
    const spentVal = expSum > 0 ? expSum : (Number(p.spent) || fallbackSpent);

    return {
      name: shortName,
      fullName: p.name || shortName,
      rawProject: p,
      value: spentVal,
      color: projectColors[idx % projectColors.length]
    };
  }) : [
    { name: 'Sangamner-P1', fullName: 'Sangamner Eco Toilet', value: 72500, color: '#2563eb' },
    { name: 'Nashik-P3', fullName: 'Nashik Highway Sanitation', value: 62500, color: '#10b981' },
    { name: 'Pune-P2', fullName: 'Pune Smart E-Toilets', value: 48300, color: '#f59e0b' },
  ];

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
          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>
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
  setActiveTab,
  onOpenCreateProject,
  onSelectProject,
  onApproveExpense,
  onRejectExpense
}) => {
  const { language } = useLanguage();

  const pendingBillsCount = expenses.filter(e => e.status === 'Pending').length;
  const approvedTotalSpent = expenses.filter(e => e.status === 'Approved').reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Official Project Summary Table directly from ASEMS Documentation Section 12 (3 Projects)
  const projectSummaryRows = [
    { project: 'Sangamner-P1', site: 'Sangamner', supervisor: 'Rohit Sharma', status: 'In Progress', budget: '₹2,00,000', expense: '₹72,500', advance: '₹50,000', balance: '₹77,500' },
    { project: 'Pune-P2', site: 'Pune', supervisor: 'Amit Deshmukh', status: 'In Progress', budget: '₹1,50,000', expense: '₹48,300', advance: '₹40,000', balance: '₹61,700' },
    { project: 'Nashik-P3', site: 'Nashik', supervisor: 'Sagar Patil', status: 'In Progress', budget: '₹2,50,000', expense: '₹62,500', advance: '₹50,000', balance: '₹1,37,500' },
  ];

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
          value={String(projects.length || 3)}
          badgeText={`${projects.length || 3} Site Projects`}
          badgeType="positive"
          icon={Folder}
          iconBg="#ea580c"
          onClick={() => setActiveTab && setActiveTab('projects')}
        />
        {/* Row 1, Card 3: Supervisors */}
        <StatCard
          title="Supervisors"
          value={String(supervisors.length || 3)}
          badgeText={`${supervisors.length || 3} Active`}
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
            onClick={() => setActiveTab && setActiveTab('projects')}
          />

          {/* Card 2: Assign Supervisors & Teams */}
          <QuickActionCard
            title="Assign Supervisors & Team"
            description="Deploy Rohit, Amit, Sagar & field crew"
            icon={Users}
            iconBg="#2563eb"
            onClick={() => setActiveTab && setActiveTab('team')}
          />

          {/* Card 3: Bill Approve */}
          <QuickActionCard
            title="Bill Approve"
            description="Review and audit daily site claims & bills"
            icon={IndianRupee}
            iconBg="#ea580c"
            onClick={() => setActiveTab && setActiveTab('expenses')}
          />

          {/* Card 4: Cash & Advance */}
          <QuickActionCard
            title="Cash & Advance"
            description="Manage supervisor floats & site cash settlements"
            icon={IndianRupee}
            iconBg="#7c3aed"
            onClick={() => setActiveTab && setActiveTab('cashadvance')}
          />

          {/* Card 5: Request Advance */}
          <QuickActionCard
            title="Request Advance"
            description="Audit UTR bank matching & supervisor advance requests"
            icon={Scale}
            iconBg="#059669"
            onClick={() => setActiveTab && setActiveTab('reconciliation')}
          />
        </div>
      </div>

      {/* 4. Analytics & Charts Row (2 Balanced Columns: Bar Chart & Pie Chart) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1.25rem',
        marginTop: '1.25rem'
      }}>
        {/* Left: Top Projects Breakdown Bar Chart */}
        <TopRevenueProjectsChart 
          projects={projects} 
          onViewAll={() => setActiveTab && setActiveTab('projects')} 
          onSelectProject={onSelectProject}
          setActiveTab={setActiveTab}
        />

        {/* Right: Interactive Pie Chart (Expense & Budget Distribution) */}
        <BudgetDistributionPieChart 
          expenses={expenses} 
          projects={projects} 
          onViewAll={() => setActiveTab && setActiveTab('expenses')}
          onSelectProject={onSelectProject}
          setActiveTab={setActiveTab}
        />
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


