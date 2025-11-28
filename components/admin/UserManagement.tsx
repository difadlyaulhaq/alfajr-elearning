'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, UserX, UserCheck, Mail, Building, Loader, X } from 'lucide-react';
import Button from '@/components/shared/Button';

// Definisikan tipe data User
interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  division: string;
  role: string;
  status: 'active' | 'inactive';
}

// Definisikan tipe data Division
interface Division {
  id: string;
  name: string;
}

// --- KOMPONEN MODAL DIPINDAHKAN KELUAR (FIX BUG FOKUS) ---
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  divisions: Division[]; // Tambahkan prop divisions
}

const UserFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, isSubmitting, isEditing, divisions }: UserFormModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl transform transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black">
            {isEditing ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="Contoh: Ahmad Fulan"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full text-black px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Kantor</label>
            <input
              type="email"
              required
              disabled={isEditing} // Email sebaiknya tidak diubah sembarangan karena ID unik
              placeholder="nama@alfajrumroh.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none transition-all ${
                isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059]'
              }`}
            />
            {isEditing && <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah untuk menjaga integritas data.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Divisi</label>
              <select 
                required
                value={formData.division}
                onChange={(e) => setFormData({...formData, division: e.target.value})}
                className="w-full text-black px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] outline-none transition-all bg-white"
              >
                <option value="">Pilih Divisi</option>
                {divisions.length === 0 ? (
                  <option value="" disabled>Loading divisi...</option>
                ) : (
                  divisions.map((div) => (
                    <option key={div.id} value={div.name}>
                      {div.name}
                    </option>
                  ))
                )}
              </select>
              {divisions.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Belum ada divisi. Silakan buat divisi terlebih dahulu di menu Master Data.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
              <select 
                required
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 text-black py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] outline-none transition-all bg-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {isEditing ? 'Password Baru (Opsional)' : 'Password Default'}
            </label>
            <input
              type="password"
              placeholder={isEditing ? "Kosongkan jika tidak ingin mengganti" : "Opsional (default: Alfajr123!)"}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full text-black px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] outline-none transition-all"
            />
          </div>

          <div className="flex space-x-3 pt-4 mt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || divisions.length === 0}
              className="flex-1 px-4 py-2.5 bg-[#C5A059] text-black rounded-lg hover:bg-[#B08F4A] font-semibold flex justify-center items-center transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Simpan Data'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA ---
const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]); // 🔥 State untuk divisions
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('all');
  
  // State untuk form & Edit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState = {
    name: '',
    email: '',
    division: '',
    role: 'user',
    password: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  // Fetch Users dan Divisions saat komponen dimuat
  useEffect(() => {
    fetchUsers();
    fetchDivisions(); // 🔥 Fetch divisions
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Function untuk fetch divisions dari API
  const fetchDivisions = async () => {
    try {
      const response = await fetch('/api/admin/divisions');
      const data = await response.json();
      if (data.success) {
        // Map hanya id dan name untuk dropdown
        setDivisions(data.data.map((d: any) => ({ id: d.id, name: d.name })));
      }
    } catch (error) {
      console.error('Gagal mengambil data divisi:', error);
    }
  };

  const handleAddClick = () => {
    setEditingId(null); // Mode Tambah
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingId(user.id); // Mode Edit
    setFormData({
      name: user.name,
      email: user.email,
      division: user.division,
      role: user.role,
      password: '' // Password dikosongkan untuk keamanan
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;
      
      if (editingId) {
        // --- LOGIKA EDIT (PATCH) ---
        response = await fetch(`/api/admin/users/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // --- LOGIKA TAMBAH BARU (POST) ---
        response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        setIsModalOpen(false);
        setFormData(initialFormState);
        setEditingId(null);
        fetchUsers(); // Refresh data tabel
        // alert(`Pegawai berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}!`);
      } else {
        const errorData = await response.json();
        alert(`Gagal: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi Toggle Status (Reset Akses)
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const confirmMessage = newStatus === 'inactive' 
      ? 'Apakah Anda yakin ingin menonaktifkan pegawai ini? Mereka tidak akan bisa login lagi.' 
      : 'Aktifkan kembali pegawai ini?';

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchUsers();
      } else {
        alert('Gagal mengubah status.');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = filterDivision === 'all' || user.division.toLowerCase() === filterDivision.toLowerCase();
    return matchesSearch && matchesDivision;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Manajemen Pengguna</h1>
            <p className="text-gray-600 mt-1">Kelola data pegawai dan akses sistem</p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleAddClick}
          >
            Tambah Pegawai
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-black pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none transition-all"
              />
            </div>
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="px-4 text-black py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none cursor-pointer bg-white"
            >
              <option value="all">Semua Divisi</option>
              {divisions.map((div) => (
                <option key={div.id} value={div.name}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Pegawai</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kontak</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Divisi</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col justify-center items-center">
                        <Loader className="animate-spin mb-2 text-[#C5A059]" size={32} /> 
                        <span className="text-sm">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <p>Tidak ada data pegawai yang ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-[#8B7355] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail size={16} className="text-gray-400" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Building size={16} className="text-gray-400" />
                          <span className="text-sm">{user.division}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'active' ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          {/* Tombol Edit */}
                          <button 
                            onClick={() => handleEditClick(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Edit Data"
                          >
                            <Edit size={18} />
                          </button>

                          {/* Tombol Reset Akses / Toggle Status */}
                          <button 
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.status === 'active' 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={user.status === 'active' ? "Non-aktifkan (Blokir Akses)" : "Aktifkan Kembali"}
                          >
                            {user.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Render Modal */}
      <UserFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        isEditing={!!editingId}
        divisions={divisions} // 🔥 Pass divisions ke modal
      />
    </div>
  );
};

export default UserManagement;