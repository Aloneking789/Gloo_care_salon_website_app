import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Scissors } from 'lucide-react';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ownerName: '',
    salonName: '',
    phone: '',
    password: '',
    referralCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: '/salon' });
  }, [user, navigate]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.ownerName || !form.salonName || !form.phone || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Basic phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Password length validation
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const generatedEmail = `gloocaresalon${form.phone}@gmail.com`;

    try {
      await register({
        ownerName: form.ownerName,
        salonName: form.salonName,
        email: generatedEmail,
        password: form.password,
        phone: form.phone,
        referralCode: form.referralCode || undefined,
      });
      toast.success('Account created successfully!');
      navigate({ to: '/salon' });
    } catch (error) {
      const apiError = error as any;
      let errorMessage = apiError.message || 'Registration failed. Please try again.';
      
      // Handle validation errors
      if (apiError.errors) {
        const errorMessages = Object.values(apiError.errors).flat();
        errorMessage = errorMessages.join(' | ');
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-md sm:p-8">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-4 shadow-sm">
            <Scissors className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Create your salon</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Join GlooCare as a partner and manage your business</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input
              id="ownerName"
              value={form.ownerName}
              onChange={update('ownerName')}
              placeholder="Enter owner name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salonName">Salon Name</Label>
            <Input
              id="salonName"
              value={form.salonName}
              onChange={update('salonName')}
              placeholder="Enter salon name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold select-none">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={update('phone')}
                placeholder="9876543210"
                required
                className="pl-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                placeholder="Create a password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full font-bold cursor-pointer h-11 mt-2" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already a partner?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
