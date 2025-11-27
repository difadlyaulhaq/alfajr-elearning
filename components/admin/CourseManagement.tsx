import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Users, Video, FileText, Upload, ExternalLink, LinkIcon } from 'lucide-react';

const CourseManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    category: '',
    description: '',
    coverImage: null,
    sections: []
  });

  const courses = [
    { 
      id: 1, 
      title: 'SOP Pelayanan Jamaah', 
      category: 'Marketing', 
      videos: 12, 
      students: 45, 
      status: 'active',
      thumbnail: '📚'
    },
    { 
      id: 2, 
      title: 'Marketing Digital untuk Umroh', 
      category: 'Marketing', 
      videos: 8, 
      students: 32, 
      status: 'active',
      thumbnail: '💼'
    },
    { 
      id: 3, 
      title: 'Finance Management', 
      category: 'Finance', 
      videos: 15, 
      students: 28, 
      status: 'draft',
      thumbnail: '💰'
    }
  ];

  const AddCourseModal = () => {
    const [videoData, setVideoData] = useState({
      title: '',
      sourceType: 'embed',
      url: '',
      duration: '',
      watermark: true,
      forceComplete: true
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-white rounded-lg w-full max-w-4xl p-6 m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">Buat Kursus Baru</h2>
            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-black">
              ✕
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-[#C5A059]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= 1 ? 'bg-[#C5A059] text-black' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="ml-2 font-semibold">Info Dasar</span>
              </div>
              <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-[#C5A059]' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${currentStep >= 2 ? 'text-[#C5A059]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= 2 ? 'bg-[#C5A059] text-black' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="ml-2 font-semibold">Kurikulum</span>
              </div>
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Judul Kursus</label>
                <input
                  type="text"
                  placeholder="Contoh: Standard Operating Procedure (SOP) Pelayanan Jamaah"
                  value={courseData.title}
                  onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Kategori</label>
                <select 
                  value={courseData.category}
                  onChange={(e) => setCourseData({...courseData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="marketing">Marketing & Sales</option>
                  <option value="finance">Finance</option>
                  <option value="operasional">Operasional</option>
                  <option value="hr">Human Resources</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Deskripsi</label>
                <textarea
                  placeholder="Jelaskan apa yang akan dipelajari dalam kursus ini..."
                  value={courseData.description}
                  onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Cover Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#C5A059] transition-colors cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600">Click to upload atau drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG hingga 2MB</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Batal
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 bg-[#C5A059] text-black rounded-lg hover:bg-[#B08F4A] transition-colors font-semibold"
                >
                  Lanjut ke Kurikulum
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Curriculum */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-black mb-4">Tambah Materi Video</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Judul Video</label>
                    <input
                      type="text"
                      placeholder="Contoh: Cara Menyapa Jamaah di Bandara"
                      value={videoData.title}
                      onChange={(e) => setVideoData({...videoData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Tipe Sumber Video</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sourceType"
                          value="embed"
                          checked={videoData.sourceType === 'embed'}
                          onChange={(e) => setVideoData({...videoData, sourceType: e.target.value})}
                          className="text-[#C5A059] focus:ring-[#C5A059]"
                        />
                        <LinkIcon size={16} />
                        <span className="text-sm">Embed Link (YouTube/Vimeo)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sourceType"
                          value="upload"
                          checked={videoData.sourceType === 'upload'}
                          onChange={(e) => setVideoData({...videoData, sourceType: e.target.value})}
                          className="text-[#C5A059] focus:ring-[#C5A059]"
                        />
                        <Upload size={16} />
                        <span className="text-sm">Upload File</span>
                      </label>
                    </div>
                  </div>

                  {videoData.sourceType === 'embed' && (
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">URL Video</label>
                      <input
                        type="text"
                        placeholder="https://youtube.com/watch?v=..."
                        value={videoData.url}
                        onChange={(e) => setVideoData({...videoData, url: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">*Pastikan video diset sebagai Unlisted di YouTube</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Durasi Video (menit)</label>
                    <input
                      type="number"
                      placeholder="15"
                      value={videoData.duration}
                      onChange={(e) => setVideoData({...videoData, duration: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="border-t border-gray-300 pt-4">
                    <h4 className="font-semibold text-black mb-3">Pengaturan Keamanan</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={videoData.watermark}
                          onChange={(e) => setVideoData({...videoData, watermark: e.target.checked})}
                          className="w-5 h-5 text-[#C5A059] rounded focus:ring-[#C5A059]"
                        />
                        <div>
                          <span className="font-medium text-black">Aktifkan Watermark User</span>
                          <p className="text-xs text-gray-500">Nama pegawai akan muncul di video</p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={videoData.forceComplete}
                          onChange={(e) => setVideoData({...videoData, forceComplete: e.target.checked})}
                          className="w-5 h-5 text-[#C5A059] rounded focus:ring-[#C5A059]"
                        />
                        <div>
                          <span className="font-medium text-black">Wajib Tonton Sampai Habis</span>
                          <p className="text-xs text-gray-500">User tidak bisa skip/fast-forward</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-300 pt-4">
                    <h4 className="font-semibold text-black mb-3">Dokumen Pendukung (Opsional)</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#C5A059] transition-colors cursor-pointer">
                      <FileText className="mx-auto text-gray-400 mb-2" size={24} />
                      <p className="text-sm text-gray-600">Upload PDF atau Excel</p>
                      <p className="text-xs text-gray-400 mt-1">Maksimal 10MB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Kembali
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setCurrentStep(1);
                  }}
                  className="px-6 py-2 bg-[#C5A059] text-black rounded-lg hover:bg-[#B08F4A] transition-colors font-semibold"
                >
                  Simpan Kursus
                </button>
              </div>
            </div>
          )}
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
            <h1 className="text-2xl font-bold text-black">Kelola Kursus</h1>
            <p className="text-gray-600 mt-1">Buat dan kelola materi pembelajaran</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-[#C5A059] text-black px-5 py-2.5 rounded-lg hover:bg-[#B08F4A] transition-colors font-semibold"
          >
            <Plus size={20} />
            <span>Buat Kursus Baru</span>
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
                placeholder="Cari kursus..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none">
              <option value="all">Semua Kategori</option>
              <option value="marketing">Marketing</option>
              <option value="finance">Finance</option>
              <option value="operasional">Operasional</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none">
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
              <div className="bg-gradient-to-br from-[#C5A059] to-[#8B7355] h-40 flex items-center justify-center text-6xl">
                {course.thumbnail}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#C5A059] bg-[#FFF8E7] px-2 py-1 rounded">
                    {course.category}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    course.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status === 'active' ? 'Aktif' : 'Draft'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-black mb-3">{course.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Video size={16} />
                    <span>{course.videos} video</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users size={16} />
                    <span>{course.students} peserta</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Eye size={16} />
                    <span className="text-sm font-semibold">Lihat</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-[#FFF8E7] text-[#C5A059] rounded-lg hover:bg-[#FFF3D6] transition-colors">
                    <Edit size={16} />
                    <span className="text-sm font-semibold">Edit</span>
                  </button>
                  <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && <AddCourseModal />}
    </div>
  );
};

export default CourseManagement;