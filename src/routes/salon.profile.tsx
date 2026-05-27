import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { UpdateSalonProfileRequest } from '@/lib/types';

export const Route = createFileRoute('/salon/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: api.profile });
  const [form, setForm] = useState<UpdateSalonProfileRequest>({});

  useEffect(() => {
    if (data) {
      setForm({
        salonName: data.salonName,
        email: data.email,
        phone: data.phone,
        address: data.address,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => api.updateProfile(form),
    onSuccess: () => {
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (e: Error) => {
      if ((e as any)?.message?.toLowerCase?.().includes('session expired') || (e as any)?.status === 401) return;
      toast.error(e.message);
    },
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Profile" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Profile" description="Your salon details" />

      {data && (
        <Card className="mb-6">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {data.salonName?.[0]?.toUpperCase() ?? 'S'}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{data.salonName}</div>
              <div className="text-sm text-muted-foreground">{data.ownerName}</div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  {data.rating ?? 0}
                </span>
                <span>{data.barbersCount ?? 0} staff</span>
                <span className="capitalize">{data.mode}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Edit details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row label="Salon name" id="salonName" value={form.salonName ?? ''} onChange={(v) => setForm({ ...form, salonName: v })} />
          <Row label="Email" id="email" type="email" value={form.email ?? ''} onChange={(v) => setForm({ ...form, email: v })} />
          <Row label="Phone" id="phone" type="tel" value={form.phone ?? ''} onChange={(v) => setForm({ ...form, phone: v })} />

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" /> Address
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Row label="Street" id="street" value={form.address?.street ?? ''} onChange={(v) => setForm({ ...form, address: { ...(form.address ?? { street: '', city: '', state: '', pincode: '' }), street: v } })} />
              <Row label="City" id="city" value={form.address?.city ?? ''} onChange={(v) => setForm({ ...form, address: { ...(form.address ?? { street: '', city: '', state: '', pincode: '' }), city: v } })} />
              <Row label="State" id="state" value={form.address?.state ?? ''} onChange={(v) => setForm({ ...form, address: { ...(form.address ?? { street: '', city: '', state: '', pincode: '' }), state: v } })} />
              <Row label="Pincode" id="pincode" value={form.address?.pincode ?? ''} onChange={(v) => setForm({ ...form, address: { ...(form.address ?? { street: '', city: '', state: '', pincode: '' }), pincode: v } })} />
            </div>
          </div>

          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label, id, value, onChange, type = 'text',
}: { label: string; id: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
