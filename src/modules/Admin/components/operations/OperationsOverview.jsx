import React, { useState } from 'react';
import {
  Building2, Users, IndianRupee, Layers, Monitor, CreditCard,
  ArrowRight, ArrowUpRight, ArrowDownRight, Activity, HardHat, Clock, ChevronRight,
  Tag, CheckCircle2, XCircle, Wrench, UserPlus, PlusCircle, Folder, Scale, ShieldCheck,
  TrendingUp, AlertTriangle, PieChart as PieIcon, Download, Calendar, Send, Image as ImageIcon, FileSpreadsheet, Briefcase
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
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
   Modular Component 2: DashboardHeader with Date Filter & Action Tools
   ========================================================================== */
export const DashboardHeader = ({
  title = 'Welcome to',
  highlight = 'Dashboard',
  subtitle = 'Hello Admin, here is your system overview.',
  dateFilter = 'all',
  onDateFilterChange,
  onExportPDF,
  onOpenTransferAdvance,
  onOpenPhotoGallery
}) => (
  <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
    <div>
      <h1 className="dash-header-title" style={{ fontSize: '1.95rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
        {title} <span style={{ color: '#2563eb' }}>{highlight}</span>
      </h1>
      <p className="dash-header-sub" style={{ fontSize: '0.98rem', color: '#64748b', margin: '0.35rem 0 0 0', fontWeight: '500' }}>
        {subtitle}
      </p>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
      {onOpenPhotoGallery && (
        <button
          onClick={onOpenPhotoGallery}
          style={{
            padding: '0.5rem 1.1rem', borderRadius: '10px', border: '1.5px solid #c7d2fe',
            backgroundColor: '#eef2ff', color: '#4f46e5', fontSize: '0.88rem', fontWeight: '800',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
          }}
        >
          <ImageIcon size={16} />
          <span>Photo Gallery</span>
        </button>
      )}
      {onOpenTransferAdvance && (
        <button
          onClick={onOpenTransferAdvance}
          style={{
            padding: '0.5rem 1.1rem', borderRadius: '10px', border: '1.5px solid #a7f3d0',
            backgroundColor: '#ecfdf5', color: '#059669', fontSize: '0.88rem', fontWeight: '800',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
          }}
        >
          <Send size={16} />
          <span>Transfer Advance</span>
        </button>
      )}
      {onExportPDF && (
        <button
          onClick={onExportPDF}
          style={{
            padding: '0.5rem 1.1rem', borderRadius: '10px', border: '1.5px solid #cbd5e1',
            backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.88rem', fontWeight: '800',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
          }}
        >
          <Download size={16} />
          <span>Export PDF</span>
        </button>
      )}
    </div>
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
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.96rem', color: 'var(--text-secondary, #64748b)', fontWeight: '700', letterSpacing: '-0.01em' }}>
          {title}
        </span>
        <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary, #1e293b)', margin: '0.1rem 0', lineHeight: 1.1 }}>
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
              fontSize: '0.88rem',
              fontWeight: '800',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              width: 'fit-content'
            }}
          >
            {isDanger ? (
              <ArrowDownRight size={15} strokeWidth={2.5} />
            ) : (
              <ArrowUpRight size={15} strokeWidth={2.5} />
            )}
            <span>{badgeText}</span>
          </span>
        </div>
      </div>

      {/* Right Column: Exact Saturated Rounded Squircle Icon Box */}
      <div
        style={{
          backgroundColor: iconBg,
          width: '58px',
          height: '58px',
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0,
          boxShadow: `0 8px 18px -3px ${iconBg}66`
        }}
      >
        {Icon ? <Icon size={28} strokeWidth={2.3} /> : <Building2 size={28} strokeWidth={2.3} />}
      </div>
    </div>
  );
};

/* ==========================================================================
   Modular Component 4: QuickActionCard (Larger Height & Padding)
   ========================================================================== */
export const QuickActionCard = ({ title, icon: Icon, iconBg, badge, onClick }) => (
  <div
    className="dash-quick-card"
    onClick={onClick}
    style={{
      backgroundColor: 'var(--card-bg, #ffffff)',
      border: '1px solid var(--border-color, #eef2f6)',
      borderRadius: '20px',
      padding: '1.45rem 1.65rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '108px',
      cursor: 'pointer',
      boxSizing: 'border-box',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      transition: 'all 0.25s ease'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', minWidth: 0, flex: 1 }}>
      <div
        style={{
          backgroundColor: iconBg,
          width: '54px',
          height: '54px',
          minWidth: '54px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0,
          boxShadow: `0 8px 18px -3px ${iconBg}55`
        }}
      >
        {Icon ? <Icon size={26} strokeWidth={2.3} /> : <Building2 size={26} strokeWidth={2.3} />}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h3 style={{ 
            fontSize: '1.2rem', 
            fontWeight: '800', 
            color: 'var(--text-primary, #0f172a)', 
            margin: 0, 
            lineHeight: 1.25, 
            letterSpacing: '-0.01em'
          }}>
            {title}
          </h3>
          {badge > 0 && (
            <span style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: '800',
              padding: '0.18rem 0.55rem',
              borderRadius: '9999px',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
            }}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
    <ArrowRight size={24} strokeWidth={2.3} style={{ color: '#94a3b8', flexShrink: 0, marginLeft: '0.65rem' }} />
  </div>
);

/* ==========================================================================
   Modular Component 5: RevenueChart (1-Month Monthly Expense Trend)
   ========================================================================== */
export const RevenueChart = () => {
  const chartData = [
    { day: 'Aug 01', label: '₹12k', height: 55, active: true },
    { day: 'Aug 05', label: '₹28k', height: 105, active: true },
    { day: 'Aug 10', label: '₹15k', height: 65, active: true },
    { day: 'Aug 15', label: '₹45k', height: 145, active: true },
    { day: 'Aug 18', label: '₹18k', height: 75, active: true },
    { day: 'Aug 21', label: '₹75k', height: 195, active: true },
    { day: 'Aug 25', label: '₹32k', height: 115, active: true },
    { day: 'Aug 30', label: '₹20k', height: 85, active: true },
  ];

  return (
    <div className="dash-analytics-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div className="dash-card-header">
        <h2 style={{ fontSize: '1.22rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
          1-Month Monthly Expenses (₹)
        </h2>
        <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0, fontWeight: '500' }}>
          Site expense disbursement trend over the past 1 month
        </p>
      </div>

      {/* Bar Chart Area with Dashed Guide Lines (Full Height) */}
      <div className="dash-chart-container" style={{ position: 'relative', marginTop: '1.5rem', height: '240px' }}>
        {/* Dashed Horizontal Grid lines (₹80k, ₹50k, ₹25k, ₹0) */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '20px', borderBottom: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '0.86rem', color: '#94a3b8', position: 'absolute', left: '0.25rem', top: '-12px', fontWeight: '700' }}>₹80k</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '80px', borderBottom: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '0.86rem', color: '#94a3b8', position: 'absolute', left: '0.25rem', top: '-12px', fontWeight: '700' }}>₹50k</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '140px', borderBottom: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '0.86rem', color: '#94a3b8', position: 'absolute', left: '0.25rem', top: '-12px', fontWeight: '700' }}>₹25k</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: '24px', borderBottom: '1px solid #cbd5e1', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '0.86rem', color: '#94a3b8', position: 'absolute', left: '0.25rem', top: '-12px', fontWeight: '700' }}>₹0</span>
        </div>

        {/* Bars Container */}
        <div style={{ position: 'absolute', left: '2.5rem', right: '0.5rem', top: 0, bottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 2 }}>
          {chartData.map((item) => (
            <div key={item.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', flex: 1, gap: '0.45rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: item.active ? '#0f172a' : '#94a3b8' }}>
                {item.label}
              </span>
              <div
                style={{
                  width: '36px',
                  height: `${item.height}px`,
                  background: item.active
                    ? 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)'
                    : '#e2e8f0',
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.3s ease',
                  boxShadow: item.active ? '0 4px 14px rgba(59, 130, 246, 0.35)' : 'none'
                }}
              />
              <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: '700', position: 'absolute', bottom: '-22px' }}>
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
      <h2 style={{ fontSize: '1.22rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
        Site Status Distribution
      </h2>
      <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0, fontWeight: '500' }}>
        Live operational status of all registered project sites
      </p>
    </div>

    {/* Exact Red/Coral Donut Ring with top green accent from Screenshot */}
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.25rem 0' }}>
      <div style={{
        position: 'relative',
        width: '170px',
        height: '170px',
        borderRadius: '50%',
        background: 'conic-gradient(#10b981 0% 8%, #ef4444 8% 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 20px rgba(239, 68, 68, 0.2)'
      }}>
        {/* Inner white circle hole */}
        <div style={{
          width: '126px',
          height: '126px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', lineHeight: 1 }}>{totalCount}</span>
          <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#64748b', marginTop: '0.25rem' }}>Total Sites</span>
        </div>
      </div>
    </div>

    {/* 4 Status Pill Boxes from Screenshot */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
      {/* 1. Active */}
      <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '0.65rem 0.45rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#059669', display: 'block' }}>● Active</span>
        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#065f46' }}>{activeCount}</span>
      </div>

      {/* 2. Attention / Delay */}
      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '0.65rem 0.45rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#dc2626', display: 'block' }}>● Attention</span>
        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#991b1b' }}>{inactiveCount}</span>
      </div>

      {/* 3. In Planning */}
      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '0.65rem 0.45rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#d97706', display: 'block' }}>● Planning</span>
        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#92400e' }}>{maintCount}</span>
      </div>

      {/* 4. Completed (Replaced Water Low) */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.65rem 0.45rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#2563eb', display: 'block' }}>● Completed</span>
        <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1e40af' }}>{waterLowCount}</span>
      </div>
    </div>
  </div>
);

