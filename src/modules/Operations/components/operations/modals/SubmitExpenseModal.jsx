import React, { useState } from 'react';
import { X, IndianRupee, Tag, FileText, Calendar, Building2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const SubmitExpenseModal = ({ isOpen, onClose, onSubmit, projects = [], supervisors = [] }) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    projectId: projects[0]?.id || '',
    category: 'Material Purchase',
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    invoiceNumber: `VCH-${Math.floor(1000 + Math.random() * 9000)}`,
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.vendor) {
      alert(language === 'mr' ? 'कृपया खर्चाचा तपशील, रक्कम आणि वेंडरचे नाव भरा.' : 'Please fill in expense title, amount, and vendor name.');
      return;
    }

    const selectedProj = projects.find(p => p.id === formData.projectId) || projects[0];
    const selectedSup = supervisors.find(s => s.id === selectedProj?.supervisorId || s.name === selectedProj?.supervisorName);

    const newExpense = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      projectId: selectedProj?.id || 'PRJ-SGM-01',
      projectName: selectedProj ? selectedProj.name : 'Sangamner Eco Toilet Installation - Site P1',
      supervisorName: selectedSup ? selectedSup.name : (selectedProj?.supervisorName || 'Rohit Sharma'),
      supervisorPhone: selectedSup ? selectedSup.phone : '+91 98220 11223',
      category: formData.category,
      description: formData.title,
      amount: Number(formData.amount),
      date: formData.date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      billPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      voucherNo: formData.invoiceNumber,
      vendorName: formData.vendor,
      comments: formData.notes || 'Emergency operational expenditure on site.',
    };

    onSubmit(newExpense);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <IndianRupee size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                {language === 'mr' ? 'नवीन साईट खर्च नोंदवा' : 'Submit Site Operational Expense'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                {language === 'mr' ? 'मंजुरीसाठी नवीन व्हाऊचर व खरेदीचे बिल जोडा' : 'Log procurement bill for operations authorization'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Project Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {language === 'mr' ? 'प्रोजेक्ट / साईट *' : 'Project / Site *'}
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Expense Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {language === 'mr' ? 'खर्चाचा प्रकार *' : 'Expense Category *'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Material Purchase">{language === 'mr' ? 'साहित्य खरेदी' : 'Material Purchase'}</option>
                <option value="Local Conveyance">{language === 'mr' ? 'स्थानिक वाहतूक' : 'Local Conveyance'}</option>
                <option value="Labor Wages">{language === 'mr' ? 'मजुरांची रोजंदारी' : 'Labor Wages'}</option>
                <option value="Equipment Rental">{language === 'mr' ? 'मशिनरी भाडे' : 'Equipment Rental'}</option>
                <option value="Site Food & Refreshment">{language === 'mr' ? 'अल्पोपहार व जेवण' : 'Site Food & Refreshment'}</option>
              </select>
            </div>
          </div>

          {/* Expense Title / Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              {language === 'mr' ? 'खर्चाचा तपशील *' : 'Expense Title / Description *'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 50 Bags Cement & 4-inch PVC drainage pipe"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Amount */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {language === 'mr' ? 'रक्कम (INR ₹) *' : 'Amount (INR ₹) *'}
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 14500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {language === 'mr' ? 'तारीख *' : 'Expense Date *'}
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Vendor Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {language === 'mr' ? 'दुकानदार / वेंडर नाव *' : 'Vendor / Supplier Name *'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sangamner Building Materials Ltd"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Voucher Number */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {language === 'mr' ? 'व्हाऊचर / बिल नंबर' : 'Voucher / Bill No.'}
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              {language === 'mr' ? 'टिप्पणी / शेरा' : 'Audit Remarks / Notes'}
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Verified by supervisor on site. Attached tax invoice."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                color: '#0f172a',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.85rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
            marginTop: '0.5rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.88rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {language === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              style={{
                padding: '0.65rem 1.65rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease'
              }}
            >
              <CheckCircle2 size={16} />
              {language === 'mr' ? 'खर्च सबमिट करा' : 'Submit Expense Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitExpenseModal;
