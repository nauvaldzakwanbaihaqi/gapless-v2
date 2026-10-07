import { db } from '@/db';
import { userPurchases, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface ProductItem {
  key: string;
  name: string;
  price: number;
  priceFormatted: string;
  description: string;
}

export const PRODUCTS_CONFIG: Record<string, ProductItem> = {
  gap_report: {
    key: 'gap_report',
    name: 'Laporan Analisis Skill Gap & Rekomendasi Mendalam',
    price: 9900,
    priceFormatted: 'Rp 9.900',
    description: 'Buka grafik radar perbandingan skill, narasi kesenjangan AI lengkap, prioritas perbaikan, dan unduh laporan resmi PDF.',
  },
};

/**
 * Pengecekan server-side apakah user telah membeli produk tertentu (opsional per career_slug)
 */
export async function hasPurchased(
  userId: string,
  productKey: string,
  careerSlug?: string | null
): Promise<boolean> {
  if (!userId || !productKey) return false;

  const conditions = [
    eq(userPurchases.userId, userId),
    eq(userPurchases.productKey, productKey),
  ];

  if (careerSlug) {
    conditions.push(eq(userPurchases.careerSlug, careerSlug));
  }

  const result = await db
    .select({ id: userPurchases.id })
    .from(userPurchases)
    .where(and(...conditions))
    .limit(1);

  return result.length > 0;
}

/**
 * Menyimpan transaksi pembelian (idempotent — tidak menduplikasi jika sudah ada)
 */
export async function recordPurchase(params: {
  userId: string;
  productKey: string;
  careerSlug?: string | null;
  amount: number;
  isMockPayment?: boolean;
  metadata?: Record<string, any>;
}) {
  const {
    userId,
    productKey,
    careerSlug = null,
    amount,
    isMockPayment = true,
    metadata = {},
  } = params;

  // Cek apakah sudah pernah dibeli (Idempotency)
  const existing = await hasPurchased(userId, productKey, careerSlug);
  if (existing) {
    const rows = await db
      .select()
      .from(userPurchases)
      .where(
        and(
          eq(userPurchases.userId, userId),
          eq(userPurchases.productKey, productKey),
          careerSlug ? eq(userPurchases.careerSlug, careerSlug) : undefined
        )
      )
      .limit(1);
    return { success: true, alreadyPurchased: true, purchase: rows[0] };
  }

  // Insert purchase baru
  const [purchase] = await db
    .insert(userPurchases)
    .values({
      userId,
      productKey,
      careerSlug,
      amount,
      isMockPayment,
      metadata,
    })
    .returning();

  return { success: true, alreadyPurchased: false, purchase };
}

/**
 * Interface abstraksi pembuatan order pembayaran (siap dihubungkan ke Midtrans/Xendit)
 */
export async function createPaymentOrder(params: {
  userId: string;
  productKey: string;
  careerSlug?: string | null;
}) {
  const product = PRODUCTS_CONFIG[params.productKey];
  if (!product) {
    throw new Error(`Product not found: ${params.productKey}`);
  }

  // Mock payment order ID generator
  const orderId = `GAPLESS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  return {
    orderId,
    productKey: product.key,
    productName: product.name,
    amount: product.price,
    amountFormatted: product.priceFormatted,
    isMock: true,
  };
}
