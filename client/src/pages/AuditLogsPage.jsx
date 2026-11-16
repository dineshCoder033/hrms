import React, { useEffect, useState } from 'react';
import { ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAuditLogs } from '../services/api';

export default function AuditLogsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [entityType, setEntityType] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = async (page = 1) => {
    try {
      setLoading(true);
      const data = await fetchAuditLogs({ page, limit: 20, entityType: entityType || undefined });
      setItems(data.items || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
  }, [entityType]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Audit Logs</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Compliance trail for leave approvals, payroll payouts, and HR actions
          </p>
        </div>

        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="px-3 py-2 rounded-full bg-white border border-gray-200 text-xs font-semibold"
        >
          <option value="">All Entities</option>
          <option value="Leave">Leave</option>
          <option value="Payroll">Payroll</option>
          <option value="Employee">Employee</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft-sm overflow-x-auto">
        {loading ? (
          <p className="p-8 text-center text-xs text-gray-400">Loading audit logs...</p>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">No audit entries recorded yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50/70">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    {log.actorName}{' '}
                    <span className="text-[10px] font-semibold text-gray-400">({log.actorRole})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.entityType}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <button
            disabled={pagination.page <= 1}
            onClick={() => loadLogs(pagination.page - 1)}
            className="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => loadLogs(pagination.page + 1)}
            className="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

