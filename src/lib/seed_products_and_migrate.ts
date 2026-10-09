import { db } from '@/db';
import { products, userPurchases, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
  console.log('🌱 Seeding products...');

  // 1. Seed products
  await db
    .insert(products)
    .values([
      {
        key: 'pro_monthly',
        name: 'Gapless Pro',
        type: 'subscription',
        price: 29000,
        priceFormatted: 'Rp 29.000',
        description: 'Langganan bulanan fitur lanjutan: re-assessment berkala, prioritas perbaikan, rekomendasi kegiatan lengkap, dan misi soft skill.',
        isActive: true,
      },
      {
        key: 'gap_report',
        name: 'Laporan Gap Mendalam',
        type: 'one_time',
        price: 9900,
        priceFormatted: 'Rp 9.900',
        description: 'Buka grafik radar interaktif, narasi analisis kesenjangan AI lengkap, prioritas perbaikan, dan unduh laporan resmi format PDF.',
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  console.log('✅ Products seeded.');

  // 2. Grandfather existing Pro/Student Pro users
  const existingProUsers = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(sql`tier ILIKE '%pro%' OR tier ILIKE '%plus%'`);

  console.log(`Found ${existingProUsers.length} existing Pro users to grandfather...`);

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  for (const u of existingProUsers) {
    const existing = await db
      .select()
      .from(userPurchases)
      .where(sql`user_id = ${u.id} AND product_key = 'pro_monthly'`)
      .limit(1);

    if (existing.length === 0) {
      await db.insert(userPurchases).values({
        userId: u.id,
        productKey: 'pro_monthly',
        amount: 29000,
        periodStart: now,
        periodEnd: periodEnd,
        isActive: true,
        isMockPayment: true,
        metadata: {
          note: 'Grandfathered existing Pro user',
          email: u.email,
        },
      });
      console.log(`Grandfathered user: ${u.email} until ${periodEnd.toISOString()}`);
    }
  }

  console.log('✅ Grandfathering complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
