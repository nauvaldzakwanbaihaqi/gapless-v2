'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Target, Calendar, Award } from 'lucide-react';

const TABS = [
  { href: '/roadmap', label: 'Roadmap', icon: Map, id: 'tab-roadmap' },
  { href: '/misi', label: 'Misi', icon: Target, id: 'tab-misi' },
  { href: '/kegiatan', label: 'Kegiatan', icon: Calendar, id: 'tab-kegiatan' },
  { href: '/passport', label: 'Passport', icon: Award, id: 'tab-passport' },
];

export function LearningTabsNav() {
  const pathname = usePathname();

  return (
    <div className="w-full pt-4 sm:pt-6">
      {/* Content Container Aligned with Page Content */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6">
        {/* Desktop & Tablet Tabs (Inside Content Area with Distinct Top & Bottom Border Separator) */}
        <div className="hidden md:flex items-center gap-1 border-b border-slate-200/90 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                prefetch={true}
                id={tab.id}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-200 whitespace-nowrap rounded-t-xl ${
                  isActive
                    ? 'border-blue-600 text-blue-700 bg-blue-50/60 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Fixed Tab Bar (Preserved for Mobile Ergonomics) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-area-pb shadow-lg">
        <div className="flex">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                prefetch={true}
                id={`${tab.id}-mobile`}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 transition-all duration-200 ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] leading-none">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
