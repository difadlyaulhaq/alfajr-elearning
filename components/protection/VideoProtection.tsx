import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface VideoProtectionProps {
  videoUrl: string;
  className?: string;
}

const VideoProtection: React.FC<VideoProtectionProps> = ({ videoUrl, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    
    if (!video || !canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const overlayCtx = overlayCanvas.getContext('2d');
    
    if (!ctx || !overlayCtx) return;

    let lastFrameData: ImageData | null = null;
    let frameCheckCount = 0;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;
      overlayCanvas.width = canvas.width;
      overlayCanvas.height = canvas.height;
    };

    video.addEventListener('loadedmetadata', updateCanvasSize);
    video.addEventListener('play', updateCanvasSize);

    // Render video with protection
    const renderFrame = () => {
      if (!video.paused && !video.ended) {
        try {
          // Draw video to hidden canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Get current frame data
          const currentFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Check for screenshot attempts by comparing frames
          if (lastFrameData) {
            frameCheckCount++;
            
            // Every 10 frames, check for suspicious patterns
            if (frameCheckCount % 10 === 0) {
              const diff = compareFrames(lastFrameData, currentFrameData);
              
              // If frames are identical when they shouldn't be, might be frozen for screenshot
              if (diff < 0.001 && !video.paused) {
                console.warn('Suspicious: Video frozen while playing');
                blockVideo('Video playback anomaly detected');
              }
            }
          }
          
          lastFrameData = currentFrameData;
          
          // Draw frame to overlay canvas with protection
          overlayCtx.drawImage(canvas, 0, 0);
          
          // Add dynamic watermark
          addDynamicWatermark(overlayCtx, canvas.width, canvas.height);
          
          // Add noise to prevent clear screenshots
          addNoise(overlayCtx, canvas.width, canvas.height);
          
        } catch (e) {
          console.error('Frame rendering error:', e);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    // Compare two frames to detect anomalies
    const compareFrames = (frame1: ImageData, frame2: ImageData): number => {
      let diff = 0;
      const data1 = frame1.data;
      const data2 = frame2.data;
      
      // Sample every 100th pixel for performance
      for (let i = 0; i < data1.length; i += 400) {
        diff += Math.abs(data1[i] - data2[i]);
      }
      
      return diff / (data1.length / 400);
    };

    // Add dynamic watermark that changes position
    const addDynamicWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const time = Date.now();
      const x = (Math.sin(time / 1000) * 0.3 + 0.5) * width;
      const y = (Math.cos(time / 1000) * 0.3 + 0.5) * height;
      
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText('PROTECTED', x, y);
      ctx.restore();
      
      // Add timestamp watermark
      const timestamp = new Date().toLocaleTimeString();
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.fillText(timestamp, width - 100, height - 20);
      ctx.restore();
    };

    // Add subtle noise to make screenshots less useful
    const addNoise = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // Add very subtle noise (every 50th pixel)
      for (let i = 0; i < data.length; i += 200) {
        const noise = Math.random() * 10 - 5;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }
      
      ctx.putImageData(imageData, 0, 0);
    };

    const blockVideo = (reason: string) => {
      setIsBlocked(true);
      setBlockReason(reason);
      video.pause();
      
      // Log the violation
      fetch('/api/security/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'video_protection_triggered',
          page: window.location.pathname,
          details: { reason }
        })
      }).catch(() => {});
      
      setTimeout(() => {
        setIsBlocked(false);
        video.play();
      }, 5000);
    };

    // Detect if video element is being captured
    const checkVideoCapture = () => {
      // Check if MediaRecorder might be active
      if (navigator.mediaDevices && (navigator.mediaDevices as any).getDisplayMedia) {
        // Can't directly detect screen recording, but can monitor behavior
        const originalGetDisplayMedia = (navigator.mediaDevices as any).getDisplayMedia;
        
        (navigator.mediaDevices as any).getDisplayMedia = function(...args: any[]) {
          console.warn('Screen recording attempt detected');
          blockVideo('Screen recording detected');
          return originalGetDisplayMedia.apply(this, args);
        };
      }
    };

    checkVideoCapture();

    // Start rendering
    video.addEventListener('play', () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    });

    // Monitor for page visibility changes (app switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Prevent right-click on video
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    video.addEventListener('contextmenu', preventContextMenu);
    overlayCanvas.addEventListener('contextmenu', preventContextMenu);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      video.removeEventListener('loadedmetadata', updateCanvasSize);
      video.removeEventListener('play', updateCanvasSize);
      video.removeEventListener('contextmenu', preventContextMenu);
      overlayCanvas.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [videoUrl]);

  return (
    <div className={`relative ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Hidden video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        controls={false}
        style={{ display: 'none' }}
        playsInline
        preload="metadata"
      />
      
      {/* Hidden processing canvas */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      
      {/* Visible protected canvas */}
      <canvas
        ref={overlayCanvasRef}
        className="w-full h-full"
        style={{
          display: 'block',
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          pointerEvents: isBlocked ? 'none' : 'auto'
        }}
      />

      {/* Custom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const video = videoRef.current;
              if (video) {
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              }
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-white text-sm"
          >
            {videoRef.current?.paused ? 'Play' : 'Pause'}
          </button>
          
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="0"
            className="flex-1"
            onChange={(e) => {
              const video = videoRef.current;
              if (video && video.duration) {
                video.currentTime = (parseFloat(e.target.value) / 100) * video.duration;
              }
            }}
          />
        </div>
      </div>

      {/* Block overlay */}
      {isBlocked && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white p-8">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-bold mb-2">Video Diblokir</h3>
            <p className="text-sm text-gray-300">{blockReason}</p>
            <p className="text-xs text-gray-400 mt-2">Video akan dilanjutkan dalam beberapa detik...</p>
          </div>
        </div>
      )}
      
      {/* Always-visible warning */}
      <div className="absolute top-4 right-4 bg-red-500/80 text-white text-xs px-3 py-1 rounded-full">
        🔒 Protected Content
      </div>
    </div>
  );
};

export default VideoProtection;