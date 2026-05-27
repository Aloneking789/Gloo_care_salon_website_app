import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { CreateServiceRequest, ServiceData } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/salon/services')({
  component: ServicesPage,
});

const empty: CreateServiceRequest = { name: '', duration: 30, price: 0, category: '' };

function ServicesPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['services'], queryFn: api.services });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceData | null>(null);
  const [form, setForm] = useState<CreateServiceRequest>(empty);

  const save = useMutation({
    mutationFn: async () => {
      if (editing) return api.updateService(editing.id, form);
      return api.createService(form);
    },
    onSuccess: () => {
      toast.success(editing ? 'Service updated' : 'Service created');
      qc.invalidateQueries({ queryKey: ['services'] });
      setOpen(false);
      setEditing(null);
      setForm(empty);
    },
    onError: (e: Error) => {
      // If session expired, global handler will show toast and clear auth.
      if ((e as any)?.message?.toLowerCase?.().includes('session expired') || (e as any)?.status === 401) {
        return;
      }
      toast.error(e.message);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.deleteService(id),
    onSuccess: () => {
      toast.success('Service deleted');
      qc.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (e: Error) => {
      if ((e as any)?.message?.toLowerCase?.().includes('session expired') || (e as any)?.status === 401) {
        return;
      }
      toast.error(e.message);
    },
  });

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s: ServiceData) => {
    setEditing(s);
    setForm({ name: s.name, duration: s.duration, price: s.price, category: s.category });
    setOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage the services your salon offers"
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add service
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState onAdd={openCreate} />
      ) : (
        <div className="grid gap-3">
          {data.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{s.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {s.category} · {s.duration} min
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold text-primary">₹{s.price}</div>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { if (confirm('Delete this service?')) remove.mutate(s.id); }}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><span /></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit service' : 'New service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input id="duration" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name}>
              {save.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center">
      <p className="text-sm text-muted-foreground">No services yet.</p>
      <Button className="mt-4" onClick={onAdd}>Add your first service</Button>
    </div>
  );
}
