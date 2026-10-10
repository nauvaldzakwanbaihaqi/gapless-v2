import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { certificates, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { readCertificateFile } from '@/lib/certificate_storage';
import { isUserAdmin } from '@/lib/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: certId } = await params;

    // Ambil data sertifikat
    const certRows = await db
      .select()
      .from(certificates)
      .where(eq(certificates.id, certId))
      .limit(1);

    if (certRows.length === 0) {
      return NextResponse.json({ error: 'Sertifikat tidak ditemukan' }, { status: 404 });
    }

    const cert = certRows[0];

    // Cek role admin user jika pengakses bukan pemilik file
    let isAuthorized = session.user.id === cert.userId;
    if (!isAuthorized) {
      const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      });
      if (isUserAdmin({ ...currentUser, email: session.user.email })) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden: Kamu tidak memiliki akses ke dokumen ini' }, { status: 403 });
    }

    const fileBuffer = await readCertificateFile(cert.fileStorageKey, cert.fileData);
    if (!fileBuffer) {
      return NextResponse.json({ error: 'File tidak ditemukan di penyimpanan server' }, { status: 404 });
    }

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': cert.fileMimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${cert.judul.replace(/[^a-zA-Z0-9-_ ]/g, '')}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error serving certificate file:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
