import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
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
  ArrowDownRight,
  Edit2,
  XCircle
} from 'lucide-react';
import { useWallet, sanitizeUrl } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { exportToPDF } from '../utils/exportUtils';
import { toast } from '../../../components/Toast';
import Pagination from '../../../components/ui/Pagination';
import { 
  LABOUR_SUBCATEGORIES, 
  TRANSPORT_SUBCATEGORIES, 
  LODGING_SUBCATEGORIES,
  PURCHASE_SUBCATEGORIES,
  MISCELLANEOUS_SUBCATEGORIES,
  TRAVEL_SUBCATEGORIES,
  isLabourCategory, 
  isTransportCategory, 
  isLodgingCategory,
  isPurchaseCategory,
  isMiscellaneousCategory,
  isTravelCategory,
  isDailyAllowanceCategory,
  extractSubCategory,
  formatSubCategoryDisplay
} from '../../../utils/expenseCategories';

const DailyExpenses = () => {
  const { project, projects, defaultTargetProject, categories, walletBalance, expensesList, recordExpense, todaySpend, deleteExpense, updateExpense } = useWallet();
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSite, setSelectedSite] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const isInitialOpen = Boolean(location.state?.openModal || new URLSearchParams(location.search).get('openModal') === 'true' || new URLSearchParams(location.search).get('action') === 'add');
  const [isAddModalOpen, setIsAddModalOpen] = useState(() => isInitialOpen);
  const [viewReceiptModal, setViewReceiptModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editExpenseData, setEditExpenseData] = useState(null);

  useEffect(() => {
    if (location.state?.openModal || new URLSearchParams(location.search).get('openModal') === 'true' || new URLSearchParams(location.search).get('action') === 'add') {
      setIsAddModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.search, location.pathname, navigate]);

  const handleEditClick = (expense) => {
    const existingSubCat = expense.subCategory || extractSubCategory(expense.description) || '';
    const daMatch = existingSubCat.match(/^(.*?)\s*\((\d+(?:\.\d+)?)\s*Days?\)$/i);
    const daysOnlyMatch = existingSubCat.match(/^(\d+(?:\.\d+)?)\s*Days?$/i);
    const remarkPersonMatch = (expense.remark || expense.description || '').match(/(?:For|Person):\s*([^|]+)/i);

    setEditExpenseData({
      id: expense.id,
      category: expense.category,
      subCategory: existingSubCat,
      allowancePerson: daMatch ? daMatch[1].trim() : (remarkPersonMatch ? remarkPersonMatch[1].trim() : (isDailyAllowanceCategory(expense.category) ? (expense.paidTo === 'Local Vendor' ? '' : expense.paidTo) : '')),
      allowanceDays: daMatch ? daMatch[2].trim() : (daysOnlyMatch ? daysOnlyMatch[1].trim() : ''),
      customSubCategory: '',
      projectId: projects.find(p => (p.name === expense.site || p.site === expense.site))?.id || defaultTargetProject?.id,
      amount: expense.amount,
      paidTo: expense.paidTo === 'Local Vendor' ? '' : expense.paidTo,
      remark: expense.remark || '',
      description: '',
      receiptName: expense.receiptName || '',
      previewUrl: sanitizeUrl(expense.receiptUrl),
      receiptFile: null
    });
    setIsEditModalOpen(true);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setEditExpenseData({
        ...editExpenseData,
        receiptName: file.name,
        previewUrl: preview,
        receiptFile: file
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editExpenseData.projectId || !editExpenseData.category || !editExpenseData.amount || !editExpenseData.paidTo.trim()) {
      toast.error("Please fill all required fields!");
      return;
    }
    const hasSubCat = isLabourCategory(editExpenseData.category) ||
      isTransportCategory(editExpenseData.category) ||
      isLodgingCategory(editExpenseData.category) ||
      isPurchaseCategory(editExpenseData.category) ||
      isMiscellaneousCategory(editExpenseData.category) ||
      isTravelCategory(editExpenseData.category) ||
      isDailyAllowanceCategory(editExpenseData.category);

    if (hasSubCat) {
      if (isDailyAllowanceCategory(editExpenseData.category)) {
        if (!editExpenseData.allowanceDays || isNaN(editExpenseData.allowanceDays) || parseFloat(editExpenseData.allowanceDays) <= 0) {
          toast.error('Please enter number of days!');
          return;
        }
      } else if (!editExpenseData.subCategory || !editExpenseData.subCategory.trim()) {
        toast.error('Please select a sub-category / work type!');
        return;
      }
    }

    let finalSubCat = '';
    if (isDailyAllowanceCategory(editExpenseData.category)) {
      const days = parseFloat(editExpenseData.allowanceDays);
      const daysLabel = days === 1 ? '1 Day' : `${editExpenseData.allowanceDays} Days`;
      finalSubCat = daysLabel;
    } else if (editExpenseData.subCategory === 'Other' && editExpenseData.customSubCategory) {
      finalSubCat = editExpenseData.customSubCategory.trim();
    } else if (editExpenseData.subCategory === 'Other-Remark' && editExpenseData.customSubCategory) {
      finalSubCat = `Other-Remark - ${editExpenseData.customSubCategory.trim()}`;
    } else {
      finalSubCat = (editExpenseData.subCategory || '').trim();
    }

    let fullEditRemark = (editExpenseData.remark || '').trim();
    if (isDailyAllowanceCategory(editExpenseData.category) && editExpenseData.allowancePerson && editExpenseData.allowancePerson.trim()) {
      const personText = `For: ${editExpenseData.allowancePerson.trim()}`;
      if (!fullEditRemark.toLowerCase().includes(personText.toLowerCase())) {
        fullEditRemark = fullEditRemark ? `${personText} | ${fullEditRemark}` : personText;
      }
    }

    if (!editExpenseData.receiptName && !editExpenseData.previewUrl) {
      toast.error(language === 'mr' ? 'कृपया बिलाचा फोटो किंवा डॉक्युमेंट पुरावा जोडा (Bill Proof अनिवार्य आहे)!' : language === 'hi' ? 'कृपया बिल की फोटो या डॉक्युमेंट प्रमाण जोड़ें (Bill Proof अनिवार्य है)!' : 'Please attach a bill photo or document proof (Mandatory)!');
      return;
    }
    setSubmitting(true);
    try {
      await updateExpense(editExpenseData.id, {
        ...editExpenseData,
        subCategory: finalSubCat,
        remark: fullEditRemark
      });
      setIsEditModalOpen(false);
      setEditExpenseData(null);
      toast.success(language === 'mr' ? 'खर्च यशस्वीरित्या अपडेट झाला!' : language === 'hi' ? 'खर्च सफलतापूर्वक अपडेट हुआ!' : 'Expense updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update expense');
    } finally {
      setSubmitting(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    customSubCategory: '',
    allowancePerson: '',
    allowanceDays: '',
    projectId: defaultTargetProject ? defaultTargetProject.id : '',
    amount: '',
    paidTo: '',
    remark: '',
    description: '',
    receiptName: '',
    previewUrl: null,
    receiptFile: null
  });

  useEffect(() => {
    if (defaultTargetProject) {
      setFormData(prev => ({ ...prev, projectId: defaultTargetProject.id }));
    }
  }, [defaultTargetProject]);

  const fileInputRef = useRef(null);

  const categoriesList = [
    'All',
    ...(categories?.map(c => c.name) || [])
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5242880) {
        toast.error(language === 'mr' ? 'फाईल 5MB पेक्षा लहान असावी!' : language === 'hi' ? 'फ़ाइल 5MB से छोटी होनी चाहिए!' : 'File must be smaller than 5MB!');
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(language === 'mr' ? 'फक्त PDF, JPG, PNG फाईल्स चालतील!' : language === 'hi' ? 'केवल PDF, JPG, PNG फ़ाइलें अनुमत हैं!' : 'Only PDF, JPG, PNG files allowed!');
        return;
      }
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

    if (!formData.projectId) {
      toast.error(language === 'mr' ? 'कृपया साइट लोकेशन निवडा!' : language === 'hi' ? 'कृपया साइट लोकेशन चुनें!' : 'Please select a Site Location!');
      return;
    }
    if (!formData.category) {
      toast.error(language === 'mr' ? 'कृपया खर्चाचा प्रकार निवडा!' : language === 'hi' ? 'कृपया खर्च का प्रकार चुनें!' : 'Please select an Expense Category!');
      return;
    }
    const hasSubCat = isLabourCategory(formData.category) ||
      isTransportCategory(formData.category) ||
      isLodgingCategory(formData.category) ||
      isPurchaseCategory(formData.category) ||
      isMiscellaneousCategory(formData.category) ||
      isTravelCategory(formData.category) ||
      isDailyAllowanceCategory(formData.category);

    if (hasSubCat) {
      if (isDailyAllowanceCategory(formData.category)) {
        if (!formData.allowanceDays || isNaN(formData.allowanceDays) || parseFloat(formData.allowanceDays) <= 0) {
          toast.error('Please enter number of days!');
          return;
        }
      } else if (!formData.subCategory || !formData.subCategory.trim()) {
        toast.error('Please select a sub-category / work type!');
        return;
      }
    }

    let finalSubCategory = '';
    if (isDailyAllowanceCategory(formData.category)) {
      const days = parseFloat(formData.allowanceDays);
      const daysLabel = days === 1 ? '1 Day' : `${formData.allowanceDays} Days`;
      finalSubCategory = daysLabel;
    } else if (formData.subCategory === 'Other' && formData.customSubCategory) {
      finalSubCategory = formData.customSubCategory.trim();
    } else if (formData.subCategory === 'Other-Remark' && formData.customSubCategory) {
      finalSubCategory = `Other-Remark - ${formData.customSubCategory.trim()}`;
    } else {
      finalSubCategory = (formData.subCategory || '').trim();
    }

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      toast.error(language === 'mr' ? 'कृपया योग्य रक्कम भरा!' : language === 'hi' ? 'कृपया सही राशि भरें!' : 'Please enter a valid amount!');
      return;
    }
    if (!formData.paidTo || !formData.paidTo.trim()) {
      toast.error(language === 'mr' ? 'कृपया कोणाला पैसे दिले (Vendor / Person Name) ते भरा!' : language === 'hi' ? 'कृपया किसे भुगतान किया (Vendor / Person Name) यह भरें!' : 'Please enter Paid To (Vendor / Person Name)!');
      return;
    }
    if (!formData.receiptName) {
      toast.error(language === 'mr' ? 'कृपया बिलाचा फोटो किंवा डॉक्युमेंट पुरावा जोडा (Bill Proof अनिवार्य आहे)!' : language === 'hi' ? 'कृपया बिल की फोटो या डॉक्युमेंट प्रमाण जोड़ें (Bill Proof अनिवार्य है)!' : 'Please attach a bill photo or document proof (Mandatory)!');
      return;
    }

    setSubmitting(true);
    try {
      let fullRemark = (formData.remark || '').trim();
      if (isDailyAllowanceCategory(formData.category) && formData.allowancePerson && formData.allowancePerson.trim()) {
        const personText = `For: ${formData.allowancePerson.trim()}`;
        fullRemark = fullRemark ? `${personText} | ${fullRemark}` : personText;
      }

      await recordExpense({
        category: formData.category,
        subCategory: finalSubCategory,
        projectId: formData.projectId,
        amount: parseFloat(formData.amount),
        paidTo: formData.paidTo.trim(),
        remark: fullRemark,
        receiptName: formData.receiptName,
        receiptUrl: formData.previewUrl || null,
        file: formData.receiptFile
      });

      setFormData({
        category: '',
        subCategory: '',
        customSubCategory: '',
        allowancePerson: '',
        allowanceDays: '',
        projectId: defaultTargetProject ? defaultTargetProject.id : '',
        amount: '',
        paidTo: '',
        remark: '',
        description: '',
        receiptName: '',
        previewUrl: null,
        receiptFile: null
      });

      setIsAddModalOpen(false);
      toast.success(language === 'mr' ? 'खर्च आणि बिलाचा पुरावा यशस्वीरीत्या नोंदवला गेला!' : language === 'hi' ? 'खर्च और बिल का प्रमाण सफलतापूर्वक दर्ज हो गया!' : 'Expense and bill proof recorded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || (language === 'mr' ? 'खर्च नोंदवण्यात अडचण आली, पुन्हा प्रयत्न करा.' : language === 'hi' ? 'खर्च दर्ज करने में समस्या आई, पुनः प्रयास करें.' : 'Could not save the expense, please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Unique lists for filters
  const uniqueSites = ['All', ...new Set(expensesList.map(item => item.site).filter(Boolean))];
  const uniqueCategories = ['All', ...new Set(expensesList.map(item => item.category).filter(Boolean))];
  const uniqueDates = ['', ...new Set(expensesList.map(item => item.date).filter(Boolean))];

  // Filtered List
  const filteredExpenses = expensesList.filter((exp) => {
    // 1. Site Filter
    if (selectedSite !== 'All' && exp.site !== selectedSite) return false;
    
    // 2. Category Filter
    if (selectedCategory !== 'All' && exp.category !== selectedCategory) return false;

    // 3. Date Filter
    if (selectedDate && exp.date !== selectedDate) return false;

    // 4. Search Filter
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
      (exp.subCategory || '').toLowerCase().includes(term) ||
      (exp.site || '').toLowerCase().includes(term) ||
      (exp.paidTo || '').toLowerCase().includes(term) ||
      (exp.date || '').toLowerCase().includes(term) ||
      (exp.status || '').toLowerCase().includes(term) ||
      (exp.receiptName || '').toLowerCase().includes(term) ||
      receiptLabel.toLowerCase().includes(term) ||
      (exp.amount || '').toString().includes(term)
    );
  });

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const currentExpenses = filteredExpenses.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => (prev > 1 ? prev - 1 : prev));
  };

  const totalFilteredAmount = filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);



  const handleExportPDF = () => {
    const headers = ['Voucher ID', 'Category', 'Site Location', 'Vendor / Details', 'Date', 'Amount (Rs)', 'Status'];
    const rows = filteredExpenses.map((exp) => [
      exp.displayId || exp.id?.slice(0, 8)?.toUpperCase() || '—',
      exp.subCategory ? `${exp.category} (${exp.subCategory})` : exp.category,
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
              : language === 'hi'
              ? 'दैनिक साइट खर्च, मजदूरी व बिलों का प्रबंधन व ऑडिट रिकॉर्ड।'
              : 'Record, verify, and categorize daily site operational expenses, muster labor wages, and bills.'}
          </p>
        </div>

        {/* Action Buttons: PDF */}
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
              {language === 'mr' ? 'एकूण खर्च' : language === 'hi' ? 'कुल खर्च' : 'Total Spent'}
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
              {language === 'mr' ? 'आजचा खर्च' : language === 'hi' ? 'आज का खर्च' : "Today's Spend"}
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

      {/* Filter and Search Bar Container */}
      <div className="filter-toolbar" style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        margin: '0.5rem 0 1.5rem 0',
        padding: '0.75rem',
        background: 'var(--card-bg)',
        borderRadius: '1rem',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 12px -4px var(--shadow-color)'
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
            placeholder={language === 'mr' ? 'खर्च, पावती, विक्रेता किंवा रक्कम शोधा...' : language === 'hi' ? 'खर्च, रसीद, विक्रेता या राशि खोजें...' : 'Search expense, vendor, category, site, amount...'}
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
          flex: '1 1 140px',
          minWidth: '140px'
        }}>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
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
            {uniqueSites.map((site, index) => (
              <option key={index} value={site}>{site === 'All' ? (language === 'mr' ? 'सर्व साइट्स (All Sites)' : 'All Sites') : site}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div style={{
          position: 'relative',
          flex: '1 1 140px',
          minWidth: '140px'
        }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
            {uniqueCategories.map((cat, index) => (
              <option key={index} value={cat}>{cat === 'All' ? (language === 'mr' ? 'सर्व श्रेणी (All Categories)' : 'All Categories') : cat}</option>
            ))}
          </select>
        </div>


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
              {language === 'mr' ? 'दैनिक खर्चाच्या नोंदी' : language === 'hi' ? 'दैनिक खर्च की प्रविष्टियाँ' : 'Daily Expense Entries'}
            </h2>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '0.2rem 0.55rem',
              borderRadius: '1rem',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              color: '#2563eb'
            }}>
              {filteredExpenses.length} {language === 'mr' ? 'नोंदी' : language === 'hi' ? 'प्रविष्टियाँ' : 'Entries'}
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
                <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {language === 'mr' ? 'कोणतीही खर्चाची नोंद सापडली नाही.' : language === 'hi' ? 'कोई खर्च प्रविष्टि नहीं मिली।' : 'No expense entries found.'}
                  </td>
                </tr>
              ) : (
                currentExpenses.map((exp) => (
                  <tr
                    key={exp.displayId || exp.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td data-label="ID" style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--primary-color)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={exp.displayId || exp.id}>
                      {exp.displayId || exp.id}
                    </td>
                    <td data-label="CATEGORY" style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {exp.category}
                      {formatSubCategoryDisplay(exp.category, exp.subCategory) && (
                        <span style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#4f46e5',
                          marginTop: '2px',
                          background: 'rgba(99, 102, 241, 0.08)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          width: 'fit-content'
                        }}>
                          {formatSubCategoryDisplay(exp.category, exp.subCategory)}
                        </span>
                      )}
                    </td>
                    <td data-label="SITE" style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} color="#3b82f6" />
                        <span>{exp.site}</span>
                      </div>
                    </td>
                    <td data-label="VENDOR" style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                      {exp.paidTo || 'Local Vendor'}
                      {exp.remark && (
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Remark: {exp.remark}
                        </span>
                      )}
                    </td>
                    <td data-label="DATE" style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {exp.date}
                    </td>
                    <td data-label="AMOUNT" style={{ padding: '0.85rem 1rem', fontWeight: '800', color: '#10b981', whiteSpace: 'nowrap' }}>
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td data-label="STATUS" style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: (exp.status === 'Approved' || exp.status === 'Paid') ? 'rgba(16, 185, 129, 0.15)' : exp.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: (exp.status === 'Approved' || exp.status === 'Paid') ? '#10b981' : exp.status === 'Rejected' ? '#ef4444' : '#f59e0b',
                          width: 'fit-content'
                        }}>
                          {(exp.status === 'Approved' || exp.status === 'Paid') ? <CheckCircle2 size={12} /> : exp.status === 'Rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                          {exp.status === 'Paid' ? (language === 'mr' ? 'पैसे मिळाले (Paid)' : 'Paid') : exp.status === 'Approved' ? t('approved') : exp.status === 'Rejected' ? (language === 'mr' ? 'नाकारले' : language === 'hi' ? 'अस्वीकृत' : 'Rejected') : t('pending')}
                        </span>
                        {exp.status === 'Paid' && exp.paidByName ? (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: '#0284c7',
                            paddingLeft: '0.2rem'
                          }}>
                            Paid by: {exp.paidByName}
                          </span>
                        ) : (exp.status === 'Approved' && exp.opsApprovedByName) ? (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: '#059669',
                            paddingLeft: '0.2rem'
                          }}>
                            Ops: {exp.opsApprovedByName}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td data-label="RECEIPT" style={{ padding: '0.85rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
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
                    <td data-label="ACTIONS" style={{ padding: '0.85rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button
                          title="Edit"
                          disabled={exp.status !== 'Pending'}
                          style={{
                            background: exp.status === 'Pending' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                            color: exp.status === 'Pending' ? '#3b82f6' : '#94a3b8',
                            border: exp.status === 'Pending' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(148, 163, 184, 0.3)',
                            padding: '0.35rem',
                            borderRadius: '0.5rem',
                            cursor: exp.status === 'Pending' ? 'pointer' : 'not-allowed',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            opacity: exp.status === 'Pending' ? 1 : 0.6
                          }}
                          onMouseEnter={(e) => { if (exp.status === 'Pending') { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; } }}
                          onMouseLeave={(e) => { if (exp.status === 'Pending') { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; } }}
                          onClick={() => handleEditClick(exp)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          title="Delete"
                          disabled={exp.status !== 'Pending'}
                          style={{
                            background: exp.status === 'Pending' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                            color: exp.status === 'Pending' ? '#ef4444' : '#94a3b8',
                            border: exp.status === 'Pending' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(148, 163, 184, 0.3)',
                            padding: '0.35rem',
                            borderRadius: '0.5rem',
                            cursor: exp.status === 'Pending' ? 'pointer' : 'not-allowed',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            opacity: exp.status === 'Pending' ? 1 : 0.6
                          }}
                          onMouseEnter={(e) => { if (exp.status === 'Pending') { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; } }}
                          onMouseLeave={(e) => { if (exp.status === 'Pending') { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; } }}
                          onClick={async () => { 
                            if(window.confirm(language === 'mr' ? 'हा खर्च खरोखर डिलीट करायचा आहे का?' : language === 'hi' ? 'क्या आप वास्तव में इस खर्च को डिलीट करना चाहते हैं?' : 'Are you sure you want to delete this expense?')) {
                              try {
                                await deleteExpense(exp.id);
                              } catch(err) {
                                toast.error(err.response?.data?.error || 'Failed to delete expense.');
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
        
        {/* Pagination Controls */}
        <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <Pagination
            currentPage={validCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredExpenses.length}
            onPrev={handlePrevPage}
            onNext={handleNextPage}
          />
        </div>
      </div>

      {/* Modal: Add Expense */}
      {isAddModalOpen && createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
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
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
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
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
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
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '', customSubCategory: '' })}
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
                  <option value="" disabled>{language === 'mr' ? 'कॅटेगरी निवडा' : language === 'hi' ? 'कैटेगरी चुनें' : 'Select Category'}</option>
                  {categoriesList.filter(c => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c === 'Other' ? (language === 'mr' ? 'इतर (Other)' : language === 'hi' ? 'अन्य (Other)' : 'Other') : c}
                    </option>
                  ))}
                  {!categoriesList.includes('Other') && (
                    <option value="Other">
                      {language === 'mr' ? 'इतर (Other)' : language === 'hi' ? 'अन्य (Other)' : 'Other'}
                    </option>
                  )}
                </select>
              </div>

              {/* Sub-Category Dropdown for Labour */}
              {isLabourCategory(formData.category) && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Labour Work Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.65rem',
                      border: '1.5px solid #6366f1',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="" disabled>-- Select Work Type --</option>
                    {LABOUR_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {formData.subCategory === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify Labour Work"
                      required
                      value={formData.customSubCategory}
                      onChange={(e) => setFormData({ ...formData, customSubCategory: e.target.value })}
                      style={{
                        width: '100%',
                        marginTop: '0.5rem',
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
                  )}
                </div>
              )}

              {/* Sub-Category Dropdown for Transport */}
              {isTransportCategory(formData.category) && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Transport Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.65rem',
                      border: '1.5px solid #6366f1',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="" disabled>-- Select Transport Type --</option>
                    {TRANSPORT_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {formData.subCategory === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify Transport Detail"
                      required
                      value={formData.customSubCategory}
                      onChange={(e) => setFormData({ ...formData, customSubCategory: e.target.value })}
                      style={{
                        width: '100%',
                        marginTop: '0.5rem',
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
                  )}
                </div>
              )}

              {/* Sub-Category Dropdown for Lodging & Boarding */}
              {isLodgingCategory(formData.category) && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Lodging & Boarding Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.65rem',
                      border: '1.5px solid #6366f1',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="" disabled>-- Select Lodging Type --</option>
                    {LODGING_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {formData.subCategory === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify Lodging Detail"
                      required
                      value={formData.customSubCategory}
                      onChange={(e) => setFormData({ ...formData, customSubCategory: e.target.value })}
                      style={{
                        width: '100%',
                        marginTop: '0.5rem',
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
                  )}
                </div>
              )}

              {/* Sub-Category Dropdown for Purchase / Materials */}
              {isPurchaseCategory(formData.category) && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Material / Purchase Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.65rem',
                      border: '1.5px solid #6366f1',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="" disabled>-- Select Material Type --</option>
                    {PURCHASE_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {formData.subCategory === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify Material / Purchase Item"
                      required
                      value={formData.customSubCategory}
                      onChange={(e) => setFormData({ ...formData, customSubCategory: e.target.value })}
                      style={{
                        width: '100%',
                        marginTop: '0.5rem',
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
                  )}
                </div>
              )}

              {/* Sub-Category Dropdown for Miscellaneous & Emergency */}
              {isMiscellaneousCategory(formData.category) && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Miscellaneous Detail / Remark <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.65rem',
                      border: '1.5px solid #6366f1',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="" disabled>-- Select Option --</option>
                    {MISCELLANEOUS_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {formData.subCategory === 'Other-Remark' && (
                    <input
                      type="text"
                      placeholder="Enter Remark / Note (e.g. Pickup Diesel, Courier, etc.)"
                      value={formData.customSubCategory}
                      onChange={(e) => setFormData({ ...formData, customSubCategory: e.target.value })}
                      style={{
                        width: '100%',
                        marginTop: '0.5rem',
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
                  )}
                </div>
              )}

              {/* Sub-Category Dropdown for Travel & Conveyance */}
              {isTravelCategory(formData.category) && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Travel & Conveyance Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.65rem',
                      border: '1.5px solid #6366f1',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="" disabled>-- Select Travel Type --</option>
                    {TRAVEL_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {formData.subCategory === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify Travel Detail"
                      required
                      value={formData.customSubCategory}
                      onChange={(e) => setFormData({ ...formData, customSubCategory: e.target.value })}
                      style={{
                        width: '100%',
                        marginTop: '0.5rem',
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
                  )}
                </div>
              )}

              {/* Manual Input for Daily Allowance & Food: Number of Days */}
              {isDailyAllowanceCategory(formData.category) && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    No. of Days <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0.5"
                    step="0.5"
                    placeholder="e.g. 4"
                    value={formData.allowanceDays || ''}
                    onChange={(e) => setFormData({ ...formData, allowanceDays: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.65rem',
                      border: '1.5px solid #6366f1',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

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

              {/* Remark (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  Remark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Work details, purpose, or reason"
                  value={formData.remark || ''}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
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
                      {language === 'mr' ? 'कॅमेरा फोटो' : language === 'hi' ? 'कैमरा फोटो' : 'Camera Snap'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {language === 'mr' ? 'थेट फोटो काढा' : language === 'hi' ? 'सीधे फोटो लें' : 'Take direct photo'}
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
                      {language === 'mr' ? 'डॉक्युमेंट्स / गॅलरी' : language === 'hi' ? 'डॉक्युमेंट्स / गैलरी' : 'Upload Document'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {language === 'mr' ? 'PDF किंवा इमेज निवडा' : language === 'hi' ? 'PDF या इमेज चुनें' : 'PDF, JPG, PNG'}
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
                {submitting ? (language === 'mr' ? 'सेव्ह होत आहे...' : language === 'hi' ? 'सेव हो रहा है...' : 'Saving...') : t('saveExpenseBtn')}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: View Receipt */}
      {viewReceiptModal && createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
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
              padding: '1.25rem',
              border: '1px solid var(--border-color)',
              marginBottom: '1.25rem'
            }}>
              {viewReceiptModal.receiptUrl ? (
                /\.pdf($|\?)/i.test(viewReceiptModal.receiptUrl) ? (
                  <a
                    href={viewReceiptModal.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'inherit', textDecoration: 'none' }}
                  >
                    <FileText size={48} color="#3b82f6" />
                    <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '700' }}>Open PDF in new tab</span>
                  </a>
                ) : (
                  <img
                    src={viewReceiptModal.receiptUrl}
                    alt="Receipt"
                    style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: '0.5rem', margin: '0 auto', display: 'block' }}
                  />
                )
              ) : (
                <>
                  <FileText size={48} color="#3b82f6" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>No receipt file on record</p>
                </>
              )}
              <p style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '0.75rem' }}>
                {viewReceiptModal.receiptName || `${viewReceiptModal.id}_Invoice_Proof.pdf`}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Paid to: {viewReceiptModal.paidTo || 'Local Vendor'} • Amount: ₹{viewReceiptModal.amount.toLocaleString()}
                {viewReceiptModal.opsApprovedByName && ` • Ops Approved by: ${viewReceiptModal.opsApprovedByName}`}
                {viewReceiptModal.paidByName && ` • Paid by Accounts: ${viewReceiptModal.paidByName}`}
              </p>
            </div>

            <a
              href={viewReceiptModal.receiptUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!viewReceiptModal.receiptUrl) {
                  e.preventDefault();
                  toast.error(language === 'mr' ? 'डाउनलोड करण्यासाठी कोणतीही पावती फाइल उपलब्ध नाही.' : language === 'hi' ? 'डाउनलोड करने के लिए कोई रसीद फ़ाइल उपलब्ध नहीं है।' : 'No receipt file available to download.');
                }
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.65rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'none',
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
            >
              {viewReceiptModal.receiptUrl ? 'Open / Download Receipt File' : 'Download Verified Receipt File'}
            </a>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Edit Expense */}
      {isEditModalOpen && editExpenseData && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--surface-bg)', borderRadius: '1.25rem', width: '100%', maxWidth: '500px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <Edit2 size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {language === 'mr' ? 'खर्च संपादित करा' : language === 'hi' ? 'खर्च संपादित करें' : 'Edit Expense'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Update voucher details</p>
                </div>
              </div>
              <button onClick={() => { setIsEditModalOpen(false); setEditExpenseData(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{t('siteLocation')}</label>
                  <select
                    value={editExpenseData.projectId}
                    onChange={(e) => setEditExpenseData({ ...editExpenseData, projectId: e.target.value })}
                    required
                    style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="" disabled>Select Site</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{t('expenseCategory')}</label>
                  <select
                    value={editExpenseData.category}
                    onChange={(e) => setEditExpenseData({ ...editExpenseData, category: e.target.value, subCategory: '', customSubCategory: '' })}
                    required
                    style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="" disabled>Select Category</option>
                    {categoriesList.filter(c => c !== 'All').map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub-Category Dropdown for Labour (Edit) */}
              {isLabourCategory(editExpenseData.category) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Labour Work Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={editExpenseData.subCategory || ''}
                    onChange={(e) => setEditExpenseData({ ...editExpenseData, subCategory: e.target.value })}
                    style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid #6366f1', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="" disabled>-- Select Work Type --</option>
                    {LABOUR_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {editExpenseData.subCategory === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify Labour Work"
                      required
                      value={editExpenseData.customSubCategory || ''}
                      onChange={(e) => setEditExpenseData({ ...editExpenseData, customSubCategory: e.target.value })}
                      style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  )}
                </div>
              )}

              {/* Sub-Category Dropdown for Transport (Edit) */}
              {isTransportCategory(editExpenseData.category) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Transport Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={editExpenseData.subCategory || ''}
                    onChange={(e) => setEditExpenseData({ ...editExpenseData, subCategory: e.target.value })}
                    style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid #6366f1', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="" disabled>-- Select Transport Type --</option>
                    {TRANSPORT_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {editExpenseData.subCategory === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify Transport Detail"
                      required
                      value={editExpenseData.customSubCategory || ''}
                      onChange={(e) => setEditExpenseData({ ...editExpenseData, customSubCategory: e.target.value })}
                      style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  )}
                </div>
              )}

              {/* Sub-Category Dropdown for Lodging & Boarding (Edit) */}
              {isLodgingCategory(editExpenseData.category) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Lodging & Boarding Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={editExpenseData.subCategory || ''}
                    onChange={(e) => setEditExpenseData({ ...editExpenseData, subCategory: e.target.value })}
                    style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid #6366f1', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="" disabled>-- Select Lodging Type --</option>
                    {LODGING_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {editExpenseData.subCategory === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify Lodging Detail"
                      required
                      value={editExpenseData.customSubCategory || ''}
                      onChange={(e) => setEditExpenseData({ ...editExpenseData, customSubCategory: e.target.value })}
                      style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  )}
                </div>
              )}

              {/* Sub-Category Dropdown for Purchase / Materials (Edit) */}
              {isPurchaseCategory(editExpenseData.category) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Material / Purchase Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={editExpenseData.subCategory || ''}
                    onChange={(e) => setEditExpenseData({ ...editExpenseData, subCategory: e.target.value })}
                    style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid #6366f1', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="" disabled>-- Select Material Type --</option>
                    {PURCHASE_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {editExpenseData.subCategory === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify Material / Purchase Item"
                      required
                      value={editExpenseData.customSubCategory || ''}
                      onChange={(e) => setEditExpenseData({ ...editExpenseData, customSubCategory: e.target.value })}
                      style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  )}
                </div>
              )}

              {/* Sub-Category Dropdown for Miscellaneous & Emergency (Edit) */}
              {isMiscellaneousCategory(editExpenseData.category) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Miscellaneous Detail / Remark <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={editExpenseData.subCategory || ''}
                    onChange={(e) => setEditExpenseData({ ...editExpenseData, subCategory: e.target.value })}
                    style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid #6366f1', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="" disabled>-- Select Option --</option>
                    {MISCELLANEOUS_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {editExpenseData.subCategory === 'Other-Remark' && (
                    <input
                      type="text"
                      placeholder="Enter Remark / Note"
                      value={editExpenseData.customSubCategory || ''}
                      onChange={(e) => setEditExpenseData({ ...editExpenseData, customSubCategory: e.target.value })}
                      style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  )}
                </div>
              )}

              {/* Sub-Category Dropdown for Travel & Conveyance (Edit) */}
              {isTravelCategory(editExpenseData.category) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Travel & Conveyance Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required
                    value={editExpenseData.subCategory || ''}
                    onChange={(e) => setEditExpenseData({ ...editExpenseData, subCategory: e.target.value })}
                    style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid #6366f1', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="" disabled>-- Select Travel Type --</option>
                    {TRAVEL_SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  {editExpenseData.subCategory === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify Travel Detail"
                      required
                      value={editExpenseData.customSubCategory || ''}
                      onChange={(e) => setEditExpenseData({ ...editExpenseData, customSubCategory: e.target.value })}
                      style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  )}
                </div>
              )}

              {/* Manual Input for Daily Allowance & Food: Number of Days (Edit) */}
              {isDailyAllowanceCategory(editExpenseData.category) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    No. of Days <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0.5"
                    step="0.5"
                    placeholder="e.g. 4"
                    value={editExpenseData.allowanceDays || ''}
                    onChange={(e) => setEditExpenseData({ ...editExpenseData, allowanceDays: e.target.value })}
                    style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid #6366f1', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Paid To (Vendor Name)</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Hardware, Raju Labor"
                  value={editExpenseData.paidTo}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, paidTo: e.target.value })}
                  required
                  style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              {/* Remark (Optional) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Remark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Work details, purpose, or reason"
                  value={editExpenseData.remark || ''}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, remark: e.target.value })}
                  style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{t('amountPaidLabel')}</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={editExpenseData.amount}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, amount: e.target.value })}
                  required
                  min="1"
                  style={{ padding: '0.75rem', borderRadius: '0.65rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              {/* Receipt File */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Attach Bill/Receipt Photo <span style={{ color: '#ef4444' }}>*</span></label>
                {!editExpenseData.previewUrl ? (
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
                        {language === 'mr' ? 'कॅमेरा फोटो' : language === 'hi' ? 'कैमरा फोटो' : 'Camera Snap'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {language === 'mr' ? 'थेट फोटो काढा' : language === 'hi' ? 'सीधे फोटो लें' : 'Take direct photo'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        style={{ display: 'none' }}
                        onChange={handleEditFileChange}
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
                        {language === 'mr' ? 'डॉक्युमेंट्स / गॅलरी' : language === 'hi' ? 'डॉक्युमेंट्स / गैलरी' : 'Upload Document'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {language === 'mr' ? 'PDF किंवा इमेज निवडा' : language === 'hi' ? 'PDF या इमेज चुनें' : 'PDF, JPG, PNG'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        style={{ display: 'none' }}
                        onChange={handleEditFileChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', background: 'var(--card-bg)', borderRadius: '0.75rem', border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ReceiptText size={18} color="#4338ca" />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {editExpenseData.receiptName}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                          <CheckCircle2 size={12} /> Attached
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditExpenseData({ ...editExpenseData, previewUrl: null, receiptFile: null, receiptName: '' })}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center' }}
                      title="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  color: 'white', border: 'none', fontWeight: '700', fontSize: '0.95rem', cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1, marginTop: '0.5rem', boxShadow: '0 6px 18px rgba(99, 102, 241, 0.4)'
                }}
              >
                {submitting ? 'Updating...' : 'Update Expense'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DailyExpenses;
