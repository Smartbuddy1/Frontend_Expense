// ASEMS - Aarya Site Expense Management System
// Mock Database Schema conforming to ASEMS specifications

export const INITIAL_PROJECTS = [
  {
    id: 'PRJ-101',
    name: 'Sangamner-P1 Eco Toilets',
    site: 'Sangamner Bus Stand & Market Yard',
    toilets: 12,
    supervisor: 'Rohit Patil',
    supervisorMobile: '+91 98221 45871',
    budget: 200000,
    fundsReleased: 150000,
    expenses: 72500,
    advance: 50000,
    balance: 77500,
    status: 'In Progress',
    startDate: '2026-07-01',
    endDate: '2026-09-15',
    progress: 68
  },
  {
    id: 'PRJ-102',
    name: 'Pune-P2 Smart Sanitation',
    site: 'Swargate Multimodal Hub',
    toilets: 20,
    supervisor: 'Amit Shinde',
    supervisorMobile: '+91 97654 32109',
    budget: 350000,
    fundsReleased: 220000,
    expenses: 48300,
    advance: 40000,
    balance: 171700,
    status: 'In Progress',
    startDate: '2026-07-15',
    endDate: '2026-10-30',
    progress: 45
  },
  {
    id: 'PRJ-103',
    name: 'Nashik-P3 Highway Green Toilets',
    site: 'Dwarka Circle Highway Junction',
    toilets: 16,
    supervisor: 'Sagar Jadhav',
    supervisorMobile: '+91 94231 88990',
    budget: 280000,
    fundsReleased: 180000,
    expenses: 62500,
    advance: 30000,
    balance: 117500,
    status: 'In Progress',
    startDate: '2026-08-01',
    endDate: '2026-11-15',
    progress: 32
  },
  {
    id: 'PRJ-104',
    name: 'Thane-P4 Municipal Complex',
    site: 'Majiwada Junction Installation',
    toilets: 18,
    supervisor: 'Manoj Gaikwad',
    supervisorMobile: '+91 98900 11223',
    budget: 300000,
    fundsReleased: 200000,
    expenses: 31200,
    advance: 65000,
    balance: 168800,
    status: 'In Progress',
    startDate: '2026-08-10',
    endDate: '2026-12-01',
    progress: 22
  },
  {
    id: 'PRJ-105',
    name: 'Solapur-P5 Pilgrimage Unit',
    site: 'Old City Station Area',
    toilets: 8,
    supervisor: 'Vikram Deshmukh',
    supervisorMobile: '+91 91580 44556',
    budget: 120000,
    fundsReleased: 110000,
    expenses: 20500,
    advance: 30000,
    balance: 89500,
    status: 'Settlement Pending',
    startDate: '2026-06-15',
    endDate: '2026-08-15',
    progress: 100
  },
  {
    id: 'PRJ-106',
    name: 'Kolhapur-P6 Heritage Center',
    site: 'Mahalaxmi Temple Premises',
    toilets: 14,
    supervisor: 'Pravin Shinde',
    supervisorMobile: '+91 98230 77112',
    budget: 250000,
    fundsReleased: 160000,
    expenses: 45000,
    advance: 25000,
    balance: 115000,
    status: 'In Progress',
    startDate: '2026-07-20',
    endDate: '2026-10-15',
    progress: 52
  },
  {
    id: 'PRJ-107',
    name: 'Sambhajinagar-P7 Industrial Hub',
    site: 'Waluj MIDC Station Area',
    toilets: 16,
    supervisor: 'Rajesh Kulkarni',
    supervisorMobile: '+91 94222 99334',
    budget: 290000,
    fundsReleased: 175000,
    expenses: 58000,
    advance: 35000,
    balance: 117000,
    status: 'In Progress',
    startDate: '2026-08-05',
    endDate: '2026-11-20',
    progress: 38
  },
  {
    id: 'PRJ-108',
    name: 'Nagpur-P8 Metro Corridor',
    site: 'Sitabuldi Interchange',
    toilets: 22,
    supervisor: 'Santosh More',
    supervisorMobile: '+91 98501 22448',
    budget: 380000,
    fundsReleased: 240000,
    expenses: 85000,
    advance: 45000,
    balance: 155000,
    status: 'In Progress',
    startDate: '2026-07-10',
    endDate: '2026-11-05',
    progress: 60
  },
  {
    id: 'PRJ-109',
    name: 'Ratnagiri-P9 Coastal Unit',
    site: 'Mirya Port Site',
    toilets: 10,
    supervisor: 'Deepak Sawant',
    supervisorMobile: '+91 91300 88552',
    budget: 160000,
    fundsReleased: 120000,
    expenses: 32000,
    advance: 20000,
    balance: 88000,
    status: 'In Progress',
    startDate: '2026-08-12',
    endDate: '2026-12-10',
    progress: 25
  },
  {
    id: 'PRJ-110',
    name: 'Amravati-P10 Highway Junction',
    site: 'Rajkamal Square',
    toilets: 12,
    supervisor: 'Kiran Thorat',
    supervisorMobile: '+91 97633 44110',
    budget: 210000,
    fundsReleased: 130000,
    expenses: 28500,
    advance: 25000,
    balance: 101500,
    status: 'In Progress',
    startDate: '2026-08-15',
    endDate: '2026-12-25',
    progress: 18
  }
];

