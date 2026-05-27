import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const;
type Status = typeof STATUSES[number];

export const Route = createFileRoute('/salon/bookings')({
  component: BookingsPage,
});

function BookingsPage() {
  const [status, setStatus] = useState<Status>('all');
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings', status],
    queryFn: () => api.bookings(status === 'all' ? undefined : { status }),
  });

  return (
    <div>
      <PageHeader title="Bookings" description="View and manage your appointments" />

      <Tabs value={status} onValueChange={(v) => setStatus(v as Status)} className="mb-4">
        <TabsList>
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">{s}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No bookings.
        </div>
      ) : (
        <div className="grid gap-3">
          {data.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">{b.customerName ?? 'Customer'}</div>
                  <div className="text-sm text-muted-foreground">
                    {b.serviceName ?? '—'} {b.barberName ? `· ${b.barberName}` : ''}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {b.date} {b.time ? `· ${b.time}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {b.amount !== undefined && <div className="font-semibold text-primary">₹{b.amount}</div>}
                  <Badge variant="secondary" className="capitalize">{b.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
