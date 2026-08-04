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
  ListOrdered,
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
  { to: '/salon/queue', label: 'Queue', icon: ListOrdered },
  { to: '/salon/profile', label: 'Profile', icon: User },
  { to: '/salon/wallet', label: 'Wallet', icon: Wallet },
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

const getSectionName = (pathname: string, salonName: string) => {
  if (pathname === '/salon' || pathname === '/salon/') {
    return `Dashboard`;
  }
  if (pathname.startsWith('/salon/services')) return 'Services';
  if (pathname.startsWith('/salon/gallery')) return 'Gallery';
  if (pathname.startsWith('/salon/staff')) return 'Staff';
  if (pathname.startsWith('/salon/bookings')) return 'Bookings';
  if (pathname.startsWith('/salon/queue')) return 'Queue';
  if (pathname.startsWith('/salon/profile')) return 'Profile';
  if (pathname.startsWith('/salon/wallet')) return 'Wallet';
  if (pathname.startsWith('/salon/help-support')) return 'Help & Support';
  if (pathname.startsWith('/salon/privacy-policy')) return 'Privacy Policy';
  return 'Salon Partner';
};

export function SalonLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

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
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:flex md:flex-col sticky top-0 h-screen">
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

      {/* Main container */}
      <div className="flex flex-1 flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 md:px-6 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="cursor-pointer" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 flex flex-col h-full">
                  <div className="border-b p-4">
                    <div className="text-lg font-bold text-primary">GlooCare</div>
                    <div className="text-xs text-muted-foreground">Salon Partner</div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <NavList />
                  </div>
                  <div className="border-t p-4 bg-background mt-auto">
                    <div className="mb-3 text-sm">
                      <div className="font-medium text-foreground">{user.salonName}</div>
                      <div className="truncate text-xs text-muted-foreground">{user.ownerName}</div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 text-destructive cursor-pointer border-destructive/20 hover:bg-destructive/10" 
                      onClick={() => { logout(); navigate({ to: '/login' }); }}
                    >
                      <LogOut className="h-4 w-4 text-destructive" /> Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Section Name / Welcome Message */}
            <h2 className="text-base md:text-lg font-bold text-foreground truncate max-w-[220px] sm:max-w-xs md:max-w-md">
              {getSectionName(path, user.salonName)}
            </h2>
          </div>

          {/* Right Side: Profile Icon Avatar */}
          <Link to="/salon/profile" className="flex items-center justify-center">
            <div className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 hover:border-primary/40 transition-all cursor-pointer shadow-xs select-none">
              {user.ownerName ? user.ownerName.charAt(0).toUpperCase() : 'S'}
            </div>
          </Link>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
