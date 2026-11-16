import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  RefreshCw 
} from 'lucide-react';
import { 
  downloadEmployeeTemplate, 
  previewEmployeeImport, 
  commitEmployeeImport 
} from '../services/api';

export default function BulkImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setPreviewData(null);
    setSuccessResult(null);
    setLoading(true);

    try {
      const data = await previewEmployeeImport(selected);
      setPreviewData(data);
    } catch (err) {
      setError(err.message || 'Failed to parse import file.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData?.importId) return;

    setCommitting(true);
    setError(null);

    try {
      const res = await commitEmployeeImport(previewData.importId);
      setSuccessResult(res);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to commit employee import.');
    } finally {
      setCommitting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewData(null);
    setError(null);
    setSuccessResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-4xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
              <FileSpreadsheet className="w-5 h-5 text-[#C7F436]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Bulk Import Employees</h3>
              <p className="text-xs text-gray-500 font-medium">Upload CSV or Excel sheet to onboard multiple team members</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadEmployeeTemplate}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-full transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successResult ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-gray-900">Import Successful!</h4>
              <p className="text-xs text-gray-600 max-w-md">
                {successResult.message} User accounts have been provisioned and invitation emails dispatched.
              </p>
              <button
                onClick={() => { reset(); onClose(); }}
                className="mt-4 bg-black text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md hover:bg-neutral-800 transition"
              >
                Close & Refresh List
              </button>
            </div>
          ) : !previewData ? (
            /* Upload Box */
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-black rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition bg-gray-50/50 hover:bg-white"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200/80 shadow-soft-sm flex items-center justify-center mb-4 text-gray-600">
                {loading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-black" />
                ) : (
                  <UploadCloud className="w-6 h-6 text-black" />
                )}
              </div>
              <p className="text-sm font-bold text-gray-800">
                {loading ? 'Analyzing and validating rows...' : 'Click to select or drag and drop spreadsheet'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Supports .CSV and .XLSX (Up to 1,000 rows, max 5MB)</p>
            </div>
          ) : (
            /* Preview Stage */
            <div className="space-y-4">
              {/* Stat Counters */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">File: <strong className="text-black">{file?.name}</strong></span>
                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold">
                  {previewData.totalRows} Total Rows
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {previewData.validCount} Valid
                </span>
                {previewData.invalidCount > 0 && (
                  <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {previewData.invalidCount} Errors
                  </span>
                )}
              </div>

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 text-gray-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Row</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Designation</th>
                      <th className="py-2.5 px-3">Errors / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewData.rows.map((r, idx) => {
                      const isError = r.status === 'error';
                      return (
                        <tr key={idx} className={isError ? 'bg-rose-50/60 text-rose-900' : 'hover:bg-gray-50/50'}>
                          <td className="py-2 px-3 font-mono font-bold text-gray-500">#{r.row}</td>
                          <td className="py-2 px-3">
                            {isError ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900">
                                Error
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Ready
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-semibold">{r.data?.name || '-'}</td>
                          <td className="py-2 px-3">{r.data?.email || '-'}</td>
                          <td className="py-2 px-3">{r.data?.department || '-'}</td>
                          <td className="py-2 px-3">{r.data?.designation || '-'}</td>
                          <td className="py-2 px-3 text-[11px] font-medium text-rose-700">
                            {r.errors ? r.errors.join('; ') : '✓ Validated'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {previewData && !successResult && (
          <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50/60">
            <button
              onClick={reset}
              className="text-xs font-bold text-gray-500 hover:text-black transition"
            >
              Upload Different File
            </button>

            <button
              onClick={handleCommit}
              disabled={committing || previewData.validCount === 0}
              className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-extrabold px-6 py-2.5 rounded-full transition shadow-md disabled:opacity-50 active:scale-95"
            >
              {committing ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Commit {previewData.validCount} Valid Employees</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

