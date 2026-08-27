import React, { useState } from 'react';
import { X, Image as ImageIcon, CheckCircle, Calendar, MapPin, User, Eye, Download, Filter } from 'lucide-react';

export const SitePhotoGalleryModal = ({
  isOpen,
  onClose,
  projects = []
}) => {
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activePhoto, setActivePhoto] = useState(null);

  if (!isOpen) return null;

  const mockPhotos = [
    {
      id: 1,
      title: 'Foundation Excavation & Plinth PCC',
      siteName: 'Sangamner Eco Toilet (Site P1)',
      siteId: 'PRJ-SGM-01',
      stage: 'Before / Foundation',
      category: 'Civil',
      date: '2026-08-20',
      supervisor: 'Rohit Sharma',
      location: 'Sangamner Bus Stand, Ahmednagar',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80',
      status: 'Verified'
    },
    {
      id: 2,
      title: 'Prefab SS Enclosure Shell Bolting',
      siteName: 'Sangamner Eco Toilet (Site P1)',
      siteId: 'PRJ-SGM-01',
      stage: 'In Progress / Structural',
      category: 'Fabrication',
      date: '2026-08-22',
      supervisor: 'Rohit Sharma',
      location: 'Sangamner Bus Stand, Ahmednagar',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
      status: 'Verified'
    },
    {
      id: 3,
      title: '2000L Bio-Digester Microbial Manifold Plumbed',
      siteName: 'Nashik Highway Sanitation (Site P3)',
      siteId: 'PRJ-NSK-03',
      stage: 'In Progress / Plumbing',
      category: 'Bio-Plumbing',
      date: '2026-08-23',
      supervisor: 'Sagar Patil',
      location: 'Dwarka Circle, Nashik Highway',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      status: 'Verified'
    },
    {
      id: 4,
      title: 'Solar & SCADA Telemetry System Coin Board Test',
      siteName: 'Pune Smart E-Toilets (Site P2)',
      siteId: 'PRJ-PUN-02',
      stage: 'In Progress / Electrical',
      category: 'Electrical & IoT',
      date: '2026-08-24',
      supervisor: 'Amit Deshmukh',
      location: 'Shivajinagar Station, Pune',
      url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
      status: 'Verified'
    },
    {
      id: 5,
      title: 'Final Touchup & Finished Restroom Handover Ready',
      siteName: 'Pune Smart E-Toilets (Site P2)',
      siteId: 'PRJ-PUN-02',
      stage: 'After / Handover',
      category: 'Finishing',
      date: '2026-08-24',
      supervisor: 'Amit Deshmukh',
      location: 'Shivajinagar Station, Pune',
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
      status: 'Completed'
    },
    {
      id: 6,
      title: 'Structural Steel Trench Reinforcement',
      siteName: 'Nashik Highway Sanitation (Site P3)',
      siteId: 'PRJ-NSK-03',
      stage: 'Before / Foundation',
      category: 'Civil',
      date: '2026-08-19',
      supervisor: 'Sagar Patil',
      location: 'Dwarka Circle, Nashik Highway',
      url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80',
      status: 'Verified'
    }
  ];

  const filteredPhotos = mockPhotos.filter(item => {
    const matchSite = selectedSite === 'ALL' || item.siteId === selectedSite || item.siteName.includes(selectedSite);
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory || item.stage.includes(selectedCategory);
    return matchSite && matchCat;
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1.25rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        maxWidth: '920px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'fadeInUp 0.3s ease'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#0f172a',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ImageIcon size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Site Photo Gallery & Inspection Proofs</h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Live field progress photos: Before, In-Progress & Handover stages
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
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Filters Bar */}
        <div style={{
          padding: '1rem 1.75rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Filter Site:</span>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                fontWeight: '700',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="ALL">All Projects ({mockPhotos.length})</option>
              <option value="PRJ-SGM-01">Sangamner Site (P1)</option>
              <option value="PRJ-PUN-02">Pune Site (P2)</option>
              <option value="PRJ-NSK-03">Nashik Highway (P3)</option>
            </select>

            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginLeft: '0.5rem' }}>Stage:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                fontWeight: '700',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="ALL">All Stages</option>
              <option value="Before">Before / Foundation</option>
              <option value="In Progress">In Progress Work</option>
              <option value="After">After / Handover</option>
            </select>
          </div>

          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#059669' }}>
            {filteredPhotos.length} Verified Photos Found
          </span>
        </div>

        {/* Gallery Grid */}
        <div style={{
          padding: '1.5rem 1.75rem',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.25rem',
          flex: 1
        }}>
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                backgroundColor: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                <img
                  src={photo.url}
                  alt={photo.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '0.65rem',
                  left: '0.65rem',
                  backgroundColor: photo.stage.includes('After') ? '#10b981' : photo.stage.includes('Before') ? '#6366f1' : '#f59e0b',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}>
                  {photo.stage}
                </span>
              </div>
              <div style={{ padding: '0.85rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.3 }}>
                  {photo.title}
                </h4>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={12} color="#059669" /> {photo.siteName}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.74rem', color: '#94a3b8' }}>
                  <span>{photo.supervisor}</span>
                  <span>{photo.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.75rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '12px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Lightbox Preview if Active Photo Selected */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center', color: '#ffffff' }} onClick={(e) => e.stopPropagation()}>
            <img
              src={activePhoto.url}
              alt={activePhoto.title}
              style={{ maxHeight: '65vh', width: 'auto', maxWidth: '100%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
            />
            <h3 style={{ marginTop: '1rem', fontSize: '1.25rem', fontWeight: '800' }}>{activePhoto.title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.35rem 0' }}>{activePhoto.siteName} • {activePhoto.supervisor} ({activePhoto.date})</p>
            <button
              onClick={() => setActivePhoto(null)}
              style={{
                marginTop: '1rem',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SitePhotoGalleryModal;
