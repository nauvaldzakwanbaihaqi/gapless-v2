import { db } from '@/db';
import { userPurchases, products } from '@/db/schema';
import { eq, and, sql, gt, desc } from 'drizzle-orm';

export interface ProductItem {
  key: string;
  name: string;
  type: 'subscription' | 'one_time';
  price: number;
  priceFormatted: string;
  priceWithCurrency: string;
  description: string;
}

export const PRODUCTS_CONFIG: Record<string, ProductItem> = {
  pro_monthly: {
    key: 'pro_monthly',
    name: 'Gapless Pro',
    type: 'subscription',
    price: 29000,
    priceFormatted: '29.000',
    priceWithCurrency: 'Rp 29.000/bulan',
    description: 'Akses penuh fitur Pro: re-assessment berkala, prioritas perbaikan, roadmap 4 minggu, rekomendasi kegiatan lengkap, dan misi bulanan.',
  },
  gap_report: {
    key: 'gap_report',
    name: 'Laporan Gap Mendalam',
    type: 'one_time',
    price: 9900,
    priceFormatted: '9.900',
    priceWithCurrency: 'Rp 9.900/karier',
    description: 'Buka grafik radar interaktif, narasi kesenjangan AI lengkap, prioritas perbaikan, dan unduh laporan resmi format PDF.',
  },
};

/**
 * Pengecekan server-side apakah user memiliki langganan Gapless Pro yang masih aktif (periodEnd > now())
 */
export async function hasActivePro(userId?: string | null): Promise<boolean> {
  if (!userId) return false;

  const now = new Date();
  const activePro = await db
    .select({ id: userPurchases.id })
    .from(userPurchases)
    .where(
      and(
        eq(userPurchases.userId, userId),
        eq(userPurchases.productKey, 'pro_monthly'),
        eq(userPurchases.isActive, true),
        gt(userPurchases.periodEnd, now)
      )
    )
    .limit(1);

  return activePro.length > 0;
}

/**
 * Mengambil detail status langganan Pro user
 */
export async function getProSubscription(userId?: string | null) {
  if (!userId) return { isPro: false, periodEnd: null, daysRemaining: 0 };

  const now = new Date();
  const rows = await db
    .select()
    .from(userPurchases)
    .where(
      and(
        eq(userPurchases.userId, userId),
        eq(userPurchases.productKey, 'pro_monthly'),
        eq(userPurchases.isActive, true),
        gt(userPurchases.periodEnd, now)
      )
    )
    .orderBy(desc(userPurchases.periodEnd))
    .limit(1);

  if (rows.length === 0 || !rows[0].periodEnd) {
    return { isPro: false, periodEnd: null, daysRemaining: 0 };
  }

  const periodEnd = rows[0].periodEnd;
  const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    isPro: true,
    periodEnd,
    daysRemaining,
  };
}

/**
 * Pengecekan server-side apakah user memiliki Laporan Gap untuk career path tertentu
 */
export async function hasGapReport(
  userId?: string | null,
  careerSlug?: string | null
): Promise<boolean> {
  if (!userId || !careerSlug) return false;

  const result = await db
    .select({ id: userPurchases.id })
    .from(userPurchases)
    .where(
      and(
        eq(userPurchases.userId, userId),
        eq(userPurchases.productKey, 'gap_report'),
        eq(userPurchases.careerSlug, careerSlug)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Langganan / Perpanjang Gapless Pro (Mock Payment)
 * Idempotent: Jika Pro masih aktif, perpanjang masa aktif +30 hari pada record yang sama
 */
export async function subscribeProMock(userId: string, userEmail?: string | null, userName?: string | null) {
  const now = new Date();
  const product = PRODUCTS_CONFIG.pro_monthly;

  // Cek apakah ada record pro_monthly aktif
  const existingRows = await db
    .select()
    .from(userPurchases)
    .where(
      and(
        eq(userPurchases.userId, userId),
        eq(userPurchases.productKey, 'pro_monthly')
      )
    )
    .orderBy(desc(userPurchases.periodEnd))
    .limit(1);

  let newPeriodEnd: Date;
  let result;

  if (existingRows.length > 0) {
    const currentEnd = existingRows[0].periodEnd;
    const baseDate = currentEnd && currentEnd > now ? currentEnd : now;
    newPeriodEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updated = await db
      .update(userPurchases)
      .set({
        periodStart: existingRows[0].periodStart || now,
        periodEnd: newPeriodEnd,
        isActive: true,
        purchasedAt: now,
        amount: product.price,
        metadata: {
          ...((existingRows[0].metadata as object) || {}),
          lastRenewedAt: now.toISOString(),
          email: userEmail,
          name: userName,
        },
      })
      .where(eq(userPurchases.id, existingRows[0].id))
      .returning();

    result = updated[0];
  } else {
    newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const inserted = await db
      .insert(userPurchases)
      .values({
        userId,
        productKey: 'pro_monthly',
        amount: product.price,
        periodStart: now,
        periodEnd: newPeriodEnd,
        isActive: true,
        isMockPayment: true,
        metadata: {
          email: userEmail,
          name: userName,
        },
      })
      .returning();

    result = inserted[0];
  }

  return {
    success: true,
    purchase: result,
    periodEnd: newPeriodEnd,
  };
}

/**
 * Beli Laporan Gap Mendalam per career_slug (Mock Payment)
 * Idempotent: Jika sudah dibeli, tidak membuat baris ganda
 */
export async function buyGapReportMock(params: {
  userId: string;
  careerSlug: string;
  userEmail?: string | null;
  userName?: string | null;
}) {
  const { userId, careerSlug, userEmail, userName } = params;
  const product = PRODUCTS_CONFIG.gap_report;

  const existing = await hasGapReport(userId, careerSlug);
  if (existing) {
    const rows = await db
      .select()
      .from(userPurchases)
      .where(
        and(
          eq(userPurchases.userId, userId),
          eq(userPurchases.productKey, 'gap_report'),
          eq(userPurchases.careerSlug, careerSlug)
        )
      )
      .limit(1);
    return { success: true, alreadyPurchased: true, purchase: rows[0] };
  }

  const [purchase] = await db
    .insert(userPurchases)
    .values({
      userId,
      productKey: 'gap_report',
      careerSlug,
      amount: product.price,
      isActive: true,
      isMockPayment: true,
      metadata: {
        email: userEmail,
        name: userName,
      },
    })
    .returning();

  return { success: true, alreadyPurchased: false, purchase };
}
