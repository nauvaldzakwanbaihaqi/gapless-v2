import { db } from '@/db';
import { learningResources } from '@/db/schema';

export const SEED_RESOURCES = [
  // 1. Web Development & Frontend
  {
    title: 'MDN Web Docs — HTML & CSS Dasar hingga Mahir',
    url: 'https://developer.mozilla.org/id/docs/Learn_web_development',
    provider: 'MDN Web Docs',
    type: 'Dokumentasi',
    skillTags: ['html', 'css', 'web-development', 'frontend', 'desain-web'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 1,
  },
  {
    title: 'MDN Web Docs — Panduan Lengkap JavaScript Modern',
    url: 'https://developer.mozilla.org/id/docs/Web/JavaScript/Guide',
    provider: 'MDN Web Docs',
    type: 'Dokumentasi',
    skillTags: ['javascript', 'js', 'frontend', 'programming', 'es6'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 2,
  },
  {
    title: 'React Official Documentation — Quick Start & Deep Dive',
    url: 'https://react.dev/learn',
    provider: 'React Official',
    type: 'Dokumentasi',
    skillTags: ['react', 'reactjs', 'frontend', 'javascript', 'ui-framework'],
    level: 'Intermediate',
    isFree: true,
    isVerified: true,
    sortOrder: 3,
  },
  {
    title: 'freeCodeCamp — Responsive Web Design Certification',
    url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    provider: 'freeCodeCamp',
    type: 'Course',
    skillTags: ['html', 'css', 'responsive-design', 'frontend', 'flexbox'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 4,
  },
  {
    title: 'TypeScript for JavaScript Programmers — Panduan Resmi',
    url: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html',
    provider: 'TypeScript Official',
    type: 'Dokumentasi',
    skillTags: ['typescript', 'ts', 'javascript', 'frontend', 'backend'],
    level: 'Intermediate',
    isFree: true,
    isVerified: true,
    sortOrder: 5,
  },

  // 2. Backend & Database
  {
    title: 'Node.js Introduction & Getting Started Guide',
    url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
    provider: 'Node.js Official',
    type: 'Dokumentasi',
    skillTags: ['nodejs', 'backend', 'javascript', 'server', 'api'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 6,
  },
  {
    title: 'PostgreSQL Tutorial — Konsep Relasional & Query Lanjutan',
    url: 'https://www.postgresqltutorial.com/',
    provider: 'PostgreSQL Tutorial',
    type: 'Artikel',
    skillTags: ['postgresql', 'sql', 'database', 'backend', 'rdbms'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 7,
  },
  {
    title: 'RESTful API Design Best Practices Guide',
    url: 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design',
    provider: 'Microsoft Learn',
    type: 'Dokumentasi',
    skillTags: ['api', 'rest-api', 'backend', 'system-design', 'microservices'],
    level: 'Intermediate',
    isFree: true,
    isVerified: true,
    sortOrder: 8,
  },
  {
    title: 'Python for Beginners — Dokumentasi Resmi',
    url: 'https://docs.python.org/3/tutorial/index.html',
    provider: 'Python Software Foundation',
    type: 'Dokumentasi',
    skillTags: ['python', 'backend', 'programming', 'data-science', 'scripting'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 9,
  },

  // 3. UI/UX Design & Product Management
  {
    title: 'Figma Community Tutorials & Best Practices',
    url: 'https://help.figma.com/hc/en-us/categories/360002042553-Figma-design',
    provider: 'Figma',
    type: 'Dokumentasi',
    skillTags: ['figma', 'ui-design', 'ux-design', 'prototyping', 'wireframing'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 10,
  },
  {
    title: 'Nielsen Norman Group — UX Research & Usability Heuristics',
    url: 'https://www.nngroup.com/articles/ten-usability-heuristics/',
    provider: 'Nielsen Norman Group',
    type: 'Artikel',
    skillTags: ['ux-research', 'usability', 'heuristics', 'product-design', 'ui-ux'],
    level: 'Intermediate',
    isFree: true,
    isVerified: true,
    sortOrder: 11,
  },
  {
    title: 'Product School — Panduan Dasar Product Management',
    url: 'https://productschool.com/blog/product-management-2/the-ultimate-product-management-guide',
    provider: 'Product School',
    type: 'Artikel',
    skillTags: ['product-management', 'agile', 'scrum', 'roadmap', 'user-story'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 12,
  },

  // 4. Data Science & Machine Learning
  {
    title: 'Pandas Official Documentation — Getting Started & Tutorials',
    url: 'https://pandas.pydata.org/docs/getting_started/index.html',
    provider: 'Pandas Official',
    type: 'Dokumentasi',
    skillTags: ['pandas', 'data-analysis', 'python', 'data-science', 'statistics'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 13,
  },
  {
    title: 'Scikit-Learn Machine Learning in Python Tutorial',
    url: 'https://scikit-learn.org/stable/getting_started.html',
    provider: 'Scikit-Learn',
    type: 'Dokumentasi',
    skillTags: ['machine-learning', 'scikit-learn', 'ai', 'python', 'data-science'],
    level: 'Intermediate',
    isFree: true,
    isVerified: true,
    sortOrder: 14,
  },
  {
    title: 'SQL for Data Analysis — Mode Analytics Tutorial',
    url: 'https://mode.com/sql-tutorial/',
    provider: 'Mode Analytics',
    type: 'Course',
    skillTags: ['sql', 'data-analysis', 'data-science', 'database', 'queries'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 15,
  },

  // 5. DevOps & Cloud
  {
    title: 'Git Handbook & Version Control Fundamental',
    url: 'https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control',
    provider: 'Git SCM',
    type: 'Dokumentasi',
    skillTags: ['git', 'version-control', 'github', 'devops', 'collaboration'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 16,
  },
  {
    title: 'Docker Get Started — Kontainerisasi Aplikasi',
    url: 'https://docs.docker.com/get-started/',
    provider: 'Docker Official',
    type: 'Dokumentasi',
    skillTags: ['docker', 'containers', 'devops', 'deployment', 'cloud'],
    level: 'Intermediate',
    isFree: true,
    isVerified: true,
    sortOrder: 17,
  },
  {
    title: 'AWS Cloud Practitioner Essentials Guide',
    url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/',
    provider: 'Amazon Web Services',
    type: 'Course',
    skillTags: ['aws', 'cloud', 'infrastructure', 'devops', 'serverless'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 18,
  },

  // 6. Soft Skills & Professional Development
  {
    title: 'Google Digital Garage — Effective Communication & Leadership',
    url: 'https://learndigital.withgoogle.com/',
    provider: 'Google',
    type: 'Course',
    skillTags: ['komunikasi', 'leadership', 'collaboration', 'soft-skills', 'negosiasi'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 19,
  },
  {
    title: 'Harvard Business Review — Problem Solving & Decision Making',
    url: 'https://hbr.org/topic/decision-making',
    provider: 'Harvard Business Review',
    type: 'Artikel',
    skillTags: ['problem-solving', 'critical-thinking', 'decision-making', 'soft-skills'],
    level: 'Intermediate',
    isFree: true,
    isVerified: true,
    sortOrder: 20,
  },
  {
    title: 'freeCodeCamp YouTube — Full Web Development Bootcamp',
    url: 'https://www.youtube.com/watch?v=zJSY8tbf_ys',
    provider: 'freeCodeCamp (YouTube)',
    type: 'Video',
    skillTags: ['frontend', 'backend', 'web-development', 'javascript', 'html'],
    level: 'Beginner',
    isFree: true,
    isVerified: true,
    sortOrder: 21,
  },
];

export async function seedLearningResources() {
  console.log('🌱 Seeding static verified learning resources...');
  for (const res of SEED_RESOURCES) {
    await db.insert(learningResources).values(res).onConflictDoNothing();
  }
  console.log(`✅ ${SEED_RESOURCES.length} learning resources seeded successfully.`);
}

if (require.main === module) {
  seedLearningResources().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
