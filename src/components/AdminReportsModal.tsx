import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { snippetStorage } from '../services/snippetStorage';
import { ReportItem } from '../types';
import { 
  ShieldAlert, CheckCircle2, Trash2, ExternalLink, X, 
  Clock, AlertCircle, Filter, Check, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const AdminReportsModal: React.FC<AdminReportsModalProps> = ({
  isOpen,
  onClose,
  onToast
}) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportItem[]>(() => reportService.getAllReports());
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  useEffect(() => {
    const handleUpdate = () => {
      setReports(reportService.getAllReports());
    };
    window.addEventListener('codeself_reports_updated', handleUpdate);
    return () => window.removeEventListener('codeself_reports_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const filteredReports = reports.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleResolve = async (reportId: string) => {
    await reportService.updateReportStatus(reportId, 'resolved');
    onToast('Report marked as resolved.');
  };

  const handleDeleteSnippet = async (report: ReportItem) => {
    if (!report.snippetId) return;
    if (!confirm(`Are you sure you want to permanently delete reported snippet "${report.snippetTitle || report.snippetId}"?`)) {
      return;
    }

    snippetStorage.deleteSnippet(report.snippetId);
    await reportService.updateReportStatus(report.id, 'resolved', 'Snippet deleted by admin.');
    onToast('Reported snippet removed successfully.');
  };

  const handleViewSnippet = (snippetId?: string) => {
    if (!snippetId) return;
    onClose();
    navigate(`/snippet/${snippetId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Administrator Reports Inbox</h3>
                <span className="text-[10px] font-mono font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                  {reports.filter(r => r.status === 'pending').length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Community-flagged broken snippets, bug reports, and user feedback.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Guidance Banner for Admin */}
        <div className="p-3.5 bg-blue-50/70 border-b border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold block">How to handle reports:</span>
            <span>
              Each report below includes the reporter's exact feedback, error description, and target snippet.
              Click <strong>"Inspect Snippet"</strong> to run and review the code in the IDE, fix issues, or click <strong>"Delete Snippet"</strong> if it violates quality rules.
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Filter:</span>
          {(['pending', 'resolved', 'all'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filteredReports.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-slate-700">No {filter} reports found.</p>
              <p className="text-slate-500 mt-0.5">Everything is running smoothly!</p>
            </div>
          ) : (
            filteredReports.map(report => (
              <div
                key={report.id}
                className={`p-4 rounded-xl border text-xs transition-all space-y-3 ${
                  report.status === 'resolved'
                    ? 'bg-slate-50/70 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        report.type === 'snippet'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {report.type === 'snippet' ? 'Snippet Issue' : 'Website Bug'}
                      </span>
                      <span className="font-bold text-slate-900">{report.reasonLabel}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        report.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                      <span>Reported by: <strong>{report.reporterName}</strong> ({report.reporterEmail || 'Guest'})</span>
                      <span>·</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {report.snippetId && (
                      <button
                        type="button"
                        onClick={() => handleViewSnippet(report.snippetId)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    )}

                    {report.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleResolve(report.id)}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Mark as Resolved"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}

                    {report.snippetId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSnippet(report)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Broken Snippet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Snippet Context (if applicable) */}
                {report.snippetTitle && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                    <span className="text-slate-400 mr-1.5 font-medium">Target Code:</span>
                    <strong className="text-slate-900">{report.snippetTitle}</strong>
                    {report.snippetLanguage && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-200 font-mono text-slate-700">
                        {report.snippetLanguage}
                      </span>
                    )}
                  </div>
                )}

                {/* Detailed User Description */}
                <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-lg text-amber-950 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  <div className="text-[10px] uppercase font-sans font-bold text-amber-700 mb-1">User's Feedback / Error Details:</div>
                  {report.description}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
