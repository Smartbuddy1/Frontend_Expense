import React, { useState } from 'react';
import { 
  AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2, Clock, 
  MapPin, User, ArrowRight, Filter, Search, PhoneCall, Check, ExternalLink,
  Printer, Download, FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
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
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'Resolved' ? 'Open' : 'Resolved' } : a));
  };

  const openCount = alerts.filter(a => a.status === 'Open').length;
  const highCount = alerts.filter(a => a.priority === 'High' && a.status === 'Open').length;
  const materialCount = alerts.filter(a => (a.type?.toLowerCase().includes('material') || a.title?.toLowerCase().includes('cable')) && a.status === 'Open').length;

  const filteredAlerts = alerts.filter(alert => {
    let matchesFilter = true;
    if (filterType === 'open') matchesFilter = alert.status === 'Open';
    else if (filterType === 'high') matchesFilter = alert.priority === 'High' && alert.status === 'Open';
    else if (filterType === 'material') matchesFilter = alert.type?.toLowerCase().includes('material') || alert.title?.toLowerCase().includes('cable') || alert.title?.toLowerCase().includes('material');
    else if (filterType === 'resolved') matchesFilter = alert.status === 'Resolved';

    const matchesSearch = alert.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.supervisor.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // 1-Click PDF Export
  const handleExportPDF = () => {
    try {
      const columns = ['Alert ID', 'Project Site', 'Location', 'Supervisor', 'Type', 'Priority', 'Status', 'Issue Title'];
      const rows = filteredAlerts.map(a => [
        a.id || a.projectCode,
        a.projectName,
        a.location,
        `${a.supervisor}\n${a.phone}`,
        a.type || 'General',
        a.priority || 'Normal',
        a.status || 'Open',
        a.title
      ]);
      exportToPDF('AARYA_INNOVTECH_Site_Alerts_Report', columns, rows, 'Official Site Issues, Safety & Material Requests Audit');
      toast.success(language === 'mr' ? 'अलर्ट्स PDF डाऊनलोड झाली!' : 'Alerts PDF exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  // 1-Click Excel / CSV Export
  const handleExportExcel = () => {
    try {
      const columns = ['Alert ID', 'Project Code', 'Project Name', 'Location', 'Supervisor', 'Phone', 'Type', 'Priority', 'Status', 'Title', 'Description', 'Action Taken'];
      const rows = filteredAlerts.map(a => [
        a.id,
        a.projectCode,
        a.projectName,
        a.location,
        a.supervisor,
        a.phone,
        a.type,
        a.priority,
        a.status,
        a.title,
        a.description,
        a.actionTaken || '-'
      ]);
      exportToExcel('AARYA_INNOVTECH_Site_Alerts', columns, rows);
      toast.success(language === 'mr' ? 'अलर्ट्स Excel/CSV डाऊनलोड झाली!' : 'Alerts Excel exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export Excel');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dash-container">
      {/* Header with Title and Action Buttons (Print, Excel, PDF) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '0.5rem'
      }}>
        <div>
          <h1 className="dash-header-title" style={{ margin: 0, lineHeight: 1.2 }}>
            {language === 'mr' ? 'साईट व ऑपरेशन्स' : 'Site & Operational'}{' '}
            <span>{language === 'mr' ? 'महत्त्वाचे अलर्ट्स' : 'Alerts'}</span>
          </h1>
          <p className="dash-header-sub" style={{ margin: '0.25rem 0 0 0' }}>
            {language === 'mr' 
              ? 'सुरक्षा, स्थानिक परवानगी, साहित्याचा तुटवडा आणि त्वरित लक्ष देण्याच्या सूचना.' 
              : 'Live site safety, municipal clearances, material shortages & critical escalations across active projects.'}
          </p>
        </div>

        {/* Top Right Action Buttons: Print, Excel, PDF */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* 🖨️ Print Button */}
          <button
            onClick={handlePrint}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '0.92rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <Printer size={16} style={{ color: '#0f172a' }} />
            <span>Print</span>
          </button>

          {/* 📄 Excel Button */}
          <button
            onClick={handleExportExcel}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: '1.5px solid #16a34a',
              backgroundColor: '#ffffff',
              color: '#16a34a',
              fontSize: '0.92rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0fdf4';
              e.currentTarget.style.borderColor = '#15803d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#16a34a';
            }}
          >
            <FileSpreadsheet size={16} style={{ color: '#16a34a' }} />
            <span>Excel</span>
          </button>

          {/* 📥 PDF Button */}
          <button
            onClick={handleExportPDF}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: '1.5px solid #dc2626',
              backgroundColor: '#ffffff',
              color: '#dc2626',
              fontSize: '0.92rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.borderColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#dc2626';
            }}
          >
            <Download size={16} style={{ color: '#dc2626' }} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip (3 Core Interactive Summary Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        width: '100%'
      }}>
        {/* Card 1: Open Alerts -> Filters Open */}
        <div 
          onClick={() => setFilterType('open')}
          style={{
            backgroundColor: filterType === 'open' ? '#fff1f2' : '#ffffff',
            borderRadius: '14px',
            border: filterType === 'open' ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
            borderLeft: '4px solid #ef4444',
            padding: '1rem 1.25rem',
            boxShadow: filterType === 'open' ? '0 6px 16px rgba(239, 68, 68, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = filterType === 'open' ? '0 6px 16px rgba(239, 68, 68, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)';
          }}
          title="Click to filter Open Alerts"
        >
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Open Alerts</span>
          <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#ef4444', marginTop: '0.15rem' }}>{openCount} Alerts</div>
        </div>

        {/* Card 2: Emergency -> Filters High Priority */}
        <div 
          onClick={() => setFilterType('high')}
          style={{
            backgroundColor: filterType === 'high' ? '#fff7ed' : '#ffffff',
            borderRadius: '14px',
            border: filterType === 'high' ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
            borderLeft: '4px solid #ea580c',
            padding: '1rem 1.25rem',
            boxShadow: filterType === 'high' ? '0 6px 16px rgba(234, 88, 12, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(234, 88, 12, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = filterType === 'high' ? '0 6px 16px rgba(234, 88, 12, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)';
          }}
          title="Click to filter Emergency High Priority Issues"
        >
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Emergency</span>
          <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#ea580c', marginTop: '0.15rem' }}>{highCount} Issues</div>
        </div>

        {/* Card 3: Material Shortage -> Filters Material Requests */}
        <div 
          onClick={() => setFilterType('material')}
          style={{
            backgroundColor: filterType === 'material' ? '#fefce8' : '#ffffff',
            borderRadius: '14px',
            border: filterType === 'material' ? '1.5px solid #eab308' : '1px solid #e2e8f0',
            borderLeft: '4px solid #eab308',
            padding: '1rem 1.25rem',
            boxShadow: filterType === 'material' ? '0 6px 16px rgba(234, 179, 8, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(234, 179, 8, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = filterType === 'material' ? '0 6px 16px rgba(234, 179, 8, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)';
          }}
          title="Click to filter Material Shortage Requests"
        >
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Material Shortage</span>
          <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#ca8a04', marginTop: '0.15rem' }}>{materialCount || 1} Request</div>
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
            { id: 'high', label: 'Emergency' },
            { id: 'material', label: `Material (${materialCount || 1})` },
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

      {/* Horizontal Alerts Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        width: '100%'
      }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          {filteredAlerts.length === 0 ? (
            <div style={{
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <CheckCircle2 size={42} style={{ color: '#10b981', margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>All Clear!</h3>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>No alerts matching your selected criteria.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1.5px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <th style={{ padding: '0.95rem 1.25rem', whiteSpace: 'nowrap' }}>PROJECT SITE</th>
                  <th style={{ padding: '0.95rem 1rem', whiteSpace: 'nowrap' }}>SUPERVISOR</th>
                  <th style={{ padding: '0.95rem 1rem', whiteSpace: 'nowrap', textAlign: 'center' }}>STATUS</th>
                  <th style={{ padding: '0.95rem 1.25rem', whiteSpace: 'nowrap', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert, idx) => (
                  <tr
                    key={alert.id}
                    style={{
                      borderBottom: idx === filteredAlerts.length - 1 ? 'none' : '1px solid #f1f5f9',
                      backgroundColor: alert.status === 'Resolved' ? '#fcfcfc' : '#ffffff',
                      transition: 'background-color 0.15s ease',
                      opacity: alert.status === 'Resolved' ? 0.65 : 1
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = alert.status === 'Resolved' ? '#fcfcfc' : '#ffffff'}
                  >

                    {/* Project Site */}
                    <td style={{ padding: '1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.88rem' }}>
                        {alert.projectName}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={11} style={{ color: '#ef4444' }} />
                        <span>{alert.location}</span>
                      </div>
                    </td>

                    {/* Supervisor */}
                    <td style={{ padding: '1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.86rem' }}>
                        {alert.supervisor}
                      </div>
                      <a 
                        href={`tel:${alert.phone.replace(/[^0-9]/g, '')}`}
                        style={{ fontSize: '0.76rem', color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem', fontWeight: '600' }}
                      >
                        <PhoneCall size={11} /> {alert.phone}
                      </a>
                    </td>

                    {/* Status & Time */}
                    <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{
                        padding: '0.22rem 0.65rem',
                        borderRadius: '9999px',
                        backgroundColor: alert.status === 'Resolved' ? '#ecfdf5' : '#fef2f2',
                        color: alert.status === 'Resolved' ? '#059669' : '#dc2626',
                        fontWeight: '800',
                        fontSize: '0.74rem',
                        border: `1px solid ${alert.status === 'Resolved' ? '#a7f3d0' : '#fecaca'}`,
                        display: 'inline-block'
                      }}>
                        {alert.status === 'Resolved' ? '✓ Resolved' : '● Open'}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        {alert.time}
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: alert.status === 'Resolved' ? '#ffffff' : '#f8fafc',
                          color: alert.status === 'Resolved' ? '#2563eb' : '#0f172a',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#2563eb'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = alert.status === 'Resolved' ? '#ffffff' : '#f8fafc'; e.currentTarget.style.color = alert.status === 'Resolved' ? '#2563eb' : '#0f172a'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                      >
                        <Check size={13} />
                        <span>{alert.status === 'Resolved' ? 'Reopen' : 'Resolve'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsTab;
