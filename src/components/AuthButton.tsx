"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { signIn, signOut } from "next-auth/react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { LogOut, Crown, ShieldCheck } from "lucide-react";

interface AuthButtonProps {
    variant?: 'light' | 'dark';
}

export default function AuthButton({ variant = 'light' }: AuthButtonProps) {
    const { session, status } = useAuthGuard();
    const isDark = variant === 'dark';

    const sessionIsPro = Boolean(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session?.user as any)?.isPro ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((session?.user as any)?.tier && (session?.user as any).tier !== 'FREE' && (session?.user as any).tier.toLowerCase().includes('pro'))
    );
    const [isPro, setIsPro] = useState(sessionIsPro);

    useEffect(() => {
        setIsPro(sessionIsPro);
    }, [sessionIsPro]);

    useEffect(() => {
        if (!session?.user?.id) return;
        // Sinkronisasi status langganan riil
        fetch('/api/user/subscription')
            .then((res) => res.json())
            .then((data) => {
                if (typeof data?.isPro === 'boolean') {
                    setIsPro(data.isPro);
                }
            })
            .catch(() => {});
    }, [session?.user?.id]);

    if (status === "loading") {
        return (
            <div className={`${isDark ? 'bg-slate-800' : 'bg-gray-200'} animate-pulse h-10 w-32 rounded-full`}></div>
        );
    }

    // Kalau User sudah login
    if (session?.user) {
        return (
            <div className={`flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-full md:rounded-2xl border transition-all ${
                isDark 
                    ? 'bg-slate-800/90 border-slate-700/80 shadow-md backdrop-blur-xs' 
                    : 'bg-white border-gray-200 shadow-sm'
            }`}>
                {/* Tampilkan foto profil kalau ada */}
                {session.user.image ? (
                    <img src={session.user.image} alt="Profile" className="w-7 h-7 md:w-8 md:h-8 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {session.user.name?.charAt(0) || 'U'}
                    </div>
                )}
                <div className="hidden md:block text-sm pr-1">
                    <p className={`font-bold leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {session.user.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        {isPro ? (
                            <Link 
                                href="/pricing" 
                                className={`inline-flex items-center gap-1 text-[10px] font-bold transition ${
                                    isDark ? 'text-amber-400 hover:text-amber-300' : 'text-blue-600 hover:text-blue-700'
                                }`}
                                title="Paket Aktif: Gapless Pro"
                            >
                                <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                <span>Gapless Pro</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-medium ${
                                    isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                    Free
                                </span>
                                <span className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>•</span>
                                <Link 
                                    href="/pricing" 
                                    className={`text-[10px] font-bold transition ${
                                        isDark ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'
                                    }`}
                                >
                                    Upgrade ke Pro
                                </Link>
                            </div>
                        )}

                        {Boolean((session?.user as any)?.isAdmin) && (
                            <>
                                <span className={`text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>•</span>
                                <Link 
                                    href="/admin/certificates" 
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded-md transition"
                                    title="Buka Panel Admin Review Sertifikat"
                                >
                                    <ShieldCheck className="w-2.5 h-2.5 text-indigo-600" />
                                    <span>Admin</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => signOut()}
                    className={`p-1.5 md:px-3 md:py-1.5 text-xs rounded-full md:rounded-xl font-semibold transition-all ml-0 md:ml-2 flex items-center justify-center cursor-pointer ${
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
            } p-2 md:px-6 md:py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer text-xs sm:text-sm`}
            aria-label="Login via Google"
        >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="hidden md:inline">Login via Google</span>
        </button>
    );
}
