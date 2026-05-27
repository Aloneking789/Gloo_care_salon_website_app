import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, User as UserIcon } from 'lucide-react';

export const Route = createFileRoute('/salon/staff')({
  component: StaffPage,
});

function StaffPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['barbers'], queryFn: api.barbers });

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage your barbers and stylists"
        actions={
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" /> Add staff
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No staff members yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{b.name}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {b.specialization ?? b.phone ?? '—'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
