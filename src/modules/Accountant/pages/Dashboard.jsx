import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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

const API = import.meta.env.VITE_API_BASE_URL;

// Backend statuses <-> the display strings this dashboard's UI already uses.
const EXPENSE_STATUS_TO_DISPLAY = {
  submitted: 'Pending Accounts Verification',
  ops_approved: 'Pending Accounts Verification',
  accounts_paid: 'Accounts Verified & Paid',
  ops_rejected: 'Sent for Correction',
};

const ADVANCE_STATUS_TO_DISPLAY = {
  requested: 'Pending Operations Approval',
  approved: 'Pending Accounts Payment',
  rejected: 'Rejected',
  disbursed: 'Disbursed',
};

const mapProjectForAccounts = (p) => {
  const budget = Number(p.budget) || 0;
  const fundsReleased = Number(p.fundsReleased) || 0;
  return {
    id: p.id,
    name: p.name,
    site: p.site || p.location || '',
    toilets: p.toiletsCount || 0,
    supervisor: p.supervisor?.name || 'Unassigned',
    supervisorMobile: p.supervisor?.mobile || '',
    budget,
    fundsReleased,
    expenses: 0,
    advance: 0,
    balance: fundsReleased,
    status: p.status,
    startDate: p.startDate ? p.startDate.split('T')[0] : '',
    endDate: p.endDate ? p.endDate.split('T')[0] : '',
    progress: p.progress || 0,
  };
};

const mapExpenseForAccounts = (e) => ({
  id: e.id,
  projectId: e.projectId,
  projectName: e.project?.name || 'Unknown Project',
  siteName: e.project?.site || '',
  supervisor: e.submittedBy?.name || 'Unknown',
  category: e.category?.name || 'Uncategorized',
  itemDescription: e.description,
  vendorName: e.vendorName || '',
  billNumber: '',
  billDate: e.createdAt,
  amount: Number(e.amount),
  hasBill: !!e.receiptUrl,
  billUrl: e.receiptUrl || null,
  status: EXPENSE_STATUS_TO_DISPLAY[e.status] || 'Pending Accounts Verification',
  submittedAt: e.createdAt,
});

const mapAdvanceForAccounts = (a) => ({
  id: a.id,
  projectId: a.projectId,
  projectName: a.project?.name || 'Unknown Project',
  siteName: a.project?.site || '',
  supervisor: a.requestedBy?.name || 'Unknown',
  supervisorMobile: a.requestedBy?.mobile || '',
  bankDetails: null,
  requestedAmount: Number(a.amount),
  approvedAmount: Number(a.amount),
  purpose: a.purpose || '',
  requestDate: a.createdAt,
  date: a.createdAt,
  status: ADVANCE_STATUS_TO_DISPLAY[a.status] || 'Pending Operations Approval',
  paymentDetails: a.status === 'disbursed' ? { amountPaid: Number(a.amount) } : null,
});

const mapPaymentForAccounts = (p) => ({
  id: p.id,
  date: p.createdAt,
  type: p.type,
  projectId: p.projectId,
  projectName: p.project?.name || '',
  paidTo: p.paidTo || '',
  amount: Number(p.amount),
  paymentMode: p.paymentMode || '',
  refNumber: p.refNumber || '',
  category: p.category || '',
  status: 'Completed',
  notes: p.notes || '',
});