export const EXPENSE_CATEGORIES = [
  { id: 'cat_purchase', name: 'Purchase / Materials', icon: 'ShoppingBag', color: '#3b82f6' },
  { id: 'cat_labour', name: 'Labour & Contractors', icon: 'Users', color: '#10b981' },
  { id: 'cat_transport', name: 'Transport & Logistics', icon: 'Truck', color: '#f59e0b' },
  { id: 'cat_lodging', name: 'Lodging & Hotel', icon: 'Home', color: '#8b5cf6' },
  { id: 'cat_travel', name: 'Travel & Conveyance', icon: 'Car', color: '#ec4899' },
  { id: 'cat_allowance', name: 'Daily Allowance & Food', icon: 'Utensils', color: '#06b6d4' },
  { id: 'cat_misc', name: 'Miscellaneous & Emergency', icon: 'MoreHorizontal', color: '#64748b' }
];

export const INITIAL_EXPENSES = [
  {
    id: 'EXP-8091',
    projectId: 'PRJ-101',
    projectName: 'Sangamner-P1 Eco Toilets',
    siteName: 'Sangamner Bus Stand',
    supervisor: 'Rohit Patil',
    category: 'Purchase / Materials',
    itemDescription: 'Plumbing PVC pipes, CPVC fittings & water inlet solenoid valves (Set of 12)',
    vendorName: 'Mahalaxmi Hardware & Sanitary',
    vendorGstin: '27AABCM8921R1Z8',
    billNumber: 'MHS/26/0491',
    billDate: '2026-08-18',
    amount: 18450,
    taxAmount: 2814,
    hasBill: true,
    billUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    status: 'Pending Accounts Verification',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-08-19 11:30 AM',
      remarks: 'Goods received and inspected on site. Verified with BOQ.'
    },
    accountsVerification: null,
    submittedAt: '2026-08-18 06:45 PM'
  },
  {
    id: 'EXP-8092',
    projectId: 'PRJ-102',
    projectName: 'Pune-P2 Smart Sanitation',
    siteName: 'Swargate Hub',
    supervisor: 'Amit Shinde',
    category: 'Labour & Contractors',
    itemDescription: 'Weekly wages for 4 skilled tile masons & 2 electric technicians (6 days)',
    vendorName: 'Direct Site Labour Muster',
    vendorGstin: 'N/A (Muster Roll)',
    billNumber: 'MUSTER-W3-AUG',
    billDate: '2026-08-19',
    amount: 14200,
    taxAmount: 0,
    hasBill: true,
    billUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
    status: 'Pending Accounts Verification',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Rahul Verma (Project Ops Lead)',
      approvedAt: '2026-08-20 09:15 AM',
      remarks: 'Attendance sheet matched with daily site logs.'
    },
    accountsVerification: null,
    submittedAt: '2026-08-19 08:20 PM'
  },
  {
    id: 'EXP-8093',
    projectId: 'PRJ-103',
    projectName: 'Nashik-P3 Highway Green Toilets',
    siteName: 'Dwarka Circle',
    supervisor: 'Sagar Jadhav',
    category: 'Transport & Logistics',
    itemDescription: 'Crane and trailer charges for unloading prefabricated stainless steel cubicles',
    vendorName: 'Shree Ganesh Logistics & Crane Services',
    vendorGstin: '27AASPG5541Q1ZG',
    billNumber: 'SGL-2026-88',
    billDate: '2026-08-19',
    amount: 12500,
    taxAmount: 625,
    hasBill: true,
    billUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    status: 'Pending Accounts Verification',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Pravin Kadam (Zonal Ops Manager)',
      approvedAt: '2026-08-20 02:40 PM',
      remarks: 'Heavy machinery needed for swift placement. Verified.'
    },
    accountsVerification: null,
    submittedAt: '2026-08-19 09:10 PM'
  },
  {
    id: 'EXP-8094',
    projectId: 'PRJ-104',
    projectName: 'Thane-P4 Municipal Complex',
    siteName: 'Majiwada Site',
    supervisor: 'Manoj Gaikwad',
    category: 'Lodging & Hotel',
    itemDescription: 'Hotel lodging for 3 technicians (5 nights) near Majiwada site',
    vendorName: 'Hotel Royal Residency',
    vendorGstin: '27AAMCR1122D1ZH',
    billNumber: 'INV-44120',
    billDate: '2026-08-20',
    amount: 9850,
    taxAmount: 1182,
    hasBill: true,
    billUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    status: 'Pending Accounts Verification',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Sunil Shinde (Site Ops Lead)',
      approvedAt: '2026-08-21 10:00 AM',
      remarks: 'Lodging tariffs within approved rate limit.'
    },
    accountsVerification: null,
    submittedAt: '2026-08-20 11:30 PM'
  },
  {
    id: 'EXP-8085',
    projectId: 'PRJ-101',
    projectName: 'Sangamner-P1 Eco Toilets',
    siteName: 'Sangamner Bus Stand',
    supervisor: 'Rohit Patil',
    category: 'Purchase / Materials',
    itemDescription: 'Cement bags (25 bags) and river sand for concrete base pad',
    vendorName: 'Sangamner Building Materials Depot',
    vendorGstin: '27AABCS7744E1ZY',
    billNumber: 'SBM-901',
    billDate: '2026-08-14',
    amount: 16500,
    taxAmount: 2517,
    hasBill: true,
    billUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
    status: 'Accounts Verified & Paid',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-08-15 04:00 PM',
      remarks: 'Foundation civil materials verified.'
    },
    accountsVerification: {
      status: 'Verified',
      verifiedBy: 'Accounts Dept',
      verifiedAt: '2026-08-16 11:45 AM',
      paymentRef: 'UPI/260816/094812',
      paymentMode: 'UPI',
      remarks: 'Tax invoice verified on GST portal. Paid to vendor via QR.'
    },
    submittedAt: '2026-08-14 07:00 PM'
  }
];

