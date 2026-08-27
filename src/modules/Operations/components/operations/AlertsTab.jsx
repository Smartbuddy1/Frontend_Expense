import React, { useState } from 'react';
import { 
  AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2, Clock, 
  MapPin, User, ArrowRight, Filter, Search, PhoneCall, Check, ExternalLink 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './operations-dashboard.css';

export const AlertsTab = ({ onSelectProject }) => {
  const { language } = useLanguage();
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-SGM-01',
      projectCode: 'Sangamner-P1',
      projectName: 'Sangamner Eco Toilet Installation - Site P1',
      supervisor: 'Rohit Sharma',
      phone: '+91 98220 11223',
      location: 'Sangamner Bus Stand, Maharashtra',
      type: 'Municipal Delay',
      priority: 'High',
      title: 'Municipal Water Hookup Line Approval Delayed',
      description: 'Excavation and underground pipeline laying complete. Awaiting municipal junction connection approval from Sangamner Council.',
      time: '1 hour ago',
      status: 'Open',
      actionTaken: 'Escalated to local ward officer for expedited permission.'
    },
    {
      id: 'ALT-NSK-02',
      projectCode: 'Nashik-P3',
      projectName: 'Nashik Highway Eco Sanitation - Site P3',
      supervisor: 'Sagar Patil',
      phone: '+91 94220 88990',
      location: 'Highway KM 145, Nashik',
      type: 'Safety & Quality',
      priority: 'Medium',
      title: 'Bio-Digester Valve Seal Hydrostatic Pressure Check Due',
      description: 'Hydrostatic pressure check scheduled before backfilling trench. Requires QC sign-off before concrete slab casing.',
      time: '3 hours ago',
      status: 'Open',
      actionTaken: 'QC technician dispatched to site with pressure calibration gauge.'
    },
    {
      id: 'ALT-PUN-03',
      projectCode: 'Pune-P2',
      projectName: 'Pune Smart City E-Toilet Cluster - Site P2',
      supervisor: 'Amit Deshmukh',
      phone: '+91 98230 45678',
      location: 'Shivajinagar & Swargate Junction, Pune',
      type: 'Material Shortage',
      priority: 'Medium',
      title: 'Additional 4-Core Armored Cable Required (40m)',
      description: 'Site supervisor Amit requested 40m 4-core armored electrical cable for final hookup between distribution pillar and smart coin kiosk.',
      time: '5 hours ago',
      status: 'Open',
      actionTaken: 'Local procurement purchase order initiated.'
    }
  ]);

  const handleResolve = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filterType === 'all' || alert.status.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = alert.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.supervisor.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const openCount = alerts.filter(a => a.status === 'Open').length;
  const highCount = alerts.filter(a => a.priority === 'High' && a.status === 'Open').length;

  return (
    <div className="dash-container">
      {/* Header */}
      <div className="dash-header">
        <h1 className="dash-header-title">
          {language === 'mr' ? 'साईट व ऑपरेशन्स' : 'Site & Operational'}{' '}
          <span>{language === 'mr' ? 'महत्त्वाचे अलर्ट्स' : 'Alerts'}</span>
        </h1>
        <p className="dash-header-sub">
          {language === 'mr' 
            ? 'सुरक्षा, स्थानिक परवानगी, साहित्याचा तुटवडा आणि त्वरित लक्ष देण्याच्या सूचना.' 
            : 'Live site safety, municipal clearances, material shortages & critical escalations across active projects.'}
        </p>
      </div>

      {/* KPI Stats Strip */}
      <div className="dash-stats-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <span className="dash-stat-label">Total Active Alerts</span>
            <div className="dash-stat-icon-box" style={{ backgroundColor: '#ef4444' }}>
              <AlertTriangle size={18} strokeWidth={2.2} />
            </div>
          </div>
          <h3 className="dash-stat-val">{openCount}</h3>
          <span className="dash-status-pill" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
            ● Requires Attention
          </span>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <span className="dash-stat-label">High Priority</span>
            <div className="dash-stat-icon-box" style={{ backgroundColor: '#ea580c' }}>
              <ShieldAlert size={18} strokeWidth={2.2} />
            </div>
          </div>
          <h3 className="dash-stat-val">{highCount}</h3>
          <span className="dash-status-pill" style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5' }}>
            1 Municipal Delay
          </span>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <span className="dash-stat-label">Material Shortages</span>
            <div className="dash-stat-icon-box" style={{ backgroundColor: '#f59e0b' }}>
              <AlertCircle size={18} strokeWidth={2.2} />
            </div>
          </div>
          <h3 className="dash-stat-val">1</h3>
          <span className="dash-status-pill" style={{ background: '#fffbeb', color: '#b45309', borderColor: '#fef3c7' }}>
            Pune Cable Order
          </span>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <span className="dash-stat-label">Average Resolution Time</span>
            <div className="dash-stat-icon-box" style={{ backgroundColor: '#10b981' }}>
              <Clock size={18} strokeWidth={2.2} />
            </div>
          </div>
          <h3 className="dash-stat-val">&lt; 4 hrs</h3>
          <span className="dash-status-pill">
            ✓ Quick Turnaround
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text"
            placeholder="Search project code, alert title, or supervisor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.4rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'open', label: `Open (${openCount})` },
            { id: 'high', label: 'High Priority' },
            { id: 'resolved', label: 'Resolved' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: filterType === f.id ? '#2563eb' : '#e2e8f0',
                backgroundColor: filterType === f.id ? '#eff6ff' : '#ffffff',
                color: filterType === f.id ? '#2563eb' : '#64748b',
                fontWeight: filterType === f.id ? '700' : '600',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {filteredAlerts.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <CheckCircle2 size={42} style={{ color: '#10b981', margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>All Clear!</h3>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>No alerts matching your selected criteria.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: `1px solid ${alert.status === 'Resolved' ? '#e2e8f0' : alert.priority === 'High' ? '#fecaca' : '#fed7aa'}`,
                padding: '1.15rem 1.35rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                opacity: alert.status === 'Resolved' ? 0.7 : 1
              }}
            >
              {/* Alert Top Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    fontWeight: '800',
                    fontSize: '0.75rem',
                    border: '1px solid #bfdbfe'
                  }}>
                    {alert.projectCode}
                  </span>

                  <span style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    backgroundColor: alert.priority === 'High' ? '#fef2f2' : '#fffbeb',
                    color: alert.priority === 'High' ? '#dc2626' : '#b45309',
                    fontWeight: '700',
                    fontSize: '0.72rem',
                    border: `1px solid ${alert.priority === 'High' ? '#fecaca' : '#fef3c7'}`
                  }}>
                    ● {alert.priority} Priority
                  </span>

                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '500' }}>
                    {alert.type} • {alert.time}
                  </span>
                </div>

                {/* Status Tag */}
                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  backgroundColor: alert.status === 'Resolved' ? '#ecfdf5' : '#fef2f2',
                  color: alert.status === 'Resolved' ? '#059669' : '#dc2626',
                  fontWeight: '800',
                  fontSize: '0.72rem',
                  border: `1px solid ${alert.status === 'Resolved' ? '#a7f3d0' : '#fecaca'}`
                }}>
                  {alert.status === 'Resolved' ? '✓ Resolved' : '● Open Notice'}
                </span>
              </div>

              {/* Alert Title & Description */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                  {alert.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                  {alert.description}
                </p>
              </div>

              {/* Supervisor & Action Strip */}
              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <User size={14} style={{ color: '#2563eb' }} />
                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{alert.supervisor}</span>
                  </div>

                  <a href={`tel:${alert.phone.replace(/[^0-9]/g, '')}`} style={{ color: '#ea580c', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <PhoneCall size={12} /> {alert.phone}
                  </a>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={13} style={{ color: '#64748b' }} />
                    <span>{alert.location}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleResolve(alert.id)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: alert.status === 'Resolved' ? '#ffffff' : '#f8fafc',
                      color: alert.status === 'Resolved' ? '#2563eb' : '#0f172a',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    {alert.status === 'Resolved' ? 'Reopen Alert' : '✓ Mark Resolved'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsTab;
