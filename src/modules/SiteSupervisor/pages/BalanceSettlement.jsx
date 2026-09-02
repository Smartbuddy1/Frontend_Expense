import React, { useState } from 'react';
import {
  Wallet,
  Scale,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  ShieldAlert,
  Printer,
  FileDown,
  MapPin,
  Search,
  Building2
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { exportToExcel, triggerPrint, exportToPDF } from '../utils/exportUtils';

const BalanceSettlement = () => {
  const { walletBalance, totalAdvance, expensesList } = useWallet();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const totalSpent = expensesList.reduce((sum, item) => sum + item.amount, 0);

  const ledgerEntries = [
    {
      id: 'TXN-902',
      type: 'Credit',
      site: 'Head Office (Main Account)',
      desc: 'Advance received from Head Office',
      amount: totalAdvance,
      date: 'August 2026',
      balanceAfter: walletBalance + totalSpent
    },
    ...expensesList.map((exp) => ({
      id: `TXN-${exp.id.replace('EXP-', '')}`,
      type: 'Debit',
      site: exp.site || 'Metro Line 3 - Station #4B',
      desc: `${exp.category} - ${exp.paidTo || 'Vendor'}`,
      amount: exp.amount,
      date: exp.date,
      balanceAfter: walletBalance
    }))
  ];

  const filteredEntries = ledgerEntries.filter(entry => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (entry.id || '').toLowerCase().includes(term) ||
      (entry.site || '').toLowerCase().includes(term) ||
      (entry.desc || '').toLowerCase().includes(term) ||
      (entry.date || '').toLowerCase().includes(term) ||
      (entry.amount || '').toString().includes(term)
    );
  });

  const handleExportExcel = () => {
    const headers = ['Transaction ID', 'Date', 'Project / Site Name', 'Type (Credit/Debit)', 'Transaction Details', 'Amount (₹)', 'Closing Balance (₹)'];
    const rows = filteredEntries.map(entry => [
      entry.id,
      entry.date,
      entry.site,
      entry.type,
      entry.desc,
      entry.amount,
      entry.balanceAfter
    ]);
    exportToExcel('Site_Supervisor_Passbook_Ledger', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ['Txn ID', 'Date', 'Project / Site', 'Type', 'Transaction Details', 'Amount (Rs)', 'Closing Balance (Rs)'];
    const rows = filteredEntries.map(entry => [
      entry.id,
      entry.date,
      entry.site,
      entry.type,
      entry.desc,
      `${entry.type === 'Debit' ? '-' : '+'} Rs. ${entry.amount.toLocaleString()}`,
      `Rs. ${entry.balanceAfter.toLocaleString()}`
    ]);
    exportToPDF({
      fileName: 'Supervisor_Passbook_Statement',
      title: 'Supervisor Advance & Settlement Passbook',
      subtitle: 'Complete reconciled statement of site advance credits and field expense debits.',
      headers,
      rows,
      meta: [
        { label: 'Closing Balance', value: `Rs. ${walletBalance.toLocaleString()}` },
        { label: 'Total Advance', value: `Rs. ${totalAdvance.toLocaleString()}` },
        { label: 'Reconciled Spend', value: `Rs. ${totalSpent.toLocaleString()}` }
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
            {t('balanceSettlement')}
          </h1>
          <p style={{
            fontSize: '0.925rem',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            {language === 'mr'
              ? 'साईटवरील शिल्लक रक्कम, खर्च झालेला हिशोब आणि ऑडिट पासबुक लेजर.'
              : language === 'hi'
              ? 'साइट की शेष राशि, खर्च का हिसाब व ऑडिट पासबुक लेजर।'
              : 'Supervise available site petty balance, reconciled expenditures, and monthly audit settlement passbook.'}
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
            title="Download / Save Passbook as PDF"
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
            title="Export Passbook to Excel / CSV"
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
            title="Print Passbook Statement"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>
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
          placeholder={language === 'mr' ? 'प्रोजेक्ट, तपशील किंवा रक्कम शोधा...' : language === 'hi' ? 'प्रोजेक्ट, विवरण या राशि खोजें...' : 'Search project, details, amount...'}
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

      {/* Ledger Table Container */}
      <div style={{
        background: 'var(--surface-bg)',
        borderRadius: '1.15rem',
        padding: '1.4rem',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 16px -2px var(--shadow-color)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Table Title */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.1rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={18} color="#06b6d4" />
            {language === 'mr' ? 'पासबुक स्टेटमेंट व ट्रॅन्झॅक्शन लेजर' : language === 'hi' ? 'पासबुक स्टेटमेंट व ट्रांजेक्शन लेजर' : 'Passbook Statement & Transaction Ledger'}
          </h3>
        </div>

        <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          <table className="premium-table" style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>TXN ID</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>DATE</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>PROJECT / SITE NAME</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>TRANSACTION DETAILS</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>CREDIT (+)</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>DEBIT (-)</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'right' }}>RUNNING BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {language === 'mr' ? 'कोणताही ट्रॅन्झॅक्शन सापडला नाही.' : language === 'hi' ? 'कोई ट्रांजेक्शन नहीं मिला।' : 'No matching transactions found.'}
                  </td>
                </tr>
              ) : (
                filteredEntries.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '0.9rem 1rem', fontWeight: '700', color: 'var(--primary-color)', whiteSpace: 'nowrap' }}>
                      {row.id}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {row.date}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                        <MapPin size={14} color="#3b82f6" />
                        <span>{row.site}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {row.desc}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: '700', color: '#10b981', whiteSpace: 'nowrap' }}>
                      {row.type === 'Credit' ? `+₹${row.amount.toLocaleString()}` : '-'}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: '700', color: '#ef4444', whiteSpace: 'nowrap' }}>
                      {row.type === 'Debit' ? `-₹${row.amount.toLocaleString()}` : '-'}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: '800', color: 'var(--text-primary)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      ₹{row.balanceAfter.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BalanceSettlement;