export const INITIAL_ADVANCES = [
  {
    id: 'ADV-401',
    projectId: 'PRJ-101',
    projectName: 'Sangamner-P1 Eco Toilets',
    siteName: 'Sangamner Bus Stand',
    supervisor: 'Rohit Patil',
    supervisorMobile: '+91 98221 45871',
    bankDetails: {
      accountNo: '50100293847561',
      ifsc: 'HDFC0001234',
      bankName: 'HDFC Bank',
      upiId: 'rohitpatil@okhdfcbank'
    },
    requestedAmount: 25000,
    approvedAmount: 25000,
    purpose: 'Civil work foundation, excavation labor charges and emergency local sanitary hardware purchase',
    requestDate: '2026-08-20',
    status: 'Pending Accounts Payment',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-08-21 08:30 AM',
      remarks: 'Civil work starting next week. Advance recommended.'
    },
    paymentDetails: null
  },
  {
    id: 'ADV-402',
    projectId: 'PRJ-104',
    projectName: 'Thane-P4 Municipal Complex',
    siteName: 'Majiwada Junction',
    supervisor: 'Manoj Gaikwad',
    supervisorMobile: '+91 98900 11223',
    bankDetails: {
      accountNo: '30981726354',
      ifsc: 'SBIN0004567',
      bankName: 'State Bank of India',
      upiId: 'manoj.gaikwad@oksbi'
    },
    requestedAmount: 30000,
    approvedAmount: 20000,
    purpose: 'Site team travel, diesel generator hire and initial structural rigging tools',
    requestDate: '2026-08-20',
    status: 'Pending Accounts Payment',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-08-21 09:45 AM',
      remarks: 'Approved Rs 20,000 for week 1 operations.'
    },
    paymentDetails: null
  },
  {
    id: 'ADV-395',
    projectId: 'PRJ-101',
    projectName: 'Sangamner-P1 Eco Toilets',
    siteName: 'Sangamner Bus Stand',
    supervisor: 'Rohit Patil',
    supervisorMobile: '+91 98221 45871',
    requestedAmount: 25000,
    approvedAmount: 25000,
    purpose: 'Initial site mobilization, earth excavation & tools setup',
    requestDate: '2026-08-02',
    status: 'Disbursed',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-08-02 11:00 AM'
    },
    paymentDetails: {
      paymentDate: '2026-08-03',
      paymentMode: 'NEFT',
      refNumber: 'NEFT/N260803984712',
      paidFromAccount: 'ICICI Current A/c - 001905004412 (Aarya Prod)',
      paidTo: 'Rohit Patil (Supervisor)',
      amountPaid: 25000,
      recordedBy: 'Accounts Dept'
    }
  },
  {
    id: 'ADV-396',
    projectId: 'PRJ-102',
    projectName: 'Pune-P2 Smart Sanitation',
    siteName: 'Swargate Multimodal Hub',
    supervisor: 'Amit Shinde',
    supervisorMobile: '+91 97654 32109',
    requestedAmount: 40000,
    approvedAmount: 40000,
    purpose: 'Electrical sensor contractor advance & specialized tiling tools',
    requestDate: '2026-08-05',
    status: 'Disbursed',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-08-05 03:30 PM'
    },
    paymentDetails: {
      paymentDate: '2026-08-06',
      paymentMode: 'RTGS',
      refNumber: 'RTGS/R260806112233',
      paidFromAccount: 'ICICI Current A/c - 001905004412 (Aarya Prod)',
      paidTo: 'Amit Shinde (Supervisor)',
      amountPaid: 40000,
      recordedBy: 'Accounts Dept'
    }
  },
  {
    id: 'ADV-397',
    projectId: 'PRJ-103',
    projectName: 'Nashik-P3 Highway Green Toilets',
    siteName: 'Dwarka Circle Highway Junction',
    supervisor: 'Sagar Jadhav',
    supervisorMobile: '+91 94231 88990',
    requestedAmount: 30000,
    approvedAmount: 30000,
    purpose: 'Site barricading, steel fencing & night generator hire',
    requestDate: '2026-08-08',
    status: 'Disbursed',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-08-08 04:15 PM'
    },
    paymentDetails: {
      paymentDate: '2026-08-09',
      paymentMode: 'UPI',
      refNumber: 'UPI/622199008877',
      paidFromAccount: 'ICICI Current A/c - 001905004412 (Aarya Prod)',
      paidTo: 'Sagar Jadhav (Supervisor)',
      amountPaid: 30000,
      recordedBy: 'Accounts Dept'
    }
  },
  {
    id: 'ADV-398',
    projectId: 'PRJ-105',
    projectName: 'Solapur-P5 Pilgrimage Unit',
    siteName: 'Old City Station Area',
    supervisor: 'Vikram Deshmukh',
    supervisorMobile: '+91 91580 44556',
    requestedAmount: 30000,
    approvedAmount: 30000,
    purpose: 'Pilgrim unit transport & rapid assembly labour',
    requestDate: '2026-07-19',
    status: 'Disbursed',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-07-19 12:00 PM'
    },
    paymentDetails: {
      paymentDate: '2026-07-20',
      paymentMode: 'IMPS',
      refNumber: 'IMPS/7722109934',
      paidFromAccount: 'HDFC Corporate A/c - 502000881920',
      paidTo: 'Vikram Deshmukh (Supervisor)',
      amountPaid: 30000,
      recordedBy: 'Accounts Dept'
    }
  },
  {
    id: 'ADV-399',
    projectId: 'PRJ-106',
    projectName: 'Kolhapur-P6 Heritage Center',
    siteName: 'Mahalaxmi Temple Premises',
    supervisor: 'Pravin Shinde',
    supervisorMobile: '+91 98230 77112',
    requestedAmount: 25000,
    approvedAmount: 25000,
    purpose: 'Heritage stone carving labour advance & site barricading',
    requestDate: '2026-07-24',
    status: 'Disbursed',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-07-24 02:30 PM'
    },
    paymentDetails: {
      paymentDate: '2026-07-25',
      paymentMode: 'NEFT',
      refNumber: 'NEFT/N26072588112',
      paidFromAccount: 'ICICI Current A/c - 001905004412 (Aarya Prod)',
      paidTo: 'Pravin Shinde (Supervisor)',
      amountPaid: 25000,
      recordedBy: 'Accounts Dept'
    }
  },
  {
    id: 'ADV-400',
    projectId: 'PRJ-107',
    projectName: 'Sambhajinagar-P7 Industrial Hub',
    siteName: 'Waluj MIDC Station Area',
    supervisor: 'Rajesh Kulkarni',
    supervisorMobile: '+91 94222 99334',
    requestedAmount: 35000,
    approvedAmount: 35000,
    purpose: 'Industrial area water connection & high-voltage plumbing wiring',
    requestDate: '2026-08-07',
    status: 'Disbursed',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-08-07 10:45 AM'
    },
    paymentDetails: {
      paymentDate: '2026-08-08',
      paymentMode: 'RTGS',
      refNumber: 'RTGS/R26080844556',
      paidFromAccount: 'ICICI Current A/c - 001905004412 (Aarya Prod)',
      paidTo: 'Rajesh Kulkarni (Supervisor)',
      amountPaid: 35000,
      recordedBy: 'Accounts Dept'
    }
  },
  {
    id: 'ADV-403',
    projectId: 'PRJ-108',
    projectName: 'Nagpur-P8 Metro Corridor',
    siteName: 'Sitabuldi Interchange',
    supervisor: 'Santosh More',
    supervisorMobile: '+91 98501 22448',
    requestedAmount: 45000,
    approvedAmount: 45000,
    purpose: 'Metro interchange site scaffolding & heavy structural fittings',
    requestDate: '2026-07-14',
    status: 'Disbursed',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-07-14 01:15 PM'
    },
    paymentDetails: {
      paymentDate: '2026-07-15',
      paymentMode: 'NEFT',
      refNumber: 'NEFT/N26071533221',
      paidFromAccount: 'ICICI Current A/c - 001905004412 (Aarya Prod)',
      paidTo: 'Santosh More (Supervisor)',
      amountPaid: 45000,
      recordedBy: 'Accounts Dept'
    }
  },
  {
    id: 'ADV-404',
    projectId: 'PRJ-109',
    projectName: 'Ratnagiri-P9 Coastal Unit',
    siteName: 'Mirya Port Site',
    supervisor: 'Deepak Sawant',
    supervisorMobile: '+91 91300 88552',
    requestedAmount: 20000,
    approvedAmount: 20000,
    purpose: 'Coastal anti-rust coating labour and emergency site generator',
    requestDate: '2026-08-13',
    status: 'Disbursed',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-08-13 05:00 PM'
    },
    paymentDetails: {
      paymentDate: '2026-08-14',
      paymentMode: 'UPI',
      refNumber: 'UPI/998811223344',
      paidFromAccount: 'HDFC Corporate A/c - 502000881920',
      paidTo: 'Deepak Sawant (Supervisor)',
      amountPaid: 20000,
      recordedBy: 'Accounts Dept'
    }
  },
  {
    id: 'ADV-405',
    projectId: 'PRJ-110',
    projectName: 'Amravati-P10 Highway Junction',
    siteName: 'Rajkamal Square',
    supervisor: 'Kiran Thorat',
    supervisorMobile: '+91 97633 44110',
    requestedAmount: 25000,
    approvedAmount: 25000,
    purpose: 'Highway junction utility digging and precast foundation setup',
    requestDate: '2026-08-15',
    status: 'Disbursed',
    dineshApproval: {
      status: 'Approved',
      approvedBy: 'Dinesh Sir (Operations Head)',
      approvedAt: '2026-08-15 11:30 AM'
    },
    paymentDetails: {
      paymentDate: '2026-08-16',
      paymentMode: 'IMPS',
      refNumber: 'IMPS/88776655443',
      paidFromAccount: 'ICICI Current A/c - 001905004412 (Aarya Prod)',
      paidTo: 'Kiran Thorat (Supervisor)',
      amountPaid: 25000,
      recordedBy: 'Accounts Dept'
    }
  }
];

