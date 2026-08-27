import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Activity, CheckCircle2, AlertCircle, Clock, Calendar, Users, CloudSun, Camera } from 'lucide-react';

const UpdateProgressModal = ({ isOpen, onClose, project, onUpdateProgress, supervisors }) => {
  const [progress, setProgress] = useState(0);
  const [health, setHealth] = useState('On Track');
  const [milestones, setMilestones] = useState([]);
  const [logSummary, setLogSummary] = useState('');
  const [workforceCount, setWorkforceCount] = useState(25);
  const [issuesReported, setIssuesReported] = useState('');
  const [weather, setWeather] = useState('Clear, 28°C');

  useEffect(() => {
    if (project) {
      setProgress(project.progress || 0);
      setHealth(project.health || 'On Track');
      setMilestones(project.milestones || []);
      setLogSummary('');
      setWorkforceCount(project.teamCount * 3 || 25);
      setIssuesReported('');
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const toggleMilestoneStatus = (index) => {
    const updated = [...milestones];
    const currentStatus = updated[index].status;
    if (currentStatus === 'Pending') updated[index].status = 'In Progress';
    else if (currentStatus === 'In Progress') updated[index].status = 'Completed';
    else updated[index].status = 'Pending';
    setMilestones(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const previousProgress = project.progress || 0;
    const diff = Number(progress) - previousProgress;
    const progressDiffText = diff >= 0 ? `+${diff}%` : `${diff}%`;

    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      projectId: project.id,
      projectName: project.name,
      supervisor: project.supervisorName || 'Site Supervisor',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      progressAdded: progressDiffText,
      currentOverallProgress: Number(progress),
      statusTag: health,
      workSummary: logSummary || 'Daily operations milestone progress logged successfully.',
      workforceCount: Number(workforceCount),
      issuesReported: issuesReported || 'None reported.',
      weather,
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=600&auto=format&fit=crop&q=60'
    };

    onUpdateProgress({
      projectId: project.id,
      progress: Number(progress),
      health,
      milestones,
      status: Number(progress) === 100 ? 'Completed' : project.status === 'Planning' && Number(progress) > 0 ? 'In Progress' : project.status,
      newLog
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-slate-800/80 dark:to-slate-900">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0">
              <TrendingUp size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                Update Site Progress & Milestones
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Log live execution status for <span className="font-semibold text-blue-600 dark:text-blue-400">{project.name}</span>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
          {/* Progress Slider */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Completion</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{progress}% Complete</h3>
              </div>
              <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold ${
                health === 'On Track' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                health === 'At Risk' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' :
                health === 'Delayed' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' :
                'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
              }`}>
                {health}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full h-2.5 sm:h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 font-medium">
              <span>0% (Kickoff)</span>
              <span>50% (Midway)</span>
              <span>100% (Handover)</span>
            </div>
          </div>

          {/* Health Status Selection */}
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 sm:mb-2">
              Project Health & Risk Flag
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'On Track', color: 'border-emerald-500 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30' },
                { name: 'At Risk', color: 'border-amber-500 text-amber-600 bg-amber-50/50 dark:bg-amber-950/30' },
                { name: 'Delayed', color: 'border-rose-500 text-rose-600 bg-rose-50/50 dark:bg-rose-950/30' },
                { name: 'Completed', color: 'border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-950/30' },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setHealth(item.name)}
                  className={`py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all ${
                    health === item.name ? `${item.color} ring-2 ring-blue-500/20` : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Milestone Check-off */}
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span>Execution Milestones (Click to toggle)</span>
              <span className="text-[10px] sm:text-[11px] text-blue-600 dark:text-blue-400 font-normal">Tap to advance</span>
            </label>
            <div className="space-y-1.5 sm:space-y-2">
              {milestones.map((m, idx) => (
                <div
                  key={m.id || idx}
                  onClick={() => toggleMilestoneStatus(idx)}
                  className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-all gap-2"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className={`p-1 sm:p-1.5 rounded-lg shrink-0 ${
                      m.status === 'Completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                      m.status === 'In Progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' :
                      'bg-slate-100 text-slate-400 dark:bg-slate-700'
                    }`}>
                      {m.status === 'Completed' ? <CheckCircle2 size={15} /> :
                       m.status === 'In Progress' ? <Activity size={15} /> :
                       <Clock size={15} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">{m.title}</p>
                      {m.targetDate && <p className="text-[10px] sm:text-xs text-slate-400">Target: {m.targetDate}</p>}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 ${
                    m.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    m.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Site Activity Log Details */}
          <div className="space-y-3 sm:space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Camera size={14} className="text-blue-500" />
              Daily Site Log Report & Activity Notes
            </h4>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Today's Work Summary & Achievements *
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Completed level 3 slab rebar tying, ready-mix poured..."
                value={logSummary}
                onChange={(e) => setLogSummary(e.target.value)}
                className="w-full px-3 sm:px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Users size={13} /> Active Workforce / Labor Count
                </label>
                <input
                  type="number"
                  value={workforceCount}
                  onChange={(e) => setWorkforceCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <CloudSun size={13} /> Site Weather Condition
                </label>
                <input
                  type="text"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <AlertCircle size={13} className="text-amber-500" /> Site Issues / Blockers (if any)
              </label>
              <input
                type="text"
                placeholder="e.g. Awaiting delivery of 2-inch valves from supplier"
                value={issuesReported}
                onChange={(e) => setIssuesReported(e.target.value)}
                className="w-full px-3 sm:px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px]"
            >
              <CheckCircle2 size={16} />
              Save Progress & Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProgressModal;

