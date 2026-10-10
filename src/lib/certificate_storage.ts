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
 * Simpan file sertifikat ke direktori storage privat yang aman
 */
export async function saveCertificateFile(
  userId: string,
  certId: string,
  file: File,
  ext: string,
  mimeType: string
): Promise<{ storageKey: string; size: number }> {
  // Direktori terisolasi per user
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizedCertId = certId.replace(/[^a-zA-Z0-9-_]/g, '');
  const relativeKey = `${sanitizedUserId}/${sanitizedCertId}.${ext}`;

  const baseStorageDir = path.join(process.cwd(), 'storage', 'certificates', sanitizedUserId);
  if (!fs.existsSync(baseStorageDir)) {
    fs.mkdirSync(baseStorageDir, { recursive: true });
  }

  const fullPath = path.join(baseStorageDir, `${sanitizedCertId}.${ext}`);
  const arrayBuffer = await file.arrayBuffer();
  fs.writeFileSync(fullPath, Buffer.from(arrayBuffer));

  return {
    storageKey: relativeKey,
    size: file.size,
  };
}

/**
 * Baca file dari storage untuk streaming privat
 */
export async function readCertificateFile(storageKey: string): Promise<Buffer | null> {
  // Cegah path traversal
  const normalizedKey = path.normalize(storageKey).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(process.cwd(), 'storage', 'certificates', normalizedKey);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  return fs.readFileSync(fullPath);
}
