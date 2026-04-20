'use client';

import { useEffect, useState } from 'react';
import { Activity, Download, Printer, Trash2, Monitor, Smartphone, Shield, Search, Loader2, MapPin } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface ActivityLog {
  _id: string;
  actorType: string;
  action: string;
  ip: string;
  location: string;
  device: { browser?: string; os?: string; platform?: string } | string;
  createdAt: string;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiAdmin.get('api/admin/activity-logs');
      const data = res.data;
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to fetch activity logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      await apiAdmin.delete('api/admin/activity-logs/clear');
      fetchLogs();
    } catch (err) {
      console.error('❌ Failed to clear logs:', err);
    }
  };

  const exportToExcel = () => {
    const header = ['Actor', 'Action', 'IP', 'Device', 'Date'];
    const rows = logs.map((log) => [
      log.actorType,
      log.action,
      log.ip,
      typeof log.device === 'string'
        ? log.device
        : `${log.device?.browser || 'Unknown'} on ${log.device?.os || 'Unknown'} (${log.device?.platform || 'Unknown'})`,
      new Date(log.createdAt).toLocaleString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header, ...rows].map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'activity_logs.csv');
    document.body.appendChild(link);
    link.click();
  };

  const printLogs = () => {
    const printContent = `
      <html>
        <head>
          <title>Activity Logs</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h2>Activity Logs</h2>
          <table>
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>IP</th>
                <th>Device</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${logs
                .map(
                  (log) => `
                <tr>
                  <td>${log.actorType}</td>
                  <td>${log.action}</td>
                  <td>${log.ip}</td>
                  <td>${
                    typeof log.device === 'string'
                      ? log.device
                      : `${log.device?.browser || 'Unknown'} on ${log.device?.os || 'Unknown'} (${log.device?.platform || 'Unknown'})`
                  }</td>
                  <td>${new Date(log.createdAt).toLocaleString()}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.warn('Unable to open print window.');
      return;
    }
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6 sm:pb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#253A7B]" />
            Activity Logs
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Monitor administrative actions and system security events</p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={exportToExcel}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#253A7B] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={printLogs}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={clearLogs}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-500 border border-red-100 rounded-lg text-sm font-semibold hover:bg-red-50 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#253A7B] mb-4" />
            <p className="text-gray-500 text-sm font-medium">Syncing audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-gray-200" />
             </div>
             <h3 className="text-lg font-semibold text-gray-900 mb-1">Audit trail empty</h3>
             <p className="text-gray-500 text-sm max-w-xs">No recent administrative activities detected in the logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-[#253A7B] text-[10px] uppercase tracking-widest">Actor Type</th>
                  <th className="px-6 py-4 font-bold text-[#253A7B] text-[10px] uppercase tracking-widest">Operation / Action</th>
                  <th className="px-6 py-4 font-bold text-[#253A7B] text-[10px] uppercase tracking-widest text-center">Network IP</th>
                  <th className="px-6 py-4 font-bold text-[#253A7B] text-[10px] uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 font-bold text-[#253A7B] text-[10px] uppercase tracking-widest">Device Metadata</th>
                  <th className="px-6 py-4 font-bold text-[#253A7B] text-[10px] uppercase tracking-widest text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all ${
                          log.actorType === 'admin'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-green-50 text-green-700 border-green-100'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {log.actorType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center w-fit px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            log.action.includes('login')
                              ? 'bg-emerald-50 text-emerald-700'
                              : log.action.includes('logout')
                              ? 'bg-amber-50 text-amber-700'
                              : log.action.includes('delete') || log.action.includes('error')
                              ? 'bg-red-50 text-red-700'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <code className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {log.ip}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#253A7B]" />
                        {log.location || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                        {typeof log.device !== 'string' && (log.device?.os === 'Android' || log.device?.os === 'iOS') ? (
                          <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-600 font-medium truncate max-w-[150px]">
                          {typeof log.device === 'string'
                            ? log.device
                            : `${log.device?.browser || 'Browser'} on ${log.device?.os || 'System'}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-gray-900 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400">
                           {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