const mapSettlementForAccounts = (s) => ({
  id: s.id,
  projectId: s.projectId,
  projectName: s.project?.name || '',
  siteName: s.project?.site || '',
  supervisor: s.supervisor?.name || '',
  supervisorMobile: s.supervisor?.mobile || '',
  completedDate: s.completedDate,
  totalAdvanceGiven: Number(s.totalAdvanceGiven),
  totalApprovedExpenses: Number(s.totalApprovedExpenses),
  difference: Number(s.difference),
  settlementType: s.settlementType === 'refund_due' ? 'REFUND_DUE' : 'ADDITIONAL_PAYABLE',
  status: s.status === 'settled'
    ? 'Completed'
    : (s.settlementType === 'refund_due' ? 'Pending Refund Receipt' : 'Pending Accounts Payout'),
  supervisorRemark: s.supervisorRemark || '',
  accountsRemark: s.accountsRemark || '',
});

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

  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingCore, setLoadingCore] = useState(true);

  // Projects, expenses, advances, payments, and settlements all come from the
  // real backend now. Audit logs are still a static sample — see
  // docs/03-frontend-status.md for what's real vs not.
  const fetchCore = useCallback(async () => {
    setLoadingCore(true);
    try {
      const [projRes, expRes, advRes, payRes, settleRes] = await Promise.all([
        axios.get(`${API}/projects`, { params: { pageSize: 100 } }),
        axios.get(`${API}/expenses`, { params: { pageSize: 100 } }),
        axios.get(`${API}/advances`),
        axios.get(`${API}/payments-ledger`),
        axios.get(`${API}/settlements`),
      ]);
      setProjects(projRes.data.projects.map(mapProjectForAccounts));
      setExpenses(expRes.data.expenses.map(mapExpenseForAccounts));
      setAdvances(advRes.data.advances.map(mapAdvanceForAccounts));
      setPayments(payRes.data.entries.map(mapPaymentForAccounts));
      setSettlements(settleRes.data.settlements.map(mapSettlementForAccounts));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCore(false);
    }
  }, []);

  useEffect(() => { fetchCore(); }, [fetchCore]);

  // Active Modals state
  const [inspectingExpense, setInspectingExpense] = useState(null);
  const [correctingItem, setCorrectingItem] = useState(null);
  const [paymentItem, setPaymentItem] = useState(null);
  const [paymentType, setPaymentType] = useState('Advance');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Approve Expense Handler (Module 6) — marks an Operations-approved expense as paid
  const handleApproveExpense = async (expense) => {
    try {
      await axios.patch(`${API}/expenses/${expense.id}/pay`);
      await fetchCore();
      setInspectingExpense(null);
      showToast(`Claim ${expense.id} (₹${expense.amount.toLocaleString()}) verified and approved successfully!`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to approve expense', 'error');
    }
  };

  // 2. Reject / Send back for correction (Module 6)
  const handleRejectExpense = async (expense, reason) => {
    try {
      await axios.patch(`${API}/expenses/${expense.id}/reject`, { remarks: reason });
      await fetchCore();
      setInspectingExpense(null);
      setCorrectingItem(null);
      showToast(`Claim ${expense.id} sent back to ${expense.supervisor} with correction note.`, 'warning');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to reject expense', 'error');
    }
  };

  // 3. Disburse Advance Handler (Module 3)
  const handleTriggerAdvancePayment = (adv) => {
    setPaymentItem(adv);
    setPaymentType('Advance');
  };

  // 4. Submit Payment Handler (Module 7)
  const handlePaymentSubmitted = async (item, paymentData) => {
    if (paymentType !== 'Advance') {
      setPaymentItem(null);
      return;
    }
    try {
      await axios.patch(`${API}/advances/${item.id}/disburse`, {
        paidTo: paymentData.paidTo,
        paymentMode: paymentData.paymentMode,
        refNumber: paymentData.refNumber,
        notes: paymentData.notes,
      });
      await fetchCore();
      showToast(`Advance ${item.id} (₹${paymentData.amount.toLocaleString()}) disbursed to ${paymentData.paidTo}!`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to disburse advance', 'error');
    } finally {
      setPaymentItem(null);
    }
  };

  const pendingExpensesCount = expenses.filter(e => e.status === 'Pending Accounts Verification').length;
  const pendingAdvancesCount = advances.filter(a => a.status === 'Pending Accounts Payment').length;
  const pendingSettlementsCount = settlements.filter(s => s.status !== 'Completed').length;

  const counts = {
    pendingExpenses: pendingExpensesCount,
    pendingAdvances: pendingAdvancesCount,
    pendingSettlements: pendingSettlementsCount
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

    </div>
  );
};

export default Dashboard;
