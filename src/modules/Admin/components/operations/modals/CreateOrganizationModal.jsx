import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const districtsByState = {
  Maharashtra: [
    'Ahmednagar', 'Pune', 'Nashik', 'Kolhapur', 'Chhatrapati Sambhajinagar',
    'Mumbai City', 'Mumbai Suburban', 'Thane', 'Satara', 'Solapur', 'Sangli', 'Nagpur', 'Jalgaon'
  ],
  'Jammu & Kashmir': ['Jammu', 'Srinagar', 'Udhampur', 'Kathua'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  Karnataka: ['Bengaluru Urban', 'Belagavi', 'Mysuru', 'Hubballi-Dharwad'],
  Goa: ['North Goa', 'South Goa']
};

const citiesByDistrict = {
  Ahmednagar: ['Sangamner', 'Ahmednagar', 'Shirdi', 'Rahata', 'Kopargaon', 'Shrirampur'],
  Pune: ['Pune', 'Shivajinagar', 'Swargate', 'Pimpri-Chinchwad', 'Hadapsar', 'Baramati'],
  Nashik: ['Nashik', 'Malegaon', 'Sinnar', 'Igatpuri'],
  Kolhapur: ['Kolhapur', 'Vaibhavwadi', 'Ichalkaranji', 'Jaysingpur'],
  Jammu: ['Satwari Jammu', 'Jammu City', 'R.S. Pura']
};

const CreateOrganizationModal = ({
  isOpen,
  onClose,
  onSave,
  editingOrg = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    website: '',
    type: '',
    state: 'Maharashtra',
    district: 'Ahmednagar',
    city: 'Sangamner',
    contactPerson: '',
    contactMobile: '',
    email: '',
    password: '',
    logoName: ''
  });

  useEffect(() => {
    if (editingOrg) {
      setFormData({
        name: editingOrg.name || '',
        phone: editingOrg.phone || '',
        address: editingOrg.address || '',
        website: editingOrg.website || '',
        type: editingOrg.type || 'Municipal Council',
        state: editingOrg.state || 'Maharashtra',
        district: editingOrg.district || 'Ahmednagar',
        city: editingOrg.city || 'Sangamner',
        contactPerson: editingOrg.contactPerson || '',
        contactMobile: editingOrg.contactMobile || editingOrg.phone || '',
        email: editingOrg.email || '',
        password: editingOrg.password || 'Aarya@123',
        logoName: editingOrg.logoName || ''
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        address: '',
        website: '',
        type: '',
        state: 'Maharashtra',
        district: 'Ahmednagar',
        city: 'Sangamner',
        contactPerson: '',
        contactMobile: '',
        email: '',
        password: '',
        logoName: ''
      });
    }
  }, [editingOrg, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter Client Name');
      return;
    }

    const orgToSave = {
      ...formData,
      id: editingOrg ? editingOrg.id : `ORG-${Date.now().toString().slice(-4)}`,
      code: editingOrg ? editingOrg.code : formData.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 5) + '-MH',
      shortName: formData.name.length > 25 ? formData.name.slice(0, 22) + '...' : formData.name,
      activeProjectsCount: editingOrg ? (editingOrg.activeProjectsCount || 0) : 0,
      totalContractValue: editingOrg ? (editingOrg.totalContractValue || 0) : 0,
      status: editingOrg ? (editingOrg.status || 'Active') : 'Active',
      verifiedDate: editingOrg ? editingOrg.verifiedDate : new Date().toISOString().split('T')[0]
    };

    onSave(orgToSave);
    toast.success(editingOrg ? 'Client Details updated successfully!' : 'Client registered successfully!');
    onClose();
  };

  const currentDistricts = districtsByState[formData.state] || ['Ahmednagar', 'Pune', 'Nashik', 'Kolhapur'];
  const currentCities = citiesByDistrict[formData.district] || ['Sangamner', 'Pune', 'Nashik', 'Kolhapur'];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1.25rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid #cbd5e1',
        fontFamily: "'Cambria', Georgia, serif"
      }}>
        {/* Header: Organization Details title with close X */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Organization Details
          </h2>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.35rem',
              borderRadius: '8px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Organization Details Fields */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Organization Name & Organization Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune Municipal Corporation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.96rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Organization Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 20 2550 1200"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.96rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Organization Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  Organization Address *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Main Administrative Building, Road, City - Pincode"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.96rem',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Organization Type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  Organization Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.96rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Select Type --</option>
                  <option value="Municipal Corporation">Municipal Corporation</option>
                  <option value="Municipal Council">Municipal Council</option>
                  <option value="Smart City SPV">Smart City Development Corp (SPV)</option>
                  <option value="Central Highway Authority">Central Highway Authority (NHAI/MSRDC)</option>
                  <option value="Grampanchayat / Rural Body">Grampanchayat Office</option>
                  <option value="Airport Authority">Airports Authority of India (AAI)</option>
                  <option value="Private / Commercial Client">Private / Commercial Client</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Location Details */}
          <div>
            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 1rem 0',
              paddingBottom: '0.45rem',
              borderBottom: '1px solid #e2e8f0'
            }}>
              Location Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {/* State */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    State *
                  </label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value, district: '', city: '' })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.96rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">-- Select State --</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Jammu & Kashmir">Jammu & Kashmir</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Goa">Goa</option>
                  </select>
                </div>

                {/* District */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    District *
                  </label>
                  <select
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value, city: '' })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.96rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">-- Select District --</option>
                    {currentDistricts.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City */}
              <div>
                <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  City *
                </label>
                <select
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.96rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Select City --</option>
                  {currentCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Sangamner">Sangamner</option>
                  <option value="Pune">Pune</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Kolhapur">Kolhapur</option>
                  <option value="Vaibhavwadi">Vaibhavwadi</option>
                  <option value="Satwari Jammu">Satwari Jammu</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Contact Person Details */}
          <div>
            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 1rem 0',
              paddingBottom: '0.45rem',
              borderBottom: '1px solid #e2e8f0'
            }}>
              Contact Person Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Contact Name & Contact Mobile */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.96rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Contact Mobile
                  </label>
                  <input
                    type="text"
                    placeholder="Optional (Defaults to Organization Phone)"
                    value={formData.contactMobile}
                    onChange={(e) => setFormData({ ...formData, contactMobile: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.96rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Contact Email & Password */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="contact@org.gov.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.96rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.96rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                    8-10 characters
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.85rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.65rem 1.75rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.98rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              {editingOrg ? 'Update Organization Details' : 'Save Organization Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrganizationModal;
