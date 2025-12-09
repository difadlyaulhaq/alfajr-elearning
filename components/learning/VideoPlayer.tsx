
'use client';

import React, { useMemo } from 'react';

// --- Tipe Data ---
interface User {
  name: string;
  email: string;
}

interface VideoPlayerProps {
  lesson: {
    title: string;
    contentType: 'video' | 'youtube' | 'text';
    url: string;
    textContent: string;
  };
  user: User | null; // Tambahkan prop user
}

const VideoPlayer = ({ lesson, user }: VideoPlayerProps) => {

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (videoId) {
      const params = new URLSearchParams({
        rel: '0', showinfo: '0', iv_load_policy: '3', 
        modestbranding: '1', controls: '1', disablekb: '0',
      });
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }
    return null;
  };

  const embedUrl = useMemo(() => {
    if (lesson.contentType === 'youtube') {
      return getYouTubeEmbedUrl(lesson.url);
    }
    return lesson.url;
  }, [lesson]);

  // CSS for watermark animation
  const watermarkAnimation = `
    @keyframes float-watermark {
      0% { transform: translate(0%, 0%); }
      25% { transform: translate(10%, 20%); }
      50% { transform: translate(25%, 5%); }
      75% { transform: translate(5%, 25%); }
      100% { transform: translate(0%, 0%); }
    }
  `;

  if (lesson.contentType === 'text') {
    return (
        <div className="bg-white p-6 md:p-8 rounded-lg border">
             <h2 className="text-2xl font-bold text-black mb-4">{lesson.title}</h2>
             <div 
                className="prose prose-lg max-w-none text-black"
                dangerouslySetInnerHTML={{ __html: lesson.textContent }}
             />
        </div>
    )
  }

  return (
    <div 
      className="relative w-full bg-black rounded-lg overflow-hidden" 
      style={{ paddingTop: '56.25%' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <style>{watermarkAnimation}</style>
      
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={lesson.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      ) : (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white">
          <p>URL video tidak valid atau tidak didukung.</p>
        </div>
      )}

      {/* Watermark Element */}
      {user && (
        <div 
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
          style={{
            animation: 'float-watermark 20s infinite ease-in-out'
          }}
        >
          <p className="text-white/20 font-sans text-xl md:text-2xl select-none" style={{ textShadow: '1px 1px 2px black' }}>
            {user.name} - {user.email}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
