import React, { createContext, useState, useContext, useEffect } from 'react';

const WalletContext = createContext(null);

const DEFAULT_EXPENSES = [
  { id: 'EXP-1007', category: 'Purchase', site: 'Metro Line 3 - Station #4B', amount: 4800, date: '20 Aug 2026', time: '09:30 AM', status: 'Approved', paidTo: 'Patil Building Materials', receiptName: 'Ultratech_Invoice_801.pdf', receipt: true },
  { id: 'EXP-1006', category: 'Lodging and Boarding', site: 'Metro Line 3 - Station #4B', amount: 750, date: '20 Aug 2026', time: '08:15 AM', status: 'Pending', paidTo: 'Site Canteen & Mess', receiptName: 'Canteen_Slip.jpg', receipt: true },
  { id: 'EXP-1005', category: 'Local Conveyance', site: 'City Mall Phase 2 Extension', amount: 2400, date: '19 Aug 2026', time: '04:20 PM', status: 'Approved', paidTo: 'Auto / Taxi Transit', receiptName: 'Fuel_Receipt_100L.png', receipt: true },
  { id: 'EXP-1004', category: 'Transport', site: 'Metro Line 3 - Station #4B', amount: 1650, date: '18 Aug 2026', time: '11:00 AM', status: 'Approved', paidTo: 'Tempo & Logistics Delivery', receiptName: null, receipt: false },
  { id: 'EXP-1003', category: 'Labour', site: 'Metro Line 3 - Station #4B', amount: 3200, date: '17 Aug 2026', time: '02:45 PM', status: 'Approved', paidTo: 'Daily Mason Wages', receiptName: 'Muster_Wages_Slip.pdf', receipt: true },
  { id: 'EXP-1002', category: 'Travel', site: 'City Mall Phase 2 Extension', amount: 1850, date: '16 Aug 2026', time: '10:15 AM', status: 'Approved', paidTo: 'Train & Outstation Bus', receiptName: 'Ticket_Invoice.pdf', receipt: true },
  { id: 'EXP-1001', category: 'Miscellaneous', site: 'Green Valley Flyover', amount: 950, date: '15 Aug 2026', time: '05:30 PM', status: 'Approved', paidTo: 'Hardware Petty Expenses', receiptName: 'Petty_Receipt.jpg', receipt: true }
];

// Helper to ensure all expenses have clean, unbroken sequential IDs
const ensureSequentialIds = (list) => {
  if (!Array.isArray(list) || list.length === 0) return DEFAULT_EXPENSES;
  const count = list.length;
  return list.map((item, idx) => ({
    ...item,
    id: `EXP-${1000 + (count - idx)}`
  }));
};

export const WalletProvider = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('supervisor_wallet_balance');
    return saved !== null ? parseFloat(saved) : 25000;
  });

  const [totalAdvance, setTotalAdvance] = useState(() => {
    const saved = localStorage.getItem('supervisor_total_advance');
    return saved !== null ? parseFloat(saved) : 125000;
  });

  const [expensesList, setExpensesList] = useState(() => {
    const saved = localStorage.getItem('supervisor_expenses_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return ensureSequentialIds(parsed);
      } catch (e) {
        return DEFAULT_EXPENSES;
      }
    }
    return DEFAULT_EXPENSES;
  });

  const [lastDeduction, setLastDeduction] = useState(null);

  useEffect(() => {
    localStorage.setItem('supervisor_wallet_balance', walletBalance.toString());
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem('supervisor_total_advance', totalAdvance.toString());
  }, [totalAdvance]);

  useEffect(() => {
    localStorage.setItem('supervisor_expenses_list', JSON.stringify(expensesList));
  }, [expensesList]);

  // Function to add a daily expense and immediately deduct from available wallet balance
  const recordExpense = (expenseData) => {
    const amountNum = parseFloat(expenseData.amount) || 0;
    
    // Deduct from wallet balance
    setWalletBalance((prev) => {
      const nextBal = prev - amountNum;
      return nextBal;
    });

    let createdEntry = null;

    setExpensesList((prev) => {
      const currentMax = prev.reduce((max, exp) => {
        const num = parseInt((exp.id || '').replace(/[^0-9]/g, ''), 10);
        return !isNaN(num) && num > max ? num : max;
      }, 1000);

      createdEntry = {
        id: `EXP-${currentMax + 1}`,
        category: expenseData.category || 'Materials',
        site: expenseData.site || 'Metro Line 3 - Station #4B',
        amount: amountNum,
        date: 'Today',
        time: 'Just now',
        status: 'Pending',
        paidTo: expenseData.paidTo || 'Local Vendor',
        receiptName: expenseData.receiptName || null,
        receiptUrl: expenseData.receiptUrl || null,
        receipt: !!(expenseData.receiptName || expenseData.receiptUrl)
      };

      return [createdEntry, ...prev];
    });
    
    // Flash deduction notification
    setLastDeduction(amountNum);
    setTimeout(() => setLastDeduction(null), 4000);

    return createdEntry;
  };

  // Function to record multiple expenses at once in batch
  const recordMultipleExpenses = (expensesArray) => {
    if (!Array.isArray(expensesArray) || expensesArray.length === 0) return [];
    
    let totalBatchAmount = 0;
    let createdBatch = [];

    setExpensesList((prev) => {
      let currentMax = prev.reduce((max, exp) => {
        const num = parseInt((exp.id || '').replace(/[^0-9]/g, ''), 10);
        return !isNaN(num) && num > max ? num : max;
      }, 1000);

      createdBatch = expensesArray.map((exp) => {
        currentMax += 1;
        const amountNum = parseFloat(exp.amount) || 0;
        totalBatchAmount += amountNum;
        return {
          id: `EXP-${currentMax}`,
          category: exp.category || 'Travel',
          site: exp.site || 'Metro Line 3 - Station #4B',
          amount: amountNum,
          date: 'Today',
          time: 'Just now',
          status: 'Pending',
          paidTo: exp.paidTo || 'Local Vendor',
          receiptName: exp.fileName || (exp.previewUrl ? 'Camera_Photo_Snap.jpg' : null),
          receiptUrl: exp.previewUrl || null,
          receipt: !!(exp.fileName || exp.previewUrl)
        };
      });

      return [...createdBatch.reverse(), ...prev];
    });

    setWalletBalance((prev) => prev - totalBatchAmount);

    setLastDeduction(totalBatchAmount);
    setTimeout(() => setLastDeduction(null), 4000);

    return createdBatch;
  };

  // Function to request advance and optionally credit wallet upon approval
  const requestAdvance = (advanceData) => {
    const amountNum = parseFloat(advanceData.amount) || 0;
    setTotalAdvance((prev) => prev + amountNum);
    return true;
  };

  // Calculate today's total spend
  const todaySpend = expensesList
    .filter(item => item.date.includes('Today') || item.date.includes('20 Aug'))
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <WalletContext.Provider value={{
      walletBalance,
      totalAdvance,
      expensesList,
      recordExpense,
      recordMultipleExpenses,
      requestAdvance,
      todaySpend,
      lastDeduction
    }}>
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
