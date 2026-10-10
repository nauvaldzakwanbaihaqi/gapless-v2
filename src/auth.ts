import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
// Pastikan path './db' mengarah ke konfigurasi koneksi Drizzle lu yang bener
import { db } from "./db"
import { users } from "./db/schema"
import { eq } from "drizzle-orm"

import { hasActivePro } from "./lib/payment_service"
import { isUserAdmin } from "./lib/admin"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: DrizzleAdapter(db),
    providers: [
        Google({
            // Ngasih tau TypeScript secara eksplisit biar nggak rewel
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async session({ session, user }: any) {
            if (session.user) {
                const userId = user?.id || session.user.id;
                if (userId) {
                    session.user.id = userId;
                    try {
                        const isPro = await hasActivePro(userId);
                        session.user.isPro = isPro;
                        session.user.tier = isPro ? 'Student Pro' : 'FREE';
                        session.user.isAdmin = isUserAdmin({ ...user, email: session.user.email });
                    } catch (e) {
                        console.error("Error fetching user pro status in session:", e);
                        session.user.isPro = false;
                        session.user.tier = 'FREE';
                        session.user.isAdmin = isUserAdmin({ email: session.user.email });
                    }
                }
            }
            return session;
        },
    },
    session: {
        strategy: "database", // Gunakan database strategy (karena Drizzle Adapter)
        maxAge: 24 * 60 * 60, // 24 jam dalam detik
    },
})