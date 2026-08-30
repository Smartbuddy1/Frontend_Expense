import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { IndianRupee, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL;

// Talks directly to the real backend — separate from the rest of this dashboard,
// which still runs on sample mock data (see docs/03-frontend-status.md). This is
// the actually-functional payment/disbursal flow for launch.
const LivePayments = () => {
  const [expenses, setExpenses] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, advRes] = await Promise.all([
        axios.get(`${API}/expenses`, { params: { status: 'ops_approved', pageSize: 100 } }),
        axios.get(`${API}/advances`, { params: { status: 'approved' } }),
      ]);
      setExpenses(expRes.data.expenses);
      setAdvances(advRes.data.advances);
    } catch (err) {
      toast.error('Could not load live data from the server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const payExpense = async (id) => {
    const paymentRef = window.prompt('Payment reference / UTR (optional):') || '';
    setBusyId(id);
    try {
      await axios.patch(`${API}/expenses/${id}/pay`, { paymentRef });
      toast.success('Expense marked as paid');
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not mark paid');
    } finally {
      setBusyId(null);
    }
  };

  const disburseAdvance = async (id) => {
    setBusyId(id);
    try {
      await axios.patch(`${API}/advances/${id}/disburse`);
      toast.success('Advance disbursed');
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not disburse');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <IndianRupee size={18} /> Expenses Ready to Pay ({expenses.length})
        </h3>
        {expenses.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Nothing ready to pay.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {expenses.map((exp) => (
              <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <strong>{exp.description}</strong> — ₹{Number(exp.amount).toLocaleString()}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {exp.project?.name} • {exp.submittedBy?.name} • Approved by {exp.opsApprovedBy?.name || 'Operations'}
                    {exp.receiptUrl && <> • <a href={exp.receiptUrl} target="_blank" rel="noreferrer">Receipt</a></>}
                  </div>
                </div>
                <button onClick={() => payExpense(exp.id)} disabled={busyId === exp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.85rem', borderRadius: '0.5rem', border: 'none', background: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                  <Send size={15} /> Mark Paid
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <IndianRupee size={18} /> Advances Ready to Disburse ({advances.length})
        </h3>
        {advances.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Nothing ready to disburse.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {advances.map((adv) => (
              <div key={adv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <strong>₹{Number(adv.amount).toLocaleString()}</strong> — {adv.purpose || 'No purpose given'}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{adv.project?.name} • {adv.requestedBy?.name}</div>
                </div>
                <button onClick={() => disburseAdvance(adv.id)} disabled={busyId === adv.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.85rem', borderRadius: '0.5rem', border: 'none', background: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                  <Send size={15} /> Disburse
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePayments;
