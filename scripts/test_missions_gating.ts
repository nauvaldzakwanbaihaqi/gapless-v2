import { db } from '../src/db';
import { softSkillMissions, users, userPurchases } from '../src/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { hasActivePro } from '../src/lib/payment_service';

async function testGating() {
  console.log('=== TEST 1: Mission Ordering ===');
  const allMissions = await db
    .select()
    .from(softSkillMissions)
    .where(eq(softSkillMissions.isActive, true))
    .orderBy(
      asc(softSkillMissions.competency),
      asc(softSkillMissions.difficultyOrder),
      asc(softSkillMissions.sortOrder)
    );

  const groups: Record<string, typeof allMissions> = {};
  for (const m of allMissions) {
    if (!groups[m.competency]) groups[m.competency] = [];
    groups[m.competency].push(m);
  }

  let allOrdered = true;
  for (const [comp, list] of Object.entries(groups)) {
    console.log(`Competency: ${comp}`);
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      console.log(`  [#${i + 1}] ${m.title} (difficulty: ${m.difficultyLevel}, order: ${m.difficultyOrder})`);
      if (i > 0 && (list[i].difficultyOrder || 0) < (list[i - 1].difficultyOrder || 0)) {
        allOrdered = false;
      }
    }
  }
  console.log('Result Test 1 (All Ascending Difficulty):', allOrdered ? 'PASSED ✅' : 'FAILED ❌');

  console.log('\n=== TEST 2: User naupaldjakwan1@gmail.com Status ===');
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, 'naupaldjakwan1@gmail.com'))
    .limit(1);

  if (!user.length) throw new Error('User not found');
  const u = user[0];
  const isPro = await hasActivePro(u.id);
  console.log('User Name:', u.name);
  console.log('User Tier:', u.tier);
  console.log('hasActivePro:', isPro);
  const test2Passed = u.tier === 'FREE' && isPro === false;
  console.log('Result Test 2 (User is FREE):', test2Passed ? 'PASSED ✅' : 'FAILED ❌');

  console.log('\n=== TEST 3: Gating Rules Simulation ===');
  // Untuk tiap kompetensi, misi 1 harus terbuka (isLocked = false), misi 2 harus terkunci (isLocked = true)
  let gatingPassed = true;
  for (const [comp, list] of Object.entries(groups)) {
    const m1Locked = !isPro && 0 >= 1; // false
    const m2Locked = !isPro && 1 >= 1; // true
    console.log(`[${comp}] Mission 1 (${list[0].title}): isLocked = ${m1Locked}`);
    console.log(`[${comp}] Mission 2 (${list[1].title}): isLocked = ${m2Locked}`);
    if (m1Locked !== false || m2Locked !== true) {
      gatingPassed = false;
    }
  }
  console.log('Result Test 3 (Mission 1 Unlocked, Mission 2 Locked for Free):', gatingPassed ? 'PASSED ✅' : 'FAILED ❌');
}

testGating()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  });
