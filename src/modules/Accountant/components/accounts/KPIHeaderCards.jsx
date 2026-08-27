import React from 'react';
import { 
  Wallet, 
  Send, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  XCircle,
  CreditCard,
  Building2,
  FileSpreadsheet,
  Activity,
  ShieldCheck,
  Tag,
  Receipt,
  FileText
} from 'lucide-react';

const KPIHeaderCards = ({ projects, expenses, advances, settlements, onNavigateTab }) => {
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalFundsReleased = projects.reduce((acc, p) => acc + (p.fundsReleased || 0), 0);
  const totalProjectExpenses = projects.reduce((acc, p) => acc + (p.expenses || 0), 0);
  const totalSupervisorWalletBalance = projects.reduce((acc, p) => acc + (p.balance || 0), 0);
  
  const totalAdvancesDisbursed = advances
    .filter(a => a.status === 'Disbursed')
    .reduce((acc, a) => acc + (a.approvedAmount || 0), 0);

  const totalVerifiedExpenses = expenses
    .filter(e => e.status === 'Accounts Verified & Paid')
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  const pendingVerificationList = expenses.filter(e => e.status === 'Pending Accounts Verification');
  const pendingVerificationAmount = pendingVerificationList.reduce((acc, e) => acc + (e.amount || 0), 0);

  const pendingAdvancesList = advances.filter(a => a.status === 'Pending Accounts Payment');
  const pendingAdvancesAmount = pendingAdvancesList.reduce((acc, a) => acc + (a.approvedAmount || 0), 0);

  const correctionList = expenses.filter(e => e.status === 'Sent for Correction');
  const pendingSettlementsList = settlements.filter(s => s.status !== 'Completed');

  const totalPendingAmount = pendingVerificationAmount + pendingAdvancesAmount;
  const totalPendingCount = pendingVerificationList.length + pendingAdvancesList.length;

  const budgetVariance = totalBudget - totalProjectExpenses;
  const walletFundPercent = totalFundsReleased > 0 ? ((totalSupervisorWalletBalance / totalFundsReleased) * 100).toFixed(1) : 0;
  const spentPercent = totalFundsReleased > 0 ? ((totalProjectExpenses / totalFundsReleased) * 100).toFixed(1) : 0;

  const totalAuditItems = expenses.length;
  const verifiedExpensesCount = expenses.filter(e => e.status === 'Accounts Verified & Paid').length;
  const pendingAuditCount = totalAuditItems - verifiedExpensesCount;
  const auditReadinessPercent = totalAuditItems > 0 
    ? Math.round((verifiedExpensesCount / totalAuditItems) * 100) 
    : 100;
  const isFullyAuditReady = auditReadinessPercent === 100 && correctionList.length === 0;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const cards = [
    {
      id: 'funds_released',
      title: 'Total Funds Released',
      value: formatINR(totalFundsReleased),
      icon: Wallet,
      iconBg: '#2563eb', // Royal Blue
      pillText: `${projects.length} Sites Funded`,
      pillType: 'success',
      targetTab: 'advances'
    },
    {
      id: 'expenses',
      title: 'Total Expenses',
      value: formatINR(totalProjectExpenses),
      icon: Receipt,
      iconBg: '#7c3aed', // Purple
      pillText: `${spentPercent}% of released`,
      pillType: 'success',
      targetTab: 'verification'
    },
    {
      id: 'supervisor_wallets',
      title: 'Supervisor Wallets',
      value: formatINR(totalSupervisorWalletBalance),
      icon: CreditCard,
      iconBg: '#059669', // Emerald Green
      pillText: `${walletFundPercent}% cash on site`,
      pillType: 'success',
      targetTab: 'wallets'
    },
    {
      id: 'pending',
      title: 'Pending Approval',
      value: totalPendingCount > 0 ? `${totalPendingCount}` : '0',
      icon: Clock,
      iconBg: '#f59e0b', // Amber/Orange
      pillText: totalPendingCount > 0 ? `${totalPendingCount} Needs action` : 'All clear',
      pillType: totalPendingCount > 0 ? 'warning' : 'success',
      targetTab: 'verification'
    },
    {
      id: 'corrections',
      title: 'Correction Required',
      value: `${correctionList.length}`,
      icon: XCircle,
      iconBg: '#e11d48', // Red / Rose
      pillText: correctionList.length > 0 ? `${correctionList.length} Needs check` : '0 Critical',
      pillType: correctionList.length > 0 ? 'danger' : 'success',
      targetTab: 'verification'
    },
    {
      id: 'reports',
      title: 'Financial Reports',
      value: `${auditReadinessPercent}%`,
      icon: FileSpreadsheet,
      iconBg: isFullyAuditReady ? '#059669' : '#e11d48',
      pillText: isFullyAuditReady 
        ? 'Audit Ready' 
        : (correctionList.length > 0 
            ? `${correctionList.length} Correction Required` 
            : `${pendingAuditCount} Pending Audit`),
      pillType: isFullyAuditReady ? 'success' : (auditReadinessPercent >= 75 ? 'warning' : 'danger'),
      targetTab: 'reports'
    }
  ];

  return (
    <div className="kpi-cards-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSuccess = card.pillType === 'success';
        const isDanger = card.pillType === 'danger';
        const isWarning = card.pillType === 'warning';

        return (
          <div
            key={card.id}
            onClick={() => onNavigateTab && card.targetTab && onNavigateTab(card.targetTab)}
            className="kpi-hover-card"
            style={{
              backgroundColor: 'var(--surface-bg, #ffffff)',
              borderRadius: '18px',
              padding: '1.15rem 1.25rem',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '135px',
              cursor: onNavigateTab ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {/* Top Row: Title + Metric on Left, Vibrant Icon Box on Right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: 'var(--text-secondary, #64748b)',
                  marginBottom: '0.35rem',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {card.title}
                </div>
                <div style={{
                  fontSize: '1.45rem',
                  fontWeight: '800',
                  color: 'var(--text-primary, #0f172a)',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.15',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {card.value}
                </div>
              </div>

              {/* Right Side Solid Vibrant Colored Rounded Square */}
              <div 
                className="kpi-icon-box"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: card.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: `0 6px 14px -2px ${card.iconBg}40`,
                  flexShrink: 0
                }}
              >
                <Icon size={21} strokeWidth={2.3} color="#ffffff" />
              </div>
            </div>

            {/* Bottom Row: Pill Badge with Trend Indicator */}
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.22rem 0.65rem',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                backgroundColor: isDanger 
                  ? '#fee2e2' 
                  : isWarning 
                  ? '#fef3c7' 
                  : '#dcfce7',
                color: isDanger 
                  ? '#b91c1c' 
                  : isWarning 
                  ? '#b45309' 
                  : '#15803d'
              }}>
                {isDanger ? (
                  <TrendingDown size={12} strokeWidth={2.5} />
                ) : isWarning ? (
                  <AlertCircle size={12} strokeWidth={2.5} />
                ) : (
                  <TrendingUp size={12} strokeWidth={2.5} />
                )}
                <span>{card.pillText}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPIHeaderCards;


