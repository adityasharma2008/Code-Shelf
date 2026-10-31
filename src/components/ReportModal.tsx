import React, { useState } from 'react';
import { reportService } from '../services/reportService';
import { authService } from '../services/authService';
import { ReportType, ReportReason } from '../types';
import { AlertTriangle, Flag, X, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
  reportType?: ReportType;
  snippetId?: string;
  snippetTitle?: string;
  snippetLanguage?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onToast,
  reportType = 'snippet',
  snippetId,
  snippetTitle,
  snippetLanguage
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason>(
    reportType === 'snippet' ? 'broken_code' : 'ui_bug'
  );
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUser = authService.getCurrentUser();

  const snippetReasons: Array<{ id: ReportReason; label: string; desc: string }> = [
    { id: 'broken_code', label: 'Broken Code / Runtime Failure', desc: 'Code produces compilation errors, segmentation fault, or incorrect output.' },
    { id: 'harmful_malicious', label: 'Malicious / Dangerous Code', desc: 'Contains dangerous commands, unauthorized loops, or malicious exploits.' },
    { id: 'plagiarism', label: 'Plagiarism / Copyright', desc: 'Copied directly without attribution or violates author licenses.' },
    { id: 'misleading', label: 'Misleading Title or Description', desc: 'Code does not perform what title or description advertises.' },
    { id: 'spam', label: 'Spam or Low Quality', desc: 'Empty snippet, gibberish, or irrelevant promotional text.' }
  ];

  const websiteReasons: Array<{ id: ReportReason; label: string; desc: string }> = [
    { id: 'runner_failure', label: 'Compiler / Execution Failure', desc: 'Pyodide, sql.js, or backend runner failed unexpectedly.' },
    { id: 'ui_bug', label: 'Interface or Layout Bug', desc: 'Visual overlap, broken button, mobile display issue, or Monaco editor bug.' },
    { id: 'feature_request', label: 'Feature Request / Improvement', desc: 'Suggestion for a new language, editor tool, or learning feature.' },
    { id: 'other', label: 'Other Issue', desc: 'General question, inquiry, or other platform issue.' }
  ];

  const activeReasons = reportType === 'snippet' ? snippetReasons : websiteReasons;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide specific details so the issue can be corrected.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const reasonObj = activeReasons.find(r => r.id === selectedReason);
    const res = await reportService.submitReport({
      type: reportType,
      reason: selectedReason,
      reasonLabel: reasonObj ? reasonObj.label : selectedReason,
      description: description.trim(),
      snippetId,
      snippetTitle,
      snippetLanguage,
      reporterUserId: currentUser ? currentUser.id : undefined,
      reporterName: currentUser ? currentUser.name : 'Community Member',
      reporterEmail: currentUser ? currentUser.email : undefined
    });

    setIsSubmitting(false);

    if (res.success) {
      onToast('Thank you! Your report has been submitted for administrator review.');
      setDescription('');
      onClose();
    } else {
      setError(res.error || 'Failed to submit report. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <Flag className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {reportType === 'snippet' ? 'Report Code Snippet' : 'Report Issue / Feedback'}
              </h3>
              <p className="text-xs text-slate-500">
                {reportType === 'snippet'
                  ? `Reporting: ${snippetTitle || 'Code Snippet'} (${snippetLanguage || 'Source'})`
                  : 'Report a bug, runner error, or feedback to the site administrator.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Reason <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {activeReasons.map(r => (
                <label
                  key={r.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedReason === r.id
                      ? 'bg-rose-50/70 border-rose-300 text-rose-950 font-medium ring-1 ring-rose-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={() => setSelectedReason(r.id)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="font-semibold">{r.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Explanation <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please explain what is wrong, error messages, or exact steps so the administrator knows what needs to be fixed..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:bg-white focus:ring-1 focus:ring-rose-600 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
