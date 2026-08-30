import React, { useState } from 'react';
import { UploadCloud, FileText, Image, CheckCircle2, Clock, Trash2, Eye, ShieldCheck, Sparkles, Search, X } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

// Infers a rough file-type label from the receipt's name so the archive still
// shows something like "PDF Invoice" without WalletContext needing to track it.
const inferFileType = (receiptName) => {
  const ext = (receiptName || '').split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF Invoice';
  if (ext === 'png') return 'PNG Photo';
  if (ext === 'jpg' || ext === 'jpeg') return 'JPG Slip';
  return 'Receipt Attached';
};

const UploadBills = () => {
  const { expensesList, recordExpense } = useWallet();

  // A "bill" here is just any wallet expense that has a receipt attached —
  // shared with Daily Expenses / Balance Settlement instead of a separate list.
  const bills = expensesList
    .filter((exp) => exp.receipt)
    .map((exp) => ({
      id: exp.id,
      title: exp.receiptName || exp.category,
      vendor: exp.paidTo || 'Site Vendor',
      amount: exp.amount,
      date: exp.date,
      type: inferFileType(exp.receiptName),
      status: exp.status === 'Approved' ? 'Verified' : 'Under Review',
    }));

  const [searchTerm, setSearchTerm] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [category, setCategory] = useState('Travel');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');

  const filteredBills = bills.filter(b => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      b.title.toLowerCase().includes(term) ||
      b.vendor.toLowerCase().includes(term) ||
      b.id.toLowerCase().includes(term) ||
      b.amount.toString().includes(term)
    );
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!uploadTitle || !amount) return;
    recordExpense({
      category,
      paidTo: vendor || 'Site Vendor',
      amount: parseFloat(amount),
      receiptName: uploadTitle,
    });
    setUploadTitle('');
    setCategory('Travel');
    setVendor('');
    setAmount('');
    alert('Bill uploaded successfully and submitted for audit verification!');
  };

  return (
    <div className="supervisor-container">
      <div className="supervisor-header">
        <div className="supervisor-title-wrap">
          <h1>
            <UploadCloud size={32} color="#8b5cf6" />
            Upload Bills / Receipts
          </h1>
          <p>Digitize vendor invoices, GST bills, machinery fuel slips & muster payment vouchers.</p>
        </div>
        <span className="supervisor-badge" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.25)' }}>
          <ShieldCheck size={14} /> CLOUD STORAGE & OCR SYNC
        </span>
      </div>

      {/* 50% Width Search Bar */}
      <div style={{
        position: 'relative',
        width: '50%',
        minWidth: '280px',
        margin: '0.15rem 0 0.75rem 0'
      }}>
        <Search
          size={17}
          style={{
            position: 'absolute',
            left: '0.95rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            pointerEvents: 'none'
          }}
        />
        <input
          type="text"
          placeholder="Search bill, vendor, ID, amount..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.55rem 2.2rem 0.55rem 2.5rem',
            borderRadius: '0.75rem',
            border: '1.5px solid var(--border-color)',
            backgroundColor: 'var(--surface-bg)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px -2px var(--shadow-color)',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px'
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
        {/* Upload Box */}
        <div style={{
          background: 'var(--surface-bg)',
          borderRadius: '1.25rem',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          boxShadow: '0 4px 20px -4px var(--shadow-color)',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Upload Proof or Invoice
          </h2>

          <form onSubmit={handleUpload}>
            <div style={{
              border: '2px dashed var(--primary-color)',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: 'var(--card-bg)',
              marginBottom: '1.25rem',
              cursor: 'pointer'
            }}>
              <UploadCloud size={44} color="#8b5cf6" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                Tap to Camera Snap or Browse
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Supports JPG, PNG, PDF up to 15MB
              </p>
              <input type="file" style={{ display: 'none' }} id="file-input-direct" />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Bill / Voucher Title
              </label>
              <input
                type="text"
                placeholder="e.g. Travel Ticket / Material Purchase Invoice"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Expense Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none' }}
              >
                <option value="Travel">Travel</option>
                <option value="Local Conveyance">Local Conveyance</option>
                <option value="Transport">Transport</option>
                <option value="Lodging and Boarding">Lodging and Boarding</option>
                <option value="Purchase">Purchase</option>
                <option value="Labour">Labour</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Vendor / Supplier Name
              </label>
              <input
                type="text"
                placeholder="e.g. Mahavir Steel Depot"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Bill Total Amount (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 14500"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '800', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(139, 92, 246, 0.3)'
              }}
            >
              Upload & Verify Bill
            </button>
          </form>
        </div>

        {/* Uploaded Gallery */}
        <div style={{
          background: 'var(--surface-bg)',
          borderRadius: '1.25rem',
          border: '1px solid var(--border-color)',
          padding: '1.75rem',
          boxShadow: '0 4px 20px -4px var(--shadow-color)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Submitted Bills Archive
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredBills.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>
                No bills match your search criteria.
              </p>
            ) : (
              filteredBills.map((bill) => (
                <div 
                  key={bill.id}
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.85rem',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{bill.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {bill.vendor} • {bill.date} • <span style={{ color: '#8b5cf6' }}>{bill.type}</span>
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem' }}>₹{bill.amount.toLocaleString()}</p>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: bill.status === 'Verified' ? '#10b981' : '#f59e0b'
                    }}>
                      {bill.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadBills;
