'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Loader, X, FolderOpen, AlertCircle, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  courseCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Modal Component
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

const CategoryModal = ({ isOpen, onClose, onSubmit, formData, setFormData, isSubmitting, isEditing }: CategoryModalProps) => {
  const [showIconPicker, setShowIconPicker] = useState(false);
  if (!isOpen) return null;

  const iconOptions = ['📚', '💼', '💰', '🎓', '📊', '🛠️', '🌐', '📱', '🎯', '💡', '🔧', '📈'];
  const colorOptions = [
    { name: 'Emas', value: '#C5A059' },
    { name: 'Biru', value: '#3B82F6' },
    { name: 'Hijau', value: '#10B981' },
    { name: 'Merah', value: '#EF4444' },
    { name: 'Ungu', value: '#8B5CF6' },
    { name: 'Oranye', value: '#F59E0B' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black">
            {isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Kategori *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Marketing & Sales"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full text-black px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
            <textarea
              placeholder="Jelaskan kategori ini untuk apa..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full text-black px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Icon Kategori</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-full text-left px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] outline-none transition-all flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{formData.icon}</span>
                    <span className="text-sm text-gray-600">Pilih icon...</span>
                  </div>
                  <ChevronDown size={20} className="text-gray-500" />
                </button>
                {showIconPicker && (
                  <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                    {iconOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, icon: emoji});
                          setShowIconPicker(false);
                        }}
                        className={`p-3 text-2xl rounded-lg transition-all hover:bg-gray-50 flex items-center justify-center ${
                          formData.icon === emoji
                            ? 'bg-[#FFF8E7] scale-105 ring-2 ring-[#C5A059] ring-offset-1'
                            : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Warna Tema</label>
              <div className="space-y-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({...formData, color: color.value})}
                    className={`w-full flex items-center space-x-3 p-2.5 rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? 'border-[#C5A059] bg-[#FFF8E7]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-sm font-medium text-black">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-[#C5A059] text-black rounded-lg hover:bg-[#B08F4A] font-semibold flex justify-center items-center transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Simpan Kategori'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const CategoryManagement = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState = {
    name: '',
    description: '',
    icon: '📚',
    color: '#C5A059'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data kategori:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color
    });
    setIsModalOpen(true);
  };

  const showConfirmationToast = (message: string, onConfirm: () => void) => {
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
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex justify-center items-center text-sm"
              onClick={() => {
                toast.dismiss(t.id);
                onConfirm();
              }}
            >
              Hapus
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
    toast.loading(editingId ? 'Menyimpan perubahan...' : 'Menambahkan kategori...');

    try {
      let response;
      
      if (editingId) {
        response = await fetch(`/api/admin/categories/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const result = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success((t) => (
          <div className="flex items-center justify-between w-full">
            <span>{result.message}</span>
            <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        ), { duration: 3000 });
        setIsModalOpen(false);
        setFormData(initialFormState);
        setEditingId(null);
        fetchCategories();
        router.refresh();
      } else {
        toast.error((t) => (
          <div className="flex items-center justify-between w-full">
            <span>{`Gagal: ${result.error}`}</span>
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

  const handleDelete = async (id: string, name: string) => {
    const confirmMessage = `Hapus kategori "${name}"? Data ini tidak bisa dikembalikan.`;
    
    const performDelete = async () => {
      toast.loading('Menghapus kategori...');
      try {
        const response = await fetch(`/api/admin/categories/${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();
        toast.dismiss();

        if (response.ok) {
          toast.success((t) => (
            <div className="flex items-center justify-between w-full">
              <span>{result.message}</span>
              <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          ), { duration: 3000 });
          fetchCategories();
          router.refresh();
        } else {
          toast.error((t) => (
            <div className="flex items-center justify-between w-full">
              <span>{`Gagal menghapus: ${result.error}`}</span>
              <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          ), { duration: 3000 });
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.dismiss();
        toast.error((t) => (
          <div className="flex items-center justify-between w-full">
            <span>Terjadi kesalahan saat menghapus kategori.</span>
            <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        ), { duration: 3000 });
      }
    };

    showConfirmationToast(confirmMessage, performDelete);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Manajemen Kategori</h1>
            <p className="text-gray-600 mt-1">Kelompokkan kursus berdasarkan topik</p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center space-x-2 bg-[#C5A059] text-black px-5 py-2.5 rounded-lg hover:bg-[#B08F4A] transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            <span>Buat Kategori</span>
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-black pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none"
            />
          </div>
        </div>

        {/* Category Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin text-[#C5A059]" size={40} />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <FolderOpen className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">Belum ada kategori dibuat</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden group"
              >
                <div
                  className="h-32 flex items-center justify-center text-6xl"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  {category.icon}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-black">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {category.description || 'Tidak ada deskripsi'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-600">
                      <span className="font-bold text-black">{category.courseCount}</span> Kursus
                    </span>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        isEditing={!!editingId}
      />
    </div>
  );
};

export default CategoryManagement;