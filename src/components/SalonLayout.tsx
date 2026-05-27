import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Scissors,
  Image as ImageIcon,
  Users,
  Calendar,
  User,
  Wallet,
  Settings,
  HelpCircle,
  Shield,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const nav: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { to: '/salon', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/salon/services', label: 'Services', icon: Scissors },
  { to: '/salon/gallery', label: 'Gallery', icon: ImageIcon },
  { to: '/salon/staff', label: 'Staff', icon: Users },
  { to: '/salon/bookings', label: 'Bookings', icon: Calendar },
  { to: '/salon/profile', label: 'Profile', icon: User },
  { to: '/salon/wallet', label: 'Wallet', icon: Wallet },
  { to: '/salon/settings', label: 'Settings', icon: Settings },
  { to: '/salon/help-support', label: 'Help & Support', icon: HelpCircle },
  { to: '/salon/privacy-policy', label: 'Privacy', icon: Shield },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-3">
      {nav.map((item) => {
        const active = item.exact ? path === item.to : path.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SalonLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: '/login' });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:flex md:flex-col">
        <div className="border-b p-4">
          <div className="text-lg font-bold text-primary">GlooCare</div>
          <div className="text-xs text-muted-foreground">Salon Partner</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavList />
        </div>
        <div className="border-t p-3">
          <div className="mb-2 px-3 text-sm">
            <div className="font-medium text-foreground">{user.salonName}</div>
            <div className="truncate text-xs text-muted-foreground">{user.ownerName}</div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { logout(); navigate({ to: '/login' }); }}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="border-b p-4">
                <div className="text-lg font-bold text-primary">GlooCare</div>
                <div className="text-xs text-muted-foreground">Salon Partner</div>
              </div>
              <NavList />
            </SheetContent>
          </Sheet>
          <div className="text-sm font-semibold text-primary">GlooCare</div>
          <Button variant="ghost" size="icon" onClick={() => { logout(); navigate({ to: '/login' }); }} aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
