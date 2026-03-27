'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, LayoutGrid, Trophy, MessageSquare, Plus, LogIn, LogOut, FolderOpen } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { useUser } from '@/lib/hooks/useUser';
import { useState, useEffect, useCallback } from 'react';

const DEADLINE = new Date('2026-03-30T04:00:00Z');

function useCountdown() {
  const calc = useCallback(() => {
    const diff = DEADLINE.getTime() - Date.now();
    if (diff <= 0) return null;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s };
  }, []);
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return time;
}

export default function Sidebar({ onSubmitClick }: { onSubmitClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: loading, mutate } = useUser();
  const { t } = useLanguage();
  const countdown = useCountdown();

  const NAV_ITEMS = [
    { href: '/guide', label: t.nav.guide, icon: Compass },
    { href: '/gallery', label: t.nav.gallery, icon: LayoutGrid },
    { href: '/leaderboard', label: t.nav.leaderboard, icon: Trophy },
    ...(user ? [{ href: '/my-demos', label: t.nav.myDemos, icon: FolderOpen }] : []),
    { href: '/square', label: t.nav.square, icon: MessageSquare },
  ];

  const handleActionClick = () => {
    if (user) {
      onSubmitClick();
    } else {
      router.push('/');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    mutate(null, false); // 立即更新缓存，不重新请求
    router.push('/');
  };

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-[#f3f4ee] hidden md:flex flex-col pt-10 pb-8 px-6 gap-y-4 z-50">
        {/* Branding */}
        <div className="mb-8 px-2">
          <h1 className="text-3xl font-headline font-bold text-on-surface leading-tight">AI Demo Day</h1>
          <p className="text-sm text-on-surface-variant mt-2">小红书战略 / 投资 / 用户研究</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-y-1 flex-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-x-3 px-4 py-3 rounded-lg transition-colors duration-200 active:scale-95 ${
                  isActive
                    ? 'text-[#1A1A1A] font-bold border-l-4 border-[#5f5e5e] bg-white/50'
                    : 'text-[#5f5e5e] font-medium opacity-80 hover:bg-[#ecefe7]'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-headline font-bold tracking-tight text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Button - Submit or Login */}
        <div className="px-2 mb-4">
          {!loading && (
            <button
              onClick={handleActionClick}
              className={`w-full flex flex-col items-center justify-center gap-0.5 py-3 px-4 rounded-lg transition-all shadow-sm active:scale-95 ${
                user
                  ? 'bg-[#1A1A1A] text-white hover:opacity-90'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/30'
              }`}
            >
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <Plus size={16} strokeWidth={2.5} />
                    <span className="font-headline font-bold tracking-tight text-base chinese-text">{t.nav.submit}</span>
                  </div>
                  {countdown ? (
                    <span className="text-[11px] opacity-60 tabular-nums">
                      {countdown.d > 0 ? `${countdown.d}天 ` : ''}{String(countdown.h).padStart(2,'0')}:{String(countdown.m).padStart(2,'0')}:{String(countdown.s).padStart(2,'0')} 后截止
                    </span>
                  ) : (
                    <span className="text-[11px] opacity-60">已截止</span>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn size={16} strokeWidth={2.5} />
                  <span className="font-headline font-bold tracking-tight text-base chinese-text">{t.nav.login}</span>
                </div>
              )}
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="px-4">
          {loading ? (
            <div className="text-xs text-on-surface-variant">Loading...</div>
          ) : user ? (
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-headline font-bold text-lg text-on-surface chinese-text">{user.name}</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-wider mt-0.5 font-medium chinese-text">{user.department}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                title="退出登录"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
              <span className="text-sm text-on-surface-variant">{t.nav.guest}</span>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden z-50 bg-[#f3f4ee] border-t border-outline-variant/20 flex items-center justify-around px-1 pt-1.5 pb-1.5 safe-area-pb">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-[56px] rounded-lg transition-colors ${
                isActive
                  ? 'text-[#1A1A1A] font-bold'
                  : 'text-[#5f5e5e] opacity-70'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-tight truncate max-w-[56px]">{item.label}</span>
            </Link>
          );
        })}
        {/* Submit / Login button */}
        {!loading && (
          <button
            onClick={handleActionClick}
            className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-[56px] rounded-lg text-[#5f5e5e] opacity-70 transition-colors"
          >
            {user ? <Plus size={20} strokeWidth={2} /> : <LogIn size={20} strokeWidth={2} />}
            <span className="text-[10px] font-medium leading-tight">{user ? t.nav.submit : t.nav.login}</span>
          </button>
        )}
      </nav>
    </>
  );
}
