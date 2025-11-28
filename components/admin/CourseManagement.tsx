'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Users, Video, FileText, Upload, Link as LinkIcon, Youtube, ExternalLink, X, ChevronDown, ChevronUp, PlayCircle, Clock, AlertCircle, Save } from 'lucide-react';

// --- Tipe Data ---
interface Category {
  id: string;
  name: string;
}

interface Attachment {
  name: string;
  url: string;
  type: 'link';
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'document';
  sourceType: 'embed' | 'drive';
  url: string;
  duration: string;
  watermark: boolean;
  forceComplete: boolean;
  attachments: Attachment[];
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  description: string;
  coverImage: string;
  status: 'active' | 'draft';
  sections: Section[];
  totalVideos: number;
  totalStudents: number;
}

const CourseManagement = () => {
  // State Utama
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Modal Form (Add/Edit)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // State Modal Preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Course | null>(null);

  // State Form Data
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    categoryId: '',
    description: '',
    coverImage: '',
    status: 'draft',
    sections: []
  });

  // State Sementara untuk Form Lesson
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null); // Untuk tahu lesson ditambahkan ke section mana
  const [tempLesson, setTempLesson] = useState<Partial<Lesson>>({
    title: '',
    sourceType: 'embed',
    url: '',
    duration: '',
    watermark: true,
    forceComplete: true,
    attachments: []
  });
  const [tempAttachment, setTempAttachment] = useState({ name: '', url: '' });

  // --- Fetch Data ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, catRes] = await Promise.all([
        fetch('/api/admin/courses'),
        fetch('/api/admin/categories')
      ]);
      
      const coursesData = await coursesRes.json();
      const catData = await catRes.json();

      if (coursesData.success) setCourses(coursesData.data);
      if (catData.success) setCategories(catData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helper Functions ---
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const resetForm = () => {
    setFormData({
      title: '', categoryId: '', description: '', coverImage: '', status: 'draft', sections: []
    });
    setTempLesson({ title: '', sourceType: 'embed', url: '', duration: '', watermark: true, forceComplete: true, attachments: [] });
    setCurrentStep(1);
    setIsEditing(false);
    setEditId(null);
  };

  // --- Handlers ---
  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (course: Course) => {
    setFormData(course);
    setEditId(course.id);
    setIsEditing(true);
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleOpenPreview = (course: Course) => {
    setPreviewData(course);
    setShowPreview(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus kursus "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Kursus berhasil dihapus');
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSaveCourse = async () => {
    if (!formData.title || !formData.categoryId) {
      alert('Judul dan Kategori wajib diisi');
      return;
    }

    try {
      const url = isEditing ? `/api/admin/courses/${editId}` : '/api/admin/courses';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (result.success) {
        alert(`Kursus berhasil ${isEditing ? 'diperbarui' : 'dibuat'}!`);
        setShowModal(false);
        fetchData();
      } else {
        alert(`Gagal: ${result.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Terjadi kesalahan sistem');
    }
  };

  // --- Curriculum Handlers ---
  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: `Bab ${(formData.sections?.length || 0) + 1}`,
      lessons: []
    };
    setFormData(prev => ({ ...prev, sections: [...(prev.sections || []), newSection] }));
  };

  const updateSectionTitle = (index: number, title: string) => {
    const newSections = [...(formData.sections || [])];
    newSections[index].title = title;
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const deleteSection = (index: number) => {
    const newSections = (formData.sections || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const saveLessonToSection = (sectionId: string) => {
    if (!tempLesson.title || !tempLesson.url) {
      alert('Judul materi dan URL wajib diisi');
      return;
    }

    const newLesson: Lesson = {
      ...tempLesson as Lesson,
      id: Date.now().toString(),
      type: 'video'
    };

    const newSections = (formData.sections || []).map(section => {
      if (section.id === sectionId) {
        return { ...section, lessons: [...section.lessons, newLesson] };
      }
      return section;
    });

    setFormData(prev => ({ ...prev, sections: newSections }));
    // Reset temp lesson
    setTempLesson({ title: '', sourceType: 'embed', url: '', duration: '', watermark: true, forceComplete: true, attachments: [] });
    setActiveSectionId(null);
  };

  const addAttachmentToTempLesson = () => {
    if (!tempAttachment.name || !tempAttachment.url) return;
    setTempLesson(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), { ...tempAttachment, type: 'link' }]
    }));
    setTempAttachment({ name: '', url: '' });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Kelola Kursus</h1>
            <p className="text-gray-600 mt-1">Buat dan kelola materi pembelajaran</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 bg-[#C5A059] text-black px-5 py-2.5 rounded-lg hover:bg-[#B08F4A] transition-colors font-semibold shadow-md"
          >
            <Plus size={20} />
            <span>Buat Kursus Baru</span>
          </button>
        </div>
      </div>

      {/* Course List */}
      <div className="p-8">
        {isLoading ? (
          <div className="text-center py-20 text-gray-500">Memuat data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="h-48 bg-gray-200 relative">
                  {course.coverImage ? (
                    <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C5A059] to-[#8B7355] text-white text-4xl">
                      📚
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold ${course.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {course.status === 'active' ? 'Aktif' : 'Draft'}
                  </span>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-[#C5A059] shadow-sm">
                    {course.categoryName}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-black mb-2 line-clamp-1" title={course.title}>{course.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center"><Video size={14} className="mr-1"/> {course.totalVideos || course.sections?.reduce((acc, s) => acc + s.lessons.length, 0) || 0} Video</span>
                    <span className="flex items-center"><Users size={14} className="mr-1"/> {course.totalStudents} Peserta</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenPreview(course)}
                      className="flex-1 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium text-sm flex items-center justify-center"
                    >
                      <Eye size={16} className="mr-1" /> Preview
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(course)}
                      className="flex-1 py-2 bg-[#FFF8E7] text-[#C5A059] rounded hover:bg-[#FFF3D6] font-medium text-sm flex items-center justify-center"
                    >
                      <Edit size={16} className="mr-1" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(course.id, course.title)}
                      className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-black">{isEditing ? 'Edit Kursus' : 'Buat Kursus Baru'}</h2>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-gray-400 hover:text-red-500" /></button>
            </div>

            {/* Steps */}
            <div className="flex justify-center py-4 bg-gray-50 border-b">
              <div className="flex space-x-4">
                <button onClick={() => setCurrentStep(1)} className={`px-4 py-2 rounded-full flex items-center space-x-2 ${currentStep === 1 ? 'bg-[#FFF8E7] text-[#C5A059] border border-[#C5A059]' : 'text-gray-400'}`}>
                  <span className="w-6 h-6 rounded-full bg-current text-white flex items-center justify-center text-xs">1</span>
                  <span className="font-semibold text-sm">Informasi Dasar</span>
                </button>
                <div className="w-8 h-px bg-gray-300 self-center"></div>
                <button onClick={() => setCurrentStep(2)} className={`px-4 py-2 rounded-full flex items-center space-x-2 ${currentStep === 2 ? 'bg-[#FFF8E7] text-[#C5A059] border border-[#C5A059]' : 'text-gray-400'}`}>
                  <span className="w-6 h-6 rounded-full bg-current text-white flex items-center justify-center text-xs">2</span>
                  <span className="font-semibold text-sm">Kurikulum</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {currentStep === 1 ? (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Kursus</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black"
                      placeholder="Contoh: SOP Pelayanan Jamaah"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                    <select 
                      value={formData.categoryId}
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black bg-white"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image (URL)</label>
                    <input 
                      type="text" 
                      value={formData.coverImage}
                      onChange={e => setFormData({...formData, coverImage: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" checked={formData.status === 'draft'} onChange={() => setFormData({...formData, status: 'draft'})} className="text-[#C5A059]" />
                        <span className="text-black">Draft</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" checked={formData.status === 'active'} onChange={() => setFormData({...formData, status: 'active'})} className="text-[#C5A059]" />
                        <span className="text-black">Active</span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Sections List */}
                  {formData.sections?.map((section, sIndex) => (
                    <div key={section.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-bold text-gray-500">BAB {sIndex + 1}</span>
                          <input 
                            type="text" 
                            value={section.title} 
                            onChange={(e) => updateSectionTitle(sIndex, e.target.value)}
                            className="bg-transparent border-b border-dashed border-gray-400 focus:border-[#C5A059] outline-none font-semibold text-black flex-1"
                            placeholder="Judul Bab"
                          />
                        </div>
                        <button onClick={() => deleteSection(sIndex)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                      </div>

                      <div className="p-4 space-y-3">
                        {section.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-start p-3 bg-gray-50 rounded border">
                            <div className="w-10 h-10 bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center rounded mr-3">
                              <Video size={20} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-black text-sm">{lesson.title}</h4>
                              <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                <span>{lesson.duration} menit</span> • <span>{lesson.sourceType}</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add Lesson Area */}
                        {activeSectionId === section.id ? (
                          <div className="border-2 border-dashed border-[#C5A059] rounded-lg p-4 bg-[#FFF8E7]/30 mt-4">
                            <h4 className="font-bold text-gray-800 mb-3 text-sm">Tambah Materi Video</h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <input 
                                type="text" placeholder="Judul Video" className="border p-2 rounded text-sm text-black"
                                value={tempLesson.title} onChange={e => setTempLesson({...tempLesson, title: e.target.value})}
                              />
                              <input 
                                type="text" placeholder="Durasi (menit)" className="border p-2 rounded text-sm text-black"
                                value={tempLesson.duration} onChange={e => setTempLesson({...tempLesson, duration: e.target.value})}
                              />
                            </div>
                            <div className="flex gap-2 mb-3">
                              <select 
                                className="border p-2 rounded text-sm bg-white text-black"
                                value={tempLesson.sourceType} onChange={e => setTempLesson({...tempLesson, sourceType: e.target.value as any})}
                              >
                                <option value="embed">YouTube (Embed)</option>
                                <option value="drive">Google Drive</option>
                              </select>
                              <input 
                                type="text" placeholder="URL Video" className="border p-2 rounded text-sm flex-1 text-black"
                                value={tempLesson.url} onChange={e => setTempLesson({...tempLesson, url: e.target.value})}
                              />
                            </div>
                            
                            {/* Attachments */}
                            <div className="mb-3">
                              <label className="text-xs font-bold text-gray-600 block mb-1">Lampiran (File Pendukung)</label>
                              {tempLesson.attachments?.map((att, i) => (
                                <div key={i} className="flex items-center text-xs bg-white border p-1 rounded mb-1 w-fit">
                                  <LinkIcon size={12} className="mr-1"/> {att.name}
                                </div>
                              ))}
                              <div className="flex gap-2 mt-1">
                                <input placeholder="Nama File" className="border p-1.5 rounded text-xs text-black" value={tempAttachment.name} onChange={e => setTempAttachment({...tempAttachment, name: e.target.value})} />
                                <input placeholder="Link File (Drive/Docs)" className="border p-1.5 rounded text-xs flex-1 text-black" value={tempAttachment.url} onChange={e => setTempAttachment({...tempAttachment, url: e.target.value})} />
                                <button onClick={addAttachmentToTempLesson} className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300 text-black">Add</button>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setActiveSectionId(null)} className="px-3 py-1.5 text-xs text-gray-600 border rounded">Batal</button>
                              <button onClick={() => saveLessonToSection(section.id)} className="px-3 py-1.5 text-xs bg-[#C5A059] text-black rounded font-bold">Simpan Materi</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setActiveSectionId(section.id)} className="w-full py-2 border border-dashed border-gray-300 text-gray-500 rounded hover:border-[#C5A059] hover:text-[#C5A059] text-sm flex items-center justify-center transition-colors">
                            <Plus size={16} className="mr-1" /> Tambah Materi
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button onClick={addSection} className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-semibold border border-dashed border-gray-300 flex items-center justify-center">
                    <Plus size={20} className="mr-2" /> Tambah Bab Baru
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-white rounded-b-xl">
              {currentStep === 2 && (
                <button onClick={() => setCurrentStep(1)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
                  Kembali
                </button>
              )}
              {currentStep === 1 ? (
                <button onClick={() => setCurrentStep(2)} className="px-6 py-2.5 bg-[#C5A059] text-black rounded-lg hover:bg-[#B08F4A] font-bold">
                  Lanjut: Kurikulum
                </button>
              ) : (
                <button onClick={handleSaveCourse} className="px-6 py-2.5 bg-[#C5A059] text-black rounded-lg hover:bg-[#B08F4A] font-bold flex items-center">
                  <Save size={18} className="mr-2" /> Simpan Kursus
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- PREVIEW MODAL --- */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl min-h-[80vh] shadow-2xl relative flex flex-col">
            <button 
              onClick={() => setShowPreview(false)} 
              className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
            >
              <X size={24} />
            </button>

            {/* Preview Header */}
            <div className="h-64 relative bg-gray-900">
              {previewData.coverImage ? (
                <img src={previewData.coverImage} className="w-full h-full object-cover opacity-60" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 text-white text-5xl">📚</div>
              )}
              <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/80 to-transparent">
                <span className="bg-[#C5A059] text-black text-xs font-bold px-2 py-1 rounded mb-2 inline-block">
                  {previewData.categoryName}
                </span>
                <h1 className="text-3xl font-bold text-white mb-2">{previewData.title}</h1>
                <p className="text-gray-200 text-sm max-w-2xl">{previewData.description}</p>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-8 bg-[#F8F9FA]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold text-lg text-black mb-4">Tentang Kursus Ini</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {previewData.description || "Tidak ada deskripsi detail."}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 font-bold text-black">Kurikulum Pembelajaran</div>
                    <div>
                      {previewData.sections?.map((section, idx) => (
                        <div key={idx} className="border-b last:border-0">
                          <div className="bg-gray-50/50 px-4 py-3 font-semibold text-gray-700 text-sm flex justify-between items-center">
                            <span>{section.title}</span>
                            <span className="text-xs font-normal text-gray-500">{section.lessons.length} Materi</span>
                          </div>
                          <div className="divide-y">
                            {section.lessons.map((lesson, lIdx) => (
                              <div key={lIdx} className="p-4 flex items-center hover:bg-gray-50 transition-colors cursor-default">
                                <div className="w-8 h-8 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center mr-4 shrink-0">
                                  {lesson.type === 'video' ? <PlayCircle size={16} /> : <FileText size={16} />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-black">{lesson.title}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} /> {lesson.duration} menit</span>
                                    {lesson.attachments?.length > 0 && (
                                      <span className="text-xs text-blue-600 flex items-center gap-1"><LinkIcon size={10} /> {lesson.attachments.length} file</span>
                                    )}
                                  </div>
                                </div>
                                {lesson.forceComplete && <div className="text-[10px] border border-orange-200 text-orange-600 px-2 py-0.5 rounded bg-orange-50">Wajib</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4">Statistik Kursus</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Video</span>
                        <span className="font-medium text-black">{previewData.totalVideos} Video</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Peserta</span>
                        <span className="font-medium text-black">{previewData.totalStudents} Orang</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${previewData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {previewData.status === 'active' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;