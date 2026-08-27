import React, { useState } from 'react';
import { 
  ReceiptText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Eye, 
  UploadCloud, 
  Camera, 
  FileText, 
  Trash2, 
  Printer, 
  FileSpreadsheet, 
  FileDown, 
  Search, 
  MapPin, 
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { exportToExcel, triggerPrint, exportToPDF } from '../utils/exportUtils';

const DailyExpenses = () => {
  const { expensesList, recordMultipleExpenses, walletBalance } = useWallet();
  const { t, language } = useLanguage();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Default Site Selection
  const [commonSite, setCommonSite] = useState('Metro Line 3 - Station #4B');

  // Multi-Transaction Dynamic Rows State
  const [expenseRows, setExpenseRows] = useState([
    {
      id: 1,
      category: 'Travel',
      amount: '',
      paidTo: '',
      fileName: '',
      previewUrl: null
    }
  ]);

  const addExpenseRow = () => {
    setExpenseRows([
      ...expenseRows,
      {
        id: Date.now() + Math.random(),
        category: 'Purchase',
        amount: '',
        paidTo: '',
        fileName: '',
        previewUrl: null
      }
    ]);
  };

  const removeExpenseRow = (index) => {
    if (expenseRows.length <= 1) return;
    setExpenseRows(expenseRows.filter((_, i) => i !== index));
  };

  const updateExpenseRow = (index, field, value) => {
    const updated = [...expenseRows];
    updated[index][field] = value;
    setExpenseRows(updated);
  };

  const handleRowFileSelect = (index, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      const updated = [...expenseRows];
      updated[index].fileName = file.name;
      updated[index].previewUrl = preview;
      setExpenseRows(updated);
    }
  };

  const handleRemoveRowFile = (index) => {
    const updated = [...expenseRows];
    updated[index].fileName = '';
    updated[index].previewUrl = null;
    setExpenseRows(updated);
  };

  // Grand Total of All Rows in Current Batch
  const batchTotalAmount = expenseRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);

  const handleBatchSubmit = (e) => {
    e.preventDefault();

    // Check that at least one row has a valid amount
    const validRows = expenseRows.filter(r => parseFloat(r.amount) > 0);
    if (validRows.length === 0) {
      alert(language === 'mr' ? 'कृपया किमान एका नोंदीची रक्कम भरा.' : 'Please enter an amount for at least one expense.');
      return;
    }

    const payload = validRows.map(r => ({
      category: r.category,
      site: commonSite,
      amount: parseFloat(r.amount),
      paidTo: r.paidTo || 'Local Vendor',
      fileName: r.fileName,
      previewUrl: r.previewUrl
    }));

    recordMultipleExpenses(payload);

    // Reset Form
    setExpenseRows([
      {
        id: Date.now(),
        category: 'Travel',
        amount: '',
        paidTo: '',
        fileName: '',
        previewUrl: null
      }
    ]);
    setIsAddModalOpen(false);
    alert(`Success! ${validRows.length} ${language === 'mr' ? 'खर्चाच्या नोंदी सेव्ह झाल्या व वॉलेटमधून ₹' : 'expenses recorded and ₹'}${batchTotalAmount.toLocaleString()} ${language === 'mr' ? 'वजा झाले.' : 'deducted from wallet.'}`);
  };

  const totalSpent = expensesList.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBills = expensesList.filter(e => e.receipt).length;

  const filteredExpenses = expensesList.filter(exp => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (exp.id || '').toLowerCase().includes(term) ||
      (exp.category || '').toLowerCase().includes(term) ||
      (exp.paidTo || '').toLowerCase().includes(term) ||
      (exp.site || '').toLowerCase().includes(term) ||
      (exp.amount || '').toString().includes(term) ||
      (exp.status || '').toLowerCase().includes(term)
    );
  });

  const handleExportExcel = () => {
    const headers = ['Voucher ID', 'Category', 'Site Location', 'Date & Time', 'Amount (₹)', 'Paid To', 'Status', 'Bill Proof'];
    const rows = filteredExpenses.map(exp => [
      exp.id,
      exp.category,
      exp.site,
      exp.date,
      exp.amount,
      exp.paidTo || '-',
      exp.status,
      exp.receipt ? (exp.receiptName || 'Yes') : 'No'
    ]);
    exportToExcel('Site_Daily_Expenses_Report', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ['Voucher ID', 'Category', 'Site Location', 'Date & Time', 'Amount (Rs)', 'Paid To', 'Status', 'Bill Proof'];
    const rows = filteredExpenses.map(exp => [
      exp.id,
      exp.category,
      exp.site,
      exp.date,
      `Rs. ${exp.amount.toLocaleString()}`,
      exp.paidTo || '-',
      exp.status,
      exp.receipt ? (exp.receiptName || 'Attached') : 'No Bill'
    ]);
    exportToPDF({
      fileName: 'Daily_Expenses_Report',
      title: 'Site Daily Expenses & Vouchers Report',
      subtitle: 'Detailed log of site field expenses, worker wage disbursements and vendor receipts.',
      headers,
      rows,
      meta: [
        { label: 'Total Spent', value: `Rs. ${totalSpent.toLocaleString()}` },
        { label: 'Bills Attached', value: `${totalBills} of ${expensesList.length}` },
        { label: 'Wallet Balance', value: `Rs. ${walletBalance.toLocaleString()}` }
      ]
    });
  };

  return (
    <div className="supervisor-container" style={{ gap: '1.25rem' }}>
      {/* Frameless Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '0.5rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 0.25rem 0'
          }}>
            {t('dailyExpenses')}
          </h1>
          <p style={{
            fontSize: '0.925rem',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            {language === 'mr' 
              ? 'दैनिक साईट खर्च, मजुरी आणि बिलांचे �        {/* Action Buttons: PDF, Excel, Print */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: '#6366f1',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Download / Save as PDF"
          >
            <FileDown size={15} />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Export to Excel / CSV Spreadsheet"
          >
            <FileSpreadsheet size={15} />
            <span>Excel</span>
          </button>

          <button
            onClick={triggerPrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.65rem',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Print Expenses Table"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Full-Width 100% Search Bar Placed Below Subtitle Line */}
      <div style={{
        position: 'relative',
        width: '100%',
        margin: '0.15rem 0 0.35rem 0'
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
          placeholder={language === 'mr' ? 'कॅटेगरी, वेंडर किंवा रक्कम शोधा...' : 'Search category, vendor, amount...'}
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
            boxShadow: '0 2px 8px -2px var(--shadow-color)'
          }}
          onFocus={(e) => e.target.style.borderColor = '#2563eb'}
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
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              padding: 0
            }}
            title="Clear Search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Full-Width Expenses & Voucher Table Container */}
      <div style={{
        background: 'var(--surface-bg)',
        borderRadius: '1.15rem',
        border: '1px solid var(--border-color)',
        padding: '1.4rem',
        boxShadow: '0 4px 16px -2px var(--shadow-color)'
      }}>
        {/* Table Header with Title, Total Bills Badge & + Add Expense Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.1rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <ReceiptText size={18} color="#f97316" />
              {language === 'mr' ? 'खर्च व व्हाउचर्स लेजर (Expense Ledger)' : 'Expense & Voucher Ledger'}
            </h2>

            {/* Total Bills Badge */}
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              background: 'rgba(59, 130, 246, 0.12)', 
              border: '1px solid rgba(59, 130, 246, 0.25)', 
              padding: '0.25rem 0.65rem', 
              borderRadius: '0.65rem',
              color: '#3b82f6',
              fontWeight: '700',
              fontSize: '0.775rem'
            }}>
              <FileText size={13} />
              <span>Total Bills ({totalBills})</span>
            </div>
          </div>

          {/* Right Area of Card: Add Expense Button */}
          <div>
            {/* + Add Expense Button with Royal Blue to Purple Gradient */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '0.85rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={16} />
              <span>{language === 'mr' ? 'नवीन खर्च जोडा' : 'Add Expense'}</span>
            </button>
          </div>
        </div>r={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={16} />
              <span>{language === 'mr' ? 'नवीन खर्च नोंदवा' : 'Add Expense'}</span>
            </button>
          </div>
        </div>

        {/* Structured Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Voucher ID</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Category & Paid To</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Site Location</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Amount (₹)</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Bill Proof</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {language === 'mr' ? 'कोणतीही जुळणारी खर्चाची नोंद सापडली नाही.' : 'No matching expense entries found.'}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr 
                    key={exp.id}
                    style={{ 
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '0.9rem 1rem', fontWeight: '700', color: '#f97316' }}>
                      {exp.id}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {exp.category}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        Paid to: {exp.paidTo || 'Local Vendor'}
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} color="#3b82f6" />
                        <span>{exp.site}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {exp.date}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem' }}>
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      {exp.receipt ? (
                        <button
                          onClick={() => {
                            if (exp.receiptUrl) {
                              setPreviewModalUrl(exp.receiptUrl);
                            } else {
                              alert(`Attached Bill Document: ${exp.receiptName || 'Receipt_Doc'}`);
                            }
                          }}
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Eye size={13} /> {exp.receiptName || t('receipt')}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>No Bill</span>
                      )}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: exp.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: exp.status === 'Approved' ? '#10b981' : '#f59e0b'
                      }}>
                        <CheckCircle2 size={12} /> {exp.status === 'Approved' ? t('approved') : t('pending')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Multiple Expenses Batch Modal */}
      {isAddModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            style={{
              backgroundColor: 'var(--surface-bg)',
              borderRadius: '1.25rem',
              width: '100%',
              maxWidth: '680px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-color)',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(249, 115, 22, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                  <Layers size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {language === 'mr' ? 'दैनिक खर्च व बिले नोंदवा (Multiple Entries)' : 'Record Daily Expenses & Bills'}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {language === 'mr' ? 'एकाच वेळी एकापेक्षा जास्त खर्चाच्या नोंदी जोडा' : 'Add multiple expense items in one single batch'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleBatchSubmit} style={{ overflowY: 'auto', paddingRight: '0.25rem', flex: 1 }}>
              {/* Site Location Selector for all entries */}
              <div style={{ marginBottom: '1.25rem', background: 'var(--card-bg)', padding: '0.85rem 1rem', borderRadius: '0.85rem', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={15} color="#3b82f6" />
                  {t('siteLocation')}
                </label>
                <select
                  value={commonSite}
                  onChange={(e) => setCommonSite(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '0.6rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)', fontWeight: '600', outline: 'none' }}
                >
                  <option value="Metro Line 3 - Station #4B">Metro Line 3 - Station #4B</option>
                  <option value="City Mall Phase 2 Extension">City Mall Phase 2 Extension</option>
                  <option value="Green Valley Flyover">Green Valley Flyover</option>
                </select>
              </div>

              {/* Dynamic Expense Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                {expenseRows.map((row, idx) => (
                  <div 
                    key={row.id}
                    style={{
                      background: 'var(--card-bg)',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: '0.95rem',
                      padding: '1.1rem',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#f97316', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        ● Expense Item #{idx + 1}
                      </span>
                      {expenseRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExpenseRow(idx)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#ef4444',
                            borderRadius: '0.5rem',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Trash2 size={13} /> {language === 'mr' ? 'काढून टाका' : 'Remove'}
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      {/* Expense Category */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                          {t('expenseCategoryLabel')}
                        </label>
                        <select
                          value={row.category}
                          onChange={(e) => updateExpenseRow(idx, 'category', e.target.value)}
                          style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.55rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
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

                      {/* Amount Paid */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                          {t('amountPaidLabel')} *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1500"
                          required
                          value={row.amount}
                          onChange={(e) => updateExpenseRow(idx, 'amount', e.target.value)}
                          style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.55rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '800', outline: 'none' }}
                        />
                      </div>

                      {/* Paid To */}
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                          {t('paidToLabel')}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Shinde Hardware / Mason Wage"
                          value={row.paidTo}
                          onChange={(e) => updateExpenseRow(idx, 'paidTo', e.target.value)}
                          style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.55rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    {/* Camera and File Attachment for this row */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.75rem',
                            border: '1px dashed #3b82f6',
                            borderRadius: '0.55rem',
                            backgroundColor: 'rgba(59, 130, 246, 0.08)',
                            color: '#3b82f6',
                            fontWeight: '700',
                            fontSize: '0.775rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Camera size={14} />
                          <span>{t('cameraSnap')}</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleRowFileSelect(idx, e)}
                            style={{ display: 'none' }}
                          />
                        </label>

                        <label 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.75rem',
                            border: '1px dashed #8b5cf6',
                            borderRadius: '0.55rem',
                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                            color: '#8b5cf6',
                            fontWeight: '700',
                            fontSize: '0.775rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <UploadCloud size={14} />
                          <span>{t('chooseFile')}</span>
                          <input 
                            type="file" 
                            accept="image/*,.pdf"
                            onChange={(e) => handleRowFileSelect(idx, e)}
                            style={{ display: 'none' }}
                          />
                        </label>

                        {row.fileName && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.35rem 0.65rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            borderRadius: '0.55rem',
                            fontSize: '0.75rem',
                            color: '#10b981',
                            fontWeight: '700'
                          }}>
                            <span>📎 {row.fileName}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveRowFile(idx)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Another Row Button */}
              <button
                type="button"
                onClick={addExpenseRow}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '0.75rem',
                  border: '1.5px dashed #f97316',
                  backgroundColor: 'rgba(249, 115, 22, 0.08)',
                  color: '#ea580c',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  marginBottom: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Plus size={16} />
                <span>{language === 'mr' ? '+ आणखी एक खर्च जोडा (Add Another Item)' : '+ Add Another Expense Item'}</span>
              </button>

              {/* Bottom Summary & Submit Button */}
              <div style={{
                background: 'var(--card-bg)',
                borderRadius: '0.85rem',
                border: '1px solid var(--border-color)',
                padding: '0.85rem 1.1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {language === 'mr' ? 'एकूण जमा खर्च (Total Batch)' : 'Total Batch Amount'}
                  </span>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f97316' }}>
                    ₹{batchTotalAmount.toLocaleString()}
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  {expenseRows.length} {language === 'mr' ? 'खर्चाच्या नोंदी' : 'Items'}
                </span>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(249, 115, 22, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Sparkles size={18} />
                <span>
                  {language === 'mr' 
                    ? `सर्व (${expenseRows.length}) खर्च सेव्ह करा (₹${batchTotalAmount.toLocaleString()})` 
                    : `Save All (${expenseRows.length}) Expenses & Deduct ₹${batchTotalAmount.toLocaleString()}`}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Full Size Receipt Viewer Modal */}
      {previewModalUrl && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setPreviewModalUrl(null)}
        >
          <div 
            style={{
              backgroundColor: 'var(--surface-bg)',
              borderRadius: '1rem',
              padding: '1rem',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Receipt Photo Preview</span>
              <button 
                onClick={() => setPreviewModalUrl(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <img 
              src={previewModalUrl} 
              alt="Receipt Preview" 
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '0.5rem' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyExpenses;
