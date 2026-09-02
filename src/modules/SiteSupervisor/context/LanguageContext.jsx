import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  mr: {
    // Navigation
    dashboard: 'डॅशबोर्ड',
    assignedProjects: 'प्रकल्प व साइट प्रगती',
    requestAdvance: 'अ‍ॅडव्हान्स मागणी',
    dailyExpenses: 'दैनिक खर्च व बिले',
    uploadBills: 'बिल अपलोड करा',
    balanceSettlement: 'शिल्लक रक्कम व पासबुक',
    mainMenu: 'मुख्य मेनू',
    logout: 'लॉगआउट',
    
    // Header & Wallet
    walletBalance: 'शिल्लक वॉलेट रक्कम',
    readyToSpend: 'खर्चासाठी उपलब्ध',
    liveActive: 'साइट चालू आहे',
    justSpent: 'आत्ता खर्च झाले',
    
    // Dashboard Stats & Cards
    supervisorTitle: 'साइट सुपरवायझर डॅशबोर्ड',
    supervisorSubtitle: 'साइटवरील कामे, दैनंदिन खर्च, अ‍ॅडव्हान्स आणि बिलांचे थेट व्यवस्थापन.',
    availableBalance: 'उपलब्ध शिल्लक रक्कम',
    totalAdvance: 'एकूण मिळालेला अ‍ॅडव्हान्स',
    todaySpend: 'आजचा एकूण खर्च',
    assignedSites: 'नियुक्त साइट्स',
    quickActions: 'त्वरित कृती (Quick Actions)',
    recentExpenses: 'अलीकडील खर्च व व्हाउचर्स',
    recentExpensesSub: 'साइटवर नोंदवलेल्या खर्चाच्या ताज्या नोंदी',
    quickAddExpense: 'नवीन खर्च जोडा',
    
    // Action Card Descriptions
    descAssigned: 'साइट नकाशे, कामगारांची संख्या व दैनंदिन प्रगती तपासा',
    descAdvance: 'खरेदी, डिझेल व मजुरीसाठी आपत्कालीन निधी मागा',
    descExpenses: 'दैनिक खर्च नोंदवा आणि बिलांचा फोटो/पावती जोडा',
    descSettlement: 'शिल्लक रक्कम, हिशोब व अंतिम सेटलमेंट पासबुक तपासा',
    
    // Table Headers
    voucherId: 'व्हाउचर आयडी',
    expenseCategory: 'खर्चाचा प्रकार',
    siteLocation: 'साइट ठिकाण',
    dateTime: 'तारीख',
    amount: 'रक्कम (₹)',
    status: 'स्थिती (Status)',
    receipt: 'पावती / बिल',
    view: 'पहा',
    noBill: 'बिल नाही',
    approved: 'मंजूर',
    pending: 'तपासणी सुरू',
    
    // Expense Form
    recordExpenseTitle: 'खर्च नोंदवा व बिल जोडा',
    expenseCategoryLabel: 'खर्चाचा प्रकार (Category)',
    amountPaidLabel: 'दिलेली रक्कम (₹)',
    paidToLabel: 'कोणाला पैसे दिले (दुकान / व्यक्तीचे नाव)',
    attachBillProof: 'बिलाचा पुरावा जोडा (फोटो / पावती)',
    cameraSnap: 'कॅमेराने फोटो काढा',
    chooseFile: 'फाइल / गॅलरी निवडा',
    saveExpenseBtn: 'खर्च व बिल जतन करा',
    filterAll: 'सर्व नोंदी',
    filterWithBill: 'बिल असलेले',
    
    // Request Advance
    requestAdvanceTitle: 'अ‍ॅडव्हान्स पैशांची मागणी',
    requestAdvanceSub: 'साइटवरील चालू कामांसाठी व मजुरीसाठी निधीची मागणी करा.',
    reqAmountLabel: 'लागणारी रक्कम (₹)',
    purposeLabel: 'मागणीचे कारण / स्पष्टीकरण',
    sendRequisitionBtn: 'अ‍ॅडव्हान्स मागणी पाठवा',
    advanceHistory: 'मागील अ‍ॅडव्हान्स नोंदी',
    
    // Language names
    currentLang: 'मराठी',
    switchLang: 'English'
  },
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    assignedProjects: 'प्रोजेक्ट व साइट प्रगति',
    requestAdvance: 'एडवांस अनुरोध',
    dailyExpenses: 'दैनिक खर्च व बिल',
    uploadBills: 'बिल अपलोड करें',
    balanceSettlement: 'शेष राशि व पासबुक',
    mainMenu: 'मुख्य मेनू',
    logout: 'लॉगआउट',

    // Header & Wallet
    walletBalance: 'वॉलेट शेष राशि',
    readyToSpend: 'खर्च के लिए उपलब्ध',
    liveActive: 'साइट सक्रिय है',
    justSpent: 'अभी खर्च हुआ',

    // Dashboard Stats & Cards
    supervisorTitle: 'साइट सुपरवाइजर डैशबोर्ड',
    supervisorSubtitle: 'साइट के कार्य, दैनिक खर्च, एडवांस और बिलों का सीधा प्रबंधन।',
    availableBalance: 'उपलब्ध शेष राशि',
    totalAdvance: 'कुल प्राप्त एडवांस',
    todaySpend: 'आज का कुल खर्च',
    assignedSites: 'नियुक्त साइटें',
    quickActions: 'त्वरित कार्य (Quick Actions)',
    recentExpenses: 'हाल के खर्च व वाउचर',
    recentExpensesSub: 'साइट पर दर्ज किए गए खर्च की ताज़ा प्रविष्टियाँ',
    quickAddExpense: 'नया खर्च जोड़ें',

    // Action Card Descriptions
    descAssigned: 'साइट मानचित्र, मजदूरों की संख्या व दैनिक प्रगति देखें',
    descAdvance: 'खरीद, डीजल व मजदूरी के लिए आपातकालीन निधि मांगें',
    descExpenses: 'दैनिक खर्च दर्ज करें और बिल की फोटो/रसीद जोड़ें',
    descSettlement: 'शेष राशि, हिसाब व अंतिम सेटलमेंट पासबुक देखें',

    // Table Headers
    voucherId: 'वाउचर आईडी',
    expenseCategory: 'खर्च का प्रकार',
    siteLocation: 'साइट स्थान',
    dateTime: 'तारीख',
    amount: 'राशि (₹)',
    status: 'स्थिति (Status)',
    receipt: 'रसीद / बिल',
    view: 'देखें',
    noBill: 'बिल नहीं',
    approved: 'स्वीकृत',
    pending: 'जांच जारी',

    // Expense Form
    recordExpenseTitle: 'खर्च दर्ज करें व बिल जोड़ें',
    expenseCategoryLabel: 'खर्च का प्रकार (Category)',
    amountPaidLabel: 'भुगतान की गई राशि (₹)',
    paidToLabel: 'किसे भुगतान किया (दुकान / व्यक्ति का नाम)',
    attachBillProof: 'बिल का प्रमाण जोड़ें (फोटो / रसीद)',
    cameraSnap: 'कैमरे से फोटो लें',
    chooseFile: 'फाइल / गैलरी चुनें',
    saveExpenseBtn: 'खर्च व बिल सहेजें',
    filterAll: 'सभी प्रविष्टियाँ',
    filterWithBill: 'बिल सहित',

    // Request Advance
    requestAdvanceTitle: 'एडवांस राशि का अनुरोध',
    requestAdvanceSub: 'साइट के चालू कार्यों व मजदूरी के लिए निधि का अनुरोध करें।',
    reqAmountLabel: 'आवश्यक राशि (₹)',
    purposeLabel: 'अनुरोध का कारण / स्पष्टीकरण',
    sendRequisitionBtn: 'एडवांस अनुरोध भेजें',
    advanceHistory: 'पिछले एडवांस रिकॉर्ड',

    // Language names
    currentLang: 'हिंदी',
    switchLang: 'मराठी'
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    assignedProjects: 'View Assigned Project',
    requestAdvance: 'Request Advance',
    dailyExpenses: 'Daily Expenses & Bills',
    uploadBills: 'Upload Bills',
    balanceSettlement: 'Track Balance & Settlement',
    mainMenu: 'Main Menu',
    logout: 'Logout',
    
    // Header & Wallet
    walletBalance: 'Wallet Balance',
    readyToSpend: 'Ready to spend',
    liveActive: 'LIVE ACTIVE',
    justSpent: 'Just Spent',
    
    // Dashboard Stats & Cards
    supervisorTitle: 'Site Supervisor Dashboard',
    supervisorSubtitle: 'Supervise assigned project tasks, field expenses, fund advances & verified receipts.',
    availableBalance: 'Available Balance',
    totalAdvance: 'Total Advance',
    todaySpend: "Today's Spend",
    assignedSites: 'Assigned Sites',
    quickActions: 'Quick Actions',
    recentExpenses: 'Recent Daily Expenses & Vouchers',
    recentExpensesSub: 'Latest verified site expenditure submissions',
    quickAddExpense: 'Add Expense',
    
    // Action Card Descriptions
    descAssigned: 'Check assigned site plans & progress',
    descAdvance: 'Requisition emergency site funds',
    descExpenses: 'Log daily expenses & upload bill proofs',
    descSettlement: 'Check ledger passbook & settlement',
    
    // Table Headers
    voucherId: 'VOUCHER ID',
    expenseCategory: 'EXPENSE CATEGORY',
    siteLocation: 'SITE LOCATION',
    dateTime: 'DATE',
    amount: 'AMOUNT (₹)',
    status: 'STATUS',
    receipt: 'RECEIPT',
    view: 'View',
    noBill: 'No bill',
    approved: 'Approved',
    pending: 'Pending',
    
    // Expense Form
    recordExpenseTitle: 'Record Expense & Bill Proof',
    expenseCategoryLabel: 'Expense Category',
    amountPaidLabel: 'Amount Paid (₹)',
    paidToLabel: 'Paid To (Vendor / Person Name)',
    attachBillProof: 'Attach Bill / Receipt Proof',
    cameraSnap: 'Take Photo (Camera)',
    chooseFile: 'Choose File / PDF',
    saveExpenseBtn: 'Save Expense & Bill Proof',
    filterAll: 'All Entries',
    filterWithBill: 'With Bill',
    
    // Request Advance
    requestAdvanceTitle: 'Request Advance Money',
    requestAdvanceSub: 'Requisition site petty cash, urgent material purchase funds, and worker advances.',
    reqAmountLabel: 'Required Advance Amount (₹)',
    purposeLabel: 'Purpose / Reason',
    sendRequisitionBtn: 'Send Advance Requisition',
    advanceHistory: 'Requisition History',
    
    // Language names
    currentLang: 'English',
    switchLang: 'मराठी'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'mr'; // Defaults to Marathi for local supervisors!
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const LANG_CYCLE = ['mr', 'en', 'hi'];
  const toggleLanguage = () => {
    setLanguage(prev => LANG_CYCLE[(LANG_CYCLE.indexOf(prev) + 1) % LANG_CYCLE.length]);
  };

  const t = (key) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
