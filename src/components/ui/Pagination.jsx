import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPrev, onNext, language = 'en' }) => {
  if (totalPages <= 1) return null; // Don't show pagination if there's only one page

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.35rem 1.5rem',
      backgroundColor: 'var(--card-bg, #ffffff)',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '20px',
      marginTop: '0.75rem',
      gap: '0.85rem',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        {/* Previous Button */}
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          style={{
            height: '44px',
            padding: '0 1.35rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color, #cbd5e1)',
            backgroundColor: currentPage === 1 ? 'var(--bg-color, #f8fafc)' : 'var(--card-bg, #ffffff)',
            color: currentPage === 1 ? 'var(--text-secondary, #94a3b8)' : 'var(--text-primary, #0f172a)',
            fontSize: '0.92rem',
            fontWeight: '800',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.2s ease',
            boxShadow: currentPage === 1 ? 'none' : '0 1px 3px rgba(0,0,0,0.06)'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.backgroundColor = 'var(--table-hover, #eff6ff)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.borderColor = 'var(--border-color, #cbd5e1)';
              e.currentTarget.style.color = 'var(--text-primary, #0f172a)';
              e.currentTarget.style.backgroundColor = 'var(--card-bg, #ffffff)';
            }
          }}
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
          {language === 'mr' ? 'मागे (Previous)' : 'Previous'}
        </button>

        {/* '1 of 3' Middle Display Box */}
        <div style={{
          height: '44px',
          padding: '0 1.45rem',
          borderRadius: '10px',
          border: '1px solid var(--border-color, #e2e8f0)',
          backgroundColor: 'var(--input-bg, #f8fafc)',
          color: 'var(--text-primary, #0f172a)',
          fontSize: '0.95rem',
          fontWeight: '900',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <span style={{ color: '#38bdf8' }}>{currentPage}</span>
          <span style={{ color: 'var(--text-secondary, #64748b)', fontWeight: '700' }}>{language === 'mr' ? 'पैकी' : 'of'}</span>
          <span style={{ color: 'var(--text-primary, #0f172a)' }}>{totalPages}</span>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          style={{
            height: '44px',
            padding: '0 1.35rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color, #cbd5e1)',
            backgroundColor: currentPage === totalPages ? 'var(--bg-color, #f8fafc)' : 'var(--card-bg, #ffffff)',
            color: currentPage === totalPages ? 'var(--text-secondary, #94a3b8)' : 'var(--text-primary, #0f172a)',
            fontSize: '0.92rem',
            fontWeight: '800',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.2s ease',
            boxShadow: currentPage === totalPages ? 'none' : '0 1px 3px rgba(0,0,0,0.06)'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.backgroundColor = 'var(--table-hover, #eff6ff)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.borderColor = 'var(--border-color, #cbd5e1)';
              e.currentTarget.style.color = 'var(--text-primary, #0f172a)';
              e.currentTarget.style.backgroundColor = 'var(--card-bg, #ffffff)';
            }
          }}
        >
          {language === 'mr' ? 'पुढे (Next)' : 'Next'}
          <ChevronRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
