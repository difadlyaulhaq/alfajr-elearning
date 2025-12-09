
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/utils/scrape-thumbnail
 * Mengambil URL video YouTube dari query parameter 'url', lalu melakukan scraping
 * untuk mendapatkan thumbnail dengan resolusi tertinggi.
 * @param {NextRequest} request - Objek request dari Next.js.
 * @returns {NextResponse} - JSON response berisi thumbnailUrl atau pesan error.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json(
      { success: false, error: "Parameter 'url' tidak ditemukan." },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch halaman video YouTube
    const response = await fetch(videoUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    if (!response.ok) {
        throw new Error(`Gagal fetch URL: ${response.statusText}`);
    }
    const html = await response.text();

    // 2. Cari 'ytInitialPlayerResponse' di dalam HTML
    const match = html.match(/var ytInitialPlayerResponse = ({.*?});/);
    if (!match || !match[1]) {
        // Fallback ke metode lama jika metode baru gagal
        return fallbackToOldMethod(videoUrl);
    }

    const playerResponse = JSON.parse(match[1]);
    const thumbnails = playerResponse?.videoDetails?.thumbnail?.thumbnails;

    if (!thumbnails || thumbnails.length === 0) {
      throw new Error("Data thumbnail tidak ditemukan di dalam player response.");
    }

    // 3. Cari thumbnail dengan resolusi terbaik (lebar terbesar)
    const bestThumbnail = thumbnails.reduce((prev: any, current: any) => 
        (prev.width > current.width) ? prev : current
    );

    return NextResponse.json({ success: true, thumbnailUrl: bestThumbnail.url });

  } catch (error: any) {
    console.error('Kesalahan saat scraping thumbnail:', error);
    // Jika ada error, coba fallback ke metode lama
    return fallbackToOldMethod(videoUrl);
  }
}

function fallbackToOldMethod(videoUrl: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (videoId) {
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        return NextResponse.json({ success: true, thumbnailUrl });
    }

    return NextResponse.json(
      { success: false, error: "Gagal mengekstrak thumbnail dari URL." },
      { status: 500 }
    );
}
