import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Image as ImageIcon, 
  Clock, 
  CheckCircle2, 
  CalendarDays, 
  TrendingUp 
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { PeriodTotal } from '@/lib/types';

export const Route = createFileRoute('/salon/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.dashboard,
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: api.profile,
  });

  const hasImages = profile?.images && profile.images.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.ownerName ?? ''}`}
        description={user?.salonName}
      />

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      {/* Financial Overview Grid */}
      <div>
        <h2 className="mb-4 text-base font-semibold tracking-tight text-foreground/90">Financial Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Today's Revenue"
            periodTotal={data?.totals?.today}
            loading={isLoading}
          />
          <StatCard
            icon={<CalendarDays className="h-4 w-4" />}
            label="Weekly Revenue"
            periodTotal={data?.totals?.weekly}
            loading={isLoading}
          />
          <StatCard
            icon={<Calendar className="h-4 w-4" />}
            label="Monthly Revenue"
            periodTotal={data?.totals?.monthly}
            loading={isLoading}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="All-Time Revenue"
            periodTotal={data?.totals?.allTime}
            loading={isLoading}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Bookings Overview Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Bookings Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <StatDetail 
              icon={<Calendar className="h-5 w-5 text-blue-500" />}
              label="Today" 
              value={data?.bookings?.today} 
              loading={isLoading} 
            />
            <StatDetail 
              icon={<Clock className="h-5 w-5 text-amber-500" />}
              label="Upcoming" 
              value={data?.bookings?.upcoming} 
              loading={isLoading} 
            />
            <StatDetail 
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              label="Completed" 
              value={data?.bookings?.completed} 
              loading={isLoading} 
            />
          </CardContent>
        </Card>

        {/* Commission Card */}
        <Card>
          <CardHeader>
            <CardTitle>Commission</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <div className="text-3xl font-bold text-primary">
                {data?.commissionPercentage ?? 0}%
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Platform commission automatically calculated on each booking.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Salon Gallery Section */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <div>
            <CardTitle>Salon Gallery</CardTitle>
            <CardDescription className="mt-1">
              Visual portfolio of your salon displayed to customer app users.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto gap-2">
            <Link to="/salon/gallery">
              <ImageIcon className="h-4 w-4" />
              Manage Gallery
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isProfileLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          ) : !hasImages ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No gallery images uploaded yet</p>
              <p className="text-xs text-muted-foreground/80 mt-1 mb-4">Upload images to showcase your space and services.</p>
              <Button asChild size="sm">
                <Link to="/salon/gallery">Go to Gallery</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {profile?.images?.slice(0, 5).map((src, i) => (
                <div 
                  key={i} 
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/30"
                >
                  <img 
                    src={src} 
                    alt={`Salon gallery item ${i + 1}`} 
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  periodTotal,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  periodTotal?: PeriodTotal;
  loading: boolean;
}) {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-md bg-linear-to-br from-card to-muted/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="text-primary/80">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="text-2xl font-bold tracking-tight">
              ₹{periodTotal?.amount ?? 0}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>In Hand: <span className="font-semibold text-foreground">₹{periodTotal?.inHand ?? 0}</span></span>
              <span className="text-muted-foreground/40">•</span>
              <span>Comm: <span className="font-semibold text-foreground">₹{periodTotal?.commissionAmount ?? 0}</span></span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatDetail({ 
  icon, 
  label, 
  value, 
  loading 
}: { 
  icon: React.ReactNode;
  label: string; 
  value?: number; 
  loading: boolean 
}) {
  return (
    <div className="flex flex-col items-center md:items-start p-3 rounded-lg bg-muted/20 border border-border/50">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-1 h-7 w-12" />
      ) : (
        <div className="text-2xl font-bold tracking-tight text-foreground">{value ?? 0}</div>
      )}
    </div>
  );
}
