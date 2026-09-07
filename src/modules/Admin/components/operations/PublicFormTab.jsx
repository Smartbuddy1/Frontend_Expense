import React, { useState, useEffect } from 'react';
import {
  Globe, FileText, CheckCircle2, Clock, Eye, Trash2,
  RefreshCw, Search, ExternalLink, ClipboardList,
  AlertCircle, IndianRupee, X
} from 'lucide-react';

const LOCAL_KEY = 'supervisor_expenses_list';

const PublicFormTab = () => {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [viewEntry, setViewEntry] = useState(null);

  const load = () => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      setSubmissions(raw ? [...JSON.parse(raw)].reverse() : []);
    } catch {
      setSubmissions([]);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this submission?')) return;
    try {
      const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list.filter(e => e.id !== id)));
      load();
    } catch {}
  };

  const handleMarkApproved = (id) => {
    try {
      const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list.map(e => e.id === id ? { ...e, status: 'Approved' } : e)));
      load();
      if (viewEntry?.id === id) setViewEntry(prev => ({ ...prev, status: 'Approved' }));
    } catch {}
  };

  const categories = ['All', ...Array.from(new Set(submissions.map(s => s.category).filter(Boolean)))];

  const filtered = submissions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (s.submitterName || '').toLowerCase().includes(q) ||
      (s.id || '').toLowerCase().includes(q) ||
      (s.site || '').toLowerCase().includes(q) ||
      (s.paidTo || '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    const matchCat = filterCategory === 'All' || s.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const totalAmount = filtered.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const pendingCount = filtered.filter(e => e.status !== 'Approved').length;
  const publicFormUrl = `${window.location.origin}${import.meta.env.BASE_URL || '/'}supervisor/expense-form`;

  const avatarColor = (name = '') => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
    return colors[name.charCodeAt(0) % colors.length] || '#3b82f6';
  };

  return (
    <div style={{ padding: '1.5rem 0' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Globe size={22} color="#3b82f6" />
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Public Form Submissions
            </h2>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Field expense entries submitted via the public portal
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <a
            href={publicFormUrl} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
              background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
              color: '#fff', border: 'none', padding: '0.5rem 1rem',
              borderRadius: '0.65rem', fontWeight: '700', fontSize: '0.82rem',
              cursor: 'pointer', textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
            }}
          >
            <ExternalLink size={13} /> Open Public Form
          </a>
          <button
            onClick={load}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
              background: 'var(--surface-bg)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)', padding: '0.5rem 1rem',
              borderRadius: '0.65rem', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.9rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total', value: submissions.length, color: '#3b82f6', icon: ClipboardList },
          { label: 'Pending', value: pendingCount, color: '#f59e0b', icon: AlertCircle },
          { label: 'Approved', value: submissions.length - pendingCount, color: '#10b981', icon: CheckCircle2 },
          { label: 'Total Amount', value: `₹${totalAmount.toLocaleString('en-IN')}`, color: '#8b5cf6', icon: IndianRupee },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            background: 'var(--surface-bg)', border: '1px solid var(--border-color)',
            borderRadius: '0.85rem', padding: '0.9rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '0.6rem', background: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '0.1rem' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters Bar ── */}
      <div style={{
        background: 'var(--surface-bg)', border: '1px solid var(--border-color)',
        borderRadius: '0.85rem', padding: '0.85rem 1rem', marginBottom: '1rem',
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center'
      }}>
        <div style={{ flex: '1 1 200px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search name, ID, site, vendor…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem',
              background: 'var(--card-bg)', border: '1px solid var(--border-color)',
              borderRadius: '0.55rem', color: 'var(--text-primary)',
              fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '0.55rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
        >
          {['All', 'Pending', 'Approved'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '0.55rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        {(search || filterStatus !== 'All' || filterCategory !== 'All') && (
          <button
            onClick={() => { setSearch(''); setFilterStatus('All'); setFilterCategory('All'); }}
            style={{ padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.55rem', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {submissions.length === 0 ? (
        <div style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '3rem 2rem', textAlign: 'center' }}>
          <Globe size={40} color="var(--text-secondary)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.5rem' }}>No submissions yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Share the public form link with field staff to start collecting expenses.
          </p>
          <a href={publicFormUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', padding: '0.6rem 1.4rem', borderRadius: '0.75rem', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none' }}>
            <ExternalLink size={15} /> Open Public Form
          </a>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          No submissions match your filters.
        </div>
      ) : (
        <div style={{ background: 'var(--surface-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', overflow: 'hidden' }}>
          {/* Count row */}
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {submissions.length} submissions
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              Total: <strong style={{ color: '#10b981' }}>₹{totalAmount.toLocaleString('en-IN')}</strong>
            </span>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--card-bg)' }}>
                  {['#', 'Voucher ID', 'Submitted By', 'Site / Location', 'Category', 'Vendor / Paid To', 'Amount', 'Date', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} style={{
                      padding: '0.7rem ' + (i === 0 ? '0.75rem' : '1rem'),
                      fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      textAlign: i >= 6 ? (i === 7 ? 'left' : 'center') : 'left',
                      borderBottom: '2px solid var(--border-color)', whiteSpace: 'nowrap'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, idx) => {
                  const name = entry.submitterName || '?';
                  const color = avatarColor(name);
                  const isApproved = entry.status === 'Approved';
                  return (
                    <tr
                      key={entry.id || idx}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--card-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* # */}
                      <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{idx + 1}</td>

                      {/* Voucher ID */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontWeight: '700', color: '#6366f1', fontSize: '0.82rem', fontFamily: 'monospace' }}>{entry.id}</span>
                      </td>

                      {/* Submitted By */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%', background: color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '0.7rem', fontWeight: '800', flexShrink: 0
                          }}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.05rem' }}>{entry.role || '—'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Site */}
                      <td style={{ padding: '0.75rem 1rem', maxWidth: '140px' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={entry.site || ''}>
                          {entry.site || '—'}
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                          padding: '0.2rem 0.6rem', borderRadius: '9999px',
                          fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap'
                        }}>{entry.category || '—'}</span>
                      </td>

                      {/* Vendor */}
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {entry.paidTo || '—'}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                          ₹{(Number(entry.amount) || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '600', whiteSpace: 'nowrap' }}>{entry.date || '—'}</div>
                        {entry.time && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.05rem' }}>{entry.time}</div>}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.22rem 0.65rem', borderRadius: '9999px',
                          fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap',
                          background: isApproved ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                          color: isApproved ? '#10b981' : '#f59e0b'
                        }}>
                          {isApproved ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                          {isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                          <button onClick={() => setViewEntry(entry)} title="View"
                            style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'none', padding: '0.32rem 0.52rem', borderRadius: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Eye size={13} />
                          </button>
                          {!isApproved && (
                            <button onClick={() => handleMarkApproved(entry.id)} title="Approve"
                              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', padding: '0.32rem 0.52rem', borderRadius: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <CheckCircle2 size={13} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(entry.id)} title="Delete"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '0.32rem 0.52rem', borderRadius: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {viewEntry && (
        <div
          onClick={() => setViewEntry(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface-bg)', borderRadius: '1.1rem', width: '100%', maxWidth: '500px',
              maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--surface-bg)', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.65rem', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Submission Details</div>
                  <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: '700', fontFamily: 'monospace' }}>{viewEntry.id}</div>
                </div>
              </div>
              <button onClick={() => setViewEntry(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1, padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {/* Amount highlight */}
              <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(59,130,246,0.12))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Amount</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)' }}>₹{(Number(viewEntry.amount) || 0).toLocaleString('en-IN')}</div>
                </div>
                <span style={{
                  padding: '0.3rem 0.85rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '700',
                  background: viewEntry.status === 'Approved' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: viewEntry.status === 'Approved' ? '#10b981' : '#f59e0b'
                }}>
                  {viewEntry.status || 'Pending'}
                </span>
              </div>

              {/* Details List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  ['Voucher ID', viewEntry.id],
                  ['Submitted By', viewEntry.submitterName],
                  ['Role / Department', viewEntry.role],
                  ['Site / Location', viewEntry.site],
                  ['Category', viewEntry.category],
                  ['Payment Mode', viewEntry.paymentMode],
                  ['Vendor / Paid To', viewEntry.paidTo],
                  ['Date & Time', `${viewEntry.date || ''} ${viewEntry.time ? '• ' + viewEntry.time : ''}`],
                  ['Description', viewEntry.description || '—'],
                  ['GPS Location', viewEntry.gpsAddress || viewEntry.gpsLocation || '—'],
                  ['Receipt / Bill', viewEntry.receiptName || '—'],
                  ['Submitted Via', viewEntry.submittedVia || 'Public Expense Form'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.65rem 0', borderBottom: '1px solid var(--border-color)', gap: '1rem' }}>
                    <span style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', fontWeight: '700', flexShrink: 0, minWidth: '130px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600', textAlign: 'right', wordBreak: 'break-word' }}>{val || '—'}</span>
                  </div>
                ))}
              </div>

              {/* Receipt Image */}
              {viewEntry.receiptUrl && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Receipt Preview</div>
                  <img src={viewEntry.receiptUrl} alt="Receipt"
                    style={{ width: '100%', borderRadius: '0.65rem', border: '1px solid var(--border-color)', maxHeight: '220px', objectFit: 'contain', background: '#f8fafc' }} />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.65rem' }}>
              {viewEntry.status !== 'Approved' && (
                <button
                  onClick={() => handleMarkApproved(viewEntry.id)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', padding: '0.65rem', borderRadius: '0.65rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  <CheckCircle2 size={15} /> Mark Approved
                </button>
              )}
              <button
                onClick={() => setViewEntry(null)}
                style={{ flex: 1, background: 'var(--card-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '0.65rem', borderRadius: '0.65rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicFormTab;
