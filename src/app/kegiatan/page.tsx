import { hasActivePro } from '@/lib/payment_service';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { LearningTabsNav } from '@/components/LearningTabsNav';
import { getEntitlements } from '@/lib/entitlements';
import { db } from '@/db';
import { activities, savedActivities, activityEvidence } from '@/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { KegiatanClient } from './KegiatanClient';

export const metadata = { title: 'Rekomendasi Kegiatan | Gapless' };

export default async function KegiatanPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin?callbackUrl=/kegiatan');

  const isPro = await hasActivePro(session.user.id);
  const ent = getEntitlements(isPro);

  // Ambil kegiatan aktif
  // Urutan: Free by deadline terdekat, Plus by sortOrder / match
  const allActivities = await db
    .select()
    .from(activities)
    .where(eq(activities.isActive, true))
    .orderBy(ent.isPro ? asc(activities.sortOrder) : asc(activities.deadline));

  // Ambil saved activities user
  const savedRows = await db
    .select({ activityId: savedActivities.activityId })
    .from(savedActivities)
    .where(eq(savedActivities.userId, session.user.id));

  const savedIds = savedRows.map((r) => r.activityId);

  // Ambil bukti kegiatan user
  const evidenceRows = await db
    .select()
    .from(activityEvidence)
    .where(eq(activityEvidence.userId, session.user.id));

  const evidenceMap = Object.fromEntries(
    evidenceRows.map((e) => [e.activityId, e])
  );

  // Gating: Free hanya lihat N kegiatan (misal 3 per kuota)
  const limit = ent.activities.limit;
  const openActivities = Number.isFinite(limit)
    ? allActivities.slice(0, limit)
    : allActivities;
  const lockedCount = allActivities.length - openActivities.length;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
      <Navbar />
      <LearningTabsNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-28 md:pb-8">
        <KegiatanClient
          activities={openActivities}
          savedIds={savedIds}
          evidenceMap={evidenceMap}
          isPro={ent.isPro}
          lockedCount={lockedCount}
          monthlyQuota={ent.activities.limit}
        />
      </main>
    </div>
  );
}
