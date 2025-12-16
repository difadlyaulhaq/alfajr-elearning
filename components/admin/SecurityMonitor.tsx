// components/admin/SecurityMonitor.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Eye, Download, Filter } from 'lucide-react';

interface SecurityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  page: string;
  details?: any;
  timestamp: string;
  userAgent: string;
  ip: string;
}

export default function SecurityMonitor() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: 'all',
    userId: '',
  });
  const [stats, setStats] = useState({
    totalAttempts: 0,
    uniqueUsers: 0,
    lastHourAttempts: 0,
  });

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.action !== 'all') params.append('action', filter.action);
      if (filter.userId) params.append('userId', filter.userId);
      params.append('limit', '100');

      const response = await fetch(`/api/security/log?${params}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (logsData: SecurityLog[]) => {
    const uniqueUsers = new Set(logsData.map(log => log.userId)).size;
    const lastHourAttempts = logsData.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      const oneHourAgo = Date.now() - 3600000;
      return logTime > oneHourAgo;
    }).length;

    setStats({
      totalAttempts: logsData.length,
      uniqueUsers,
      lastHourAttempts,
    });
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Email', 'Action', 'Page', 'IP'];
    const csvData = logs.map(log => [
      log.timestamp,
      log.userName,
      log.userEmail,
      log.action,
      log.page,
      log.ip,
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'screenshot_attempt':
        return 'bg-orange-100 text-orange-800';
      case 'recording_detected':
        return 'bg-red-100 text-red-800';
      case 'devtools_opened':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      'screenshot_attempt': 'Screenshot Attempt',
      'recording_detected': 'Recording Detected',
      'devtools_opened': 'DevTools Opened',
      'context_menu': 'Context Menu',
    };
    return labels[action] || action;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="text-[#C5A059]" size={36} />
          Security Monitor
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor dan analisis aktivitas keamanan website
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Attempts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.totalAttempts}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.uniqueUsers}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Eye className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Hour</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.lastHourAttempts}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-600" />
          <select
            value={filter.action}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
          >
            <option value="all">All Actions</option>
            <option value="screenshot_attempt">Screenshot Attempts</option>
            <option value="recording_detected">Recording Detected</option>
            <option value="devtools_opened">DevTools Opened</option>
          </select>

          <input
            type="text"
            placeholder="Filter by User ID"
            value={filter.userId}
            onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A059] flex-1"
          />

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#C5A059] text-white rounded-lg hover:bg-[#B39049] transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Page
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No security logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {log.userName}
                        </div>
                        <div className="text-gray-500">{log.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}
                      >
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.page}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {log.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
