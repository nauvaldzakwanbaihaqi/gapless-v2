"use client";

import { signIn, signOut } from "next-auth/react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { LogOut } from "lucide-react";
import { isPlusUser, PLAN_CONFIG } from "@/config/plan";

interface AuthButtonProps {
    variant?: 'light' | 'dark';
}

export default function AuthButton({ variant = 'light' }: AuthButtonProps) {
    const { session, status } = useAuthGuard();
    const isDark = variant === 'dark';

    if (status === "loading") {
        return (
            <div className={`${isDark ? 'bg-slate-800' : 'bg-gray-200'} animate-pulse h-10 w-40 rounded-full`}></div>
        );
    }

    // Kalau User sudah login
    if (session?.user) {
        const tier = session.user.tier || '';
        const isPro = isPlusUser(tier);

        return (
            <div className={`flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-full md:rounded-2xl border transition-all ${
                isDark 
                    ? 'bg-slate-800/90 border-slate-700/80 shadow-md backdrop-blur-xs' 
                    : 'bg-white border-gray-200 shadow-sm'
            }`}>
                {/* Tampilkan foto profil kalau ada */}
                {session.user.image && (
                    <img src={session.user.image} alt="Profile" className="w-7 h-7 md:w-8 md:h-8 rounded-full" referrerPolicy="no-referrer" />
                )}
                <div className="hidden md:block text-sm">
                    <p className={`font-bold leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {session.user.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>Status:</span>
                        {isPro ? (
                            <span className="inline-flex items-center gap-0.5 bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-2xs">
                                <span>{PLAN_CONFIG.plus.badge}</span>
                            </span>
                        ) : (
                            <div className="flex items-center gap-1">
                                <span className={`font-bold text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{PLAN_CONFIG.free.badge}</span>
                                <a href="/pricing" className={`text-[10px] font-bold hover:underline ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                                    (Upgrade)
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => signOut()}
                    className={`p-1.5 md:px-3 md:py-1.5 text-sm rounded-full md:rounded-xl font-semibold transition-all ml-0 md:ml-2 flex items-center justify-center cursor-pointer ${
                        isDark
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 md:bg-red-600 md:hover:bg-red-700 md:text-white'
                            : 'bg-red-50 hover:bg-red-100 md:bg-red-500 md:hover:bg-red-600 text-red-600 md:text-white'
                    }`}
                    aria-label="Logout"
                >
                    <span className="hidden md:inline">Logout</span>
                    <LogOut className="w-4 h-4 md:hidden" />
                </button>
            </div>
        );
    }

    // Kalau User belum login
    return (
        <button 
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className={`${
                isDark
                    ? 'bg-white hover:bg-slate-100 text-slate-950'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
            } p-2 md:px-6 md:py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer`}
            aria-label="Login via Google"
        >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="hidden md:inline">Login via Google</span>
        </button>
    );
}
