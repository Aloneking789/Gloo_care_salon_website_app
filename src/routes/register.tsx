import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ownerName: '',
    salonName: '',
    email: '',
    password: '',
    phone: '',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: '/salon' });
  }, [user, navigate]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        ...form,
        referralCode: form.referralCode || undefined,
      });
      toast.success('Account created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-primary">Create your salon</h1>
          <p className="text-sm text-muted-foreground">Join GlooCare as a partner</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Owner name" id="ownerName" value={form.ownerName} onChange={update('ownerName')} required />
          <Field label="Salon name" id="salonName" value={form.salonName} onChange={update('salonName')} required />
          <Field label="Email" id="email" type="email" value={form.email} onChange={update('email')} required />
          <Field label="Phone" id="phone" type="tel" value={form.phone} onChange={update('phone')} required />
          <Field label="Password" id="password" type="password" value={form.password} onChange={update('password')} required />
          <Field label="Referral code (optional)" id="referralCode" value={form.referralCode} onChange={update('referralCode')} />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already a partner?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field(props: React.ComponentProps<typeof Input> & { label: string }) {
  const { label, id, ...rest } = props;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...rest} />
    </div>
  );
}
