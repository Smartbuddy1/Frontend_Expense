import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Calendar, IndianRupee, Users, CheckCircle2, Activity, Clock, ShieldCheck, Phone, ArrowUpRight, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';

const ProjectDetailModal = ({ isOpen, onClose, project, supervisors = [], teamMembers = [], expenses = [], onOpenAssign, onOpenProgress }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  useEffect(() => {
    if (isOpen && project && activeTab === 'photos') {
      fetchPhotos();
    }
  }, [isOpen, project, activeTab]);

  const fetchPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const response = await axios.get(`/api/projects/${project.id}/photos`);
      setPhotos(response.data);
    } catch (err) {
      console.error("Error fetching photos:", err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  if (!isOpen || !project) return null;

  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const totalApprovedExpenses = projectExpenses
    .filter(e => e.status === 'Approved')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const assignedMembers = teamMembers.filter(m => project.assignedTeam?.includes(m.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-slate-800/80 dark:to-slate-900">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                  {project.name}
                </h2>
                <span className="font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold shrink-0">
                  {project.id}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                <MapPin size={12} className="text-rose-500 shrink-0" /> <span className="truncate">{project.location} • {project.client}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 p-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Activity size={16} /> Overview
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 p-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'photos' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Camera size={16} /> Site Photos
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
          {activeTab === 'overview' ? (
            <>
              {/* Top Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase text-slate-500 font-semibold truncate">Total Budget</p>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">
                    ₹{project.budget?.toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase text-slate-500 font-semibold truncate">Approved Claims</p>
                  <h3 className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                    ₹{totalApprovedExpenses.toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase text-slate-500 font-semibold truncate">Live Progress</p>
                  <h3 className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                    {project.progress}%
                  </h3>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase text-slate-500 font-semibold truncate">Site Health</p>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                    project.health === 'On Track' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    project.health === 'Delayed' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {project.health}
                  </span>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-1">Scope & Objective</h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{project.description}</p>
                </div>
              )}

              {/* Supervisor and Team Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Site Supervisor Card */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2.5 sm:space-y-3 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600 shrink-0" /> Site Supervisor
                    </h4>
                    <button
                      onClick={() => { onClose(); onOpenAssign(project); }}
                      className="text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      Change <ArrowUpRight size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                      {project.supervisorName?.charAt(0) || 'S'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{project.supervisorName}</h5>
                      <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <Phone size={11} className="shrink-0" /> <span className="truncate">{project.supervisorPhone}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Field Team Members */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2.5 sm:space-y-3 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Users size={14} className="text-blue-600 shrink-0" /> Deployed Crew ({assignedMembers.length})
                    </h4>
                    <button
                      onClick={() => { onClose(); onOpenAssign(project); }}
                      className="text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      Manage <ArrowUpRight size={13} />
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {assignedMembers.length > 0 ? (
                      assignedMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 gap-2">
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 dark:text-white truncate block text-[11px] sm:text-xs">{member.name}</span>
                            <span className="text-slate-500 text-[10px] sm:text-[11px] truncate block">{member.designation}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{member.id}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-3 text-center">No individual team crew assigned yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Milestones Stepper */}
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Activity size={14} className="text-indigo-600 shrink-0" /> Milestones & Timeline
                  </h4>
                  <button
                    onClick={() => { onClose(); onOpenProgress(project); }}
                    className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    Update <ArrowUpRight size={13} />
                  </button>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  {project.milestones?.map((m, idx) => (
                    <div key={m.id || idx} className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className={`p-1 sm:p-1.5 rounded-lg shrink-0 ${
                          m.status === 'Completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                          m.status === 'In Progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' :
                          'bg-slate-200 text-slate-500 dark:bg-slate-700'
                        }`}>
                          {m.status === 'Completed' ? <CheckCircle2 size={14} /> :
                           m.status === 'In Progress' ? <Activity size={14} /> :
                           <Clock size={14} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{m.title}</p>
                          {m.targetDate && <p className="text-[10px] sm:text-[11px] text-slate-400">Target: {m.targetDate}</p>}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 ${
                        m.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        m.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4 min-h-[300px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-blue-600" /> Gallery
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {photos.length} Photos
                </span>
              </div>
              
              {loadingPhotos ? (
                <div className="flex justify-center items-center flex-1">
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                </div>
              ) : photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Camera size={32} className="text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-500">No site photos uploaded yet.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map(photo => (
                    <div key={photo.id} className="rounded-xl overflow-hidden border border-slate-200 bg-white flex flex-col">
                      <img src={photo.imageUrl} alt="Site" className="w-full h-24 object-cover" />
                      <div className="p-2 flex flex-col gap-1">
                        <span className="text-[10px] text-slate-900 font-semibold line-clamp-2">{photo.description || 'No description'}</span>
                        <div className="flex justify-between items-center mt-auto pt-1">
                          <span className="text-[9px] text-slate-500">{photo.supervisor?.name || 'Supervisor'}</span>
                          <span className="text-[9px] text-slate-400">{new Date(photo.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <span className="text-[11px] sm:text-xs text-slate-500 text-center sm:text-left">
            Timeline: {project.startDate} to {project.endDate}
          </span>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">

            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold text-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
