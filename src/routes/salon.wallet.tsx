import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Wallet as WalletIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const Route = createFileRoute('/salon/wallet')({
  component: WalletPage,
});

function WalletPage() {
  const wallet = useQuery({ queryKey: ['wallet'], queryFn: api.wallet });
  const referral = useQuery({ queryKey: ['referral'], queryFn: api.referralCode });

  const copyCode = async () => {
    const code = referral.data?.referralCode;
    if (!code) return;
    await navigator.clipboard.writeText(code);
    toast.success('Referral code copied');
  };

  return (
    <div>
      <PageHeader title="Wallet & Referrals" />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <WalletIcon className="h-4 w-4 text-primary" /> Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wallet.isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="text-4xl font-bold text-primary">₹{wallet.data?.balance ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your referral code</CardTitle>
          </CardHeader>
          <CardContent>
            {referral.isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-secondary px-4 py-2 font-mono text-lg font-semibold tracking-wider">
                  {referral.data?.referralCode ?? '—'}
                </div>
                <Button variant="ghost" size="icon" onClick={copyCode} aria-label="Copy">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">Share with other salon owners</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {wallet.isLoading ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !wallet.data?.transactions?.length ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="divide-y">
              {wallet.data.transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-medium">{t.reason}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className={`font-semibold ${t.type === 'CREDIT' ? 'text-emerald-600' : 'text-destructive'}`}>
                    {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