export const INITIAL_PAYMENTS_LEDGER = [
  {
    id: 'PAY-701',
    date: '2026-08-03',
    type: 'Site Advance Disbursal',
    projectId: 'PRJ-101',
    projectName: 'Sangamner-P1 Eco Toilets',
    paidTo: 'Rohit Patil (Supervisor)',
    amount: 25000,
    paymentMode: 'NEFT',
    refNumber: 'NEFT/N260803984712',
    category: 'Site Advance',
    status: 'Completed',
    notes: 'ADV-395 initial site mobilization & preliminary tools'
  },
  {
    id: 'PAY-702',
    date: '2026-08-06',
    type: 'Site Advance Disbursal',
    projectId: 'PRJ-102',
    projectName: 'Pune-P2 Smart Sanitation',
    paidTo: 'Amit Shinde (Supervisor)',
    amount: 40000,
    paymentMode: 'RTGS',
    refNumber: 'RTGS/R260806112233',
    category: 'Site Advance',
    status: 'Completed',
    notes: 'ADV-396 electrical sensor contractor advance & tiling tools'
  },
  {
    id: 'PAY-703',
    date: '2026-08-09',
    type: 'Site Advance Disbursal',
    projectId: 'PRJ-103',
    projectName: 'Nashik-P3 Highway Green Toilets',
    paidTo: 'Sagar Jadhav (Supervisor)',
    amount: 30000,
    paymentMode: 'UPI',
    refNumber: 'UPI/622199008877',
    category: 'Site Advance',
    status: 'Completed',
    notes: 'ADV-397 site barricading, steel fencing & night generator'
  },
  {
    id: 'PAY-704',
    date: '2026-07-20',
    type: 'Site Advance Disbursal',
    projectId: 'PRJ-105',
    projectName: 'Solapur-P5 Pilgrimage Unit',
    paidTo: 'Vikram Deshmukh (Supervisor)',
    amount: 30000,
    paymentMode: 'IMPS',
    refNumber: 'IMPS/7722109934',
    category: 'Site Advance',
    status: 'Completed',
    notes: 'ADV-398 pilgrim unit transport & rapid assembly labour'
  },
  {
    id: 'PAY-705',
    date: '2026-07-25',
    type: 'Site Advance Disbursal',
    projectId: 'PRJ-106',
    projectName: 'Kolhapur-P6 Heritage Center',
    paidTo: 'Pravin Shinde (Supervisor)',
    amount: 25000,
    paymentMode: 'NEFT',
    refNumber: 'NEFT/N26072588112',
    category: 'Site Advance',
    status: 'Completed',
    notes: 'ADV-399 heritage stone carving labour advance'
  },
  {
    id: 'PAY-706',
    date: '2026-08-08',
    type: 'Site Advance Disbursal',
    projectId: 'PRJ-107',
    projectName: 'Sambhajinagar-P7 Industrial Hub',
    paidTo: 'Rajesh Kulkarni (Supervisor)',
    amount: 35000,
    paymentMode: 'RTGS',
    refNumber: 'RTGS/R26080844556',
    category: 'Site Advance',
    status: 'Completed',
    notes: 'ADV-400 industrial area water connection & plumbing wiring'
  },
  {
    id: 'PAY-707',
    date: '2026-07-15',
    type: 'Site Advance Disbursal',
    projectId: 'PRJ-108',
    projectName: 'Nagpur-P8 Metro Corridor',
    paidTo: 'Santosh More (Supervisor)',
    amount: 45000,
    paymentMode: 'NEFT',
    refNumber: 'NEFT/N26071533221',
    category: 'Site Advance',
    status: 'Completed',
    notes: 'ADV-403 metro interchange site scaffolding & fittings'
  },
  {
    id: 'PAY-708',
    date: '2026-08-14',
    type: 'Site Advance Disbursal',
    projectId: 'PRJ-109',
    projectName: 'Ratnagiri-P9 Coastal Unit',
    paidTo: 'Deepak Sawant (Supervisor)',
    amount: 20000,
    paymentMode: 'UPI',
    refNumber: 'UPI/998811223344',
    category: 'Site Advance',
    status: 'Completed',
    notes: 'ADV-404 coastal anti-rust coating labour and generator'
  },
  {
    id: 'PAY-709',
    date: '2026-08-16',
    type: 'Site Advance Disbursal',
    projectId: 'PRJ-110',
    projectName: 'Amravati-P10 Highway Junction',
    paidTo: 'Kiran Thorat (Supervisor)',
    amount: 25000,
    paymentMode: 'IMPS',
    refNumber: 'IMPS/88776655443',
    category: 'Site Advance',
    status: 'Completed',
    notes: 'ADV-405 highway junction utility digging & precast foundation'
  },
  {
    id: 'PAY-710',
    date: '2026-08-16',
    type: 'Expense Reimbursement',
    projectId: 'PRJ-101',
    projectName: 'Sangamner-P1 Eco Toilets',
    paidTo: 'Mahalaxmi Hardware & Sanitary',
    amount: 16500,
    paymentMode: 'UPI',
    refNumber: 'UPI/260816/094812',
    category: 'Purchase / Materials',
    status: 'Completed',
    notes: 'Cement & sand foundation bill settlement'
  }
];

