'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, Users, Video, X, Save, BookText, Youtube, Loader2, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';

import RichTextEditor from '@/components/admin/RichTextEditor';

import { Course, Section, Lesson, Category, User, Division } from '@/types';

export const CoursePreviewModal: React.FC<{
  previewData: Course; // Use Course type
  onClose: () => void;
}> = ({ previewData, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-black">
            Preview Kursus: {previewData.title}
          </h2>
          <button onClick={onClose}>
            <X size={24} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          {/* Cover Image */}
          {(previewData.thumbnail || previewData.coverImage) && (
            <img
              src={previewData.thumbnail || previewData.coverImage || "/logo-alfajr.png"}
              alt={previewData.title}
              className="w-full h-60 object-cover rounded-lg mb-6 shadow-lg"
              onError={(e) => {
                e.currentTarget.src = "/logo-alfajr.png";
              }}
            />
          )}

          {/* Description */}
          {previewData.description && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold mt-4 mb-4 text-black">Deskripsi</h3>
              <div className="prose prose-lg max-w-none">
                <MarkdownRenderer content={previewData.description} />
              </div>
            </div>
          )}

          {/* Curriculum */}
          {previewData.sections && previewData.sections.length > 0 && (
            <div className="mt-8">
              <h2 className="text-3xl font-bold mb-6 text-black">Kurikulum</h2>
              {previewData.sections.map((section: Section, sIndex: number) => (
                <div key={section.id} className="mb-6 border-b pb-4 last:border-b-0">
                  <h3 className="text-xl font-semibold mb-4 text-black">
                    Bab {sIndex + 1}: {section.title}
                  </h3>
                  {section.lessons && section.lessons.length > 0 ? (
                    <ul className="space-y-3">
                      {section.lessons.map((lesson: Lesson) => (
                        <li
                          key={lesson.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center rounded mr-3 shrink-0">
                              {lesson.contentType === "youtube" ? <Youtube size={16} /> : <BookText size={16} />}
                            </div>
                            <p className="font-semibold text-black text-base">
                              {lesson.title}
                            </p>
                          </div>
                          
                          {/* Text Content Preview */}
                          {lesson.contentType === "text" && lesson.textContent && (
                            <div className="mt-3 pl-11">
                              <div className="prose prose-sm max-w-none text-gray-700 line-clamp-3">
                                <MarkdownRenderer
                                  content={
                                    lesson.textContent.substring(0, 200) +
                                    (lesson.textContent.length > 200 ? "..." : "")
                                  }
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* YouTube Link */}
                          {lesson.contentType === "youtube" && lesson.url && (
                            <div className="mt-3 pl-11">
                              <a
                                href={lesson.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                <Eye size={16} className="mr-1" />
                                Tonton Video
                              </a>
                            </div>
                          )}

                          {/* Attachment */}
                          {lesson.attachmentUrl && lesson.attachmentName && (
                            <div className="mt-3 pl-11">
                              <a
                                href={lesson.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                <LinkIcon size={14} className="mr-1" />
                                {lesson.attachmentName}
                              </a>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic text-sm">
                      Belum ada materi untuk bab ini.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
    const fetchRequiredData = async () => {
      try {
        const [usersRes, divisionsRes, categoriesRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/divisions'),
          fetch('/api/admin/categories'),
        ]);

        const usersData = await usersRes.json();
        const divisionsData = await divisionsRes.json();
        const categoriesData = await categoriesRes.json();

        if (usersData.success) {
          setAllUsers(usersData.data);
        } else {
          toast.error((t) => (
            <div className="flex items-center justify-between w-full">
              <span>Gagal memuat data pengguna.</span>
              <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          ), { duration: 3000 });
        }

        if (divisionsData.success) {
          setAllDivisions(divisionsData.data);
        } else {
          toast.error((t) => (
            <div className="flex items-center justify-between w-full">
              <span>Gagal memuat data divisi.</span>
              <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          ), { duration: 3000 });
        }
        
        if (categoriesData.success) {
          setCategories(categoriesData.data);
        } else {
          toast.error((t) => (
            <div className="flex items-center justify-between w-full">
              <span>Gagal memuat data kategori.</span>
              <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          ), { duration: 3000 });
        }
      } catch (error) {
        console.error('Error fetching required data:', error);
        toast.error((t) => (
          <div className="flex items-center justify-between w-full">
            <span>Terjadi kesalahan saat memuat data esensial.</span>
            <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        ), { duration: 3000 });
      }
    };

    fetchRequiredData();
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
  const [initialFormData, setInitialFormData] = useState<Partial<Course>>({
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
    const initialCourseState: Partial<Course> = {
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
    };
    setFormData(initialCourseState);
    setInitialFormData(initialCourseState);
    setTempLesson({ title: '', contentType: 'youtube', sourceType: 'embed', url: '', textContent: '', duration: '', watermark: true, forceComplete: true, attachmentName: '', attachmentUrl: '' });
    setCurrentStep(1);
    setIsEditing(false);
    setEditId(null);
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
        duration: 10000,
      }
    );
  };
  
  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (course: Course) => {
    setFormData(course);
    setInitialFormData(course);
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
    const confirmMessage = `Hapus kursus "${title}"? Tindakan ini tidak dapat dibatalkan.`;
    
    const performDelete = async () => {
      toast.loading('Menghapus kursus...');
      try {
        const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
        const data = await res.json();

        toast.dismiss();
        if (res.ok) {
          toast.success((t) => (
            <div className="flex items-center justify-between w-full">
              <span>Kursus berhasil dihapus!</span>
              <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          ), { duration: 3000 });
          router.refresh();
        } else {
          toast.error((t) => (
            <div className="flex items-center justify-between w-full">
              <span>{`Gagal: ${data.error || 'Terjadi kesalahan'}`}</span>
              <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          ), { duration: 3000 });
        }
      } catch (error: any) {
        console.error('Delete error:', error);
        toast.dismiss();
        toast.error((t) => (
          <div className="flex items-center justify-between w-full">
            <span>{`Terjadi kesalahan sistem: ${error.message}`}</span>
            <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        ), { duration: 3000 });
      }
    };

    showConfirmationToast(confirmMessage, performDelete);
  };

  const handleSaveAndContinue = async () => {
    if (!formData.title || !formData.categoryId) {
      return toast.error((t) => (
        <div className="flex items-center justify-between w-full">
          <span>Judul dan Kategori wajib diisi</span>
          <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
      ), { duration: 3000 });
    }
    
    setIsLoading(true);
    toast.loading('Menyimpan perubahan...');
    
    const url = isEditing ? `/api/admin/courses/${editId}` : '/api/admin/courses';
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      // The API is expected to handle the partial data and save it.
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Gagal menyimpan progres.');
      }
      
      const courseId = isEditing ? editId : result.data.id;
      if (!courseId) {
        throw new Error("Tidak menerima ID kursus dari server.");
      }

      if (!isEditing) {
          setEditId(courseId);
          setIsEditing(true);
      }
      
      // Re-fetch the definitive state from the server to ensure consistency
      const refetchRes = await fetch(`/api/admin/courses/${courseId}`);
      const updatedCourseResult = await refetchRes.json();

      if (updatedCourseResult.success) {
          setFormData(updatedCourseResult.data);
          setInitialFormData(updatedCourseResult.data);
          toast.dismiss();
          toast.success((t) => (
            <div className="flex items-center justify-between w-full">
              <span>Perubahan berhasil disimpan!</span>
              <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          ), { duration: 3000 });
          router.refresh();
          setCurrentStep(prev => prev + 1);
      } else {
        throw new Error('Gagal mengambil data terbaru setelah menyimpan.');
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error((t) => (
        <div className="flex items-center justify-between w-full">
          <span>{`Gagal: ${error.message}`}</span>
          <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
      ), { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    setIsLoading(true);
    if (!formData.title || !formData.categoryId) {
      toast.error((t) => (
        <div className="flex items-center justify-between w-full">
          <span>Judul dan Kategori wajib diisi</span>
          <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
      ), { duration: 3000 });
      setIsLoading(false);
      return;
    }
    toast.loading('Menyimpan kursus...');
    
    const finalFormData = { ...formData };

    try {
      const url = isEditing ? `/api/admin/courses/${editId}` : '/api/admin/courses';
      const method = isEditing ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalFormData) });
      const result = await res.json();
      toast.dismiss();
      if (result.success) {
        toast.success((t) => (
          <div className="flex items-center justify-between w-full">
            <span>{`Kursus berhasil ${isEditing ? 'diperbarui' : 'dibuat'}!`}</span>
            <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        ), { duration: 3000 });
        setShowModal(false);
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
      console.error('Save error:', error);
      toast.dismiss();
      toast.error((t) => (
        <div className="flex items-center justify-between w-full">
          <span>Terjadi kesalahan sistem</span>
          <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
      ), { duration: 3000 });
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
    const confirmMessage = 'Anda yakin ingin menghapus materi ini dari daftar?';
    
    const performDelete = () => {
      const newSections = (formData.sections || []).map(s => s.id === sectionId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s);
      setFormData(prev => ({ ...prev, sections: newSections }));
      toast.success((t) => (
        <div className="flex items-center justify-between w-full">
          <span>Materi dihapus dari daftar.</span>
          <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
      ), { duration: 3000 });
    };

    showConfirmationToast(confirmMessage, performDelete);
  };

  const handleSaveLesson = (sectionId: string) => {
    if (!tempLesson.title) return toast.error((t) => (
      <div className="flex items-center justify-between w-full">
        <span>Judul materi wajib diisi</span>
        <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
          <X size={16} />
        </button>
      </div>
    ), { duration: 3000 });
    if (tempLesson.contentType === 'youtube' && !tempLesson.url) return toast.error((t) => (
      <div className="flex items-center justify-between w-full">
        <span>URL materi wajib diisi</span>
        <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
          <X size={16} />
        </button>
      </div>
    ), { duration: 3000 });
    if (tempLesson.contentType === 'text' && !tempLesson.textContent) return toast.error((t) => (
      <div className="flex items-center justify-between w-full">
        <span>Konten artikel wajib diisi</span>
        <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
          <X size={16} />
        </button>
      </div>
    ), { duration: 3000 });

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
    toast.success((t) => (
      <div className="flex items-center justify-between w-full">
        <span>Materi berhasil disimpan sementara!</span>
        <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-gray-100">
          <X size={16} />
        </button>
      </div>
    ), { duration: 3000 });
  };

  const handleRichTextChange = useCallback((content: string) => {
    setTempLesson(prev => ({...prev, textContent: content}));
  }, [setTempLesson]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialFormData);

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
              <button onClick={() => isDirty ? handleSaveAndContinue() : setCurrentStep(2)} disabled={!isEditing && !formData.title} className={`px-4 py-2 rounded-full flex items-center space-x-2 ${currentStep === 2 ? 'bg-[#FFF8E7] text-[#C5A059] border border-[#C5A059]' : 'text-gray-400'}`}><span className="w-6 h-6 rounded-full bg-current text-white flex items-center justify-center text-xs">2</span><span className="font-semibold text-sm">Kurikulum</span></button>
              <div className="w-8 h-px bg-gray-300 self-center"></div>
              <button onClick={() => isDirty ? handleSaveAndContinue() : setCurrentStep(3)} disabled={!isEditing && !formData.title} className={`px-4 py-2 rounded-full flex items-center space-x-2 ${currentStep === 3 ? 'bg-[#FFF8E7] text-[#C5A059] border border-[#C5A059]' : 'text-gray-400'}`}><span className="w-6 h-6 rounded-full bg-current text-white flex items-center justify-center text-xs">3</span><span className="font-semibold text-sm">Enrollment</span></button>
            </div></div>
            <div className="flex-1 overflow-y-auto p-8">
              {currentStep === 1 ? (
                <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Judul Kursus</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400" placeholder="Contoh: SOP Pelayanan Jamaah" disabled={isLoading}/></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label><select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black bg-white" disabled={isLoading}><option value="">Pilih Kategori</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Level</label><select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as any})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black bg-white" disabled={isLoading}><option value="basic">Basic</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
                    <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label><textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400" placeholder="Jelaskan tentang kursus ini..." disabled={isLoading} /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image (URL)</label><input type="text" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400" placeholder="https://..." disabled={isLoading}/></div>
                    { (formData.thumbnail || formData.coverImage) && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Preview Thumbnail</label>
                            <img src={formData.thumbnail || formData.coverImage} alt="Preview" className="w-full h-auto rounded-lg border" />
                        </div>
                    )}
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
                            {tempLesson.contentType === 'youtube' && <div className="grid grid-cols-2 gap-3 mb-3"><input type="text" placeholder="Durasi (menit)" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400" value={tempLesson.duration} onChange={e => setTempLesson({...tempLesson, duration: e.target.value})} disabled={isLoading}/><input type="text" placeholder="URL Youtube" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C5A059] outline-none text-black placeholder:text-gray-400" value={tempLesson.url} onChange={e => setTempLesson({...tempLesson, url: e.target.value})} onBlur={e => {
                                const videoId = getYouTubeId(e.target.value);
                                if (videoId) {
                                    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                    if (!formData.coverImage) {
                                        setFormData({...formData, thumbnail: thumbnailUrl });
                                    }
                                }
                            }} disabled={isLoading}/></div>}
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
                    <div className="border rounded-lg h-48 overflow-y-auto p-2 bg-gray-50 space-y-2">
                      {allUsers
                        .filter(user =>
                          user.name.toLowerCase().includes(searchTermUsers.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTermUsers.toLowerCase())
                        )
                        .map((user) => {
                          const isEnrolled = formData.enrolledUserIds?.includes(user.id) ?? false;
                          return (
                            <label key={user.id} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer border transition-all ${
                              isEnrolled 
                                ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                : 'bg-white border-gray-200 hover:bg-gray-100'
                            }`}>
                              <input
                                type="checkbox"
                                checked={isEnrolled}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const userId = user.id;
                                  setFormData(prev => ({
                                    ...prev,
                                    enrolledUserIds: checked
                                      ? [...(prev.enrolledUserIds || []), userId]
                                      : (prev.enrolledUserIds || []).filter(id => id !== userId),
                                  }));
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-[#C5A059] focus:ring-2 focus:ring-offset-0 focus:ring-[#C5A059]/50"
                              />
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-brand-gold to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-black">{user.name}</span>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </label>
                          )
                        })}
                    </div>
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
                                        <div className="border rounded-lg h-48 overflow-y-auto p-2 bg-gray-50 space-y-2">
                      {allDivisions
                        .filter(division =>
                          division.name.toLowerCase().includes(searchTermDivisions.toLowerCase())
                        )
                        .map((division) => {
                          const isEnrolled = formData.enrolledDivisionIds?.includes(division.id) ?? false;
                          return (
                            <label key={division.id} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer border transition-all ${
                              isEnrolled 
                                ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                : 'bg-white border-gray-200 hover:bg-gray-100'
                            }`}>
                              <input
                                type="checkbox"
                                checked={isEnrolled}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const divisionId = division.id;
                                  setFormData(prev => ({
                                    ...prev,
                                    enrolledDivisionIds: checked
                                      ? [...(prev.enrolledDivisionIds || []), divisionId]
                                      : (prev.enrolledDivisionIds || []).filter(id => id !== divisionId),
                                  }));
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-[#C5A059] focus:ring-2 focus:ring-offset-0 focus:ring-[#C5A059]/50"
                              />
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                                  <Users size={16} />
                                </div>
                                <span className="text-sm font-semibold text-black">{division.name}</span>
                              </div>
                            </label>
                          )
                        })}
                    </div>                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end space-x-3 bg-white rounded-b-xl">
              {currentStep > 1 && <button onClick={() => setCurrentStep(prev => prev - 1)} disabled={isLoading} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">Kembali</button>}
              
              {currentStep < 3 ? (
                isDirty ? (
                  <button onClick={handleSaveAndContinue} disabled={isLoading} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center shadow-md">
                    {isLoading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                    {isLoading ? 'Menyimpan...' : 'Simpan & Lanjut'}
                  </button>
                ) : (
                  <button onClick={() => setCurrentStep(prev => prev + 1)} disabled={isLoading} className="px-6 py-2.5 bg-[#C5A059] text-black rounded-lg hover:bg-[#B08F4A] font-bold">Lanjut</button>
                )
              ) : (
                <button onClick={handleSaveCourse} disabled={isLoading || (!isDirty && isEditing)} className="px-6 py-2.5 bg-[#C5A059] text-black rounded-lg hover:bg-[#B08F4A] font-bold flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />} 
                  {isLoading ? 'Menyimpan...' : 'Simpan Kursus'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPreview && previewData && (
        <CoursePreviewModal previewData={previewData} onClose={() => setShowPreview(false)} />
      )}

    </div>
  );
};

export default CourseManagement;