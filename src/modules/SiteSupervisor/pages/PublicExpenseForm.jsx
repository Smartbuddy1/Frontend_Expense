import React, { useState, useEffect, useRef } from 'react';
import {
  ReceiptText,
  Camera,
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  User,
  Briefcase,
  Layers,
  Send,
  RotateCw,
  X,
  FileCheck,
  Building2,
  Navigation,
  Globe,
  Printer,
  Plus,
  CreditCard,
  Banknote,
  Zap,
  Tag,
  Store,
  FileUp,
  Image as ImageIcon,
  Check,
  ShieldCheck,
  MapPinned
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';

const PublicExpenseForm = () => {
  const wallet = useWallet();
  const { language, setLanguage } = useLanguage();

  // Form State
  const [formData, setFormData] = useState({
    role: 'Site Supervisor',
    submitterName: '',
    site: '',
    customSite: '',
    category: 'Travel',
    amount: '',
    paidTo: '',
    paymentMode: 'UPI / GPay',
    description: '',
    receiptName: '',
    previewUrl: null,
    gpsLocation: null,
    gpsAddress: '',
    isGpsLoading: false,
    gpsError: null
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Departments / Roles
  const roles = [
    { value: 'Site Supervisor', labelEn: 'Site Supervisor', labelMr: 'साइट सुपरवायझर', labelHi: 'साइट सुपरवाइजर', icon: Briefcase },
    { value: 'Sales / Field Executive', labelEn: 'Sales / Field Executive', labelMr: 'सेल्स / फील्ड एक्झिक्युटिव्ह', labelHi: 'सेल्स / फील्ड एक्जीक्यूटिव', icon: Zap },
    { value: 'Site Engineer / Manager', labelEn: 'Site Engineer / Manager', labelMr: 'साइट इंजिनिअर / मॅनेजर', labelHi: 'साइट इंजीनियर / मैनेजर', icon: Building2 },
    { value: 'Procurement / Purchase', labelEn: 'Procurement / Purchase', labelMr: 'खरेदी विभाग (Purchase)', labelHi: 'खरीद विभाग (Purchase)', icon: Tag },
    { value: 'Office & Admin', labelEn: 'Office & Admin', labelMr: 'ऑफिस / ॲडमिन', labelHi: 'ऑफिस / एडमिन', icon: Layers },
    { value: 'Contractor / Vendor', labelEn: 'Contractor / Vendor', labelMr: 'कंत्राटदार / व्हेंडर', labelHi: 'ठेकेदार / वेंडर', icon: User },
    { value: 'Other', labelEn: 'Other', labelMr: 'इतर', labelHi: 'अन्य', icon: User }
  ];

  // Sites List
  const predefinedSites = [
    'Client Visit / Sales Meeting',
    'Office / Headquarter',
    'Other / Custom Location'
  ];

  // Categories
  const categories = [
    { value: 'Travel', labelEn: 'Travel / Conveyance', labelMr: 'प्रवास / पेट्रोल / भाडे', labelHi: 'यात्रा / पेट्रोल / किराया', emoji: '🚗' },
    { value: 'Local Conveyance', labelEn: 'Local Conveyance (Auto/Taxi)', labelMr: 'स्थानिक प्रवास (रिक्षा/टॅक्सी)', labelHi: 'स्थानीय यात्रा (रिक्शा/टैक्सी)', emoji: '🛺' },
    { value: 'Client Meeting / Hospitality', labelEn: 'Client Meeting / Food & Tea', labelMr: 'क्लायंट भेट / चहा-नाश्ता', labelHi: 'क्लाइंट मीटिंग / चाय-नाश्ता', emoji: '☕' },
    { value: 'Purchase', labelEn: 'Purchase / Site Material', labelMr: 'खरेदी / मटेरिअल', labelHi: 'खरीद / मटेरियल', emoji: '🛒' },
    { value: 'Transport', labelEn: 'Transport & Freight', labelMr: 'वाहतूक / टेम्पो भाडे', labelHi: 'परिवहन / टेम्पो किराया', emoji: '🚚' },
    { value: 'Labour', labelEn: 'Labour / Daily Wages', labelMr: 'मजुरी / दैनंदिन वेतन', labelHi: 'मजदूरी / दैनिक वेतन', emoji: '👷' },
    { value: 'Lodging and Boarding', labelEn: 'Lodging & Boarding', labelMr: 'निवास व जेवण', labelHi: 'निवास व भोजन', emoji: '🏨' },
    { value: 'Office & Stationary', labelEn: 'Office Stationary / Printing', labelMr: 'ऑफिस / झेरॉक्स / प्रिंट', labelHi: 'ऑफिस / फोटोकॉपी / प्रिंट', emoji: '📄' },
    { value: 'Miscellaneous', labelEn: 'Miscellaneous / Petty Cash', labelMr: 'किरकोळ खर्च', labelHi: 'विविध खर्च', emoji: '📦' },
    { value: 'Other', labelEn: 'Other', labelMr: 'इतर', labelHi: 'अन्य', emoji: '📌' }
  ];

  // Auto-fetch GPS Location on component mount
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setFormData(prev => ({
        ...prev,
        gpsError: language === 'mr' ? 'ब्राउझरमध्ये GPS सुविधा उपलब्ध नाही' : language === 'hi' ? 'ब्राउज़र में GPS सुविधा उपलब्ध नहीं है' : 'Geolocation is not supported by your browser'
      }));
      return;
    }

    setFormData(prev => ({ ...prev, isGpsLoading: true, gpsError: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const coordsStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        let address = '';
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: { 'Accept-Language': 'en' }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.address) {
              const road = data.address.road || data.address.suburb || data.address.neighbourhood || '';
              const city = data.address.city || data.address.town || data.address.county || data.address.state_district || '';
              const state = data.address.state || '';
              address = [road, city, state].filter(Boolean).join(', ');
            } else if (data.display_name) {
              address = data.display_name.split(',').slice(0, 3).join(',');
            }
          }
        } catch (err) {
          console.log('Reverse geocoding error:', err);
        }

        setFormData(prev => ({
          ...prev,
          isGpsLoading: false,
          gpsLocation: coordsStr,
          gpsAddress: address || `GPS: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
          gpsError: null
        }));
      },
      (error) => {
        let errMessage = language === 'mr' ? 'लोकेशन परमिशन चालू करा' : language === 'hi' ? 'लोकेशन परमिशन चालू करें' : 'Location permission denied or unavailable';
        setFormData(prev => ({
          ...prev,
          isGpsLoading: false,
          gpsError: errMessage
        }));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        receiptName: file.name,
        previewUrl: preview
      }));
    }
  };

  const addQuickAmount = (val) => {
    const current = parseFloat(formData.amount) || 0;
    setFormData(prev => ({ ...prev, amount: (current + val).toString() }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedSite = formData.site === 'Other / Custom Location' ? formData.customSite.trim() : formData.site;

    if (!selectedSite) {
      alert(language === 'mr' ? 'कृपया साइट किंवा ठिकाणाचे नाव टाका!' : language === 'hi' ? 'कृपया साइट या स्थान का नाम डालें!' : 'Please enter or select a site/location!');
      return;
    }

    if (!formData.submitterName.trim()) {
      alert(language === 'mr' ? 'कृपया तुमचे नाव भरा!' : language === 'hi' ? 'कृपया अपना नाम भरें!' : 'Please enter your name!');
      return;
    }

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      alert(language === 'mr' ? 'कृपया वैध रक्कम भरा!' : language === 'hi' ? 'कृपया सही राशि भरें!' : 'Please enter a valid amount!');
      return;
    }

    if (!formData.paidTo || !formData.paidTo.trim()) {
      alert(language === 'mr' ? 'कृपया ज्याला पैसे दिले त्याचे नाव भरा!' : language === 'hi' ? 'कृपया जिसे भुगतान किया उसका नाम भरें!' : 'Please enter Vendor / Person name!');
      return;
    }

    if (!formData.receiptName) {
      alert(language === 'mr' ? 'कृपया बिलाचा फोटो किंवा डॉक्युमेंट जोडा (आवश्यक)!' : language === 'hi' ? 'कृपया बिल की फोटो या डॉक्युमेंट जोड़ें (आवश्यक)!' : 'Please attach Bill / Receipt Proof (Required)!');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Generate Voucher ID
    const randomIdNum = Math.floor(1000 + Math.random() * 9000);
    const voucherId = `EXP-${randomIdNum}`;

    const newExpense = {
      id: voucherId,
      role: formData.role,
      submitterName: formData.submitterName,
      category: formData.category,
      site: selectedSite,
      amount: parseFloat(formData.amount),
      paidTo: formData.paidTo,
      paymentMode: formData.paymentMode,
      description: formData.description,
      date: formattedDate,
      time: formattedTime,
      status: 'Pending',
      receiptName: formData.receiptName,
      receiptUrl: formData.previewUrl,
      receipt: true,
      gpsLocation: formData.gpsLocation,
      gpsAddress: formData.gpsAddress,
      submittedVia: 'Public Expense Form'
    };

    // Save to context / localStorage
    try {
      if (wallet && wallet.recordExpense) {
        wallet.recordExpense(newExpense);
      } else {
        const existing = JSON.parse(localStorage.getItem('supervisor_expenses_list') || '[]');
        localStorage.setItem('supervisor_expenses_list', JSON.stringify([newExpense, ...existing]));
      }
    } catch (err) {
      console.error('Failed to save to local storage', err);
    }

    // Trigger Confetti
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedEntry(newExpense);
      setIsSubmitted(true);
    }, 450);
  };

  const handleResetForm = () => {
    setFormData({
      role: 'Site Supervisor',
      submitterName: '',
      site: 'Metro Line 3 - Station #4B',
      customSite: '',
      category: 'Travel',
      amount: '',
      paidTo: '',
      paymentMode: 'UPI / GPay',
      description: '',
      receiptName: '',
      previewUrl: null,
      gpsLocation: formData.gpsLocation,
      gpsAddress: formData.gpsAddress,
      isGpsLoading: false,
      gpsError: null
    });
    setIsSubmitted(false);
    setSubmittedEntry(null);
  };

  return (
    <div className="pef-page-container">
      {/* Top Header Bar */}
      <header className="pef-header">
        <div className="pef-brand-box">
          <div className="pef-brand-icon">
            <Building2 size={22} color="#ffffff" />
          </div>
          <div>
            <div className="pef-brand-title-wrap">
              <span className="pef-brand-title">SiteSupervisor</span>
              <span className="pef-live-badge">LIVE</span>
            </div>
            <span className="pef-brand-subtitle">
              {language === 'mr' ? 'फील्ड व साइट खर्च पोर्टल' : language === 'hi' ? 'फील्ड व साइट खर्च पोर्टल' : 'Field & Site Expense Portal'}
            </span>
          </div>
        </div>

        {/* Language Switcher */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'mr' ? 'en' : language === 'en' ? 'hi' : 'mr')}
          className="pef-lang-btn"
          title="भाषा बदला / Switch Language / भाषा बदलें"
        >
          <Globe size={15} color="#2563eb" />
          <span>{language === 'mr' ? 'English' : language === 'en' ? 'हिंदी' : 'मराठी'}</span>
        </button>
      </header>

      {/* Main Responsive White Card */}
      <div className="pef-card">
        {/* Card Header matching screenshot + Expense Form Heading */}
        <div className="pef-card-header">
          <div className="pef-card-header-left">
            <div className="pef-header-icon-box">
              <ReceiptText size={22} color="#2563eb" />
            </div>
            <div>
              <h2 className="pef-card-title">Expense Form</h2>
              <p className="pef-card-subtitle">
                {language === 'mr' ? 'खर्च आणि बिल पुरावा नोंदवा' : language === 'hi' ? 'खर्च व बिल प्रमाण दर्ज करें' : 'Record Expense & Bill Proof'}
              </p>
            </div>
          </div>
        </div>

        {/* GPS Live Location Tag Bar */}
        <div className={`pef-gps-bar ${formData.gpsError ? 'pef-gps-error' : 'pef-gps-success'}`}>
          <div className="pef-gps-left">
            <div className="pef-gps-icon-circle">
              <MapPin size={13} color={formData.gpsError ? '#e11d48' : '#16a34a'} />
            </div>
            <div className="pef-gps-text-wrap">
              <span className="pef-gps-main-text">
                {formData.isGpsLoading ? (
                  language === 'mr' ? 'GPS लोकेशन शोधत आहे...' : language === 'hi' ? 'GPS लोकेशन खोजा जा रहा है...' : 'Auto-detecting GPS location...'
                ) : formData.gpsAddress ? (
                  formData.gpsAddress
                ) : formData.gpsError ? (
                  formData.gpsError
                ) : (
                  language === 'mr' ? 'ऑटो GPS लोकेशन' : language === 'hi' ? 'ऑटो GPS लोकेशन' : 'Auto GPS Location'
                )}
              </span>
              {formData.gpsLocation && !formData.isGpsLoading && (
                <span className="pef-gps-sub-text">({formData.gpsLocation})</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={fetchCurrentLocation}
            disabled={formData.isGpsLoading}
            className="pef-gps-refresh-btn"
          >
            <RotateCw size={12} className={formData.isGpsLoading ? 'spin-anim' : ''} />
            <span>{language === 'mr' ? 'रिफ्रेश' : language === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>
        </div>

        {/* Content Area: Form OR Submitted Receipt */}
        {isSubmitted && submittedEntry ? (
          <div className="pef-success-wrap">
            <div className="pef-success-icon-circle">
              <CheckCircle2 size={40} />
            </div>

            <h3 className="pef-success-title">
              {language === 'mr' ? 'खर्च यशस्वीरीत्या नोंदवला गेला!' : language === 'hi' ? 'खर्च सफलतापूर्वक दर्ज हो गया!' : 'Expense Submitted Successfully!'}
            </h3>
            <p className="pef-success-subtitle">
              {language === 'mr' ? 'व्हाउचर पावती क्रमांक तयार झाला आहे:' : language === 'hi' ? 'वाउचर रसीद नंबर तैयार हो गया है:' : 'Your expense voucher ticket has been generated:'}
            </p>

            {/* Receipt Summary Card */}
            <div className="pef-receipt-card">
              <div className="pef-receipt-head">
                <div>
                  <span className="pef-receipt-label">
                    {language === 'mr' ? 'पावती क्रमांक (Voucher ID)' : language === 'hi' ? 'रसीद नंबर (Voucher ID)' : 'VOUCHER REF ID'}
                  </span>
                  <div className="pef-receipt-id">{submittedEntry.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="pef-receipt-label">
                    {language === 'mr' ? 'एकूण रक्कम' : language === 'hi' ? 'कुल राशि' : 'TOTAL AMOUNT'}
                  </span>
                  <div className="pef-receipt-amount">₹{submittedEntry.amount.toLocaleString()}</div>
                </div>
              </div>

              <div className="pef-receipt-grid">
                <div>
                  <span className="pef-receipt-grid-label">
                    {language === 'mr' ? 'सबमिट करणारे नाव' : language === 'hi' ? 'सबमिट करने वाले का नाम' : 'Submitted By'}
                  </span>
                  <strong className="pef-receipt-grid-val">{submittedEntry.submitterName}</strong>
                  <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: '700' }}>{submittedEntry.role}</div>
                </div>

                <div>
                  <span className="pef-receipt-grid-label">
                    {language === 'mr' ? 'खर्चाचा प्रकार' : language === 'hi' ? 'खर्च का प्रकार' : 'Expense Category'}
                  </span>
                  <strong className="pef-receipt-grid-val">{submittedEntry.category}</strong>
                </div>

                <div>
                  <span className="pef-receipt-grid-label">
                    {language === 'mr' ? 'कोणाला दिले (Paid To)' : language === 'hi' ? 'किसे भुगतान किया (Paid To)' : 'Paid To (Vendor)'}
                  </span>
                  <strong className="pef-receipt-grid-val">{submittedEntry.paidTo}</strong>
                </div>

                <div>
                  <span className="pef-receipt-grid-label">
                    {language === 'mr' ? 'पेमेंट पद्धत' : language === 'hi' ? 'पेमेंट पद्धति' : 'Payment Mode'}
                  </span>
                  <strong className="pef-receipt-grid-val">{submittedEntry.paymentMode}</strong>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span className="pef-receipt-grid-label">
                    {language === 'mr' ? 'साइट / लोकेशन' : language === 'hi' ? 'साइट / लोकेशन' : 'Site / Location'}
                  </span>
                  <strong className="pef-receipt-grid-val">{submittedEntry.site}</strong>
                </div>

                {submittedEntry.gpsAddress && (
                  <div className="pef-receipt-gps-box">
                    <span style={{ color: '#166534', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} /> {submittedEntry.gpsAddress}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetForm}
              className="pef-submit-another-btn"
            >
              <Plus size={20} />
              <span>{language === 'mr' ? 'आणखी एक खर्च भरा' : language === 'hi' ? 'एक और खर्च भरें' : 'Submit Another Expense'}</span>
            </button>
          </div>
        ) : (
          /* Main Responsive Form Section */
          <form onSubmit={handleSubmit} className="pef-form">
            
            {/* ROW 1: ROLE & YOUR NAME */}
            <div className="pef-grid-2col">
              {/* ROLE / DEPARTMENT */}
              <div>
                <label className="pef-label">
                  <Briefcase size={14} color="#2563eb" />
                  <span>{language === 'mr' ? 'विभाग / पद' : language === 'hi' ? 'विभाग / पद' : 'ROLE / DEPARTMENT'}</span>
                  <span className="pef-req-star">*</span>
                </label>
                
                <div className="pef-select-wrapper">
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="pef-select"
                  >
                    {roles.map(r => (
                      <option key={r.value} value={r.value}>
                        {language === 'mr' ? r.labelMr : language === 'hi' ? r.labelHi : r.labelEn}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} color="#64748b" className="pef-select-arrow" />
                </div>
              </div>

              {/* YOUR NAME */}
              <div>
                <label className="pef-label">
                  <User size={14} color="#2563eb" />
                  <span>{language === 'mr' ? 'तुमचे नाव' : language === 'hi' ? 'आपका नाम' : 'YOUR NAME'}</span>
                  <span className="pef-req-star">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'mr' ? 'उदा. राहुल पाटील' : language === 'hi' ? 'उदा. राहुल पाटील' : 'e.g. Rahul Patil'}
                  value={formData.submitterName}
                  onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                  className="pef-input"
                />
              </div>
            </div>

            {/* ROW 2: SITE LOCATION & EXPENSE CATEGORY */}
            <div className="pef-grid-2col">
              {/* SITE LOCATION * */}
              <div>
                <label className="pef-label">
                  <MapPin size={14} color="#2563eb" />
                  <span>{language === 'mr' ? 'साइट / लोकेशन' : language === 'hi' ? 'साइट / लोकेशन' : 'SITE LOCATION'}</span>
                  <span className="pef-req-star">*</span>
                </label>
                
                <div className="pef-select-wrapper">
                  <select
                    required
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    className="pef-select"
                  >
                    {predefinedSites.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} color="#64748b" className="pef-select-arrow" />
                </div>

                {formData.site === 'Other / Custom Location' && (
                  <input
                    type="text"
                    required
                    placeholder={language === 'mr' ? 'कस्टम साइट किंवा क्लायंट लोकेशनचे नाव लिहा' : language === 'hi' ? 'कस्टम साइट या क्लाइंट लोकेशन का नाम लिखें' : 'Enter site, client or shop location name'}
                    value={formData.customSite}
                    onChange={(e) => setFormData({ ...formData, customSite: e.target.value })}
                    className="pef-input pef-custom-site-input"
                  />
                )}
              </div>

              {/* EXPENSE CATEGORY */}
              <div>
                <label className="pef-label">
                  <Tag size={14} color="#2563eb" />
                  <span>{language === 'mr' ? 'खर्चाचा प्रकार' : language === 'hi' ? 'खर्च का प्रकार' : 'Expense Category'}</span>
                  <span className="pef-req-star">*</span>
                </label>

                <div className="pef-select-wrapper">
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="pef-select"
                  >
                    {categories.map(c => (
                      <option key={c.value} value={c.value}>
                        {c.emoji} {language === 'mr' ? c.labelMr : language === 'hi' ? c.labelHi : c.labelEn}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} color="#64748b" className="pef-select-arrow" />
                </div>
              </div>
            </div>

            {/* ROW 3: AMOUNT PAID & PAID TO */}
            <div className="pef-grid-2col">
              {/* AMOUNT PAID (₹) * */}
              <div>
                <div className="pef-amount-head">
                  <label className="pef-label" style={{ marginBottom: 0 }}>
                    <span>{language === 'mr' ? 'भरलेली रक्कम' : language === 'hi' ? 'भुगतान की गई राशि (₹)' : 'Amount Paid (₹)'}</span>
                    <span className="pef-req-star">*</span>
                  </label>
                  
                  {/* Quick Add Chips */}
                  <div className="pef-quick-chips">
                    {[100, 250, 500, 1000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => addQuickAmount(val)}
                        className="pef-chip-btn"
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pef-amount-input-wrap">
                  <span className="pef-rupee-symbol">₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 2400"
                    required
                    min="1"
                    step="any"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="pef-input pef-amount-input"
                  />
                </div>
              </div>

              {/* PAID TO (VENDOR / PERSON NAME) */}
              <div>
                <label className="pef-label">
                  <span>{language === 'mr' ? 'कोणाला दिले' : language === 'hi' ? 'किसे भुगतान किया' : 'Paid To (Vendor / Person Name)'}</span>
                  <span className="pef-req-star">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shree Sai Hardware / Auto Fare"
                  value={formData.paidTo}
                  onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                  className="pef-input"
                />
              </div>
            </div>

            {/* ROW 4: PAYMENT MODE */}
            <div>
              <label className="pef-label">
                <span>{language === 'mr' ? 'पेमेंट पद्धत' : language === 'hi' ? 'पेमेंट पद्धति' : 'Payment Mode'}</span>
              </label>
              <div className="pef-paymode-grid">
                {[
                  { label: 'UPI / GPay', icon: Zap },
                  { label: 'Cash', icon: Banknote },
                  { label: 'Bank / Card', icon: CreditCard }
                ].map(item => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMode: item.label })}
                    className={`pef-paymode-btn ${formData.paymentMode.includes(item.label.split(' ')[0]) ? 'pef-paymode-active' : ''}`}
                  >
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ROW 5: ATTACH BILL / RECEIPT PROOF * (Camera & Open Gallery) */}
            <div>
              <div className="pef-bill-header">
                <label className="pef-label" style={{ margin: 0 }}>
                  <span>{language === 'mr' ? 'बिल / पावती जोडा' : language === 'hi' ? 'बिल / रसीद जोड़ें' : 'Attach Bill / Receipt Proof'}</span>
                  <span className="pef-req-star">*</span>
                </label>
                <span className={`pef-required-badge ${formData.receiptName ? 'pef-attached-badge' : ''}`}>
                  {formData.receiptName ? '✓ Attached' : (language === 'mr' ? '(आवश्यक)' : language === 'hi' ? '(आवश्यक)' : '(Required)')}
                </span>
              </div>

              {/* Two buttons/tiles side by side: Camera & Open Gallery */}
              <div className="pef-upload-grid">
                {/* Option 1: Camera */}
                <label className="pef-upload-tile pef-camera-tile">
                  <div className="pef-upload-icon-circle pef-camera-icon-bg">
                    <Camera size={22} color="#2563eb" />
                  </div>
                  <span className="pef-upload-title">{language === 'mr' ? 'कॅमेरा' : language === 'hi' ? 'कैमरा' : 'Camera'}</span>
                  <span className="pef-upload-sub">{language === 'mr' ? 'थेट फोटो काढा' : language === 'hi' ? 'सीधे फोटो लें' : 'Take direct photo'}</span>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </label>

                {/* Option 2: Open Gallery */}
                <label className="pef-upload-tile pef-gallery-tile">
                  <div className="pef-upload-icon-circle pef-gallery-icon-bg">
                    <FileText size={22} color="#8b5cf6" />
                  </div>
                  <span className="pef-upload-title">{language === 'mr' ? 'गॅलरी उघडा' : language === 'hi' ? 'गैलरी खोलें' : 'Open Gallery'}</span>
                  <span className="pef-upload-sub">{language === 'mr' ? 'PDF किंवा इमेज निवडा' : language === 'hi' ? 'PDF या इमेज चुनें' : 'PDF, JPG, PNG'}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* File Attachment confirmation badge */}
              {formData.receiptName && (
                <div className="pef-file-preview-card">
                  <div className="pef-preview-left">
                    {formData.previewUrl ? (
                      <img
                        src={formData.previewUrl}
                        alt="Receipt"
                        className="pef-preview-thumb"
                      />
                    ) : (
                      <CheckCircle2 size={22} color="#16a34a" />
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <span className="pef-preview-name">
                        {formData.receiptName}
                      </span>
                      <span className="pef-preview-sub">
                        {language === 'mr' ? '✓ फाइल जोडली गेली' : language === 'hi' ? '✓ फाइल जुड़ गई' : '✓ File attached successfully'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, receiptName: '', previewUrl: null })}
                    className="pef-remove-file-btn"
                  >
                    <X size={14} />
                    <span>{language === 'mr' ? 'काढा' : language === 'hi' ? 'हटाएं' : 'Remove'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* ROW 6: DESCRIPTION / PURPOSE */}
            <div>
              <label className="pef-label">
                <span>{language === 'mr' ? 'खर्चाचे कारण / शेरा' : language === 'hi' ? 'खर्च का कारण / टिप्पणी' : 'Purpose / Remarks of Expense'}</span>
              </label>
              <textarea
                rows={2}
                placeholder={language === 'mr' ? 'उदा. क्लायंट मीटिंगसाठी प्रवास खर्च, 5 सिमेंट गोणी खरेदी' : language === 'hi' ? 'उदा. क्लाइंट मीटिंग के लिए यात्रा खर्च, 5 सीमेंट बैग खरीद' : 'e.g. Travel for site visit, emergency material purchase'}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="pef-input pef-textarea"
              />
            </div>

            {/* ROW 7: SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="pef-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <RotateCw size={20} className="spin-anim" />
                  <span>{language === 'mr' ? 'नोंद होत आहे...' : language === 'hi' ? 'दर्ज हो रहा है...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  <Send size={19} />
                  <span>{language === 'mr' ? 'सबमिट' : language === 'hi' ? 'सबमिट' : 'Submit'}</span>
                </>
              )}
            </button>

            <div className="pef-footer-stamp">
              <ShieldCheck size={14} color="#16a34a" />
              <span>{language === 'mr' ? 'GPS सत्यापित नोंद • SiteSupervisor' : language === 'hi' ? 'GPS सत्यापित प्रविष्टि • SiteSupervisor' : 'GPS timestamped & verified submission • SiteSupervisor'}</span>
            </div>
          </form>
        )}
      </div>

      {/* Scoped CSS with complete Mobile Responsive Media Queries */}
      <style>{`
        .pef-page-container {
          min-height: 100vh;
          width: 100%;
          background-color: #f1f5f9;
          background-image: 
            radial-gradient(at 10% 10%, rgba(37, 99, 235, 0.07) 0px, transparent 50%),
            radial-gradient(at 90% 90%, rgba(124, 58, 237, 0.07) 0px, transparent 50%),
            radial-gradient(at 50% 20%, rgba(241, 245, 249, 1) 0px, transparent 70%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 1.25rem 0.85rem 3.5rem 0.85rem;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          box-sizing: border-box;
        }

        .pef-header {
          width: 100%;
          max-width: 780px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 0.2rem 0.25rem;
          box-sizing: border-box;
        }

        .pef-brand-box {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }

        .pef-brand-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.35);
          flex-shrink: 0;
        }

        .pef-brand-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .pef-brand-title {
          font-size: 1.15rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #0f172a;
          line-height: 1.2;
        }

        .pef-live-badge {
          font-size: 0.62rem;
          font-weight: 800;
          padding: 0.1rem 0.4rem;
          border-radius: 1rem;
          background-color: #e0f2fe;
          color: #0284c7;
          border: 1px solid #bae6fd;
        }

        .pef-brand-subtitle {
          font-size: 0.74rem;
          color: #64748b;
          font-weight: 500;
          display: block;
        }

        .pef-lang-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.85rem;
          border-radius: 2rem;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .pef-card {
          width: 100%;
          max-width: 780px;
          background-color: #ffffff;
          border-radius: 1.25rem;
          box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.9);
          color: #0f172a;
          overflow: hidden;
          box-sizing: border-box;
        }

        .pef-card-header {
          padding: 1.25rem 1.5rem;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justifyContent: space-between;
        }

        .pef-card-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .pef-header-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background-color: rgba(37, 99, 235, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pef-card-title {
          font-size: 1.35rem;
          font-weight: 900;
          margin: 0;
          color: #0f172a;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .pef-card-subtitle {
          font-size: 0.78rem;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .pef-gps-bar {
          padding: 0.7rem 1.5rem;
          display: flex;
          align-items: center;
          justifyContent: space-between;
          font-size: 0.8rem;
          gap: 0.5rem;
        }

        .pef-gps-success {
          background-color: #f0fdf4;
          border-bottom: 1px solid #bbf7d0;
        }

        .pef-gps-error {
          background-color: #fff1f2;
          border-bottom: 1px solid #fecdd3;
        }

        .pef-gps-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow: hidden;
          flex: 1;
        }

        .pef-gps-icon-circle {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-color: #dcfce7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pef-gps-error .pef-gps-icon-circle {
          background-color: #fee2e2;
        }

        .pef-gps-text-wrap {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pef-gps-main-text {
          font-weight: 700;
          color: #15803d;
        }

        .pef-gps-error .pef-gps-main-text {
          color: #be123c;
        }

        .pef-gps-sub-text {
          font-size: 0.72rem;
          color: #64748b;
          margin-left: 0.35rem;
          font-weight: 500;
        }

        .pef-gps-refresh-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #2563eb;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.74rem;
          font-weight: 700;
          cursor: pointer;
          flex-shrink: 0;
          padding: 0.3rem 0.55rem;
          border-radius: 0.45rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .pef-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          box-sizing: border-box;
        }

        .pef-grid-2col {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.1rem;
        }

        .pef-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          margin-bottom: 0.45rem;
          color: #1e293b;
        }

        .pef-req-star {
          color: #ef4444;
        }

        .pef-select-wrapper {
          position: relative;
          width: 100%;
        }

        .pef-select,
        .pef-input {
          width: 100%;
          padding: 0.75rem 0.95rem;
          border-radius: 0.75rem;
          border: 1.5px solid #cbd5e1;
          background-color: #ffffff;
          color: #0f172a;
          font-size: 16px; /* Prevents auto-zoom on mobile iOS Safari */
          font-weight: 600;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .pef-select {
          padding-right: 2.2rem;
          background-color: #f8fafc;
          appearance: none;
          cursor: pointer;
        }

        .pef-select:focus,
        .pef-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .pef-select-arrow {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .pef-custom-site-input {
          margin-top: 0.5rem;
          border-color: #3b82f6;
          background-color: #eff6ff;
        }

        .pef-amount-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.45rem;
          flex-wrap: wrap;
          gap: 0.3rem;
        }

        .pef-quick-chips {
          display: flex;
          gap: 0.3rem;
        }

        .pef-chip-btn {
          padding: 0.2rem 0.45rem;
          font-size: 0.72rem;
          font-weight: 700;
          background-color: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          border-radius: 0.35rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .pef-chip-btn:hover {
          background-color: #e2e8f0;
        }

        .pef-amount-input-wrap {
          position: relative;
          width: 100%;
        }

        .pef-rupee-symbol {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.25rem;
          font-weight: 900;
          color: #2563eb;
        }

        .pef-amount-input {
          padding-left: 2.3rem;
          font-size: 1.2rem;
          font-weight: 900;
        }

        .pef-paymode-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.6rem;
        }

        .pef-paymode-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.75rem 0.4rem;
          border-radius: 0.6rem;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          color: #475569;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s;
        }

        .pef-paymode-active {
          border: 2px solid #2563eb;
          background-color: rgba(37, 99, 235, 0.08);
          color: #2563eb;
        }

        .pef-bill-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.45rem;
        }

        .pef-required-badge {
          font-size: 0.74rem;
          color: #ef4444;
          font-weight: 800;
          background-color: #fee2e2;
          padding: 0.15rem 0.5rem;
          border-radius: 0.4rem;
        }

        .pef-attached-badge {
          color: #16a34a;
          background-color: #dcfce7;
        }

        .pef-upload-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.85rem;
        }

        .pef-upload-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 1.15rem 0.65rem;
          border-radius: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          box-sizing: border-box;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .pef-camera-tile {
          border: 2px dashed #2563eb;
          background-color: rgba(37, 99, 235, 0.04);
          color: #2563eb;
        }

        .pef-gallery-tile {
          border: 2px dashed #8b5cf6;
          background-color: rgba(139, 92, 246, 0.04);
          color: #8b5cf6;
        }

        .pef-camera-tile:active,
        .pef-camera-tile:hover {
          background-color: rgba(37, 99, 235, 0.1);
        }

        .pef-gallery-tile:active,
        .pef-gallery-tile:hover {
          background-color: rgba(139, 92, 246, 0.1);
        }

        .pef-upload-icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.15rem;
        }

        .pef-camera-icon-bg {
          background-color: rgba(37, 99, 235, 0.1);
        }

        .pef-gallery-icon-bg {
          background-color: rgba(139, 92, 246, 0.1);
        }

        .pef-upload-title {
          font-size: 0.92rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .pef-upload-sub {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 500;
        }

        .pef-file-preview-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.95rem;
          background-color: #f0fdf4;
          border: 1.5px solid #86efac;
          border-radius: 0.75rem;
          margin-top: 0.75rem;
          box-shadow: 0 2px 6px rgba(22, 163, 74, 0.08);
        }

        .pef-preview-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          overflow: hidden;
          flex: 1;
        }

        .pef-preview-thumb {
          width: 38px;
          height: 38px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #86efac;
          flex-shrink: 0;
        }

        .pef-preview-name {
          font-size: 0.88rem;
          font-weight: 800;
          color: #15803d;
          display: block;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .pef-preview-sub {
          font-size: 0.72rem;
          color: #16a34a;
          font-weight: 600;
          display: block;
        }

        .pef-remove-file-btn {
          background: #fee2e2;
          border: none;
          color: #dc2626;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.76rem;
          font-weight: 800;
          padding: 0.35rem 0.65rem;
          border-radius: 0.45rem;
          flex-shrink: 0;
        }

        .pef-textarea {
          resize: vertical;
          min-height: 64px;
        }

        .pef-submit-btn {
          margin-top: 0.4rem;
          width: 100%;
          min-height: 48px;
          padding: 0.95rem 1.4rem;
          border-radius: 0.85rem;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          border: none;
          font-size: 1.1rem;
          font-weight: 900;
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          cursor: pointer;
          box-shadow: 0 10px 22px -5px rgba(37, 99, 235, 0.45);
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .pef-submit-btn:active {
          transform: scale(0.99);
        }

        .pef-footer-stamp {
          text-align: center;
          margin-top: 0.15rem;
          font-size: 0.75rem;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }

        /* Success screen styles */
        .pef-success-wrap {
          padding: 2.25rem 1.5rem;
          text-align: center;
        }

        .pef-success-icon-circle {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background-color: #dcfce7;
          color: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem auto;
          box-shadow: 0 10px 25px -5px rgba(22, 163, 74, 0.3);
        }

        .pef-success-title {
          font-size: 1.45rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 0.4rem 0;
        }

        .pef-success-subtitle {
          font-size: 0.88rem;
          color: #64748b;
          margin: 0 0 1.5rem 0;
        }

        .pef-receipt-card {
          background-color: #f8fafc;
          border: 1.5px dashed #cbd5e1;
          border-radius: 1.15rem;
          padding: 1.35rem;
          text-align: left;
          margin-bottom: 1.5rem;
        }

        .pef-receipt-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.85rem;
          margin-bottom: 0.85rem;
        }

        .pef-receipt-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 800;
          letter-spacing: 0.05em;
          display: block;
        }

        .pef-receipt-id {
          font-size: 1.3rem;
          font-weight: 900;
          color: #2563eb;
        }

        .pef-receipt-amount {
          font-size: 1.45rem;
          font-weight: 900;
          color: #16a34a;
        }

        .pef-receipt-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.8rem;
          font-size: 0.85rem;
        }

        .pef-receipt-grid-label {
          color: #64748b;
          font-size: 0.73rem;
          display: block;
          font-weight: 600;
        }

        .pef-receipt-grid-val {
          color: #0f172a;
          word-break: break-word;
        }

        .pef-receipt-gps-box {
          grid-column: span 2;
          background-color: #f0fdf4;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #bbf7d0;
        }

        .pef-submit-another-btn {
          width: 100%;
          max-width: 360px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.9rem 1.4rem;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          border: none;
          border-radius: 0.75rem;
          font-size: 0.98rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 20px -4px rgba(37, 99, 235, 0.4);
        }

        /* ---------------------------------------------------- */
        /* MOBILE RESPONSIVE MEDIA QUERIES (< 640px & < 480px) */
        /* ---------------------------------------------------- */
        @media (max-width: 640px) {
          .pef-page-container {
            padding: 0.75rem 0.5rem 2.5rem 0.5rem;
          }

          .pef-card {
            border-radius: 1rem;
          }

          .pef-card-header {
            padding: 1rem 1.1rem;
          }

          .pef-card-title {
            font-size: 1.25rem;
          }

          .pef-gps-bar {
            padding: 0.65rem 1rem;
          }

          .pef-form {
            padding: 1.1rem;
            gap: 1rem;
          }

          /* Collapse 2-column grid to 1-column on mobile */
          .pef-grid-2col {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .pef-receipt-grid {
            grid-template-columns: 1fr;
            gap: 0.65rem;
          }

          .pef-receipt-grid > div {
            grid-column: span 1 !important;
          }

          .pef-receipt-gps-box {
            grid-column: span 1 !important;
          }
        }

        @media (max-width: 420px) {
          .pef-header {
            padding: 0.1rem;
          }

          .pef-brand-title {
            font-size: 1.05rem;
          }

          .pef-brand-subtitle {
            display: none;
          }

          .pef-lang-btn {
            padding: 0.35rem 0.65rem;
            font-size: 0.75rem;
          }

          .pef-paymode-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 0.35rem;
          }

          .pef-paymode-btn {
            padding: 0.65rem 0.2rem;
            font-size: 0.74rem;
            flex-direction: column;
            gap: 0.2rem;
          }

          .pef-upload-title {
            font-size: 0.85rem;
          }

          .pef-upload-sub {
            font-size: 0.68rem;
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PublicExpenseForm;
