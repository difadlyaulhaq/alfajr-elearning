'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, UserX, UserCheck, Mail, Building, Loader, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/shared/Button';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 md:p-4 transition-opacity">
      <div className="bg-white rounded-none md:rounded-xl w-full h-full md:h-auto md:max-w-lg shadow-2xl transform transition-all flex flex-col">
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
        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
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
              className={`w-full text-black px-4 py-2.5 border border-gray-300 rounded-lg outline-none transition-all ${
                isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059]'
              }`}
            />
            {isEditing && <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah untuk menjaga integritas data.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="flex flex-col-reverse md:flex-row md:space-x-3 gap-3 md:gap-0 pt-4 mt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || divisions.length === 0}
              className="w-full md:flex-1 px-4 py-2.5 bg-[#C5A059] text-black rounded-lg hover:bg-[#B08F4A] font-semibold flex justify-center items-center transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
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

  const showConfirmationToast = (message: string, onConfirm: () => void, confirmButtonColor: string = 'bg-red-600 hover:bg-red-700') => {
    toast(
      (t) => (
        <div className="flex flex-col items-start gap-3 p-2">
          <p className="font-semibold text-gray-800">{message}</p>
          <div className="w-full flex gap-2">
            <button
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
              onClick={() => toast.dismiss(t.id)}
            >
              Batal
            </button>
            <button
              className={`flex-1 px-4 py-2.5 text-white rounded-lg font-semibold flex justify-center items-center text-sm ${confirmButtonColor}`}
              onClick={() => {
                toast.dismiss(t.id);
                onConfirm();
              }}
            >
              Konfirmasi
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000, // User has 10 seconds to decide
      }
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading(editingId ? 'Memperbarui data...' : 'Menambahkan pegawai...');

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
      
      toast.dismiss();
      if (response.ok) {
        setIsModalOpen(false);
        setFormData(initialFormState);
        setEditingId(null);
        fetchUsers(); // Refresh data tabel
        toast.success((t) => (
          <div className="flex items-center justify-between w-full">
            <span>{`Pegawai berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}!`}</span>
            <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        ), { duration: 3000 });
      } else {
        const errorData = await response.json();
        toast.error((t) => (
          <div className="flex items-center justify-between w-full">
            <span>{`Gagal: ${errorData.error}`}</span>
            <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        ), { duration: 3000 });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.dismiss();
      toast.error((t) => (
        <div className="flex items-center justify-between w-full">
          <span>Terjadi kesalahan sistem.</span>
          <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
      ), { duration: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi Toggle Status (Reset Akses)
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const confirmMessage = newStatus === 'inactive' 
      ? 'Nonaktifkan pegawai ini? Mereka tidak akan bisa login lagi.' 
      : 'Aktifkan kembali pegawai ini?';

    const performToggle = async () => {
      toast.loading('Mengubah status...');
      try {
        const response = await fetch(`/api/admin/users/${userId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        
        toast.dismiss();
        if (response.ok) {
          fetchUsers();
          toast.success((t) => (
            <div className="flex items-center justify-between w-full">
              <span>Status berhasil diubah!</span>
              <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          ), { duration: 3000 });
        } else {
          toast.error((t) => (
            <div className="flex items-center justify-between w-full">
              <span>Gagal mengubah status.</span>
              <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          ), { duration: 3000 });
        }
      } catch (error) {
        console.error('Error toggling status:', error);
        toast.dismiss();
        toast.error((t) => (
          <div className="flex items-center justify-between w-full">
            <span>Gagal mengubah status.</span>
            <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        ), { duration: 3000 });
      }
    };

    showConfirmationToast(confirmMessage, performToggle, newStatus === 'inactive' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700');
  };

  // Fungsi Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmMessage = `Hapus permanen user "${userName}"? Aksi ini tidak dapat dibatalkan.`;

    const performDelete = async () => {
      toast.loading('Menghapus user...');
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });

        toast.dismiss();
        if (response.ok) {
          fetchUsers();
          toast.success((t) => (
            <div className="flex items-center justify-between w-full">
              <span>User berhasil dihapus!</span>
              <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          ), { duration: 3000 });
        } else {
          const errorData = await response.json();
          toast.error((t) => (
            <div className="flex items-center justify-between w-full">
              <span>{`Gagal menghapus user: ${errorData.error}`}</span>
              <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          ), { duration: 3000 });
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.dismiss();
        toast.error((t) => (
          <div className="flex items-center justify-between w-full">
            <span>Terjadi kesalahan sistem saat menghapus user.</span>
            <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        ), { duration: 3000 });
      }
    };

    showConfirmationToast(confirmMessage, performDelete);
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = filterDivision === 'all' || user.division.toLowerCase() === filterDivision.toLowerCase();
    return matchesSearch && matchesDivision;
  });

  return (
    <div className="min-h-screen bg-brand-gray">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:px-8 md:py-6 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-black">Manajemen Pengguna</h1>
            <p className="text-gray-600 mt-1">Kelola data pegawai dan akses sistem</p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleAddClick}
            className="w-full md:w-auto"
          >
            Tambah Pegawai
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 md:p-8">
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
        <ResponsiveTable className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                // ... (Loading state tetap sama)
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col justify-center items-center">
                    <Loader className="animate-spin mb-2 text-[#C5A059]" size={32} />
                    <span className="text-sm">Memuat data...</span>
                  </div>
                </td></tr>
              ) : filteredUsers.length === 0 ? (
                // ... (Empty state tetap sama)
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
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-gold to-yellow-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-bold border ${user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 border-purple-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <Mail size={14} className="text-brand-gold" />
                          <span className="text-sm font-medium">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-lg w-fit border border-gray-100">
                        <Building size={14} className="text-gray-400" />
                        <span className="text-sm font-semibold">{user.division}</span>
                      </div>
                    </td>

                    {/* --- KOLOM STATUS (DIPERBAIKI WARNANYA) --- */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.status === 'active'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {user.status === 'active' ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>

                    {/* --- KOLOM AKSI (DIPERBAIKI TOMBOLNYA) --- */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-100"> {/* Opacity 100 agar selalu terlihat di mobile/tablet */}

                        {/* Tombol Edit */}
                        <button
                          onClick={() => handleEditClick(user)}
                          className="group flex items-center justify-center w-8 h-8 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md transition-all duration-200"
                          title="Edit Data"
                        >
                          <Edit size={16} />
                        </button>

                        {/* Tombol Reset Akses / Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`group flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 hover:text-white hover:shadow-md ${user.status === 'active'
                              ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-500'
                              : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-600'
                            }`}
                          title={user.status === 'active' ? "Non-aktifkan (Blokir Akses)" : "Aktifkan Kembali"}
                        >
                          {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>

                        {/* Tombol Delete */}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="group flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-md transition-all duration-200"
                          title="Hapus User"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTable>
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