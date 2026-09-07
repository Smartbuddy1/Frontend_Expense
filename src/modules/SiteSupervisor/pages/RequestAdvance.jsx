import React, { useState } from 'react';
import {
  Banknote,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  DollarSign,
  Sparkles,
  Plus,
  Search,
  MapPin,
  FileSpreadsheet,
  FileDown,
  Printer,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { exportToExcel, triggerPrint, exportToPDF } from '../utils/exportUtils';

const RequestAdvance = () => {
  const { requestAdvance, walletBalance, totalAdvance, advancesList, projects, defaultTargetProject, deleteAdvance, updateAdvance } = useWallet();
  const { t, language } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAdvanceData, setEditAdvanceData] = useState(null);

  const handleEditClick = (item) => {
    setEditAdvanceData({
      id: item.id,
      projectId: projects.find(p => (p.name === item.site || p.site === item.site))?.id || defaultTargetProject?.id,
      amount: item.amount,
      purpose: item.purpose,
      urgency: item.urgency || 'Regular'
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editAdvanceData.projectId || !editAdvanceData.amount || !editAdvanceData.purpose) {
      alert("Please fill all required fields!");
      return;
    }
    setSubmitting(true);
    try {
      await updateAdvance(editAdvanceData.id, editAdvanceData);
      setIsEditModalOpen(false);
      setEditAdvanceData(null);
      alert('Advance updated successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update advance');
    } finally {
      setSubmitting(false);
    }
  };

  // Form State for Modal
  const [amount, setAmount] = useState('');
  const [projectId, setProjectId] = useState(defaultTargetProject ? defaultTargetProject.id : '');

  React.useEffect(() => {
    if (defaultTargetProject) {
      setProjectId(defaultTargetProject.id);
    }
  }, [defaultTargetProject]);
  const [purpose, setPurpose] = useState('');
  const [urgency, setUrgency] = useState('Immediate (Same Day)');

  const history = advancesList;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      alert(language === 'mr' ? 'कृपया साइट लोकेशन निवडा!' : language === 'hi' ? 'कृपया साइट लोकेशन चुनें!' : 'Please select a Site Location!');
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert(language === 'mr' ? 'कृपया योग्य अ‍ॅडव्हान्स रक्कम भरा!' : language === 'hi' ? 'कृपया सही एडवांस राशि भरें!' : 'Please enter a valid advance amount!');
      return;
    }
    if (!urgency) {
      alert(language === 'mr' ? 'कृपया तातडीचा प्रकार (Urgency Level) निवडा!' : language === 'hi' ? 'कृपया तात्कालिकता (Urgency Level) चुनें!' : 'Please select an Urgency Level!');
      return;
    }
    if (!purpose || !purpose.trim()) {
      alert(language === 'mr' ? 'कृपया अ‍ॅडव्हान्सचे कारण / स्पष्टीकरण भरा (Mandatory)!' : language === 'hi' ? 'कृपया एडवांस का कारण / स्पष्टीकरण भरें (Mandatory)!' : 'Please enter Purpose / Reason for advance (Mandatory)!');
      return;
    }

    setSubmitting(true);
    try {
      await requestAdvance({
        amount: parseFloat(amount),
        reason: purpose.trim(),
        urgency,
        projectId
      });

      setAmount('');
      setPurpose('');
      setIsModalOpen(false);
      alert(language === 'mr'
        ? `₹${parseFloat(amount).toLocaleString()} ची अ‍ॅडव्हान्स मागणी मंजुरीसाठी पाठवली गेली आहे!`
        : language === 'hi'
        ? `₹${parseFloat(amount).toLocaleString()} की एडवांस मांग स्वीकृति के लिए भेज दी गई है!`
        : `Requisition of ₹${parseFloat(amount).toLocaleString()} submitted for Project Head approval!`);
    } catch (err) {
      alert(err.response?.data?.error || err.message || (language === 'mr' ? 'अडचण आली, पुन्हा प्रयत्न करा.' : language === 'hi' ? 'समस्या आई, कृपया पुनः प्रयास करें.' : 'Could not submit the request, please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const uniqueSites = [...new Set(history.map(item => item.site).filter(Boolean))];

  const filteredHistory = history.filter(item => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || (
      (item.id || '').toLowerCase().includes(term) ||
      (item.site || '').toLowerCase().includes(term) ||
      (item.note || '').toLowerCase().includes(term) ||
      (item.urgency || '').toLowerCase().includes(term) ||
      (item.status || '').toLowerCase().includes(term) ||
      (item.amount || '').toString().includes(term)
    );
    const matchesSite = !filterSite || item.site === filterSite;
    return matchesSearch && matchesSite;
  });

  const totalRequisitionAmount = history.reduce((sum, item) => sum + item.amount, 0);

  const handleExportExcel = () => {
    const headers = ['Requisition ID', 'Site Location', 'Date', 'Amount (₹)', 'Urgency', 'Purpose / Reason', 'Status'];
    const rows = filteredHistory.map(req => [
      req.id,
      req.site,
      req.date,
      req.amount,
      req.urgency,
      req.note,
      req.status
    ]);
    exportToExcel('Site_Advance_Requisitions_Report', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ['Req ID', 'Site Location', 'Date', 'Amount (Rs)', 'Urgency', 'Purpose / Reason', 'Status'];
    const rows = filteredHistory.map(req => [
      req.id,
      req.site,
      req.date,
      `Rs. ${req.amount.toLocaleString()}`,
      req.urgency,
      req.note,
      req.status
    ]);
    exportToPDF({
      fileName: 'Advance_Requisitions_Report',
      title: 'Site Advance Fund Requisitions Report',
      subtitle: 'Official log of field cash requests, urgent material advance allocations, and approval status.',
      headers,
      rows,
      meta: [
        { label: 'Total Requisitioned', value: `Rs. ${totalRequisitionAmount.toLocaleString()}` },
        { label: 'Total Requests', value: `${history.length} Requisitions` },
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
            {t('requestAdvanceTitle')}
          </h1>
          <p style={{
            fontSize: '0.925rem',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            {language === 'mr'
              ? 'साईटवरील खर्चासाठी नवीन अ‍ॅडव्हान्स फंडाची मागणी करा व मंजुरीचा स्टेटस तपासा.'
              : language === 'hi'
              ? 'साइट के खर्च के लिए नई एडवांस निधि की मांग करें व स्वीकृति की स्थिति देखें।'
              : 'Requisition site petty cash, urgent material purchase funds, and track approval status.'}
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
            title="Print Requisitions Table"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        margin: '0.15rem 0 1rem 0'
      }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          flex: '1 1 280px',
          maxWidth: '100%'
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
            placeholder={language === 'mr' ? 'प्रोजेक्ट, कारण किंवा रक्कम शोधा...' : language === 'hi' ? 'प्रोजेक्ट, कारण या राशि खोजें...' : 'Search site, purpose, amount...'}
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

        {/* Site Filter */}
        <div style={{
          position: 'relative',
          flex: '0 0 auto',
          minWidth: '200px'
        }}>
          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem',
              borderRadius: '0.75rem',
              border: '1.5px solid var(--border-color)',
              backgroundColor: 'var(--surface-bg)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px -2px var(--shadow-color)',
              boxSizing: 'border-box'
            }}
          >
            <option value="">{language === 'mr' ? 'सर्व साइट्स (All Sites)' : language === 'hi' ? 'सभी साइट्स (All Sites)' : 'All Sites'}</option>
            {uniqueSites.map((site, index) => (
              <option key={index} value={site}>{site}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Full-Width Recent Advance Requisitions Table Container */}
      <div style={{
        background: 'var(--surface-bg)',
        borderRadius: '1.15rem',
        border: '1px solid var(--border-color)',
        padding: '1.4rem',
        boxShadow: '0 4px 16px -2px var(--shadow-color)'
      }}>
        {/* Table Card Header with Title, Search Bar & '+ Request New Fund' Button */}
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
              <History size={18} color="#10b981" />
              {language === 'mr' ? 'अलीकडील अ‍ॅडव्हान्स मागण्या (Requisition Ledger)' : language === 'hi' ? 'हाल की एडवांस मांगें (Requisition Ledger)' : 'Recent Advance Requisitions'}
            </h2>

            {/* Total Requests Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '0.25rem 0.65rem',
              borderRadius: '0.65rem',
              color: '#10b981',
              fontWeight: '700',
              fontSize: '0.775rem'
            }}>
              <Banknote size={13} />
              <span>Total Requests ({history.length})</span>
            </div>
          </div>

          {/* Right Toolbar Area: Request New Fund Button */}
          <div>
            {/* + Request New Fund Button with Royal Blue to Purple Gradient */}
            <button
              onClick={() => setIsModalOpen(true)}
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
              <span>{language === 'mr' ? 'नवीन फंड मागणी' : language === 'hi' ? 'नई फंड मांग' : 'Request New Fund'}</span>
            </button>
          </div>
        </div>

        {/* Structured Requisitions Table */}
        <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          <table className="premium-table" style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--card-bg)' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Requisition ID</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Site Location</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Purpose / Reason</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Urgency</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Amount (₹)</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {language === 'mr' ? 'कोणतीही अ‍ॅडव्हान्स मागणी सापडली नाही.' : language === 'hi' ? 'कोई एडवांस मांग नहीं मिली।' : 'No matching advance requisitions found.'}
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr
                    key={item.displayId || item.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td data-label="REQUISITION ID" style={{ padding: '0.9rem 1rem', fontWeight: '700', color: '#10b981', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.displayId || item.id}>
                      {item.displayId || item.id}
                    </td>
                    <td data-label="SITE LOCATION" style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        <MapPin size={14} color="#3b82f6" />
                        <span>{item.site}</span>
                      </div>
                    </td>
                    <td data-label="PURPOSE" style={{ padding: '0.9rem 1rem', color: 'var(--text-primary)', fontWeight: '500', maxWidth: '280px' }}>
                      {item.note}
                    </td>
                    <td data-label="URGENCY" style={{ padding: '0.9rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.725rem',
                        fontWeight: '700',
                        backgroundColor: item.urgency?.includes('Immediate') ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                        color: item.urgency?.includes('Immediate') ? '#ef4444' : '#3b82f6'
                      }}>
                        <Clock size={11} /> {item.urgency || 'Standard'}
                      </span>
                    </td>
                    <td data-label="DATE" style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {item.date}
                    </td>
                    <td data-label="AMOUNT" style={{ padding: '0.9rem 1rem', fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                      ₹{item.amount.toLocaleString()}
                    </td>
                    <td data-label="STATUS" style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: item.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: item.status === 'Approved' ? '#10b981' : '#f59e0b'
                      }}>
                        {item.status === 'Approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {item.status}
                      </span>
                    </td>
                    <td data-label="ACTIONS" style={{ padding: '0.9rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button
                          title="Edit"
                          disabled={item.status !== 'Requested'}
                          style={{
                            background: item.status === 'Requested' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                            color: item.status === 'Requested' ? '#3b82f6' : '#94a3b8',
                            border: item.status === 'Requested' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(148, 163, 184, 0.3)',
                            padding: '0.35rem',
                            borderRadius: '0.5rem',
                            cursor: item.status === 'Requested' ? 'pointer' : 'not-allowed',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            opacity: item.status === 'Requested' ? 1 : 0.6
                          }}
                          onMouseEnter={(e) => { if(item.status === 'Requested') { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; } }}
                          onMouseLeave={(e) => { if(item.status === 'Requested') { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; } }}
                          onClick={() => handleEditClick(item)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          title="Delete"
                          disabled={item.status !== 'Requested'}
                          style={{
                            background: item.status === 'Requested' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                            color: item.status === 'Requested' ? '#ef4444' : '#94a3b8',
                            border: item.status === 'Requested' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(148, 163, 184, 0.3)',
                            padding: '0.35rem',
                            borderRadius: '0.5rem',
                            cursor: item.status === 'Requested' ? 'pointer' : 'not-allowed',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            opacity: item.status === 'Requested' ? 1 : 0.6
                          }}
                          onMouseEnter={(e) => { if(item.status === 'Requested') { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; } }}
                          onMouseLeave={(e) => { if(item.status === 'Requested') { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; } }}
                          onClick={async () => {
                            if(window.confirm(language === 'mr' ? 'हा ॲडव्हान्स खरोखर डिलीट करायचा आहे का?' : language === 'hi' ? 'क्या आप वास्तव में इस अग्रिम को डिलीट करना चाहते हैं?' : 'Are you sure you want to delete this advance request?')) {
                              try {
                                await deleteAdvance(item.id);
                              } catch(err) {
                                alert(err.response?.data?.error || 'Failed to delete advance request.');
                              }
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Fund Requisition Modal (Popup Dialog) */}
      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--surface-bg)',
              borderRadius: '1.25rem',
              width: '100%',
              maxWidth: '520px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-color)',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <Send size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {language === 'mr' ? 'नवीन फंड मागणी (Fund Requisition)' : language === 'hi' ? 'नई फंड मांग (Fund Requisition)' : 'New Fund Requisition'}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {language === 'mr' ? 'साईटवरील तातडीच्या खर्चासाठी अ‍ॅडव्हान्स मागणी पाठवा' : language === 'hi' ? 'साइट के तात्कालिक खर्च के लिए एडवांस मांग भेजें' : 'Request advance petty cash from Head Office'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="#3b82f6" />
                  {t('siteLocation')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '0.6rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none', fontWeight: '600' }}
                >
                  {projects.length > 0 ? (
                    projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  ) : (
                    <option value="">No Project Assigned</option>
                  )}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('reqAmountLabel')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  required
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '0.6rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: '800', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {language === 'mr' ? 'तातडीचा प्रकार (Urgency Level)' : language === 'hi' ? 'तात्कालिकता (Urgency Level)' : 'Urgency Level'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '0.6rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="Immediate (Same Day)">Immediate (Same Day)</option>
                  <option value="Within 24 Hours">Within 24 Hours</option>
                  <option value="Regular Weekly Advance">Regular Weekly Advance</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.4rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('purposeLabel')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows="3"
                  placeholder={language === 'mr' ? 'अ‍ॅडव्हान्स कशासाठी लागत आहे ते स्पष्ट लिहा (उदा. २ टन वाळू व मिक्सर मशीन भाडे)...' : language === 'hi' ? 'एडवांस किसलिए चाहिए यह स्पष्ट लिखें (उदा. 2 टन रेत व मिक्सर मशीन किराया)...' : 'Specify why advance is needed (e.g. 2 tons sand delivery & mixer machine rent)...'}
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '0.6rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Send size={16} />
                <span>{t('sendRequisitionBtn')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Advance */}
      {isEditModalOpen && editAdvanceData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--surface-bg)', borderRadius: '1.25rem', width: '100%', maxWidth: '450px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <Edit2 size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {language === 'mr' ? 'अ‍ॅडव्हान्स संपादित करा' : language === 'hi' ? 'एडवांस संपादित करें' : 'Edit Advance'}
                  </h3>
                </div>
              </div>
              <button onClick={() => { setIsEditModalOpen(false); setEditAdvanceData(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('siteLocation')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={editAdvanceData.projectId}
                  onChange={(e) => setEditAdvanceData({ ...editAdvanceData, projectId: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '0.6rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none', fontWeight: '600' }}
                >
                  <option value="" disabled>Select Site</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('reqAmountLabel')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  required
                  min="1"
                  step="any"
                  value={editAdvanceData.amount}
                  onChange={(e) => setEditAdvanceData({ ...editAdvanceData, amount: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '0.6rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: '800', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {language === 'mr' ? 'तातडीचा प्रकार (Urgency Level)' : language === 'hi' ? 'तात्कालिकता (Urgency Level)' : 'Urgency Level'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={editAdvanceData.urgency}
                  onChange={(e) => setEditAdvanceData({ ...editAdvanceData, urgency: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '0.6rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="Immediate (Same Day)">Immediate (Same Day)</option>
                  <option value="Within 24 Hours">Within 24 Hours</option>
                  <option value="Regular Weekly Advance">Regular Weekly Advance</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.4rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('purposeLabel')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Specify why advance is needed..."
                  required
                  value={editAdvanceData.purpose}
                  onChange={(e) => setEditAdvanceData({ ...editAdvanceData, purpose: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '0.6rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{submitting ? 'Updating...' : 'Update Advance'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestAdvance;
