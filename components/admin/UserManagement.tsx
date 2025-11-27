import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, UserX, UserCheck, Mail, Building } from 'lucide-react';

const UserManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    division: '',
    role: 'user',
    password: ''
  });

  const users = [
    { id: 1, name: 'Ahmad Fulan', email: 'ahmad@alfajrumroh.com', division: 'Marketing', role: 'User', status: 'active' },
    { id: 2, name: 'Siti Aminah', email: 'siti@alfajrumroh.com', division: 'Finance', role: 'User', status: 'active' },
    { id: 3, name: 'Budi Santoso', email: 'budi@alfajrumroh.com', division: 'Operasional', role: 'Admin', status: 'active' },
    { id: 4, name: 'Rina Kusuma', email: 'rina@alfajrumroh.com', division: 'Marketing', role: 'User', status: 'active' },
    { id: 5, name: 'Dedi Setiawan', email: 'dedi@alfajrumroh.com', division: 'Finance', role: 'User', status: 'inactive' }
  ];

  const handleSubmit = () => {
    console.log('Submitting user data:', formData);
    setShowAddModal(false);
    setFormData({ name: '', email: '', division: '', role: 'user', password: '' });
  };

  const AddUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black">Tambah Pegawai Baru</h2>
          <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">Email Kantor</label>
            <input
              type="email"
              placeholder="nama@alfajrumroh.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">Divisi</label>
            <select 
              value={formData.division}
              onChange={(e) => setFormData({...formData, division: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
            >
              <option value="">Pilih Divisi</option>
              <option value="marketing">Marketing</option>
              <option value="finance">Finance</option>
              <option value="operasional">Operasional</option>
              <option value="hr">Human Resources</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">Role</label>
            <select 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">Password (Opsional)</label>
            <input
              type="password"
              placeholder="Kosongkan jika menggunakan SSO"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">*Password default akan dikirim via email</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-[#C5A059] text-black rounded-lg hover:bg-[#B08F4A] transition-colors font-semibold"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Manajemen Pengguna</h1>
            <p className="text-gray-600 mt-1">Kelola data pegawai dan akses sistem</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-[#C5A059] text-black px-5 py-2.5 rounded-lg hover:bg-[#B08F4A] transition-colors font-semibold"
          >
            <Plus size={20} />
            <span>Tambah Pegawai</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari nama atau email..."
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
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none">
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Non-aktif</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nama Pegawai
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Divisi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#C5A059] rounded-full flex items-center justify-center">
                          <span className="text-black font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <span className="font-semibold text-black">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail size={16} />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Building size={16} />
                        <span className="text-sm">{user.division}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'Admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {user.status === 'active' ? (
                          <>
                            <UserCheck size={16} className="text-green-500" />
                            <span className="text-sm font-semibold text-green-600">Aktif</span>
                          </>
                        ) : (
                          <>
                            <UserX size={16} className="text-red-500" />
                            <span className="text-sm font-semibold text-red-600">Non-aktif</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold">1-5</span> dari <span className="font-semibold">127</span> pegawai
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
                3
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && <AddUserModal />}
    </div>
  );
};

export default UserManagement;