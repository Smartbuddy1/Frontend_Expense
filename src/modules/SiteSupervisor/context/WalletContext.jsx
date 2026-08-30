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

  const [project, setProject] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalAdvance, setTotalAdvance] = useState(0);
  const [expensesList, setExpensesList] = useState([]);
  const [advancesList, setAdvancesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDeduction, setLastDeduction] = useState(null);

  // Maps a real backend expense record to the shape the existing UI already expects.
  const toUiExpense = (e) => ({
    id: e.id,
    category: e.category?.name || 'Expense',
    site: project?.site || project?.name || '',
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
    site: project?.site || project?.name || '',
    amount: Number(a.amount),
    date: new Date(a.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    urgency: 'Regular',
    status: a.status.charAt(0).toUpperCase() + a.status.slice(1),
    note: a.purpose || '',
  });

  const refresh = useCallback(async () => {
    if (!user || user.role !== 'site_supervisor') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: projData } = await axios.get(`${API}/projects`);
      const myProject = projData.projects?.[0] || null;
      setProject(myProject);

      if (myProject) {
        const [walletRes, expRes, advRes] = await Promise.all([
          axios.get(`${API}/projects/${myProject.id}/wallet`),
          axios.get(`${API}/expenses`, { params: { projectId: myProject.id, pageSize: 100 } }),
          axios.get(`${API}/advances`, { params: { projectId: myProject.id } }),
        ]);
        setWalletBalance(walletRes.data.balance);
        setTotalAdvance(walletRes.data.totalAdvance);
        setExpensesList(expRes.data.expenses.map(toUiExpense));
        setAdvancesList(advRes.data.advances.map(toUiAdvance));
      } else {
        setExpensesList([]);
        setAdvancesList([]);
      }
    } catch (err) {
      console.error('Failed to load wallet data from the server', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  // expenseData: { category, amount, paidTo, file (a real File object, optional), site }
  const recordExpense = async (expenseData) => {
    if (!user || !project) {
      return recordExpenseLocalFallback(expenseData);
    }

    const form = new FormData();
    form.append('projectId', project.id);
    form.append('description', `${expenseData.category || 'Expense'} — ${expenseData.paidTo || 'Local Vendor'}`);
    form.append('vendorName', expenseData.paidTo || 'Local Vendor');
    form.append('amount', parseFloat(expenseData.amount) || 0);
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

  const requestAdvance = async (advanceData) => {
    if (!user || !project) {
      throw new Error('No project assigned yet — an admin needs to assign you to a project first.');
    }
    const { data } = await axios.post(`${API}/advances`, {
      projectId: project.id,
      amount: parseFloat(advanceData.amount) || 0,
      purpose: advanceData.reason || advanceData.purpose || '',
    });
    await refresh();
    return toUiAdvance(data.advance);
  };

  const todaySpend = expensesList
    .filter((item) => item.date === new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) || item.date === 'Today')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <WalletContext.Provider
      value={{
        project,
        walletBalance,
        totalAdvance,
        expensesList,
        advancesList,
        recordExpense,
        recordMultipleExpenses,
        requestAdvance,
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
