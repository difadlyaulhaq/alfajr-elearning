import DownloadAppButton from '@/components/shared/DownloadAppButton';

export default function DownloadPage() {
  return (
    <div className="flex flex-col h-screen items-center justify-center p-4 bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
            <img 
                src="/logo-alfajr.png" 
                alt="Alfajr Umroh Logo" 
                className="w-32 h-auto object-contain mx-auto mb-4"
            />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Download Aplikasi</h1>
            <p className="text-gray-600 mb-6 text-sm">
                Untuk pengalaman terbaik, silakan unduh aplikasi Alfajr E-Learning.
            </p>
            <DownloadAppButton 
                variant="primary" 
                className="w-full" 
                apkUrl="/api/download"
            />
        </div>
    </div>
  );
}
