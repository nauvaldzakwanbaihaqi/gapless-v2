import { db } from '../src/db';
import { softSkillMissions, users, userPurchases } from '../src/db/schema';
import { sql, eq, asc } from 'drizzle-orm';
import { hasActivePro } from '../src/lib/payment_service';

async function migrate() {
  console.log('--- 1. ALTER TABLE soft_skill_missions ADD difficulty_order ---');
  await db.execute(sql`
    ALTER TABLE soft_skill_missions 
    ADD COLUMN IF NOT EXISTS difficulty_order INTEGER DEFAULT 1;
  `);
  console.log('Column difficulty_order ensured in Neon Postgres.');

  console.log('--- 2. Update difficulty_order based on difficulty_level ---');
  await db.execute(sql`
    UPDATE soft_skill_missions 
    SET difficulty_order = CASE 
      WHEN difficulty_level = 'easy' THEN 1 
      WHEN difficulty_level = 'medium' THEN 2 
      WHEN difficulty_level = 'hard' THEN 3 
      ELSE 2 
    END;
  `);

  console.log('--- 3. Ensure sort_order reflects competency and difficulty_order ---');
  // Ambil semua misi
  const missions = await db.select().from(softSkillMissions);
  
  // Sort them per competency by difficulty_order ASC
  const competenciesOrder = ['Communication', 'Cooperation', 'Integrity', 'Dependability', 'Adaptability'];
  
  let newSortOrder = 1;
  for (const comp of competenciesOrder) {
    const compMissions = missions
      .filter((m) => m.competency === comp)
      .sort((a, b) => (a.difficultyOrder || 1) - (b.difficultyOrder || 1));

    for (const m of compMissions) {
      await db
        .update(softSkillMissions)
        .set({ sortOrder: newSortOrder })
        .where(eq(softSkillMissions.id, m.id));
      console.log(`Mission: [${m.competency}] ${m.title} (${m.difficultyLevel}) -> order: ${newSortOrder}`);
      newSortOrder++;
    }
  }

  console.log('--- 4. Set naupaldjakwan1@gmail.com to FREE ---');
  const targetUser = await db
    .select()
    .from(users)
    .where(eq(users.email, 'naupaldjakwan1@gmail.com'))
    .limit(1);

  if (targetUser.length) {
    const u = targetUser[0];
    await db.update(users).set({ tier: 'FREE' }).where(eq(users.id, u.id));
    await db
      .update(userPurchases)
      .set({ isActive: false })
      .where(eq(userPurchases.userId, u.id));
    
    const isPro = await hasActivePro(u.id);
    console.log(`User ${u.email} (${u.id}) tier set to FREE, isPro: ${isPro}`);
  } else {
    console.warn('User naupaldjakwan1@gmail.com not found!');
  }

  console.log('--- 5. Verify missions per competency ---');
  const finalMissions = await db
    .select()
    .from(softSkillMissions)
    .where(eq(softSkillMissions.isActive, true))
    .orderBy(asc(softSkillMissions.sortOrder));

  console.log('All missions in order:');
  for (const m of finalMissions) {
    console.log(`- [${m.competency}] ${m.title} | diff: ${m.difficultyLevel} (order: ${m.difficultyOrder}, sort: ${m.sortOrder})`);
  }
}

migrate()
  .then(() => {
    console.log('Migration finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
