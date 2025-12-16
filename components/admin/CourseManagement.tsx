'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, Users, Video, X, Save, BookText, Youtube, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

import RichTextEditor from '@/components/admin/RichTextEditor';

import { Course, Section, Lesson, Category, User, Division } from '@/types';

interface CourseManagementProps {
  initialCourses: Course[];
  initialCategories: Category[];
}

const CourseManagement: React.FC<CourseManagementProps> = ({ initialCourses, initialCategories }) => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTermUsers, setSearchTermUsers] = useState<string>('');
  const [allDivisions, setAllDivisions] = useState<Division[]>([]);
  const [searchTermDivisions, setSearchTermDivisions] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAllUsersAndDivisions = async () => {
      try {
        const [usersRes, divisionsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/divisions')
        ]);

        const usersData = await usersRes.json();
        const divisionsData = await divisionsRes.json();

        if (usersData.success) {
          setAllUsers(usersData.data);
        } else {
          toast.error('Failed to fetch users.');
        }

        if (divisionsData.success) {
          setAllDivisions(divisionsData.data);
        } else {
          toast.error('Failed to fetch divisions.');
        }
      } catch (error) {
        console.error('Error fetching users or divisions:', error);
        toast.error('Error fetching users or divisions.');
      }
    };

    fetchAllUsersAndDivisions();
  }, []); // Run once on component mount
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Course | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    categoryId: '',
    level: 'basic',
    description: '',
    coverImage: '',
    thumbnail: '',
    status: 'draft',
    sections: [],
    enrolledUserIds: [],
    enrolledDivisionIds: []
  });

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [tempLesson, setTempLesson] = useState<Partial<Lesson>>({
    title: '',
    contentType: 'youtube',
    sourceType: 'embed',
    url: '',
    textContent: '',
    duration: '',
    watermark: true,
    forceComplete: true,
    attachmentName: '',
    attachmentUrl: ''
  });

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const resetForm = () => {
    setFormData({
      title: '', categoryId: '', level: 'basic', description: '', coverImage: '', thumbnail: '', status: 'draft', sections: []
    });
    setTempLesson({ title: '', contentType: 'youtube', sourceType: 'embed', url: '', textContent: '', duration: '', watermark: true, forceComplete: true, attachmentName: '', attachmentUrl: '' });
    setCurrentStep(1);
    setIsEditing(false);
    setEditId(null);
  };

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
    const promise = fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus kursus');
        return data;
      });
    toast.promise(promise, {
      loading: 'Menghapus kursus...',
      success: 'Kursus berhasil dihapus!',
      error: (err) => `Gagal: ${err.message}`,
    }).then(() => router.refresh()).catch(error => console.error('Delete error:', error));
  };

  const handleSaveCourse = async () => {
    setIsLoading(true);
    if (!formData.title || !formData.categoryId) {
      toast.error('Judul dan Kategori wajib diisi');
      setIsLoading(false);
      return;
    }
    toast.loading('Menyimpan kursus...');
    
    let videoThumbnail = '';
    const firstLesson = formData.sections?.[0]?.lessons[0];
    if (firstLesson && firstLesson.contentType === 'youtube' && firstLesson.url) {
      const videoId = getYouTubeId(firstLesson.url);
      if (videoId) videoThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    const finalFormData = { ...formData, thumbnail: videoThumbnail || formData.coverImage };

    try {
      const url = isEditing ? `/api/admin/courses/${editId}` : '/api/admin/courses';
      const method = isEditing ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalFormData) });
      const result = await res.json();
      toast.dismiss();
      if (result.success) {
        toast.success(`Kursus berhasil ${isEditing ? 'diperbarui' : 'dibuat'}!`);
        setShowModal(false);
        router.refresh();
      } else {
        toast.error(`Gagal: ${result.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.dismiss();
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = () => setFormData(prev => ({ ...prev, sections: [...(prev.sections || []), { id: Date.now().toString(), title: `Bab ${(prev.sections?.length || 0) + 1}`, order: prev.sections?.length || 0, lessons: [] }] }));
  const updateSectionTitle = (index: number, title: string) => { const newSections = [...(formData.sections || [])]; newSections[index].title = title; setFormData(prev => ({ ...prev, sections: newSections })); };
  const deleteSection = (index: number) => setFormData(prev => ({ ...prev, sections: (prev.sections || []).filter((_, i) => i !== index) }));
  const handleStartEditLesson = (lesson: Lesson, sectionId: string) => { setActiveSectionId(sectionId); setEditingLessonId(lesson.id); setTempLesson(lesson); };
  const handleCancelEditLesson = () => { setActiveSectionId(null); setEditingLessonId(null); setTempLesson({ title: '', contentType: 'youtube', url: '', textContent: '', duration: '', attachmentName: '', attachmentUrl: '' }); };

  const handleDeleteLesson = (lessonId: string, sectionId: string) => {
    if (!confirm('Anda yakin ingin menghapus materi ini?')) return;
    const newSections = (formData.sections || []).map(s => s.id === sectionId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s);
    setFormData(prev => ({ ...prev, sections: newSections }));
    toast.success('Materi dihapus dari daftar.');
  };

  const handleSaveLesson = (sectionId: string) => {
    if (!tempLesson.title) return toast.error('Judul materi wajib diisi');
    if (tempLesson.contentType === 'youtube' && !tempLesson.url) return toast.error('URL materi wajib diisi');
    if (tempLesson.contentType === 'text' && !tempLesson.textContent) return toast.error('Konten artikel wajib diisi');

    const lessonData = { ...tempLesson, id: editingLessonId || Date.now().toString() } as Lesson;
    const newSections = (formData.sections || []).map(s => {
      if (s.id === sectionId) {
        const newLessons = editingLessonId ? s.lessons.map(l => l.id === editingLessonId ? lessonData : l) : [...s.lessons, lessonData];
        return { ...s, lessons: newLessons };
      }
      return s;
    });
    setFormData(prev => ({ ...prev, sections: newSections }));
    handleCancelEditLesson();
    toast.success('Materi berhasil disimpan sementara!');
  };

  const handleRichTextChange = useCallback((content: string) => {
    setTempLesson(prev => ({...prev, textContent: content}));
  }, [setTempLesson]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-black">Kelola Kursus</h1><p className="text-gray-600 mt-1">Buat dan kelola materi pembelajaran</p></div>
        <button onClick={handleOpenAdd} className="flex items-center space-x-2 bg-[#C5A059] text-black px-5 py-2.5 rounded-lg hover:bg-[#B08F4A] transition-colors font-semibold shadow-md"><Plus size={20} /><span>Buat Kursus Baru</span></button>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="h-48 bg-gray-200 relative">
                <img src={course.thumbnail || course.coverImage || '/logo-alfajr.png'} alt={course.title} className="w-full h-full object-cover" />
                <span className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold ${course.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>{course.status === 'active' ? 'Aktif' : 'Draft'}</span>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-[#C5A059] shadow-sm">{course.categoryName}</div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-black mb-2 line-clamp-1" title={course.title}>{course.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center"><Video size={14} className="mr-1"/> {course.sections?.reduce((acc, s) => acc + s.lessons.length, 0) || 0} Materi</span>
                  <span className="flex items-center"><Users size={14} className="mr-1"/> {course.totalStudents} Peserta</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenPreview(course)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium text-sm flex items-center justify-center"><Eye size={16} className="mr-1" /> Preview</button>
                  <button onClick={() => handleOpenEdit(course)} className="flex-1 py-2 bg-[#FFF8E7] text-[#C5A059] rounded hover:bg-[#FFF3D6] font-medium text-sm flex items-center justify-center"><Edit size={16} className="mr-1" /> Edit</button>
                  <button onClick={() => handleDelete(course.id, course.title)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-xl font-bold text-black">{isEditing ? 'Edit Kursus' : 'Buat Kursus Baru'}</h2><button onClick={() => setShowModal(false)} disabled={isLoading}><X size={24} className="text-gray-400 hover:text-red-500" /></button></div>
            <div className="flex justify-center py-4 bg-gray-50 border-b"><div className="flex space-x-4">
              <button onClick={() => setCurrentStep(1)} disabled={isLoading} className={`px-4 py-2 rounded-full flex items-center space-x-2 ${currentStep === 1 ? 'bg-[#FFF8E7] text-[#C5A059] border border-[#C5A059]' : 'text-gray-400'}`}><span className="w-6 h-6 rounded-full bg-current text-white flex items-center justify-center text-xs">1</span><span className="font-semibold text-sm">Informasi Dasar</span></button>
              <div className="w-8 h-px bg-gray-300 self-center"></div>
              <button onClick={() => setCurrentStep(2)} disabled={isLoading} className={`px-4 py-2 rounded-full flex items-center space-x-2 ${currentStep === 2 ? 'bg-[#FFF8E7] text-[#C5A059] border border-[#C5A059]' : 'text-gray-400'}`}><span className="w-6 h-6 rounded-full bg-current text-white flex items-center justify-center text-xs">2</span><span className="font-semibold text-sm">Kurikulum</span></button>
              <div className="w-8 h-px bg-gray-300 self-center"></div>
              <button onClick={() => setCurrentStep(3)} disabled={isLoading} className={`px-4 py-2 rounded-full flex items-center space-x-2 ${currentStep === 3 ? 'bg-[#FFF8E7] text-[#C5A059] border border-[#C5A059]' : 'text-gray-400'}`}><span className="w-6 h-6 rounded-full bg-current text-white flex items-center justify-center text-xs">3</span><span className="font-semibold text-sm">Enrollment</span></button>
            </div></div>
            <div className="flex-1 overflow-y-auto p-8">
              {currentStep === 1 ? (
                <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Judul Kursus</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400" placeholder="Contoh: SOP Pelayanan Jamaah" disabled={isLoading}/></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label><select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black bg-white" disabled={isLoading}><option value="">Pilih Kategori</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Level</label><select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black bg-white" disabled={isLoading}><option value="basic">Basic</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
                    <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label><textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400" placeholder="Jelaskan tentang kursus ini..." disabled={isLoading} /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image (URL)</label><input type="text" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400" placeholder="https://..." disabled={isLoading}/></div>
                    <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Status</label><div className="flex space-x-4"><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={formData.status === 'draft'} onChange={() => setFormData({...formData, status: 'draft'})} className="text-[#C5A059]" disabled={isLoading} /><span className="text-black">Draft</span></label><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={formData.status === 'active'} onChange={() => setFormData({...formData, status: 'active'})} className="text-[#C5A059]" disabled={isLoading} /><span className="text-black">Active</span></label></div></div>
                </div>
              ) : currentStep === 2 ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  {formData.sections?.map((section, sIndex) => (
                    <div key={section.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1"><span className="font-bold text-gray-500">BAB {sIndex + 1}</span><input type="text" value={section.title} onChange={(e) => updateSectionTitle(sIndex, e.target.value)} className="bg-transparent border-b border-dashed border-gray-400 focus:border-[#C5A059] outline-none font-semibold text-black flex-1 placeholder:text-gray-400" placeholder="Judul Bab" disabled={isLoading}/></div>
                        <button onClick={() => deleteSection(sIndex)} disabled={isLoading} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                      </div>
                      <div className="p-4 space-y-3">
                        {section.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center p-3 bg-gray-100 rounded border group">
                            <div className="w-10 h-10 bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center rounded mr-3 shrink-0">{lesson.contentType === 'youtube' ? <Youtube size={20} /> : <BookText size={20} />}</div>
                            <div className="flex-1">
                              <h4 className="font-bold text-black text-sm">{lesson.title}</h4>
                              <div className="text-xs text-gray-500 flex gap-2 mt-1"><span>{lesson.duration || 'N/A'} menit</span> • <span className="capitalize">{lesson.contentType}</span></div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleStartEditLesson(lesson, section.id)} disabled={isLoading} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"><Edit size={16}/></button>
                              <button onClick={() => handleDeleteLesson(lesson.id, section.id)} disabled={isLoading} className="p-1.5 text-red-600 hover:bg-red-100 rounded"><Trash2 size={16}/></button>
                            </div>
                          </div>
                        ))}
                        {activeSectionId === section.id ? (
                          <div className="border-2 border-dashed border-[#C5A059] rounded-lg p-4 bg-[#FFF8E7]/30 mt-4">
                            <h4 className="font-bold text-gray-800 mb-3 text-sm">{editingLessonId ? 'Edit Materi' : 'Tambah Materi'}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <input type="text" placeholder="Judul Materi" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400" value={tempLesson.title} onChange={e => setTempLesson({...tempLesson, title: e.target.value})} disabled={isLoading}/>
                               <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black bg-white" value={tempLesson.contentType} onChange={e => setTempLesson({...tempLesson, contentType: e.target.value as any, url: '', textContent: ''})} disabled={isLoading}>
                                <option value="youtube">Link Youtube</option>
                                <option value="text">Artikel Teks</option>
                              </select>
                            </div>
                            {tempLesson.contentType === 'youtube' && <div className="grid grid-cols-2 gap-3 mb-3"><input type="text" placeholder="Durasi (menit)" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400" value={tempLesson.duration} onChange={e => setTempLesson({...tempLesson, duration: e.target.value})} disabled={isLoading}/><input type="text" placeholder="URL Youtube" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400" value={tempLesson.url} onChange={e => setTempLesson({...tempLesson, url: e.target.value})} disabled={isLoading}/></div>}
                            {tempLesson.contentType === 'text' && (
                              <div className="md:col-span-2">
                                <RichTextEditor
                                  initialValue={tempLesson.textContent}
                                  onChange={handleRichTextChange}
                                  placeholder="Tulis artikel di sini..."
                                  showSaveButton={false}
                                />
                              </div>
                            )}
                            <div className="my-3 space-y-2">
                              <label className="text-xs font-bold text-gray-600 block">Lampiran (Opsional)</label>
                              <input placeholder="Nama File Lampiran" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400 w-full text-sm" value={tempLesson.attachmentName || ''} onChange={e => setTempLesson(prev => ({...prev, attachmentName: e.target.value}))} disabled={isLoading} />
                              <input placeholder="URL File (Drive, Docs, dll)" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400 w-full text-sm" value={tempLesson.attachmentUrl || ''} onChange={e => setTempLesson(prev => ({...prev, attachmentUrl: e.target.value}))} disabled={isLoading} />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={handleCancelEditLesson} disabled={isLoading} className="px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 font-semibold">Batal</button>
                              <button onClick={() => handleSaveLesson(section.id)} disabled={isLoading} className="px-3 py-1.5 text-xs bg-[#C5A059] text-black rounded font-bold hover:bg-[#B08F4A]">{editingLessonId ? 'Update Materi' : 'Simpan Materi'}</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setActiveSectionId(section.id)} disabled={isLoading} className="w-full py-2 border border-dashed border-gray-300 text-gray-600 rounded hover:border-[#C5A059] hover:text-[#C5A059] text-sm flex items-center justify-center transition-colors font-semibold"><Plus size={16} className="mr-1" /> Tambah Materi</button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button onClick={addSection} disabled={isLoading} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold border border-dashed border-gray-300 flex items-center justify-center"><Plus size={20} className="mr-2" /> Tambah Bab Baru</button>
                </div>
              ) : ( // currentStep === 3
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Enroll User(s)</label>
                    <input
                      type="text"
                      placeholder="Cari pengguna..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400 mb-2"
                      value={searchTermUsers}
                      onChange={(e) => setSearchTermUsers(e.target.value)}
                    />
                    <select
                      multiple
                      value={formData.enrolledUserIds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enrolledUserIds: Array.from(e.target.selectedOptions, (option) => option.value),
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black bg-white h-48"
                      disabled={isLoading}
                    >
                      {allUsers
                        .filter(user =>
                          user.name.toLowerCase().includes(searchTermUsers.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTermUsers.toLowerCase())
                        )
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Enroll Division(s)</label>
                    <input
                      type="text"
                      placeholder="Cari divisi..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400 mb-2"
                      value={searchTermDivisions}
                      onChange={(e) => setSearchTermDivisions(e.target.value)}
                    />
                    <select
                      multiple
                      value={formData.enrolledDivisionIds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enrolledDivisionIds: Array.from(e.target.selectedOptions, (option) => option.value),
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black bg-white h-48"
                      disabled={isLoading}
                    >
                      {allDivisions
                        .filter(division =>
                          division.name.toLowerCase().includes(searchTermDivisions.toLowerCase())
                        )
                        .map((division) => (
                          <option key={division.id} value={division.id}>
                            {division.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end space-x-3 bg-white rounded-b-xl">
              {currentStep > 1 && <button onClick={() => setCurrentStep(prev => prev - 1)} disabled={isLoading} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">Kembali</button>}
              {currentStep < 3 ? (
                <button onClick={() => setCurrentStep(prev => prev + 1)} disabled={isLoading} className="px-6 py-2.5 bg-[#C5A059] text-black rounded-lg hover:bg-[#B08F4A] font-bold">Lanjut</button>
              ) : (
                <button onClick={handleSaveCourse} disabled={isLoading} className="px-6 py-2.5 bg-[#C5A059] text-black rounded-lg hover:bg-[#B08F4A] font-bold flex items-center disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />} {isLoading ? 'Menyimpan...' : 'Simpan Kursus'}</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-black">Preview Kursus: {previewData.title}</h2>
              <button onClick={() => setShowPreview(false)}><X size={24} className="text-gray-400 hover:text-red-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 prose prose-lg max-w-none text-black">
              {(previewData.thumbnail || previewData.coverImage) && (
                <img src={previewData.thumbnail || previewData.coverImage || '/logo-alfajr.png'} alt={previewData.title} className="w-full h-60 object-cover rounded-lg mb-6" />
              )}
              {previewData.description && (
                <>
                  <h3 className="text-2xl font-bold mt-4 mb-2">Deskripsi</h3>
                  <ReactMarkdown>{previewData.description}</ReactMarkdown>
                </>
              )}

              {previewData.sections && previewData.sections.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-3xl font-bold mb-4">Kurikulum</h2>
                  {previewData.sections.map((section, sIndex) => (
                    <div key={section.id} className="mb-6 border-b pb-4">
                      <h3 className="text-xl font-semibold mb-3">Bab {sIndex + 1}: {section.title}</h3>
                      {section.lessons && section.lessons.length > 0 ? (
                        <ul className="space-y-3">
                          {section.lessons.map((lesson) => (
                            <li key={lesson.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center rounded mr-3 shrink-0">
                                  {lesson.contentType === 'youtube' ? <Youtube size={16} /> : <BookText size={16} />}
                                </div>
                                <p className="font-semibold text-black text-base">{lesson.title}</p>
                              </div>
                              {lesson.contentType === 'text' && lesson.textContent && (
                                <div className="prose prose-sm max-w-none mt-2 text-black">
                                  <ReactMarkdown>{lesson.textContent}</ReactMarkdown>
                                </div>
                              )}
                              {lesson.contentType === 'youtube' && lesson.url && (
                                <div className="mt-2">
                                  <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                                    Tonton Video
                                  </a>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">Belum ada materi untuk bab ini.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;