import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AssessmentPageClient } from './AssessmentPageClient';
import { Suspense } from 'react';
import { getRemainingAttempts } from '@/lib/assessmentLimit';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { PLAN_CONFIG } from '@/config/plan';

export default async function AssessmentPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/assessment');
  }

  const userTier = (session.user as any).tier || 'FREE';
  const { isAllowed, remaining, limit } = await getRemainingAttempts(
    session.user.id,
    'belum_tahu_minat',
    userTier
  );

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Batas Percobaan Habis</h2>
          <p className="text-slate-600 mb-6 text-sm">
            Anda telah menggunakan {limit} kesempatan gratis untuk tes minat ini. 
            Tingkatkan ke paket {PLAN_CONFIG.plus.name} untuk akses asesmen berkala dan fitur lanjutan.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/pricing?upgrade=auto"
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md"
            >
              Upgrade ke {PLAN_CONFIG.plus.name} (Akses Instan)
            </Link>
            <Link 
              href="/"
              className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Memuat...</div>}>
      <AssessmentPageClient />
    </Suspense>
  );
}