export const INITIAL_SETTLEMENTS = [
  {
    id: 'SETTL-501',
    projectId: 'PRJ-105',
    projectName: 'Solapur-P5 Pilgrimage Unit',
    siteName: 'Old City Station Area',
    supervisor: 'Vikram Deshmukh',
    supervisorMobile: '+91 91580 44556',
    completedDate: '2026-08-15',
    totalAdvanceGiven: 30000,
    totalApprovedExpenses: 20500,
    difference: 9500,
    settlementType: 'REFUND_DUE',
    status: 'Pending Refund Receipt',
    details: [
      { category: 'Transport', amount: 8000 },
      { category: 'Labour', amount: 7500 },
      { category: 'Daily Allowance', amount: 5000 }
    ],
    supervisorRemark: 'Site installation completed and handed over to Solapur Municipal Authority. Unused Rs 9,500 cash in hand ready to deposit in company account.',
    accountsRemark: 'Awaiting cash deposit slip or UPI transfer from Vikram Deshmukh to close site ledger.'
  },
  {
    id: 'SETTL-502',
    projectId: 'PRJ-101',
    projectName: 'Sangamner-P1 (Phase 1 Sub-Settlement)',
    siteName: 'Sangamner Bus Stand',
    supervisor: 'Rohit Patil',
    supervisorMobile: '+91 98221 45871',
    completedDate: '2026-08-18',
    totalAdvanceGiven: 50000,
    totalApprovedExpenses: 72500,
    difference: 22500,
    settlementType: 'ADDITIONAL_PAYABLE',
    status: 'Pending Accounts Payout',
    details: [
      { category: 'Purchase / Materials', amount: 34950 },
      { category: 'Labour', amount: 21000 },
      { category: 'Transport', amount: 16550 }
    ],
    supervisorRemark: 'Additional civil materials bought directly on personal credit for timeline compliance.',
    accountsRemark: 'Verified against bills EXP-8085 & EXP-8091. Payout voucher ready for Accounts approval.'
  }
];

