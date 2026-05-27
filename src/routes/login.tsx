import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { user, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: '/salon' });
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-card to-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-card/90 p-6 shadow-lg backdrop-blur-sm sm:p-8">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">GlooCare</h1>
          <p className="mt-1 text-sm text-muted-foreground">Salon Partner Portal — quick login</p>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-gradient-to-b from-card/60 to-card p-4">
          <h2 className="text-lg font-semibold">Sign in with your phone</h2>
          <p className="mt-1 text-sm text-muted-foreground">We'll send a 4-digit code to your number. Fast and secure.</p>
        </div>

        <OtpLoginForm onSendOtp={sendOtp} onVerify={verifyOtp} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New partner?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

// Email login removed — phone OTP only

function OtpLoginForm({
  onSendOtp,
  onVerify,
}: {
  onSendOtp: (phone: string) => Promise<void>;
  onVerify: (phone: string, otp: string) => Promise<void>;
}) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      await onSendOtp(phone);
      setSent(true);
      toast.success('OTP sent to your phone');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    try {
      await onVerify(phone, otp);
      toast.success('Welcome back');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <div className="flex gap-2">
          <div className="inline-flex items-center rounded-md border border-input px-3 text-sm">+91</div>
          <Input
            id="phone"
            type="tel"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={sent}
          />
        </div>
      </div>

      {!sent ? (
        <Button type="button" className="w-full" onClick={send} disabled={loading || !phone}>
          {loading ? 'Sending...' : 'Send OTP'}
        </Button>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Enter the 4-digit code</Label>
            <InputOTP maxLength={4} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button type="button" className="w-full" onClick={verify} disabled={loading || otp.length < 4}>
            {loading ? 'Verifying...' : 'Verify & sign in'}
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => { setSent(false); setOtp(''); }}
          >
            Change number
          </button>
        </>
      )}
    </div>
  );
}
