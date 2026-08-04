import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Scissors } from 'lucide-react';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { user, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: '/salon' });
  }, [user, navigate]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }
    // Basic phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(phone);
      setSent(true);
      toast.success('OTP sent successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error('Please enter the 4-digit code');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      toast.success('Welcome back!');
      navigate({ to: '/salon' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-md sm:p-8">
        {/* Header section matching Register style */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-4 shadow-sm">
            <Scissors className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {sent ? 'Verify OTP' : 'Sign in to salon'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-[280px] mx-auto leading-relaxed">
            {sent 
              ? `We sent a 4-digit code to +91 ${phone}` 
              : 'Join GlooCare as a partner and manage your business'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold select-none">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="pl-12"
                />
              </div>
            </div>
            <Button type="submit" className="w-full font-bold cursor-pointer h-11" disabled={loading || !phone}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-3 flex flex-col items-center justify-center">
              <Label className="text-sm font-semibold text-muted-foreground self-start">Enter the 4-digit code</Label>
              <div className="py-2">
                <InputOTP maxLength={4} value={otp} onChange={setOtp} autoFocus>
                  <InputOTPGroup className="gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <InputOTPSlot 
                        key={i} 
                        index={i} 
                        className="h-14 w-14 text-xl border-border bg-muted/20 rounded-xl"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="space-y-3">
              <Button type="submit" className="w-full font-bold cursor-pointer h-11" disabled={loading || otp.length < 4}>
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm font-semibold text-primary hover:underline cursor-pointer"
                onClick={() => { setSent(false); setOtp(''); }}
              >
                Change number
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          New partner?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