export const COMPANY_BANK_ACCOUNTS = [
  { id: 'acc_icici', name: 'ICICI Bank Current A/c - 001905004412 (Main Operational)', balance: 1450000 },
  { id: 'acc_hdfc', name: 'HDFC Bank Current A/c - 50200088991122 (Project Disbursal)', balance: 880000 },
  { id: 'acc_sbi', name: 'State Bank of India - 30882199001 (Govt / Escrow)', balance: 2500000 },
  { id: 'acc_petty', name: 'Petty Cash Float (Office Cashier)', balance: 45000 }
];

export const AUDIT_LOGS = [
  {
    id: 'LOG-1001',
    timestamp: '2026-08-21 15:30:12',
    user: 'Accounts Department',
    action: 'VERIFIED_EXPENSE',
    target: 'EXP-8085',
    details: 'Verified GST invoice MHS/26/0491 for Rs 16,500'
  },
  {
    id: 'LOG-1002',
    timestamp: '2026-08-21 14:15:00',
    user: 'Dinesh Sir (Operations Head)',
    action: 'APPROVED_ADVANCE',
    target: 'ADV-401',
    details: 'Approved advance request for Rohit Patil (Rs 25,000)'
  },
  {
    id: 'LOG-1003',
    timestamp: '2026-08-21 11:20:45',
    user: 'Accounts Department',
    action: 'RECORDED_PAYMENT',
    target: 'PAY-702',
    details: 'Disbursed IMPS Rs 7,000 for per diem food allowance'
  }
];
