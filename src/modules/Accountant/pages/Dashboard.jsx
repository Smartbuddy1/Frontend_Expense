import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Wallet, 
  Send, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp, 
  CreditCard, 
  FileSpreadsheet, 
  ShieldCheck, 
  Bell, 
  Filter, 
  Download, 
  Calendar, 
  Layers, 
  Sparkles,
  Folder,
  Activity,
  Users
} from 'lucide-react';

import { 
  INITIAL_PROJECTS, 
  INITIAL_EXPENSES, 
  INITIAL_ADVANCES, 
  INITIAL_PAYMENTS_LEDGER, 
  INITIAL_SETTLEMENTS, 
  AUDIT_LOGS 
} from '../data/accountsMockData';

import KPIHeaderCards from '../components/accounts/KPIHeaderCards';
import OverviewTab from '../components/accounts/OverviewTab';
import AnalyticsTab from '../components/accounts/AnalyticsTab';
import ExpenseVerificationTab from '../components/accounts/ExpenseVerificationTab';
import AdvanceDisbursalTab from '../components/accounts/AdvanceDisbursalTab';
import SupervisorWalletFundsTab from '../components/accounts/SupervisorWalletFundsTab';
import PaymentLedgerTab from '../components/accounts/PaymentLedgerTab';
import FinancialReportsTab from '../components/accounts/FinancialReportsTab';
import { useAuth } from '../context/AuthContext';

import ReceiptViewerModal from '../components/accounts/ReceiptViewerModal';
import CorrectionReasonModal from '../components/accounts/CorrectionReasonModal';
import RecordPaymentModal from '../components/accounts/RecordPaymentModal';
import FundReleaseModal from '../components/accounts/FundReleaseModal';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Layers, count: null },
  { id: 'verification', label: 'Expense Verification', icon: Clock, countKey: 'pendingExpenses' },
  { id: 'wallets', label: 'Wallet Funds', icon: Wallet, countKey: 'pendingAdvances' },
  { id: 'advances', label: 'Advance Disbursal', icon: Send, countKey: 'pendingAdvances' },
  { id: 'ledger', label: 'Payment Ledger', icon: CreditCard, count: null },
  { id: 'analytics', label: 'Analytics', icon: Activity, count: null },
  { id: 'reports', label: 'Financial Reports', icon: FileSpreadsheet, count: null }
];

