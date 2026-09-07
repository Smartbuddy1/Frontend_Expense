import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WalletContext = createContext(null);

const API = import.meta.env.VITE_API_BASE_URL;

// Local-only fallback for when there's no logged-in supervisor with an assigned
// project yet — keeps the no-login PublicExpenseForm working exactly as before.
const LOCAL_KEY = 'supervisor_expenses_list';

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalAdvance, setTotalAdvance] = useState(0);
  const [expensesList, setExpensesList] = useState([]);
  const [advancesList, setAdvancesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDeduction, setLastDeduction] = useState(null);

  const isAllProjects = selectedProjectId === 'all';
  const project = isAllProjects ? null : (projects.find((p) => p.id === selectedProjectId) || projects[0] || null);
  // The project a new expense/advance should default to when the dashboard
  // itself is scoped to "All Projects" (nothing sensible to default to there).
  const defaultTargetProject = project || projects[0] || null;

  // Maps a real backend expense/advance record to the shape the existing UI
  // expects. The site label always comes from the record's own embedded
  // project relation, so it's correct row-by-row even in "All Projects" view.
  const toUiExpense = (e) => ({
    id: e.id,
    displayId: `VOU-${e.voucherNumber ? e.voucherNumber : e.id.slice(0, 4).toUpperCase()}`,
    category: e.category?.name || 'Expense',
    site: e.project?.name || e.project?.site || '',
    amount: Number(e.amount),
    date: new Date(e.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date(e.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    status: e.status === 'ops_rejected' ? 'Rejected' : e.status === 'submitted' ? 'Pending' : 'Approved',
    paidTo: e.vendorName || 'Local Vendor',
    receiptName: e.receiptUrl ? e.receiptUrl.split('/').pop() : null,
    receiptUrl: e.receiptUrl || null,
    receipt: !!e.receiptUrl,
  });

  const toUiAdvance = (a) => ({
    id: a.id,
    displayId: `REQ-${a.requisitionNumber ? a.requisitionNumber : a.id.slice(0, 4).toUpperCase()}`,
    site: a.project?.name || a.project?.site || '',
    amount: Number(a.amount),
    date: new Date(a.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    urgency: a.urgency || 'Regular',
    status: a.status.charAt(0).toUpperCase() + a.status.slice(1),
    note: a.purpose || '',
  });

  const lastProjectKey = user ? `supervisor_last_project_${user.id}` : null;

  const loadProjectWallet = useCallback(async (projectId) => {
    if (!projectId) {
      setWalletBalance(0);
      setTotalAdvance(0);
      setExpensesList([]);
      setAdvancesList([]);
      return;
    }

    if (projectId === 'all') {
      const [expRes, advRes] = await Promise.all([
        axios.get(`${API}/expenses`, { params: { pageSize: 100 } }),
        axios.get(`${API}/advances`),
      ]);
      const totalAdv = advRes.data.advances
        .filter((a) => a.status === 'disbursed')
        .reduce((sum, a) => sum + Number(a.amount), 0);
      const totalSpent = expRes.data.expenses
        .filter((e) => ['ops_approved', 'accounts_paid'].includes(e.status))
        .reduce((sum, e) => sum + Number(e.amount), 0);
      setWalletBalance(totalAdv - totalSpent);
      setTotalAdvance(totalAdv);
      setExpensesList(expRes.data.expenses.map(toUiExpense));
      setAdvancesList(advRes.data.advances.map(toUiAdvance));
      return;
    }

    const [walletRes, expRes, advRes] = await Promise.all([
      axios.get(`${API}/projects/${projectId}/wallet`),
      axios.get(`${API}/expenses`, { params: { projectId, pageSize: 100 } }),
      axios.get(`${API}/advances`, { params: { projectId } }),
    ]);
    setWalletBalance(walletRes.data.balance);
    setTotalAdvance(walletRes.data.totalAdvance);
    setExpensesList(expRes.data.expenses.map(toUiExpense));
    setAdvancesList(advRes.data.advances.map(toUiAdvance));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    if (!user || user.role !== 'site_supervisor') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [{ data: projData }, { data: catData }] = await Promise.all([
        axios.get(`${API}/projects`, { params: { pageSize: 100 } }),
        axios.get(`${API}/expenses/categories`)
      ]);
      const myProjects = projData.projects || [];
      setProjects(myProjects);
      setCategories(catData.categories || []);

      const effectiveId = 'all'; // Always load all projects globally
      setSelectedProjectId(effectiveId);

      await loadProjectWallet(effectiveId);
    } catch (err) {
      console.error('Failed to load wallet data from the server', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const selectProject = useCallback(async (projectId) => {
    setSelectedProjectId(projectId);
    // Removed saving to localStorage to prevent global state persistence across reloads if not desired, 
    // but we won't call this from Dashboard anyway.
    setLoading(true);
    try {
      await loadProjectWallet(projectId);
    } catch (err) {
      console.error('Failed to load wallet data for the selected project', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastProjectKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Fallback used only when there's no authenticated supervisor session yet
  // (the public, no-login expense form) — mirrors the old localStorage-only behavior.
  const recordExpenseLocalFallback = (expenseData) => {
    const saved = localStorage.getItem(LOCAL_KEY);
    const list = saved ? JSON.parse(saved) : [];
    const entry = {
      id: `EXP-LOCAL-${Date.now()}`,
      displayId: `VOU-LOCAL-${Date.now().toString().slice(-4)}`,
      category: expenseData.category || 'Materials',
      site: expenseData.site || '',
      amount: parseFloat(expenseData.amount) || 0,
      date: 'Today',
      time: 'Just now',
      status: 'Pending',
      paidTo: expenseData.paidTo || 'Local Vendor',
      receiptName: expenseData.receiptName || null,
      receiptUrl: expenseData.receiptUrl || null,
      receipt: !!(expenseData.receiptName || expenseData.receiptUrl),
    };
    localStorage.setItem(LOCAL_KEY, JSON.stringify([entry, ...list]));
    return entry;
  };

  // expenseData: { category, amount, paidTo, file (a real File object, optional), projectId }
  // projectId lets the caller target any of the supervisor's assigned projects,
  // regardless of which one the dashboard itself is currently scoped to —
  // falls back to the currently-selected project when not given.
  const recordExpense = async (expenseData) => {
    const targetProjectId = expenseData.projectId || defaultTargetProject?.id;
    if (!user || !targetProjectId) {
      return recordExpenseLocalFallback(expenseData);
    }

    const matchedCategory = categories.find((c) => c.name === expenseData.category);

    const form = new FormData();
    form.append('projectId', targetProjectId);
    form.append('description', `${expenseData.category || 'Expense'} — ${expenseData.paidTo || 'Local Vendor'}`);
    form.append('vendorName', expenseData.paidTo || 'Local Vendor');
    form.append('amount', parseFloat(expenseData.amount) || 0);
    if (matchedCategory) {
      form.append('categoryId', matchedCategory.id);
    }
    if (expenseData.file) {
      form.append('receipt', expenseData.file);
    }

    const { data } = await axios.post(`${API}/expenses`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setLastDeduction(parseFloat(expenseData.amount) || 0);
    setTimeout(() => setLastDeduction(null), 4000);
    await refresh();
    return toUiExpense(data.expense);
  };

  // Submits each expense one by one against the real API (used by any bulk-entry UI).
  const recordMultipleExpenses = async (expensesArray) => {
    if (!Array.isArray(expensesArray) || expensesArray.length === 0) return [];
    const created = [];
    for (const exp of expensesArray) {
      created.push(await recordExpense(exp));
    }
    return created;
  };

  // advanceData: { amount, reason/purpose, urgency, projectId } — projectId
  // lets the caller target any assigned project, falling back to the current one.
  const requestAdvance = async (advanceData) => {
    const targetProjectId = advanceData.projectId || defaultTargetProject?.id;
    if (!user || !targetProjectId) {
      throw new Error('No project assigned yet — an admin needs to assign you to a project first.');
    }
    const { data } = await axios.post(`${API}/advances`, {
      projectId: targetProjectId,
      amount: parseFloat(advanceData.amount) || 0,
      purpose: advanceData.reason || advanceData.purpose || '',
      urgency: advanceData.urgency || 'Regular',
    });
    await refresh();
    return toUiAdvance(data.advance);
  };

  const updateExpense = async (id, expenseData) => {
    if (!user) return;
    const matchedCategory = categories.find((c) => c.name === expenseData.category);
    const form = new FormData();
    if (expenseData.projectId) form.append('projectId', expenseData.projectId);
    if (expenseData.category || expenseData.paidTo) form.append('description', `${expenseData.category || 'Expense'} — ${expenseData.paidTo || 'Local Vendor'}`);
    if (expenseData.paidTo) form.append('vendorName', expenseData.paidTo);
    if (expenseData.amount) form.append('amount', parseFloat(expenseData.amount) || 0);
    if (matchedCategory) form.append('categoryId', matchedCategory.id);
    if (expenseData.file) form.append('receipt', expenseData.file);
    await axios.put(`${API}/expenses/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await refresh();
  };

  const deleteExpense = async (id) => {
    if (!user) return;
    await axios.delete(`${API}/expenses/${id}`);
    await refresh();
  };

  const updateAdvance = async (id, advanceData) => {
    if (!user) return;
    await axios.put(`${API}/advances/${id}`, {
      projectId: advanceData.projectId || defaultTargetProject?.id,
      amount: parseFloat(advanceData.amount) || 0,
      purpose: advanceData.reason || advanceData.purpose || '',
      urgency: advanceData.urgency || 'Regular',
    });
    await refresh();
  };

  const deleteAdvance = async (id) => {
    if (!user) return;
    await axios.delete(`${API}/advances/${id}`);
    await refresh();
  };

  const todaySpend = expensesList
    .filter((item) => item.date === new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) || item.date === 'Today')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <WalletContext.Provider
      value={{
        project,
        projects,
        selectedProjectId,
        isAllProjects,
        defaultTargetProject,
        selectProject,
        categories,
        walletBalance,
        totalAdvance,
        expensesList,
        advancesList,
        recordExpense,
        recordMultipleExpenses,
        requestAdvance,
        updateExpense,
        deleteExpense,
        updateAdvance,
        deleteAdvance,
        todaySpend,
        lastDeduction,
        loading,
        refresh,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
