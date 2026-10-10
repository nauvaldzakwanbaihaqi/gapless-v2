import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { certificates, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    const isAdmin = currentUser?.isAdmin || currentUser?.role === 'ADMIN' || session.user.email === 'nauvaldzakwanbaihaqi@gmail.com';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Hanya admin yang dapat mengakses daftar sertifikat' }, { status: 403 });
    }

    const rows = await db
      .select({
        id: certificates.id,
        userId: certificates.userId,
        userName: users.name,
        userEmail: users.email,
        judul: certificates.judul,
        penyelenggara: certificates.penyelenggara,
        tanggalTerbit: certificates.tanggalTerbit,
        kategoriSkill: certificates.kategoriSkill,
        sumber: certificates.sumber,
        catatanTambahan: certificates.catatanTambahan,
        fileMimeType: certificates.fileMimeType,
        fileSize: certificates.fileSize,
        status: certificates.status,
        adminNote: certificates.adminNote,
        readinessBoostApplied: certificates.readinessBoostApplied,
        reviewedBy: certificates.reviewedBy,
        source: certificates.source,
        createdAt: certificates.createdAt,
        reviewedAt: certificates.reviewedAt,
      })
      .from(certificates)
      .leftJoin(users, eq(certificates.userId, users.id))
      .orderBy(desc(certificates.createdAt));

    return NextResponse.json({ certificates: rows });
  } catch (error) {
    console.error('Error fetching admin certificates:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
