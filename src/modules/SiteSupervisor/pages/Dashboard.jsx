import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Banknote, 
  ReceiptText, 
  UploadCloud, 
  Wallet, 
  Building2, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  HardHat, 
  Calendar,
  FileCheck,
  Search,
  Filter,
  DollarSign,
  Layers,
  Sparkles,
  Eye,
  FileText,
  MapPin,
  Camera,
  ArrowDownRight,
  FolderPlus,
  Tag,
  Folder,
  X
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    project,
    categories,
    walletBalance, 
    totalAdvance, 
    todaySpend, 
    expensesList, 
    recordExpense, 
    requestAdvance, 
    lastDeduction 
  } = useWallet();
  const { t, language } = useLanguage();

  const selectedSite = 'all';

  const [activeModal, setActiveModal] = useState(null); // 'expense', 'advance', 'bill', null
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    site: '',
    amount: '',
    paidTo: '',
    receiptName: '',
    previewUrl: null
  });

  const [advanceForm, setAdvanceForm] = useState({ 
    site: '',
    amount: '', 
    reason: '', 
    urgency: 'Immediate (Same Day)' 
  });

  // Update forms when project/categories load
  React.useEffect(() => {
    if (project) {
      setExpenseForm(prev => ({ ...prev, site: project.name }));
      setAdvanceForm(prev => ({ ...prev, site: project.name }));
    }
    if (categories && categories.length > 0 && !expenseForm.category) {
      setExpenseForm(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [project, categories]);

  const handleExpenseFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setExpenseForm(prev => ({
        ...prev,
        receiptName: file.name,
        previewUrl: preview
      }));
    }
  };

  const currentSiteInfo = {
    name: project ? project.name : (language === 'mr' ? 'कोणताही प्रकल्प नाही' : 'No Project Assigned'),
    labors: 0,
    advanceAllocated: totalAdvance,
    statusColor: '#3b82f6'
  };

  const filteredExpensesList = expensesList;

  const siteTodaySpend = filteredExpensesList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalSpent = expensesList.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleAddExpense = (e) => {
    e.preventDefault();
    
    if (!expenseForm.site) {
      alert(language === 'mr' ? 'कृपया साइट लोकेशन निवडा!' : 'Please select a Site Location!');
      return;
    }
    if (!expenseForm.category) {
      alert(language === 'mr' ? 'कृपया खर्चाचा प्रकार निवडा!' : 'Please select an Expense Category!');
      return;
    }
    if (!expenseForm.amount || isNaN(expenseForm.amount) || parseFloat(expenseForm.amount) <= 0) {
      alert(language === 'mr' ? 'कृपया योग्य रक्कम भरा!' : 'Please enter a valid amount!');
      return;
    }
    if (!expenseForm.paidTo || !expenseForm.paidTo.trim()) {
      alert(language === 'mr' ? 'कृपया कोणाला पैसे दिले (Vendor / Person Name) ते भरा!' : 'Please enter Paid To (Vendor / Person Name)!');
      return;
    }
    if (!expenseForm.receiptName) {
      alert(language === 'mr' ? 'कृपया बिलाचा फोटो किंवा डॉक्युमेंट पुरावा जोडा (Bill Proof अनिवार्य आहे)!' : 'Please attach a bill photo or document proof (Mandatory)!');
      return;
    }

    recordExpense({
      category: expenseForm.category,
      site: expenseForm.site,
      amount: parseFloat(expenseForm.amount),
      paidTo: expenseForm.paidTo.trim(),
      receiptName: expenseForm.receiptName,
      receiptUrl: expenseForm.previewUrl || null,
      receipt: true
    });

    setExpenseForm({
      category: categories && categories.length > 0 ? categories[0].name : '',
      site: project ? project.name : '',
      amount: '',
      paidTo: '',
      receiptName: '',
      previewUrl: null
    });
    setActiveModal(null);
    alert(language === 'mr' ? 'खर्च आणि बिलाचा पुरावा यशस्वीरीत्या नोंदवला गेला!' : 'Expense and bill proof recorded successfully!');
  };

  const handleRequestAdvance = (e) => {
    e.preventDefault();
    if (!advanceForm.site) {
      alert(language === 'mr' ? 'कृपया साइट लोकेशन निवडा!' : 'Please select a Site Location!');
      return;
    }
    if (!advanceForm.amount || isNaN(advanceForm.amount) || parseFloat(advanceForm.amount) <= 0) {
      alert(language === 'mr' ? 'कृपया योग्य अ‍ॅडव्हान्स रक्कम भरा!' : 'Please enter a valid advance amount!');
      return;
    }
    if (!advanceForm.urgency) {
      alert(language === 'mr' ? 'कृपया तातडीचा प्रकार (Urgency Level) निवडा!' : 'Please select an Urgency Level!');
      return;
    }
    if (!advanceForm.reason || !advanceForm.reason.trim()) {
      alert(language === 'mr' ? 'कृपया अ‍ॅडव्हान्सचे कारण / स्पष्टीकरण भरा (Mandatory)!' : 'Please enter Purpose / Reason for advance (Mandatory)!');
      return;
    }

    requestAdvance({
      amount: parseFloat(advanceForm.amount),
      reason: advanceForm.reason.trim(),
      site: advanceForm.site
    });
    alert(language === 'mr' 
      ? `₹${parseFloat(advanceForm.amount).toLocaleString()} ची अ‍ॅडव्हान्स मागणी मंजुरीसाठी पाठवली गेली आहे!` 
      : `Advance request of ₹${parseFloat(advanceForm.amount).toLocaleString()} submitted successfully!`);
    setAdvanceForm({ site: project ? project.name : '', amount: '', reason: '', urgency: 'Immediate (Same Day)' });
    setActiveModal(null);
  };

  // 4 Core Supervisor Quick Actions (Daily Expenses first, Assigned Projects second)
  const supervisorCards = [
    {
      id: 'daily-expenses',
      title: t('dailyExpenses'),
      description: t('descExpenses'),
      icon: <ReceiptText className="w-6 h-6 text-white" />,
      iconBg: '#f97316',
      action: () => navigate('/daily-expenses')
    },
    {
      id: 'assigned-projects',
      title: t('assignedProjects'),
      description: t('descAssigned'),
      icon: <Building2 className="w-6 h-6 text-white" />,
      iconBg: '#3b82f6',
      action: () => navigate('/assigned-projects')
    },
    {
      id: 'request-advance',
      title: t('requestAdvance'),
      description: t('descAdvance'),
      icon: <Banknote className="w-6 h-6 text-white" />,
      iconBg: '#10b981',
      action: () => navigate('/request-advance')
    },
    {
      id: 'track-settlement',
      title: t('balanceSettlement'),
      description: t('descSettlement'),
      icon: <Wallet className="w-6 h-6 text-white" />,
      iconBg: '#06b6d4',
      action: () => navigate('/balance-settlement')
    },
    {
      id: 'site-photos',
      title: 'Site Photos',
      description: 'Upload and view site photos',
      icon: <Camera className="w-6 h-6 text-white" />,
      iconBg: '#8b5cf6',
      action: () => navigate('/site-photos')
    }
  ];

  return (
    <div className="supervisor-container" style={{ gap: '1.25rem' }}>
      {/* Top Header Section matching Screenshot */}
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
            Welcome to <span style={{ color: '#2563eb' }}>Dashboard</span>
          </h1>
          <p style={{
            fontSize: '0.925rem',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            {language === 'mr' 
              ? 'नमस्कार (Site Supervisor), हा तुमच्या साइट्सचा आणि खर्चाचा आढावा आहे.' 
              : 'Hello Site Supervisor, here is your assigned sites overview and expenses.'}
          </p>
        </div>

        {/* Site Details on Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--surface-bg)',
            border: '1.5px solid #3b82f6',
            padding: '0.45rem 0.85rem',
            borderRadius: '0.65rem',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)'
          }}>
            <MapPin size={16} color="#3b82f6" />
            <span style={{
              color: 'var(--text-primary)',
              fontWeight: '700',
              fontSize: '0.85rem',
            }}>
              {project ? project.name : (language === 'mr' ? 'कोणताही प्रकल्प नाही' : 'No Project')}
            </span>
          </div>
        </div>
      </div>

      {/* Top Stat Cards Row (Full Width 100% Span) */}
      <div className="dashboard-kpi-grid-3">
        {/* Card 1: Available Wallet Balance */}
        <div style={{
          background: 'var(--surface-bg)',
          borderRadius: '1.15rem',
          border: '1px solid var(--border-color)',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 4px 16px -2px var(--shadow-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '140px',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            {t('availableBalance')}
          </span>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.4rem 0' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#10b981', lineHeight: 1 }}>
              ₹{walletBalance.toLocaleString()}
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.75rem',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
            }}>
              <Wallet size={22} />
            </div>
          </div>

          <div>
            {lastDeduction ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '0.65rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444'
              }}>
                <ArrowDownRight size={12} /> -₹{lastDeduction.toLocaleString()} {t('justSpent')}
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '0.65rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981'
              }}>
                ● {t('readyToSpend')}
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Total Advance Fund / Site Advance */}
        <div style={{
          background: 'var(--surface-bg)',
          borderRadius: '1.15rem',
          border: '1px solid var(--border-color)',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 4px 16px -2px var(--shadow-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '140px',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            {language === 'mr' ? 'एकूण अ‍ॅडव्हान्स फंड' : 'Total Advance Fund'}
          </span>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.4rem 0' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
              ₹{totalAdvance.toLocaleString()}
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.75rem',
              backgroundColor: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)'
            }}>
              <Banknote size={22} />
            </div>
          </div>

          <div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '0.65rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981'
            }}>
              <TrendingUp size={12} /> +100% credited
            </span>
          </div>
        </div>

        {/* Card 3: Total Settled Expenses / Site Spent */}
        <div style={{
          background: 'var(--surface-bg)',
          borderRadius: '1.15rem',
          border: '1px solid var(--border-color)',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 4px 16px -2px var(--shadow-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '140px',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            {language === 'mr' ? 'साइटवरील खर्च' : 'Site Settled Spend'}
          </span>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.4rem 0' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
              ₹{siteTodaySpend.toLocaleString()}
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.75rem',
              backgroundColor: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)'
            }}>
              <Tag size={22} />
            </div>
          </div>

          <div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '0.65rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981'
            }}>
              <TrendingUp size={12} /> {filteredExpensesList.length} Entries Recorded
            </span>
          </div>
        </div>

        {/* Card 4: Total Projects (Placed LAST in the row when 'All Sites' is selected) */}
        {selectedSite === 'all' && (
          <div style={{
            background: 'var(--surface-bg)',
            borderRadius: '1.15rem',
            border: '1px solid var(--border-color)',
            padding: '1.15rem 1.25rem',
            boxShadow: '0 4px 16px -2px var(--shadow-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '140px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {language === 'mr' ? 'एकूण नियुक्त प्रोजेक्ट्स' : 'Total Projects'}
            </span>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.4rem 0' }}>
              <div style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
                3
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '0.75rem',
                backgroundColor: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)'
              }}>
                <FolderPlus size={22} />
              </div>
            </div>

            <div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '0.65rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981'
              }}>
                <TrendingUp size={12} /> +5% active
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Section (Compact Horizontal Cards matching screenshot) */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
          {t('quickActions')}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem'
        }}>
          {supervisorCards.map((card) => (
            <div 
              key={card.id} 
              onClick={card.action}
              style={{
                background: 'var(--surface-bg)',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 3px 10px -2px var(--shadow-color)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 6px 20px -4px rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = '0 3px 10px -2px var(--shadow-color)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: card.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                  boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
                }}>
                  {card.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.1rem' }}>
                    {card.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {card.description}
                  </p>
                </div>
              </div>

              <div style={{ color: '#94a3b8', flexShrink: 0, marginLeft: '0.5rem' }}>
                <ArrowUpRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expense Entries & Field Activity */}
      <div style={{
        background: 'var(--surface-bg)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px -4px var(--shadow-color)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck size={20} color="#3b82f6" />
              {t('recentExpenses')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {project ? `${language === 'mr' ? 'साइट' : 'Site'}: ${project.name} (${filteredExpensesList.length} ${language === 'mr' ? 'नोंदी' : 'entries'})` : ''}
            </p>
          </div>

          <button 
            onClick={() => setActiveModal('expense')}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: '0.85rem',
              fontWeight: '700',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={16} /> {t('quickAddExpense')}
          </button>
        </div>

        <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          <table className="premium-table" style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{t('voucherId')}</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{t('expenseCategory')}</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{t('siteLocation')}</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{t('dateTime')}</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{t('amount')}</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{t('status')}</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600', textAlign: 'center' }}>{t('receipt')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpensesList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {language === 'mr' ? 'या साइटसाठी अद्याप कोणताही खर्च नोंदवलेला नाही.' : 'No expenses recorded for this site yet.'}
                  </td>
                </tr>
              ) : (
                filteredExpensesList.slice(0, 8).map((exp) => (
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
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {exp.category}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {exp.site}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {exp.date}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
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
                          onClick={() => alert(`Showing receipt for ${exp.id}`)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            border: 'none',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '0.4rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
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

      {/* Modal: Add Daily Expense */}
      {activeModal === 'expense' && (
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
        onClick={() => setActiveModal(null)}
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
                onClick={() => setActiveModal(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Site Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('siteLocation')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={expenseForm.site}
                  onChange={(e) => setExpenseForm({ ...expenseForm, site: e.target.value })}
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
                  {project && <option value={project.name}>{project.name}</option>}
                </select>
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('expenseCategoryLabel')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
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
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name === 'Other' ? (language === 'mr' ? 'इतर (Other)' : 'Other') : c.name}
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
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
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
                  value={expenseForm.paidTo}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
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
                  <span style={{ fontSize: '0.725rem', color: expenseForm.receiptName ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                    {expenseForm.receiptName ? '✓ Attached' : '(Required / आवश्यक)'}
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
                      onChange={handleExpenseFileChange}
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
                      onChange={handleExpenseFileChange}
                    />
                  </label>
                </div>

                {/* Attached File Preview / Confirmation */}
                {expenseForm.receiptName && (
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
                        {expenseForm.receiptName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpenseForm(prev => ({ ...prev, receiptName: '', previewUrl: null }))}
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
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  boxShadow: '0 6px 18px rgba(99, 102, 241, 0.4)'
                }}
              >
                {t('saveExpenseBtn')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Advance */}
      {activeModal === 'advance' && (
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
        onClick={() => setActiveModal(null)}
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
              maxHeight: '92vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <Banknote size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {language === 'mr' ? 'नवीन फंड मागणी (Fund Requisition)' : 'New Fund Requisition'}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {language === 'mr' ? 'साईटवरील तातडीच्या खर्चासाठी अ‍ॅडव्हान्स मागणी पाठवा' : 'Request advance petty cash from Head Office'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestAdvance} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Site Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('siteLocation')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={advanceForm.site}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, site: e.target.value })}
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
                  {project && <option value={project.name}>{project.name}</option>}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('reqAmountLabel')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="number" 
                  placeholder="e.g. 25000" 
                  required
                  min="1"
                  step="any"
                  value={advanceForm.amount}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
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

              {/* Urgency Level */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {language === 'mr' ? 'तातडीचा प्रकार (Urgency Level)' : 'Urgency Level'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  required
                  value={advanceForm.urgency}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, urgency: e.target.value })}
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
                  <option value="Immediate (Same Day)">Immediate (Same Day)</option>
                  <option value="Within 24 Hours">Within 24 Hours</option>
                  <option value="Regular Weekly Advance">Regular Weekly Advance</option>
                </select>
              </div>

              {/* Purpose / Reason */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {t('purposeLabel')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea 
                  rows="3"
                  placeholder={language === 'mr' ? 'अ‍ॅडव्हान्स कशासाठी लागत आहे ते स्पष्ट लिहा (उदा. २ टन वाळू व मिक्सर मशीन भाडे)...' : 'Specify why advance is needed (e.g. 2 tons sand delivery & mixer machine rent)...'}
                  required
                  value={advanceForm.reason}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.65rem',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                ></textarea>
              </div>

              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  boxShadow: '0 6px 18px rgba(16, 185, 129, 0.4)'
                }}
              >
                {t('sendRequisitionBtn')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Bills/Receipts */}
      {activeModal === 'bill' && (
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
        onClick={() => setActiveModal(null)}
        >
          <div 
            style={{
              backgroundColor: 'var(--surface-bg)',
              borderRadius: '1.25rem',
              width: '100%',
              maxWidth: '480px',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud color="#8b5cf6" /> Upload Site Bills & Vouchers
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{
              border: '2px dashed var(--primary-color)',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: 'var(--card-bg)',
              marginBottom: '1.25rem',
              cursor: 'pointer'
            }}>
              <UploadCloud size={48} color="#8b5cf6" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Tap to take Photo or Upload Files
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                PNG, JPG, PDF up to 10MB
              </p>
            </div>

            <button 
              onClick={() => { alert('Bills uploaded successfully!'); setActiveModal(null); }}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Confirm & Submit Voucher
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

