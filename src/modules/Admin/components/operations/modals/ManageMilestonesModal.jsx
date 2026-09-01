import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Activity } from 'lucide-react';

const ManageMilestonesModal = ({ isOpen, onClose, project, onAddMilestone, onDeleteMilestone }) => {
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  
  if (!isOpen || !project) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAddMilestone(project.id, { title: title.trim(), targetDate });
    setTitle('');
    setTargetDate('');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1300,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid #e2e8f0',
        animation: 'fadeInUp 0.25s ease'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#0f172a',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
             <Activity size={20} color="#6366f1" />
             <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>Manage Milestones</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: '700' }}>Add New Milestone</h4>
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <div>
                 <input 
                   type="text" 
                   placeholder="Milestone Title (e.g., Foundation Completed)" 
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   required
                   style={{
                     width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', 
                     border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box'
                   }}
                 />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                 <div style={{ flex: 1, position: 'relative' }}>
                   <Calendar size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                   <input 
                     type="date" 
                     value={targetDate}
                     onChange={(e) => setTargetDate(e.target.value)}
                     style={{
                       width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px', 
                       border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box'
                     }}
                   />
                 </div>
                 <button 
                   type="submit"
                   style={{
                     padding: '0 1.25rem', backgroundColor: '#2563eb', color: '#ffffff', 
                     border: 'none', borderRadius: '10px', fontWeight: '700', 
                     display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'
                   }}
                 >
                   <Plus size={16} /> Add
                 </button>
              </div>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Existing Milestones</h4>
            {(!project.milestones || project.milestones.length === 0) ? (
               <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                 No milestones added yet.
               </div>
            ) : (
              project.milestones.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#ffffff' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{m.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Target: {m.targetDate ? new Date(m.targetDate).toLocaleDateString() : 'Not Set'} &nbsp;•&nbsp; Status: {m.status}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteMilestone(project.id, m.id)}
                    style={{
                      background: 'transparent', border: 'none', color: '#ef4444', 
                      cursor: 'pointer', padding: '0.4rem', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="Delete Milestone"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMilestonesModal;
