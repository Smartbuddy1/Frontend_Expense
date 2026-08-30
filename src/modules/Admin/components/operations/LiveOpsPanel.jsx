import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CheckCircle2, XCircle, Loader2, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL;

// Talks directly to the real backend — separate from the rest of this dashboard,
// which still runs on the original mock data / localStorage (see docs/03-frontend-status.md).
// This is the actually-functional project/expense/advance flow for launch.
const LiveOpsPanel = () => {
  const [projects, setProjects] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [pendingAdvances, setPendingAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [form, setForm] = useState({ code: '', name: '', site: '', budget: '', supervisorId: '' });
  const [creating, setCreating] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, supRes, expRes, advRes] = await Promise.all([
        axios.get(`${API}/projects`, { params: { pageSize: 100 } }),
        axios.get(`${API}/users`, { params: { role: 'site_supervisor' } }),
        axios.get(`${API}/expenses`, { params: { status: 'submitted', pageSize: 100 } }),
        axios.get(`${API}/advances`, { params: { status: 'requested' } }),
      ]);
      setProjects(projRes.data.projects);
      setSupervisors(supRes.data.users);
      setPendingExpenses(expRes.data.expenses);
      setPendingAdvances(advRes.data.advances);
    } catch (err) {
      toast.error('Could not load live data from the server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.supervisorId) {
      toast.error('Code, name, and supervisor are required');
      return;
    }
    setCreating(true);
    try {
      await axios.post(`${API}/projects`, {
        code: form.code,
        name: form.name,
        site: form.site || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        supervisorId: form.supervisorId,
      });
      toast.success(`Project "${form.name}" created`);
      setForm({ code: '', name: '', site: '', budget: '', supervisorId: '' });
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create project');
    } finally {
      setCreating(false);
    }
  };

  const approveExpense = async (id) => {
    setBusyId(id);
    try {
      await axios.patch(`${API}/expenses/${id}/approve`);
      toast.success('Expense approved');
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not approve');
    } finally {
      setBusyId(null);
    }
  };

  const rejectExpense = async (id) => {
    const remarks = window.prompt('Reason for rejection (optional):') || '';
    setBusyId(id);
    try {
      await axios.patch(`${API}/expenses/${id}/reject`, { remarks });
      toast.success('Expense rejected');
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not reject');
    } finally {
      setBusyId(null);
    }
  };

  const approveAdvance = async (id) => {
    setBusyId(id);
    try {
      await axios.patch(`${API}/advances/${id}/approve`);
      toast.success('Advance approved');
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not approve');
    } finally {
      setBusyId(null);
    }
  };

  const rejectAdvance = async (id) => {
    setBusyId(id);
    try {
      await axios.patch(`${API}/advances/${id}/reject`);
      toast.success('Advance rejected');
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not reject');
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
          <PlusCircle size={18} /> Create Project (Live)
        </h3>
        <form onSubmit={handleCreateProject} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Code *</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Site</label>
            <input value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Budget</label>
            <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Supervisor *</label>
            <select value={form.supervisorId} onChange={(e) => setForm({ ...form, supervisorId: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
              <option value="">Select…</option>
              {supervisors.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.mobile})</option>)}
            </select>
          </div>
          <button type="submit" disabled={creating} style={{ padding: '0.65rem 1rem', borderRadius: '0.5rem', border: 'none', background: '#2563eb', color: 'white', fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer' }}>
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
      </div>

      <div style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontWeight: 800 }}>Projects ({projects.length})</h3>
        {projects.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No projects yet.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '0.5rem' }}>Code</th><th style={{ padding: '0.5rem' }}>Name</th><th style={{ padding: '0.5rem' }}>Supervisor</th><th style={{ padding: '0.5rem' }}>Budget</th><th style={{ padding: '0.5rem' }}>Status</th>
              </tr></thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.5rem' }}>{p.code}</td>
                    <td style={{ padding: '0.5rem' }}>{p.name}</td>
                    <td style={{ padding: '0.5rem' }}>{p.supervisor?.name || '—'}</td>
                    <td style={{ padding: '0.5rem' }}>₹{Number(p.budget).toLocaleString()}</td>
                    <td style={{ padding: '0.5rem' }}>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontWeight: 800 }}>Pending Expense Approvals ({pendingExpenses.length})</h3>
        {pendingExpenses.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Nothing pending.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingExpenses.map((exp) => (
              <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <strong>{exp.description}</strong> — ₹{Number(exp.amount).toLocaleString()}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {exp.project?.name} • {exp.submittedBy?.name} • {exp.vendorName || 'No vendor'}
                    {exp.receiptUrl && <> • <a href={exp.receiptUrl} target="_blank" rel="noreferrer">Receipt</a></>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => approveExpense(exp.id)} disabled={busyId === exp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.85rem', borderRadius: '0.5rem', border: 'none', background: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                    <CheckCircle2 size={15} /> Approve
                  </button>
                  <button onClick={() => rejectExpense(exp.id)} disabled={busyId === exp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.85rem', borderRadius: '0.5rem', border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontWeight: 800 }}>Pending Advance Approvals ({pendingAdvances.length})</h3>
        {pendingAdvances.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Nothing pending.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingAdvances.map((adv) => (
              <div key={adv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <strong>₹{Number(adv.amount).toLocaleString()}</strong> — {adv.purpose || 'No purpose given'}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{adv.project?.name} • {adv.requestedBy?.name}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => approveAdvance(adv.id)} disabled={busyId === adv.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.85rem', borderRadius: '0.5rem', border: 'none', background: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                    <CheckCircle2 size={15} /> Approve
                  </button>
                  <button onClick={() => rejectAdvance(adv.id)} disabled={busyId === adv.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.85rem', borderRadius: '0.5rem', border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveOpsPanel;
