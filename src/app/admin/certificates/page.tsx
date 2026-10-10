import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { certificates, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Navbar } from '@/components/Navbar';
import { AdminCertificatesClient } from './AdminCertificatesClient';

export const metadata = { title: 'Admin Review Sertifikat | Gapless' };

export default async function AdminCertificatesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/admin/certificates');
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  const isAdmin = currentUser?.role === 'ADMIN' || session.user.email === 'nauvaldzakwanbaihaqi@gmail.com';
  if (!isAdmin) {
    redirect('/');
  }

  const allCerts = await db
    .select({
      id: certificates.id,
      userId: certificates.userId,
      userName: users.name,
      userEmail: users.email,
      judul: certificates.judul,
      penyelenggara: certificates.penyelenggara,
      tanggalTerbit: certificates.tanggalTerbit,
      kategoriSkill: certificates.kategoriSkill,
      fileMimeType: certificates.fileMimeType,
      fileSize: certificates.fileSize,
      status: certificates.status,
      adminNote: certificates.adminNote,
      readinessBoostApplied: certificates.readinessBoostApplied,
      source: certificates.source,
      createdAt: certificates.createdAt,
      reviewedAt: certificates.reviewedAt,
    })
    .from(certificates)
    .leftJoin(users, eq(certificates.userId, users.id))
    .orderBy(desc(certificates.createdAt));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <AdminCertificatesClient initialCertificates={allCerts} />
      </main>
    </div>
  );
}
