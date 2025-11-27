import React, { useState } from 'react';
import { Search, Download, Filter, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

type StatusType = 'completed' | 'in-progress' | 'not-started';
type DivisionType = 'Marketing' | 'Finance' | 'Operasional';

interface ReportItem {
  id: number;
  name: string;
  division: DivisionType;
  course: string;
  progress: number;
  status: StatusType;
  lastAccess: string;
  completedDate: string;
}

const ReportsPage = () => {
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const reportData: ReportItem[] = [
    { 
      id: 1, 
      name: 'Ahmad Fulan', 
      division: 'Marketing', 
      course: 'SOP Pelayanan Jamaah', 
      progress: 100, 
      status: 'completed',
      lastAccess: '2 jam yang lalu',
      completedDate: '27 Nov 2025'
    },
    { 
      id: 2, 
      name: 'Siti Aminah', 
      division: 'Finance', 
      course: 'Marketing Digital untuk Umroh', 
      progress: 65, 
      status: 'in-progress',
      lastAccess: '5 jam yang lalu',
      completedDate: '-'
    },
    { 
      id: 3, 
      name: 'Budi Santoso', 
      division: 'Operasional', 
      course: 'Finance Management', 
      progress: 0, 
      status: 'not-started',
      lastAccess: 'Belum pernah',
      completedDate: '-'
    },
    { 
      id: 4, 
      name: 'Rina Kusuma', 
      division: 'Marketing', 
      course: 'Customer Service Excellence', 
      progress: 100, 
      status: 'completed',
      lastAccess: '1 hari yang lalu',
      completedDate: '26 Nov 2025'
    },
    { 
      id: 5, 
      name: 'Dedi Setiawan', 
      division: 'Finance', 
      course: 'SOP Pelayanan Jamaah', 
      progress: 45, 
      status: 'in-progress',
      lastAccess: '3 jam yang lalu',
      completedDate: '-'
    }
  ];

  const getStatusBadge = (status: StatusType) => {
    const statusConfig = {
      'completed': {
        icon: CheckCircle,
        text: 'Selesai',
        className: 'bg-green-100 text-green-800',
        iconColor: 'text-green-600'
      },
      'in-progress': {
        icon: Clock,
        text: 'Sedang Berjalan',
        className: 'bg-yellow-100 text-yellow-800',
        iconColor: 'text-yellow-600'
      },
      'not-started': {
        icon: XCircle,
        text: 'Belum Mulai',
        className: 'bg-gray-100 text-gray-800',
        iconColor: 'text-gray-600'
      }
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
      <div className="flex items-center space-x-2">
        <StatusIcon size={16} className={config.iconColor} />
        <span className={`text-xs font-semibold px-2 py-1 rounded ${config.className}`}>
          {config.text}
        </span>
      </div>
    );
  };

  const getProgressBar = (progress: number) => {
    let colorClass = 'bg-gray-400';
    if (progress > 0 && progress < 100) colorClass = 'bg-yellow-500';
    if (progress === 100) colorClass = 'bg-green-500';

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">Progress</span>
          <span className="text-xs font-bold text-black">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${colorClass} h-2 rounded-full transition-all`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Laporan Belajar</h1>
            <p className="text-gray-600 mt-1">Monitor progress pembelajaran pegawai</p>
          </div>
          <button className="flex items-center space-x-2 bg-[#C5A059] text-black px-5 py-2.5 rounded-lg hover:bg-[#B08F4A] transition-colors font-semibold">
            <Download size={20} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Total Peserta</span>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-black">127</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Selesai</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-black">89</p>
            <p className="text-xs text-green-600 font-semibold mt-1">70% completion rate</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Dalam Progress</span>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-black">32</p>
            <p className="text-xs text-yellow-600 font-semibold mt-1">25% in progress</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Belum Mulai</span>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <XCircle className="text-gray-600" size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-black">6</p>
            <p className="text-xs text-gray-600 font-semibold mt-1">5% not started</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="font-semibold text-black">Filter Data</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari nama pegawai..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
            >
              <option value="all">Semua Divisi</option>
              <option value="marketing">Marketing</option>
              <option value="finance">Finance</option>
              <option value="operasional">Operasional</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="completed">Selesai</option>
              <option value="in-progress">Sedang Berjalan</option>
              <option value="not-started">Belum Mulai</option>
            </select>
          </div>
        </div>

        {/* Report Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nama Pegawai
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Divisi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Kursus
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Akses Terakhir
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#C5A059] rounded-full flex items-center justify-center">
                          <span className="text-black font-bold">{item.name.charAt(0)}</span>
                        </div>
                        <span className="font-semibold text-black">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{item.division}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-black">{item.course}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        {getProgressBar(item.progress)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{item.lastAccess}</span>
                      {item.completedDate !== '-' && (
                        <p className="text-xs text-gray-400 mt-1">Selesai: {item.completedDate}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        <Eye size={16} />
                        <span className="text-sm font-semibold">Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold">1-5</span> dari <span className="font-semibold">127</span> data
            </p>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
                Previous
              </button>
              <button className="px-4 py-2 bg-[#C5A059] text-black rounded-lg font-semibold">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;