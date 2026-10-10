import fs from 'fs';
import path from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  ext?: string;
  mimeType?: string;
}

/**
 * Validasi MIME type berbasis magic bytes konten file + ekstensi
 */
export async function validateCertificateFile(file: File): Promise<FileValidationResult> {
  if (!file) {
    return { valid: false, error: 'File tidak ditemukan' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Ukuran file melebihi batas maksimum 5MB' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length < 4) {
    return { valid: false, error: 'File rusak atau terlalu kecil' };
  }

  // Cek Magic Bytes
  // PNG: 89 50 4E 47
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;

  // JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

  // PDF: 25 50 44 46 (%PDF)
  const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;

  if (isPng) {
    return { valid: true, ext: 'png', mimeType: 'image/png' };
  }
  if (isJpeg) {
    return { valid: true, ext: 'jpg', mimeType: 'image/jpeg' };
  }
  if (isPdf) {
    return { valid: true, ext: 'pdf', mimeType: 'application/pdf' };
  }

  return {
    valid: false,
    error: 'Format file tidak didukung. Harap unggah file berformat JPG, PNG, atau PDF.',
  };
}

/**
 * Simpan file sertifikat secara aman (kompatibel Serverless Vercel & Lokal)
 */
export async function saveCertificateFile(
  userId: string,
  certId: string,
  file: File,
  ext: string,
  mimeType: string
): Promise<{ storageKey: string; size: number; base64Data: string }> {
  // Direktori terisolasi per user
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizedCertId = certId.replace(/[^a-zA-Z0-9-_]/g, '');
  const relativeKey = `${sanitizedUserId}/${sanitizedCertId}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Data = buffer.toString('base64');

  // Coba simpan ke local disk hanya di development lokal
  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      const storageRoot = path.join(process.cwd(), 'storage', 'certificates');
      const userDir = path.join(storageRoot, sanitizedUserId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      const fullPath = path.join(userDir, `${sanitizedCertId}.${ext}`);
      fs.writeFileSync(fullPath, buffer);
    }
  } catch (fsErr) {
    console.warn('Local filesystem write skipped:', fsErr);
  }

  return {
    storageKey: relativeKey,
    size: file.size,
    base64Data,
  };
}

/**
 * Baca file dari storage untuk streaming privat (dengan prioritas base64 database)
 */
export async function readCertificateFile(
  storageKey: string,
  base64Fallback?: string | null
): Promise<Buffer | null> {
  // 1. Prioritas utama: jika ada data base64 dari database (kompatibel 100% di serverless Vercel)
  if (base64Fallback) {
    try {
      return Buffer.from(base64Fallback, 'base64');
    } catch {
      // fallback ke disk jika decode gagal
    }
  }

  // 2. Coba baca dari filesystem lokal jika ada (misal di local dev)
  try {
    const normalizedKey = path.normalize(storageKey).replace(/^(\.\.[\/\\])+/, '');
    const localPath = path.join(process.cwd(), 'storage', 'certificates', normalizedKey);
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
  } catch (err) {
    console.warn('File read from disk warning:', err);
  }

  return null;
}