/* ==========================================================================
   Modular Component 7: TopRevenueProjectsChart (Exact Reference Screenshot Layout)
   ========================================================================== */
export const TopRevenueProjectsChart = ({ projects = [], onViewAll }) => {
  const defaultItems = [
    { name: 'Sangamner-P1 Eco Toilet', width: '92%', val: '₹380k' },
    { name: 'Nashik-P3 Highway', width: '78%', val: '₹330k' },
    { name: 'Pune-P2 Smart Toilet', width: '58%', val: '₹250k' },
    { name: 'Supervisor Floats', width: '48%', val: '₹210k' },
    { name: 'Material Contingency', width: '8%', val: '₹20k' },
  ];

  return (
    <div className="dash-panel-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
      <div className="dash-panel-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 className="dash-panel-title" style={{ fontSize: '1.22rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0 }}>
            Top Revenue Projects
          </h2>
        </div>
      </div>

      {/* 5 Horizontal Bar Chart Rows */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        flex: 1,
        gap: '1rem',
        margin: '0.5rem 0'
      }}>
        {defaultItems.map((proj) => (
          <div key={proj.name} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{
              width: '175px',
              fontSize: '0.94rem',
              fontWeight: '700',
              color: 'var(--text-secondary, #64748b)',
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
                  height: '26px',
                  background: 'linear-gradient(90deg, #38bdf8 0%, #2563eb 100%)',
                  borderRadius: '9999px',
                  boxShadow: '0 3px 8px rgba(37, 99, 235, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '0.65rem',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: '24px'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dashed Scale Guideline at Bottom (0, 100, 200, 300, 400) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingLeft: '185px',
        borderTop: '1px dashed var(--border-color, #e2e8f0)',
        paddingTop: '0.5rem',
        fontSize: '0.85rem',
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
   Modular Component 8: RecentActivityFeed (Exact Reference Screenshot Layout)
   ========================================================================== */
export const RecentActivityFeed = ({ expenses = [], onApproveExpense, onRejectExpense, onViewAll }) => {
  const displayActivities = expenses ? expenses.slice(0, 4) : [];

  return (
    <div className="dash-panel-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
      <div className="dash-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div>
          <h2 className="dash-panel-title" style={{ fontSize: '1.22rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0 }}>
            Recent Activity
          </h2>
        </div>
        <button
          onClick={onViewAll}
          className="dash-panel-btn"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color, #e2e8f0)',
            padding: '0.4rem 0.95rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: '700',
            color: 'var(--text-primary, #0f172a)',
            cursor: 'pointer'
          }}
        >
          View All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.25rem' }}>
        {displayActivities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem', fontWeight: '500' }}>
            No recent activity available.
          </div>
        ) : (
          displayActivities.map((e) => {
            const projName = e.projectName || 'Site Project';
            const supName = (e.supervisorName || 'KAVERI GANGURDE').toUpperCase();
            const isPending = (e.status || 'Pending') === 'Pending';
            const isApproved = (e.status || '') === 'Approved';

            return (
              <div
                key={e.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.5rem',
                  borderBottom: '1px solid var(--border-color, #f1f5f9)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem', minWidth: 0 }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: isApproved ? '#10b981' : isPending ? '#f59e0b' : '#ef4444',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    fontSize: '1.1rem',
                    flexShrink: 0
                  }}>
                    ₹
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {projName} ({e.category || 'Site Claim'})
                    </p>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary, #64748b)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {e.description || 'inhouse testing'} | {supName}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '1.02rem', fontWeight: '800', color: isApproved ? '#059669' : '#ea580c' }}>
                      +₹{(e.amount || 0).toLocaleString('en-IN')}
                    </p>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: '600' }}>
                      {e.time || '14:24'}
                    </p>
                  </div>

                  {isPending && onApproveExpense && (
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => onApproveExpense(e.id, 'Fast-approved from Dashboard feed')}
                        title="Quick Approve Claim"
                        style={{
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.3rem 0.5rem',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        ✓
                      </button>
                      {onRejectExpense && (
                        <button
                          onClick={() => onRejectExpense(e.id, 'Rejected from Dashboard feed')}
                          title="Quick Reject Claim"
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '0.3rem 0.45rem',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
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
        <button onClick={onViewAll} className="dash-panel-btn">View All</button>
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

/* ==========================================================================
   Modular Component 11: BudgetDistributionPieChart (Interactive Expenses Pie Chart)
   ========================================================================== */
export const BudgetDistributionPieChart = ({ expenses = [], projects = [] }) => {
  const { language } = useLanguage();

  // Dynamic Category Calculation from expenses or realistic operational distribution
  const categoryTotals = {
    'Material': 0,
    'Transport': 0,
    'Labor': 0,
    'Equipment': 0,
  };

  if (expenses && expenses.length > 0) {
    expenses.forEach(e => {
      const cat = (e.category || '').toLowerCase();
      const amt = Number(e.amount) || 0;
      if (cat.includes('material') || cat.includes('cement') || cat.includes('pipe')) {
        categoryTotals['Material'] += amt;
      } else if (cat.includes('transport') || cat.includes('conveyance') || cat.includes('travel') || cat.includes('tempo')) {
        categoryTotals['Transport'] += amt;
      } else if (cat.includes('labor') || cat.includes('wages') || cat.includes('excavation')) {
        categoryTotals['Labor'] += amt;
      } else {
        categoryTotals['Equipment'] += amt;
      }
    });
  }

  // If no expenses, use standard operational project allocation
  const pieData = [
    { name: language === 'mr' ? 'साहित्य खरेदी (Material)' : 'Material Purchase', value: categoryTotals['Material'] || 72500, color: '#2563eb' },
    { name: language === 'mr' ? 'मजुरी खर्च (Labor)' : 'Labor & Wages', value: categoryTotals['Labor'] || 48000, color: '#10b981' },
    { name: language === 'mr' ? 'वाहतूक / प्रवास (Transport)' : 'Transport & Freight', value: categoryTotals['Transport'] || 32000, color: '#f59e0b' },
    { name: language === 'mr' ? 'मशिनरी / इतर (Equipment)' : 'Equipment & Tools', value: categoryTotals['Equipment'] || 30800, color: '#e11d48' },
  ];

  const totalExpenseVal = pieData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="dash-panel-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
      <div className="dash-panel-header" style={{ marginBottom: '0.5rem' }}>
        <div>
          <h2 className="dash-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <PieIcon size={18} style={{ color: '#2563eb' }} />
            <span>{language === 'mr' ? 'खर्च व बजेट वाटप (Pie Chart)' : 'Expense & Budget Distribution'}</span>
          </h2>
          <p className="dash-panel-sub">
            {language === 'mr' ? 'प्रोजेक्ट साईटवरील कॅटेगरीनुसार खर्चाचे वर्गीकरण' : 'Category-wise site operational expenditure breakdown'}
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
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
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

        {/* Center Total Amount Badge */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', display: 'block', letterSpacing: '0.05em' }}>
            Total
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>
            ₹{(totalExpenseVal / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Color-Coded Category Legend Badges */}
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
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.45rem 0.65rem',
              borderRadius: '8px',
              backgroundColor: 'var(--input-bg, #f8fafc)',
              border: '1px solid var(--border-color, #f1f5f9)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary, #334155)', fontWeight: '700', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name.split(' (')[0]}
              </span>
            </div>
            <span style={{ fontWeight: '800', color: 'var(--text-primary, #0f172a)', fontSize: '0.85rem', marginLeft: '0.4rem' }}>
              ₹{(item.value / 1000).toFixed(0)}k
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
  organizations = [],
  accountants = [],
  expenses = [],
  setActiveTab,
  onOpenCreateProject,
  onSelectProject,
  onApproveExpense,
  onRejectExpense,
  onOpenTransferAdvance,
  onOpenPhotoGallery
}) => {
  const { language } = useLanguage();
  const [dateFilter, setDateFilter] = useState('all');

  // Filter expenses based on selected date range
  const filteredExpenses = expenses.filter(e => {
    if (dateFilter === 'all') return true;
    const now = new Date();
    const expDate = e.date ? new Date(e.date) : now;
    if (dateFilter === 'today') {
      return expDate.toISOString().split('T')[0] === now.toISOString().split('T')[0];
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return expDate >= oneWeekAgo;
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return expDate >= oneMonthAgo;
    }
    return true;
  });

  const pendingBillsCount = filteredExpenses.filter(e => e.status === 'Pending').length;
  const totalProjectSpent = projects.reduce((acc, p) => acc + (Number(p.spent) || 0), 0) || 183300;

  // Official Project Summary Table directly from ASEMS Documentation Section 12 (3 Projects)
  const projectSummaryRows = [
    { project: 'Sangamner-P1', site: 'Sangamner', supervisor: 'Rohit Sharma', status: 'In Progress', budget: '₹2,00,000', expense: '₹72,500', advance: '₹50,000', balance: '₹77,500' },
    { project: 'Pune-P2', site: 'Pune', supervisor: 'Amit Deshmukh', status: 'In Progress', budget: '₹1,50,000', expense: '₹48,300', advance: '₹40,000', balance: '₹61,700' },
    { project: 'Nashik-P3', site: 'Nashik', supervisor: 'Sagar Patil', status: 'In Progress', budget: '₹2,50,000', expense: '₹62,500', advance: '₹50,000', balance: '₹1,37,500' },
  ];

  const handleExportReport = () => {
    const columns = ['Project Code', 'Site Location', 'Lead Supervisor', 'Project Status', 'Allocated Budget', 'Total Expenses', 'Advance Paid', 'Remaining Balance'];
    const rows = projectSummaryRows.map(p => [
      p.project,
      p.site,
      p.supervisor,
      p.status,
      p.budget,
      p.expense,
      p.advance,
      p.balance
    ]);

    exportToPDF(
      'AARYA INNOVTECH - Site Operations & Expense Executive Report',
      columns,
      rows
    );
  };

  return (
    <div className="dash-container">
      {/* 1. Header: Welcome to Dashboard with Date Filter & Action Tools */}
      <DashboardHeader
        title="Welcome to"
        highlight="Dashboard"
        subtitle="Hello Admin, here is your real-time site operations overview."
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onExportPDF={handleExportReport}
        onOpenTransferAdvance={onOpenTransferAdvance}
        onOpenPhotoGallery={onOpenPhotoGallery}
      />

      {/* 2. Top 4 Statistics Cards: Total Operational Head, Total Projects, Total Supervisors, Total Accountants */}
      <div className="dash-stats-grid">
        {/* Card 1: Total Operational Head */}
        <StatCard
          title="Total Operational Head"
          value={String(organizations.length || 3)}
          badgeText="Active Head"
          badgeType="positive"
          icon={ShieldCheck}
          iconBg="#2563eb"
          onClick={() => setActiveTab && setActiveTab('operational-head')}
        />

        {/* Card 2: Total Projects */}
        <StatCard
          title="Total Projects"
          value={String(projects.length || 3)}
          badgeText="Ongoing Sites"
          badgeType="positive"
          icon={HardHat}
          iconBg="#ea580c"
          onClick={() => setActiveTab && setActiveTab('projects')}
        />

        {/* Card 3: Total Supervisors */}
        <StatCard
          title="Total Supervisors"
          value={String(supervisors.length || 4)}
          badgeText="Active on Site"
          badgeType="positive"
          icon={Users}
          iconBg="#06b6d4"
          onClick={() => setActiveTab && setActiveTab('supervisors')}
        />

        {/* Card 4: Total Accountants */}
        <StatCard
          title="Total Accountants"
          value={String(accountants.length || 2)}
          badgeText="Finance & Bills"
          badgeType="positive"
          icon={Briefcase}
          iconBg="#10b981"
          onClick={() => setActiveTab && setActiveTab('accountant')}
        />
      </div>

      {/* 3. Quick Access (6 Modules matching user screenshot) */}
      <div>
        <h2 className="dash-section-title">
          Quick Access
        </h2>

        <div className="dash-quick-grid">
          {/* Card 1: Operational Head */}
          <QuickActionCard
            title="Operational Head"
            icon={ShieldCheck}
            iconBg="#2563eb"
            onClick={() => setActiveTab && setActiveTab('operational-head')}
          />

          {/* Card 2: Site Projects */}
          <QuickActionCard
            title="Site Projects"
            icon={HardHat}
            iconBg="#ea580c"
            onClick={() => setActiveTab && setActiveTab('projects')}
          />

          {/* Card 3: Site Supervisor */}
          <QuickActionCard
            title="Site Supervisor"
            icon={Users}
            iconBg="#06b6d4"
            onClick={() => setActiveTab && setActiveTab('supervisors')}
          />

          {/* Card 4: Accountant */}
          <QuickActionCard
            title="Accountant"
            icon={Briefcase}
            iconBg="#10b981"
            onClick={() => setActiveTab && setActiveTab('accountant')}
          />
        </div>
      </div>
    </div>
  );
};

export default OperationsOverview;


