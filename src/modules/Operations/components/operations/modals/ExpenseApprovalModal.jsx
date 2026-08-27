import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, FileText, IndianRupee, Calendar, User, Building, AlertTriangle, ExternalLink } from 'lucide-react';

const ExpenseApprovalModal = ({ isOpen, onClose, expense, onApprove, onReject }) => {
  const [reviewNote, setReviewNote] = useState('');
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

  if (!isOpen || !expense) return null;

  const handleConfirm = () => {
    if (actionType === 'reject' && !reviewNote.trim()) {
      alert('Please provide a mandatory reason for rejecting this expense claim.');
      return;
    }

    if (actionType === 'approve') {
      onApprove(expense.id, reviewNote || 'Approved for site operational expenditure.');
    } else if (actionType === 'reject') {
      onReject(expense.id, reviewNote);
    }
    setReviewNote('');
    setActionType(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-slate-800/80 dark:to-slate-900">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20 shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                  Review Expense Claim
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shrink-0 ${
                  expense.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                  expense.status === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  {expense.status}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Claim: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{expense.id}</span> • Inv: {expense.invoiceNumber}
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
          {/* Top Amount Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-lg min-w-0">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Claimed Amount</p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-1 mt-1 truncate">
                <span>₹</span>{expense.amount?.toLocaleString('en-IN')}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 font-medium truncate">{expense.title}</p>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
              <span className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                <span className="text-amber-400 font-bold">{expense.category}</span>
              </span>
              <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1">
                <Calendar size={12} /> {expense.date}
              </p>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-500 uppercase">
                <Building size={13} className="text-blue-500 shrink-0" /> Project
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{expense.projectName}</p>
              <p className="text-[11px] text-slate-500 font-mono">ID: {expense.projectId}</p>
            </div>

            <div className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-500 uppercase">
                <User size={13} className="text-emerald-500 shrink-0" /> Submitted By
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{expense.submittedBy}</p>
              <p className="text-[11px] text-slate-500">{expense.submitterRole || 'Site Supervisor'}</p>
            </div>
          </div>

          {/* Vendor & Justification */}
          <div className="space-y-2.5 sm:space-y-3">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Vendor / Payee</p>
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">{expense.vendor}</p>
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Site Supervisor Justification</p>
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{expense.notes}"
              </div>
            </div>
          </div>

          {/* Receipt Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">Tax Invoice / Receipt</p>
              {expense.receiptUrl && (
                <a 
                  href={expense.receiptUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                >
                  Open Full <ExternalLink size={12} />
                </a>
              )}
            </div>
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 sm:max-h-56 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <img 
                src={expense.receiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60'} 
                alt="Invoice receipt preview"
                className="w-full h-full object-cover max-h-48 sm:max-h-56 opacity-90 hover:opacity-100 transition-opacity" 
              />
            </div>
          </div>

          {/* Previous Review Remarks if any */}
          {expense.reviewedBy && (
            <div className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Reviewed by: {expense.reviewedBy} ({expense.reviewedAt})</p>
              <p className="text-xs text-slate-500 mt-1">Remarks: {expense.reviewNotes || 'No specific notes recorded.'}</p>
            </div>
          )}

          {/* Action Decision Area */}
          {expense.status === 'Pending' && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Approver's Notes / Audit Comments
              </label>
              <textarea
                rows={2}
                placeholder="Enter audit approval remarks, accounting ledger code, or rejection reasons..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition-colors"
          >
            Close
          </button>

          {expense.status === 'Pending' ? (
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => { setActionType('reject'); setTimeout(handleConfirm, 50); }}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <XCircle size={16} />
                Reject
              </button>
              <button
                type="button"
                onClick={() => { setActionType('approve'); setTimeout(handleConfirm, 50); }}
                className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1.5 transition-all hover:translate-y-[-1px]"
              >
                <CheckCircle2 size={16} />
                + Approve & Forward
              </button>
            </div>
          ) : (
            <span className="text-[11px] sm:text-xs text-slate-500 italic text-center sm:text-left">
              Finalized ({expense.status}).
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseApprovalModal;

