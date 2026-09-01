import React, { useState, useRef } from 'react';
import {
  ReceiptText,
  Plus,
  Search,
  Filter,
  FileDown,
  FileSpreadsheet,
  Printer,
  Calendar,
  DollarSign,
  Tag,
  MapPin,
  Camera,
  UploadCloud,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  Building2,
  X,
  FileText,
  Sparkles,
  Layers,
  ArrowDownRight
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { exportToExcel, triggerPrint, exportToPDF } from '../utils/exportUtils';

const DailyExpenses = () => {
  const { walletBalance, expensesList, recordExpense, todaySpend } = useWallet();
  const { t, language } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSite, setSelectedSite] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewReceiptModal, setViewReceiptModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: 'Travel',
    site: project ? project.name : '',
    amount: '',
    paidTo: '',
    description: '',
    receiptName: '',
    previewUrl: null,
    receiptFile: null
  });

  const fileInputRef = useRef(null);

  const categoriesList = [
    'All',
    ...(categories?.map(c => c.name) || [])
  ];

  const sitesList = [
    'All',
    project ? project.name : null
  ].filter(Boolean);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setFormData({
        ...formData,
        receiptName: file.name,
        previewUrl: preview,
        receiptFile: file
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.site) {
      alert(language === 'mr' ? 'कृपया साइट लोकेशन निवडा!' : 'Please select a Site Location!');
      return;
    }
    if (!formData.category) {
      alert(language === 'mr' ? 'कृपया खर्चाचा प्रकार निवडा!' : 'Please select an Expense Category!');
      return;
    }
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      alert(language === 'mr' ? 'कृपया योग्य रक्कम भरा!' : 'Please enter a valid amount!');
      return;
    }
    if (!formData.paidTo || !formData.paidTo.trim()) {
      alert(language === 'mr' ? 'कृपया कोणाला पैसे दिले (Vendor / Person Name) ते भरा!' : 'Please enter Paid To (Vendor / Person Name)!');
      return;
    }
    if (!formData.receiptName) {
      alert(language === 'mr' ? 'कृपया बिलाचा फोटो किंवा डॉक्युमेंट पुरावा जोडा (Bill Proof अनिवार्य आहे)!' : 'Please attach a bill photo or document proof (Mandatory)!');
      return;
    }

    setSubmitting(true);
    try {
      await recordExpense({
        category: formData.category,
        site: formData.site,
        amount: parseFloat(formData.amount),
        paidTo: formData.paidTo.trim(),
        receiptName: formData.receiptName,
        receiptUrl: formData.previewUrl || null,
        file: formData.receiptFile
      });

      setFormData({
        category: 'Travel',
        site: project ? project.name : '',
        amount: '',
        paidTo: '',
        description: '',
        receiptName: '',
        previewUrl: null,
        receiptFile: null
      });

      setIsAddModalOpen(false);
      alert(language === 'mr' ? 'खर्च आणि बिलाचा पुरावा यशस्वीरीत्या नोंदवला गेला!' : 'Expense and bill proof recorded successfully!');
    } catch (err) {
      alert(err.response?.data?.error || (language === 'mr' ? 'खर्च नोंदवण्यात अडचण आली, पुन्हा प्रयत्न करा.' : 'Could not save the expense, please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredExpenses = expensesList.filter((exp) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    // Check for "no bill" / "without bill" keywords
    const isNoBillSearch = ['no bill', 'nobill', 'no-bill', 'no receipt', 'without bill', 'without receipt', 'बिल नाही', 'पावती नाही'].some(kw => term.includes(kw));
    if (isNoBillSearch) {
      return !exp.receipt && !exp.receiptName;
    }

    // Check for "with bill" / "has bill" keywords
    const isWithBillSearch = ['with bill', 'has bill', 'bill attached', 'पावती सह'].some(kw => term.includes(kw));
    if (isWithBillSearch) {
      return !!(exp.receipt || exp.receiptName);
    }

    const receiptLabel = (exp.receipt || exp.receiptName) ? 'view receipt bill पावती' : 'no bill बिल नाही';

    return (
      (exp.id || '').toLowerCase().includes(term) ||
      (exp.category || '').toLowerCase().includes(term) ||
      (exp.site || '').toLowerCase().includes(term) ||
      (exp.paidTo || '').toLowerCase().includes(term) ||
      (exp.date || '').toLowerCase().includes(term) ||
      (exp.status || '').toLowerCase().includes(term) ||
      (exp.receiptName || '').toLowerCase().includes(term) ||
      receiptLabel.toLowerCase().includes(term) ||
      (exp.amount || '').toString().includes(term)
    );
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleExportExcel = () => {
    const headers = ['Voucher ID', 'Category', 'Site Location', 'Paid To / Vendor', 'Date', 'Amount (₹)', 'Status'];
    const rows = filteredExpenses.map((exp) => [
      exp.id,
      exp.category,
      exp.site,
      exp.paidTo || 'Local Vendor',
      exp.date,
      exp.amount,
      exp.status
    ]);
    exportToExcel('Daily_Site_Expenses_Report', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ['Voucher ID', 'Category', 'Site Location', 'Vendor / Details', 'Date', 'Amount (Rs)', 'Status'];
    const rows = filteredExpenses.map((exp) => [
      exp.id,
      exp.category,
      exp.site,
      exp.paidTo || 'Local Vendor',
      exp.date,
      `Rs. ${exp.amount.toLocaleString()}`,
      exp.status
    ]);
    exportToPDF({
      fileName: 'Daily_Expenses_Report',
      title: 'Daily Site Expenses & Bills Report',
      subtitle: 'Complete verified ledger of field expenditures, labor payments, and bill vouchers.',
      headers,
      rows,
      meta: [
        { label: 'Total Recorded Spend', value: `Rs. ${totalFilteredAmount.toLocaleString()}` },
        { label: 'Total Vouchers', value: `${filteredExpenses.length} Entries` },
        { label: 'Available Balance', value: `Rs. ${walletBalance.toLocaleString()}` }
      ]
    });
  };

  return (
    <div className="supervisor-container" style={{ gap: '1.25rem' }}>
      {/* Top Header Section */}
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
              ? 'दैनिक साईट खर्च, मजुरी आणि बिलांचे व्यवस्थापन व ऑडिट रेकॉर्ड.'
              : 'Record, verify, and categorize daily site operational expenses, muster labor wages, and bills.'}
          </p>
        </div>

        {/* Action Buttons: PDF, Excel, Print */}
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
            title="Export to Excel Spreadsheet"
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

      {/* Summary KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {/* Card 1: Total Spend */}
        <div style={{
          background: 'var(--surface-bg)',
          borderRadius: '1rem',
          border: '1px solid var(--border-color)',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 4px 12px -2px var(--shadow-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {language === 'mr' ? 'एकूण खर्च' : 'Total Spent'}
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              ₹{totalFilteredAmount.toLocaleString()}
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(234, 88, 12, 0.15)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ReceiptText size={20} />
          </div>
        </div>

        {/* Card 2: Today's Spend */}
        <div style={{
          background: 'var(--surface-bg)',
          borderRadius: '1rem',
          border: '1px solid var(--border-color)',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 4px 12px -2px var(--shadow-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {language === 'mr' ? 'आजचा खर्च' : "Today's Spend"}
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981', marginTop: '0.2rem' }}>
              ₹{todaySpend.toLocaleString()}
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={20} />
          </div>
        </div>

        {/* Card 3: Available Balance */}
        <div style={{
          background: 'var(--surface-bg)',
          borderRadius: '1rem',
          border: '1px solid var(--border-color)',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 4px 12px -2px var(--shadow-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {t('availableBalance')}
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6', marginTop: '0.2rem' }}>
              ₹{walletBalance.toLocaleString()}
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* 50% Width Search Bar */}
      <div style={{
        position: 'relative',
        width: '50%',
        minWidth: '280px',
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
          placeholder={language === 'mr' ? 'खर्च, पावती, विक्रेता किंवा रक्कम शोधा...' : 'Search expense, vendor, category, site, amount...'}
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

      {/* Main Table Card */}
      <div style={{
        background: 'var(--surface-bg)',
        borderRadius: '1.15rem',
        border: '1px solid var(--border-color)',
        padding: '1.4rem',
        boxShadow: '0 4px 16px -2px var(--shadow-color)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Table Top Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.85rem'
        }}>
          {/* Left Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ReceiptText size={20} color="#2563eb" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {language === 'mr' ? 'दैनिक खर्चाच्या नोंदी' : 'Daily Expense Entries'}
            </h2>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '0.2rem 0.55rem',
              borderRadius: '1rem',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              color: '#2563eb'
            }}>
              {filteredExpenses.length} {language === 'mr' ? 'नोंदी' : 'Entries'}
            </span>
          </div>

          {/* Right Action Button */}
          <div>
            {/* + Add Daily Expense Button */}
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
              <span>{t('quickAddExpense')}</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          <table className="premium-table" style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>{t('voucherId')}</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>{t('expenseCategory')}</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>{t('siteLocation')}</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Vendor / Paid To</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>{t('dateTime')}</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>{t('amount')}</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>{t('status')}</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'center' }}>{t('receipt')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {language === 'mr' ? 'कोणतीही खर्चाची नोंद सापडली नाही.' : 'No expense entries found.'}
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
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--primary-color)', whiteSpace: 'nowrap' }}>
                      {exp.id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {exp.category}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} color="#3b82f6" />
                        <span>{exp.site}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                      {exp.paidTo || 'Local Vendor'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {exp.date}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: '#10b981', whiteSpace: 'nowrap' }}>
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
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
                        {exp.status === 'Approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {exp.status === 'Approved' ? t('approved') : t('pending')}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {exp.receipt ? (
                        <button
                          onClick={() => setViewReceiptModal(exp)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Eye size={12} /> {t('view')}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>{t('noBill')}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Expense */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
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
              maxWidth: '520px',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ReceiptText color="#2563eb" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {t('recordExpenseTitle')}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Site Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('siteLocation')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.65rem',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  {sitesList.filter(s => s !== 'All').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('expenseCategoryLabel')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.65rem',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  {categoriesList.filter(c => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c === 'Other' ? (language === 'mr' ? 'इतर (Other)' : 'Other') : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('amountPaidLabel')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2400"
                  required
                  min="1"
                  step="any"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.65rem',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Paid To */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('paidToLabel')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shree Sai Hardware / Auto Fare"
                  value={formData.paidTo}
                  onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.65rem',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Attach Bill Proof - Distinct Camera and Documents Sections */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {t('attachBillProof')} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.725rem', color: formData.receiptName ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                    {formData.receiptName ? '✓ Attached' : '(Required / आवश्यक)'}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {/* Option 1: Direct Camera Snap */}
                  <label 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.85rem 0.5rem',
                      border: '1.5px dashed #2563eb',
                      borderRadius: '0.75rem',
                      backgroundColor: 'rgba(37, 99, 235, 0.06)',
                      color: '#2563eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.06)'}
                  >
                    <Camera size={22} color="#2563eb" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                      {language === 'mr' ? 'कॅमेरा फोटो' : 'Camera Snap'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {language === 'mr' ? 'थेट फोटो काढा' : 'Take direct photo'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </label>

                  {/* Option 2: Upload Documents / PDF / Gallery */}
                  <label 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.85rem 0.5rem',
                      border: '1.5px dashed #8b5cf6',
                      borderRadius: '0.75rem',
                      backgroundColor: 'rgba(139, 92, 246, 0.06)',
                      color: '#8b5cf6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.06)'}
                  >
                    <FileText size={22} color="#8b5cf6" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                      {language === 'mr' ? 'डॉक्युमेंट्स / गॅलरी' : 'Upload Document'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {language === 'mr' ? 'PDF किंवा इमेज निवडा' : 'PDF, JPG, PNG'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {/* Attached File Preview / Confirmation */}
                {formData.receiptName && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.6rem',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                      <CheckCircle2 size={16} color="#10b981" />
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {formData.receiptName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, receiptName: '', previewUrl: null, receiptFile: null })}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  marginTop: '0.5rem',
                  boxShadow: '0 6px 18px rgba(99, 102, 241, 0.4)'
                }}
              >
                {submitting ? (language === 'mr' ? 'सेव्ह होत आहे...' : 'Saving...') : t('saveExpenseBtn')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Receipt */}
      {viewReceiptModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}
          onClick={() => setViewReceiptModal(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--surface-bg)',
              borderRadius: '1.25rem',
              width: '100%',
              maxWidth: '480px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Receipt Proof ({viewReceiptModal.id})
              </h3>
              <button
                onClick={() => setViewReceiptModal(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{
              background: 'var(--card-bg)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid var(--border-color)',
              marginBottom: '1.25rem'
            }}>
              <FileText size={48} color="#3b82f6" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {viewReceiptModal.receiptName || `${viewReceiptModal.id}_Invoice_Proof.pdf`}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Paid to: {viewReceiptModal.paidTo || 'Local Vendor'} • Amount: ₹{viewReceiptModal.amount.toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => {
                alert(`Downloading ${viewReceiptModal.receiptName || 'receipt'}...`);
                setViewReceiptModal(null);
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.65rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Download Verified Receipt File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyExpenses;
