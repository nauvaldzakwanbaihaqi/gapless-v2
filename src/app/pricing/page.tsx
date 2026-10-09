import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { getProSubscription } from '@/lib/payment_service';
import { PricingClient } from './PricingClient';

export const metadata = {
  title: 'Pricing & Paket Langganan | Gapless',
};

export default async function PricingPage() {
  const session = await auth();
  const subStatus = session?.user?.id ? await getProSubscription(session.user.id) : { isPro: false, periodEnd: null, daysRemaining: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 pb-24">
        <PricingClient
          isLoggedIn={Boolean(session?.user)}
          isPro={subStatus.isPro}
          periodEnd={subStatus.periodEnd ? subStatus.periodEnd.toISOString() : null}
          daysRemaining={subStatus.daysRemaining}
        />
      </main>
    </div>
  );
}
