import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, DollarSign, Users, Scissors } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export const Route = createFileRoute('/salon/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.dashboard,
  });

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.ownerName ?? ''}`}
        description={user?.salonName}
      />

      {error && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<DollarSign className="h-4 w-4" />} label="Revenue" value={data?.totals?.revenue} prefix="₹" loading={isLoading} />
        <StatCard icon={<Calendar className="h-4 w-4" />} label="Bookings" value={data?.totals?.bookings} loading={isLoading} />
        <StatCard icon={<Users className="h-4 w-4" />} label="Customers" value={data?.totals?.customers} loading={isLoading} />
        <StatCard icon={<Scissors className="h-4 w-4" />} label="Services" value={data?.totals?.services} loading={isLoading} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bookings overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <Stat label="Today" value={data?.bookings?.today} loading={isLoading} />
            <Stat label="Pending" value={data?.bookings?.pending} loading={isLoading} />
            <Stat label="Completed" value={data?.bookings?.completed} loading={isLoading} />
            <Stat label="Cancelled" value={data?.bookings?.cancelled} loading={isLoading} />
          </CardContent>
        </Card>
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
            <p className="mt-1 text-sm text-muted-foreground">
              Platform commission on each booking
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  prefix = '',
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  prefix?: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">
            {prefix}
            {value ?? 0}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, loading }: { label: string; value?: number; loading: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {loading ? <Skeleton className="mt-1 h-6 w-12" /> : <div className="text-xl font-semibold">{value ?? 0}</div>}
    </div>
  );
}
