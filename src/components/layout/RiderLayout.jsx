import { Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ListTodo, BarChart3, UserCircle, Bike, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRiderSocket } from '@/hooks/useRiderSocket';
import { PageLoader } from '@/components/ui';
import { cn } from '@/lib/utils';

const TABS = [
  { to: '/', label: 'Deliveries', icon: ListTodo, end: true },
  { to: '/summary', label: 'Summary', icon: BarChart3 },
  { to: '/account', label: 'Account', icon: UserCircle },
];

export function RiderLayout() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  useRiderSocket(Boolean(user));

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-white/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md"><Bike className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate font-bold">Hi, {user?.name?.split(' ')[0]} 👋</p>
          <p className="flex items-center gap-1.5 text-xs text-emerald-600"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> On duty{user?.vehicleNumber ? ` · ${user.vehicleNumber}` : ''}</p>
        </div>
        <button onClick={toggle} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle theme">{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
      </header>
      <main className="flex-1 px-4 pb-28 pt-4">
        <Suspense fallback={<PageLoader />} key={pathname}><Outlet /></Suspense>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95" aria-label="Primary">
        <div className="mx-auto grid max-w-2xl grid-cols-3">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex flex-col items-center gap-1 py-2.5 text-xs font-semibold', isActive ? 'text-emerald-600' : 'text-slate-500')}>
              <Icon className="h-6 w-6" /> {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
