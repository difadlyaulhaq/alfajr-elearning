// lib/utils.ts

export const getYouTubeThumbnail = (url: string) => {
  if (!url) return null;
  
  // Regex untuk menangkap ID dari berbagai format URL (youtu.be, v=, embed, dll)
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  // Jika match dan ID-nya 11 karakter (standar YouTube)
  if (match && match[2].length === 11) {
    // Gunakan maxresdefault untuk kualitas banner terbaik
    return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
  }
  
  return null;
};