const TAB_METADATA = {
  overview: {
    prefix: 'Welcome to',
    highlight: 'Dashboard',
    title: 'Dashboard',
    subtitle: 'Hello Admin, here is your system overview.',
    icon: ShieldCheck,
    color: '#3b82f6'
  },
  verification: {
    prefix: 'Expense',
    highlight: 'Verification',
    title: 'Expense Verification',
    subtitle: 'Verify & approve site vendor invoices indented by site in-charge',
    icon: FileText,
    color: '#3b82f6'
  },
  wallets: {
    prefix: 'Supervisor',
    highlight: 'Wallets',
    title: 'Supervisor Wallets',
    subtitle: 'Monitor live site float balances, approve fund requisitions & disburse float',
    icon: Wallet,
    color: '#059669'
  },
  advances: {
    prefix: 'Advance',
    highlight: 'Payouts',
    title: 'Advance Payouts',
    subtitle: 'Review & disburse site material advances & procurement requisitions',
    icon: Users,
    color: '#8b5cf6'
  },
  ledger: {
    prefix: 'Payment',
    highlight: 'Ledger',
    title: 'Payment Ledger',
    subtitle: 'Complete transaction audit trail of all vendor payouts & fund releases',
    icon: CreditCard,
    color: '#0ea5e9'
  },
  analytics: {
    prefix: 'Financial',
    highlight: 'Analytics',
    title: 'Financial Analytics',
    subtitle: 'Executive visual analytics, budget burn rates, expenditure trends & cashflow run-rate',
    icon: Activity,
    color: '#06b6d4'
  },
  reports: {
    prefix: 'Financial',
    highlight: 'Reports',
    title: 'Financial Reports',
    subtitle: 'Official financial audit reports, project variance & expense breakdown',
    icon: FileSpreadsheet,
    color: '#ec4899'
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const normalizedTab = rawTab === 'budgets' ? 'budget' : rawTab;
  const activeTab = normalizedTab && TABS.some(t => t.id === normalizedTab) ? normalizedTab : 'overview';

  const handleTabChange = (tabId) => {
    if (tabId === 'overview') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tabId });
    }
  };

  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [advances, setAdvances] = useState(INITIAL_ADVANCES);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS_LEDGER);
  const [settlements, setSettlements] = useState(INITIAL_SETTLEMENTS);
  const [auditLogs, setAuditLogs] = useState(AUDIT_LOGS);

  // Active Modals state
  const [inspectingExpense, setInspectingExpense] = useState(null);
  const [correctingItem, setCorrectingItem] = useState(null);
  const [paymentItem, setPaymentItem] = useState(null);
  const [paymentType, setPaymentType] = useState('Advance');
  const [releasingFundProject, setReleasingFundProject] = useState(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Approve Expense Handler (Module 6)
  const handleApproveExpense = (expense) => {
    setExpenses(prev => prev.map(e => {
      if (e.id === expense.id) {
        return {
          ...e,
          status: 'Accounts Verified & Paid',
          accountsVerification: {
            status: 'Verified',
            verifiedBy: 'Accounts Dept',
            verifiedAt: new Date().toLocaleString(),
            paymentRef: `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
            paymentMode: 'NetBanking'
          }
        };
      }
      return e;
    }));

    // Update project verified expenses
    setProjects(prev => prev.map(p => {
      if (p.id === expense.projectId) {
        return { ...p, expenses: (p.expenses || 0) + expense.amount, balance: (p.balance || 0) - expense.amount };
      }
      return p;
    }));

    // Add to payments ledger
    const newPayment = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Expense Reimbursement',
      projectId: expense.projectId,
      projectName: expense.projectName,
      paidTo: expense.vendorName || expense.supervisor,
      amount: expense.amount,
      paymentMode: 'NetBanking',
      refNumber: `NEFT/EXP-${expense.id.slice(-4)}`,
      category: expense.category,
      status: 'Completed',
      notes: `Verified claim ${expense.id} - ${expense.itemDescription}`
    };
    setPayments(prev => [newPayment, ...prev]);

    setInspectingExpense(null);
    showToast(`Claim ${expense.id} (₹${expense.amount.toLocaleString()}) verified and approved successfully!`);
  };

  // 2. Reject / Send back for correction (Module 6)
  const handleRejectExpense = (expense, reason) => {
    setExpenses(prev => prev.map(e => {
      if (e.id === expense.id) {
        return {
          ...e,
          status: 'Sent for Correction',
          accountsVerification: {
            status: 'Correction Required',
            verifiedBy: 'Accounts Dept',
            verifiedAt: new Date().toLocaleString(),
            correctionReason: reason
          }
        };
      }
      return e;
    }));

    setInspectingExpense(null);
    setCorrectingItem(null);
    showToast(`Claim ${expense.id} sent back to ${expense.supervisor} with correction note.`, 'warning');
  };

  // 3. Disburse Advance Handler (Module 3)
  const handleTriggerAdvancePayment = (adv) => {
    setPaymentItem(adv);
    setPaymentType('Advance');
  };

  // 4. Submit Payment Handler (Module 7)
  const handlePaymentSubmitted = (item, paymentData) => {
    setPayments(prev => [paymentData, ...prev]);

    if (paymentType === 'Advance') {
      setAdvances(prev => prev.map(a => {
        if (a.id === item.id) {
          return {
            ...a,
            approvedAmount: paymentData.amount,
            status: 'Disbursed',
            paymentDetails: {
              paymentDate: paymentData.date,
              paymentMode: paymentData.paymentMode,
              refNumber: paymentData.refNumber,
              paidFromAccount: paymentData.paidFromAccount,
              paidTo: paymentData.paidTo,
              amountPaid: paymentData.amount,
              recordedBy: 'Accounts Dept'
            }
          };
        }
        return a;
      }));

      // Update project advances
      setProjects(prev => prev.map(p => {
        if (p.id === item.projectId) {
          return { ...p, advance: (p.advance || 0) + paymentData.amount };
        }
        return p;
      }));

      showToast(`Advance ${item.id} (₹${paymentData.amount.toLocaleString()}) disbursed to ${paymentData.paidTo}!`);
    }

    setPaymentItem(null);
  };

  // 5. Fund Release Handler (Module 2)
  const handleFundReleaseSubmitted = (project, fundData) => {
    setProjects(prev => prev.map(p => {
      if (p.id === project.id) {
        const newReleased = (p.fundsReleased || 0) + fundData.amount;
        return {
          ...p,
          fundsReleased: newReleased,
          balance: newReleased - (p.expenses || 0)
        };
      }
      return p;
    }));

    const newPayment = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      date: fundData.date,
      type: 'Project Fund Release',
      projectId: project.id,
      projectName: project.name,
      paidTo: `${project.name} Site Account`,
      amount: fundData.amount,
      paymentMode: 'Bank Transfer (RTGS)',
      refNumber: fundData.refNumber,
      category: 'Project Fund Allocation',
      status: 'Completed',
      notes: fundData.purpose
    };
    setPayments(prev => [newPayment, ...prev]);

    setReleasingFundProject(null);
    showToast(`₹${fundData.amount.toLocaleString()} released for ${project.name} successfully!`);
  };

  const pendingExpensesCount = expenses.filter(e => e.status === 'Pending Accounts Verification').length;
  const pendingAdvancesCount = advances.filter(a => a.status === 'Pending Accounts Payment').length;

  const counts = {
    pendingExpenses: pendingExpensesCount,
    pendingAdvances: pendingAdvancesCount
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 100000,
          backgroundColor: toastMessage.type === 'warning' ? '#f59e0b' : '#10b981',
          color: '#ffffff',
          padding: '0.9rem 1.4rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontWeight: '700',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'slideDown 0.25s ease'
        }}>
          <CheckCircle2 size={20} />
          {toastMessage.text}
        </div>
      )}

      {/* Main Top Header */}
      {(() => {
        const currentMeta = TAB_METADATA[activeTab] || TAB_METADATA.overview;

        return (
          <div style={{
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '1.95rem', 
                fontWeight: '800', 
                color: 'var(--text-primary)', 
                margin: 0, 
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-heading)'
              }}>
                {activeTab === 'overview' ? (
                  <>
                    Welcome to <span style={{ color: '#3b82f6' }}>Dashboard</span>
                  </>
                ) : (
                  currentMeta.title
                )}
              </h1>
              <p style={{ 
                fontSize: '0.96rem', 
                color: 'var(--text-secondary)', 
                margin: '0.35rem 0 0',
                fontFamily: 'var(--font-sans)',
                fontWeight: '500'
              }}>
                {activeTab === 'overview'
                  ? `Hello ${user?.name || user?.role || 'Admin'}, here is your system overview.`
                  : currentMeta.subtitle
                }
              </p>
            </div>
          </div>
        );
      })()}

      {/* KPI Barometer Cards (Visible only on Overview First Page) */}
      {activeTab === 'overview' && (
        <KPIHeaderCards 
          projects={projects}
          expenses={expenses}
          advances={advances}
          settlements={settlements}
          onNavigateTab={(t) => handleTabChange(t)}
        />
      )}

      {/* Active Tab View */}
      {activeTab === 'overview' && (
        <OverviewTab
          projects={projects}
          expenses={expenses}
          advances={advances}
          settlements={settlements}
          auditLogs={auditLogs}
          onNavigateTab={(t) => handleTabChange(t)}
          onInspectExpense={(exp) => setInspectingExpense(exp)}
          onDisburseAdvance={(adv) => handleTriggerAdvancePayment(adv)}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsTab
          projects={projects}
          expenses={expenses}
          advances={advances}
          payments={payments}
          settlements={settlements}
        />
      )}

      {activeTab === 'verification' && (
        <ExpenseVerificationTab
          expenses={expenses}
          projects={projects}
          onInspectExpense={(exp) => setInspectingExpense(exp)}
          onQuickApprove={(exp) => handleApproveExpense(exp)}
          onRejectExpense={(exp) => setCorrectingItem(exp)}
        />
      )}

      {activeTab === 'wallets' && (
        <SupervisorWalletFundsTab
          projects={projects}
          expenses={expenses}
          advances={advances}
          onNavigateTab={(tab) => handleTabChange(tab)}
          onQuickApprove={(exp) => handleApproveExpense(exp)}
          onRejectExpense={(exp) => setCorrectingItem(exp)}
          onDisburseAdvance={(adv) => handleTriggerAdvancePayment(adv)}
          onRejectAdvance={(adv) => setCorrectingItem(adv)}
        />
      )}

      {activeTab === 'advances' && (
        <AdvanceDisbursalTab
          advances={advances}
          projects={projects}
          onDisburseAdvance={(adv) => handleTriggerAdvancePayment(adv)}
          onRejectAdvance={(adv) => setCorrectingItem(adv)}
        />
      )}

      {activeTab === 'ledger' && (
        <PaymentLedgerTab
          payments={payments}
          onRecordNewPayment={() => {}}
        />
      )}

      {activeTab === 'reports' && (
        <FinancialReportsTab
          projects={projects}
          expenses={expenses}
          advances={advances}
          payments={payments}
          settlements={settlements}
        />
      )}

      {/* Modals */}
      {inspectingExpense && (
        <ReceiptViewerModal
          expense={inspectingExpense}
          onClose={() => setInspectingExpense(null)}
          onApprove={(exp) => handleApproveExpense(exp)}
          onReject={(exp) => {
            setCorrectingItem(exp);
            setInspectingExpense(null);
          }}
        />
      )}

      {correctingItem && (
        <CorrectionReasonModal
          item={correctingItem}
          type="Claim"
          onClose={() => setCorrectingItem(null)}
          onSubmit={(item, reason) => handleRejectExpense(item, reason)}
        />
      )}

      {paymentItem && (
        <RecordPaymentModal
          item={paymentItem}
          type={paymentType}
          onClose={() => setPaymentItem(null)}
          onSubmit={(item, data) => handlePaymentSubmitted(item, data)}
        />
      )}

      {releasingFundProject && (
        <FundReleaseModal
          project={releasingFundProject}
          onClose={() => setReleasingFundProject(null)}
          onSubmit={(proj, data) => handleFundReleaseSubmitted(proj, data)}
        />
      )}
    </div>
  );
};

export default Dashboard;
