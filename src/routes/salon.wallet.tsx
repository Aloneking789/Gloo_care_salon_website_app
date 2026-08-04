import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { WalletData } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Copy, 
  Wallet as WalletIcon, 
  Gift, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle,
  HelpCircle,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/salon/wallet')({
  component: WalletPage,
});

function WalletPage() {
  const qc = useQueryClient();
  
  // Queries
  const wallet = useQuery({ queryKey: ['wallet'], queryFn: api.wallet });
  const referral = useQuery({ queryKey: ['referral'], queryFn: api.referralCode });

  // Floored available balance
  const displayBalance = Math.floor(wallet.data?.balance ?? 0);

  // Modal open states
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('');

  const copyCode = async () => {
    const code = referral.data?.referralCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Referral code copied to clipboard!');
    } catch {
      toast.error('Failed to copy referral code');
    }
  };

  const withdrawMutation = useMutation({
    mutationFn: (body: { amount: number; upiid: string }) => api.requestWithdrawal(body),
    onSuccess: (res) => {
      toast.success(res.message || 'Withdrawal request submitted successfully.');
      qc.invalidateQueries({ queryKey: ['wallet'] });
      setWithdrawOpen(false);
      setWithdrawAmount('');
      setUpiId('');
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Withdrawal request failed');
    }
  });

  const getSuggestions = () => {
    const balance = Math.floor(wallet.data?.balance || 0);
    const baseAmounts = [100, 200, 500, 1000];
    const suggestions = baseAmounts.filter(amt => amt <= balance);
    
    if (balance > 0) {
      suggestions.push(balance);
    }
    
    return Array.from(new Set(suggestions));
  };

  const handleWithdrawSubmit = () => {
    const trimmedUpi = upiId.trim();
    if (!trimmedUpi) {
      toast.error('Please enter UPI ID');
      return;
    }

    const upiRegex = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(trimmedUpi)) {
      toast.error('Please enter a valid UPI ID (e.g. username@bank)');
      return;
    }

    const parsedAmount = parseFloat(withdrawAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }

    const balance = Math.floor(wallet.data?.balance || 0);
    if (parsedAmount > balance) {
      toast.error(`Withdrawal amount cannot exceed available balance of ₹${balance}`);
      return;
    }

    withdrawMutation.mutate({
      amount: parsedAmount,
      upiid: trimmedUpi
    });
  };

  const sortedTransactions = wallet.data?.transactions 
    ? [...wallet.data.transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Wallet & Referrals" 
        description="Manage your wallet balances, withdraw earnings, and refer other partners."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Wallet Balance Card */}
        <Card className="overflow-hidden border transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-muted-foreground uppercase tracking-wider">
              <WalletIcon className="h-4 w-4 text-primary" /> Wallet Balance
            </CardTitle>
            <CardDescription>Available earnings ready for withdrawal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {wallet.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="text-5xl font-extrabold text-primary select-all">
                  ₹{displayBalance}
                </div>
                <Button 
                  onClick={() => setWithdrawOpen(true)}
                  disabled={displayBalance <= 0}
                  className="w-full gap-2 cursor-pointer text-sm font-semibold py-5"
                >
                  <Send className="h-4 w-4" />
                  Request Withdrawal
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Referral Card */}
        <Card className="overflow-hidden border transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-muted-foreground uppercase tracking-wider">
              <Gift className="h-4 w-4 text-primary" /> Referral Program
            </CardTitle>
            <CardDescription>Earn reward by inviting your customer through GlooCare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {referral.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary/80 px-5 py-2.5 font-mono text-xl font-bold tracking-widest text-foreground select-all border border-secondary shadow-xs">
                    {referral.data?.referralCode ?? '—'}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={copyCode} 
                    aria-label="Copy code"
                    className="h-11 w-11 cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-normal flex items-start gap-1.5 pt-1">
                  <Sparkles className="h-4 w-4 shrink-0 text-primary animate-pulse" />
                  <span>Receive referral cash bonuses directly in your wallet once your referred customers complete bookings.</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Transaction History
          </CardTitle>
          <CardDescription>Records of your salon bookings credits and UPI withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          {wallet.isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : sortedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-muted/20">
              <HistoryContainer />
              <p className="text-sm font-semibold text-muted-foreground mt-3">No Transactions Yet</p>
              <p className="text-xs text-muted-foreground/80 mt-1">Earnings and withdrawals will appear here.</p>
            </div>
          ) : (
            <div className="divide-y border rounded-lg overflow-hidden bg-muted/10">
              {sortedTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 text-sm bg-background transition-colors hover:bg-muted/10">
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="font-bold text-foreground capitalize truncate">
                      {tx.reason ? tx.reason.replace(/_/g, ' ') : 'Booking Service Credit'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {new Date(tx.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className={`font-extrabold flex items-center gap-1.5 shrink-0 ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-destructive'}`}>
                    {tx.type === 'CREDIT' ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-destructive" />
                    )}
                    <span>{tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Dialog Modal */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WalletIcon className="h-5 w-5 text-primary" />
              Request Payment
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Balance Preview */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-center space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Balance</p>
              <p className="text-3xl font-extrabold text-primary">₹{displayBalance}</p>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <Label htmlFor="withdrawAmount">Amount to Withdraw (₹)</Label>
              <Input
                id="withdrawAmount"
                type="number"
                placeholder="Enter amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {getSuggestions().map((amt, idx) => {
                  const balance = Math.floor(wallet.data?.balance || 0);
                  const isAll = amt === balance;
                  
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWithdrawAmount(amt.toString())}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all border cursor-pointer select-none ${
                        withdrawAmount === amt.toString()
                          ? 'bg-primary border-primary text-primary-foreground font-bold shadow-xs'
                          : 'bg-muted/50 border-muted hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {isAll ? `All (₹${amt})` : `₹${amt}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* UPI ID input */}
            <div className="space-y-1.5">
              <Label htmlFor="upiId">UPI ID *</Label>
              <Input
                id="upiId"
                placeholder="e.g. username@bank or mobile@ybl"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                autoCapitalize="off"
                autoComplete="off"
              />
              <p className="text-[10px] text-muted-foreground leading-normal flex items-start gap-1">
                <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80 mt-0.5" />
                <span>Please ensure your UPI ID details are correct to prevent settlement failures.</span>
              </p>
            </div>
          </div>

          <DialogFooter className="flex sm:justify-end gap-2 border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => setWithdrawOpen(false)} 
              disabled={withdrawMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleWithdrawSubmit} 
              disabled={!upiId || !withdrawAmount || withdrawMutation.isPending}
              className="cursor-pointer bg-emerald-600 hover:bg-emerald-700"
            >
              {withdrawMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HistoryContainer() {
  return (
    <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
      <WalletIcon className="h-5 w-5" />
    </div>
  );
}
