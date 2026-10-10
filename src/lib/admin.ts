/**
 * Konfigurasi dan Helper Hak Akses Admin Gapless
 */

export const ADMIN_EMAILS = [
  'nauvaldzakwanbaihaqi@gmail.com',
  'tiaauliac@gmail.com',
  'tia290605@gmail.com',
  'tiaaulia.29@upi.edu',
];

export function isUserAdmin(user?: {
  email?: string | null;
  role?: string | null;
  isAdmin?: boolean | null;
} | null): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (user.role === 'ADMIN') return true;
  if (user.email && ADMIN_EMAILS.includes(user.email.trim().toLowerCase())) return true;
  return false;
}
