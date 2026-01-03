import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Cari file APK di folder public
    const publicDir = path.join(process.cwd(), 'public');
    const filename = 'Alfajr-Elearning.apk';
    const filePath = path.join(publicDir, filename);

    // Cek apakah file ada
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Baca file buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Kirim response dengan header yang memaksa download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', // Matikan cache
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
