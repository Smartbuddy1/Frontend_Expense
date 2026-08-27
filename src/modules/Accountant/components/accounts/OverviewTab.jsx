import React from 'react';
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
  CartesianGrid
} from 'recharts';
import { 
  Building2, 
  TrendingUp, 
  Clock, 
  Send, 
  ArrowUpRight, 
  Zap,
  ExternalLink,
  Wallet,
  CreditCard,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

const OverviewTab = ({ 
  projects, 
  expenses, 
  advances, 
  settlements, 
  auditLogs,
  onNavigateTab,
  onInspectExpense,
  onDisburseAdvance 
}) => {
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const projectChartData = projects.map(p => ({
    name: p.name.split(' ')[0],
    fullName: p.name,
    Released: p.fundsReleased,
    Expenses: p.expenses,
    WalletBalance: p.balance
  }));

  const categoryMap = {};
  expenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + (e.amount || 0);
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  const totalCategoryExpense = categoryData.reduce((acc, c) => acc + (c.value || 0), 0);
  const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  const pendingVerificationList = expenses.filter(e => e.status === 'Pending Accounts Verification');
  const pendingVerificationAmount = pendingVerificationList.reduce((acc, e) => acc + (e.amount || 0), 0);

  const pendingAdvancesList = advances.filter(a => a.status === 'Pending Accounts Payment');
  const pendingAdvancesAmount = pendingAdvancesList.reduce((acc, a) => acc + (a.approvedAmount || 0), 0);

  const pendingSettlementsList = settlements.filter(s => s.status !== 'Completed');
  const totalVerifiedExpenses = expenses.filter(e => e.status === 'Accounts Verified & Paid').reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalFundsReleased = projects.reduce((acc, p) => acc + (p.fundsReleased || 0), 0);
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

  // Accounts Module Quick Action Cards matching sample
  const moduleCards = [
    {
      id: 'verification',
      title: 'Expense Verification',
      desc: 'Verify site procurement & invoices',
      icon: Clock,
      color: '#059669' // Emerald Green
    },
    {
      id: 'wallets',
      title: 'Wallet Funds',
      desc: 'Site supervisor float & top-ups',
      icon: Wallet,
      color: '#10b981' // Green
    },
    {
      id: 'advances',
      title: 'Advance Payouts',
      desc: 'Disburse requested site funds',
      icon: Send,
      color: '#2563eb' // Vibrant Blue
    },
    {
      id: 'ledger',
      title: 'Payment Ledger',
      desc: 'Bank transfer trail & vouchers',
      icon: CreditCard,
      color: '#06b6d4' // Vibrant Cyan
    },
    {
      id: 'analytics',
      title: 'Financial Analytics',
      desc: 'Cashflow run-rate & supervisor graphs',
      icon: Activity,
      color: '#ec4899' // Vibrant Rose
    },
    {
      id: 'reports',
      title: 'Financial Reports',
      desc: 'Project-wise expense & audit sheets',
      icon: FileSpreadsheet,
      color: '#6366f1' // Vibrant Indigo
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. ACCOUNTS QUICK ACTIONS CARDS GRID (Matching User Sample) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Quick Actions
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              Select any action card to redirect directly to the respective accounts section
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', padding: '0.25rem 0.7rem', borderRadius: '20px' }}>
            Click card to open
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.15rem'
        }}>
          {moduleCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigateTab && onNavigateTab(card.id)}
                className="quick-action-sample-card"
                style={{
                  backgroundColor: 'var(--surface-bg, #ffffff)',
                  borderRadius: '18px',
                  padding: '1.25rem 1.4rem',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Left: Solid Rounded Color Icon Box + Text */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', minWidth: 0, flex: 1 }}>
                  <div 
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      backgroundColor: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                      boxShadow: `0 6px 14px ${card.color}35`
                    }}
                  >
                    <Icon size={23} strokeWidth={2.3} color="#ffffff" />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '800',
                      color: 'var(--text-primary)',
                      marginBottom: '0.2rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      letterSpacing: '-0.01em'
                    }}>
                      {card.title}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {card.desc}
                    </div>
                  </div>
                </div>

                {/* Right: Subtle Light Arrow */}
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#94a3b8' }}>
                  <ArrowRight size={20} strokeWidth={2} color="#94a3b8" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. VISUAL CHARTS GRID */}
      <div className="overview-charts-grid">
        
        {/* Project Financial Comparison (Bar Chart) */}
        <div style={{
          backgroundColor: 'var(--surface-bg)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
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
              onClick={() => onNavigateTab('analytics')}
              style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer', flexShrink: 0 }}
            >
              Analytics Hub <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ width: '100%', height: '330px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectChartData} maxBarSize={28} barGap={4} margin={{ top: 15, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '0.78rem', paddingBottom: '14px' }} />
                <XAxis 
                  dataKey="name" 
                  interval={0} 
                  tick={({ x, y, payload }) => {
                    if (!payload || !payload.value) return null;
                    const text = String(payload.value);
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
                  }}
                  height={56}
                  stroke="var(--text-secondary)" 
                  tickLine={false} 
                />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} tickLine={false} />
                <Tooltip 
                  formatter={(value) => [formatINR(value)]}
                  contentStyle={{ backgroundColor: 'var(--surface-bg)', borderRadius: '10px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <Bar dataKey="Released" fill="#3b82f6" maxBarSize={28} radius={[4, 4, 0, 0]} name="Funds Released" />
                <Bar dataKey="Expenses" fill="#7c3aed" maxBarSize={28} radius={[4, 4, 0, 0]} name="Verified Expenses" />
                <Bar dataKey="WalletBalance" fill="#10b981" maxBarSize={28} radius={[4, 4, 0, 0]} name="Site Wallet Balance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Distribution (Donut Chart) */}
        <div style={{
          backgroundColor: 'var(--surface-bg)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Expense Breakdown by Category
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Materials, Labour, Lodging, Transport & Food
              </p>
            </div>
            <button 
              onClick={() => onNavigateTab('reports')}
              style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
            >
              Reports Hub <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="overview-pie-container">
            <div className="overview-pie-chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={74}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatINR(value)]}
                    contentStyle={{ backgroundColor: 'var(--surface-bg)', borderRadius: '10px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="overview-pie-legend">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="overview-pie-legend-row">
                  <div className="overview-pie-legend-label">
                    <span 
                      className="overview-pie-legend-dot" 
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} 
                    />
                    <span className="overview-pie-legend-name">
                      {cat.name}
                    </span>
                  </div>
                  <strong className="overview-pie-legend-amount">
                    {formatINR(cat.value)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OverviewTab;

