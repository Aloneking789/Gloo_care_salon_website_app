import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Clock, 
  Scissors, 
  User as UserIcon, 
  CheckCircle, 
  ChevronRight, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/salon/queue')({
  component: QueuePage,
});

function QueuePage() {
  const qc = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [completingToken, setCompletingToken] = useState<number | null>(null);

  // Queries
  const queueQuery = useQuery({
    queryKey: ['queue'],
    queryFn: api.getQueue,
  });

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: api.services,
  });

  // Mutations
  const addToQueueMutation = useMutation({
    mutationFn: (serviceId: string) => api.addToQueue(serviceId),
    onSuccess: (res) => {
      toast.success(`Customer added! Token ${res.token} at position ${res.position}.`);
      qc.invalidateQueries({ queryKey: ['queue'] });
      setAddModalOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add customer to queue');
    }
  });

  const completeServiceMutation = useMutation({
    mutationFn: (queueToken: number) => api.completeQueue(queueToken),
    onSuccess: (res) => {
      toast.success(res.message || 'Service completed successfully.');
      qc.invalidateQueries({ queryKey: ['queue'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to complete queue service');
    },
    onSettled: () => {
      setCompletingToken(null);
    }
  });

  const handleCompleteService = (token: number) => {
    setCompletingToken(token);
    completeServiceMutation.mutate(token);
  };

  const handleAddClick = () => {
    const services = servicesQuery.data || [];
    if (services.length === 0) {
      toast.error('Please add services first before adding customers to the queue');
      return;
    }
    setAddModalOpen(true);
  };

  const isRefetching = queueQuery.isFetching || servicesQuery.isFetching;

  const handleRefresh = async () => {
    await Promise.all([
      queueQuery.refetch(),
      servicesQuery.refetch(),
    ]);
    toast.success('Queue list updated');
  };

  const members = queueQuery.data || [];
  const services = servicesQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader 
        title="Live Queue" 
        description="Monitor and manage walk-in customers and current waiting lists."
        layout="side-by-side"
        actions={
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefetching}
              className="cursor-pointer gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm h-8 sm:h-9"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button 
              size="sm" 
              onClick={handleAddClick}
              className="cursor-pointer gap-1 px-2.5 sm:px-4 text-xs sm:text-sm h-8 sm:h-9 bg-primary text-primary-foreground font-semibold"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
              <span className="text-xs sm:text-sm">Add Walk-in</span>
            </Button>
          </>
        }
      />

      {/* Main Body */}
      {queueQuery.isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-muted/10 p-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 animate-pulse">
            <Users className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No One in Queue</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Add walk-in customers or check back later when clients book live queue tokens.
          </p>
          <Button onClick={handleAddClick} className="cursor-pointer gap-1.5 font-semibold">
            <Plus className="h-4 w-4" /> Add First Customer
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 max-w-3xl">
          {members.map((member) => {
            const isFirst = member.position === 1;
            const isCompleting = completingToken === member.token;
            
            return (
              <Card 
                key={member.token + "-" + member.position}
                className={`overflow-hidden border transition-all duration-300 ${
                  isFirst 
                    ? 'border-primary ring-1 ring-primary shadow-xs' 
                    : 'hover:shadow-xs'
                }`}
              >
                <CardContent className="p-5 md:p-6 space-y-4">
                  {/* Position Pill and Time Limit */}
                  <div className="flex items-center justify-between">
                    <div>
                      {isFirst ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 px-3 py-1 text-xs select-none">
                          <Sparkles className="h-3 w-3 text-white animate-pulse" />
                          🔜 Next Up
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="font-semibold text-xs border select-none">
                          #{member.position} in line
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 border px-2.5 py-1 rounded-full font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{member.estimatedTime} min wait</span>
                    </div>
                  </div>

                  {/* Token number & Customer details */}
                  <div className="flex items-center gap-4 flex-col sm:flex-row">
                    {/* Token Box */}
                    <div className={`h-16 w-20 flex flex-col items-center justify-center rounded-xl border select-none shrink-0 ${
                      isFirst 
                        ? 'bg-primary/10 border-primary/30 text-primary' 
                        : 'bg-muted/30 border-muted-foreground/15 text-muted-foreground'
                    }`}>
                      <span className="text-[10px] font-bold tracking-widest leading-none">TOKEN</span>
                      <span className="text-3xl font-extrabold leading-none mt-1">{member.token}</span>
                    </div>

                    {/* Customer Row */}
                    <div className="flex-1 w-full border rounded-xl p-3 bg-muted/10 flex items-center gap-3">
                      {member.user ? (
                        <>
                          <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/15">
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-foreground truncate">{member.user.name}</div>
                            <div className="text-xs text-muted-foreground font-medium">{member.user.phone}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
                            <UserIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-amber-700">Walk-in Customer</div>
                            <div className="text-xs text-muted-foreground">No contact details registered</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Services Row */}
                  <div className="space-y-2 border-t pt-3.5">
                    <div className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Services</div>
                    <div className="grid gap-2">
                      {member.services.map((service) => (
                        <div 
                          key={service.id} 
                          className="flex items-center justify-between text-sm bg-primary/5 border border-primary/10 rounded-lg p-2.5"
                        >
                          <div className="flex items-center gap-2 font-semibold text-foreground">
                            <Scissors className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{service.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <span className="text-primary">₹{service.price}</span>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="text-muted-foreground">{service.duration} mins</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Complete Button (Only for #1 Next Up) */}
                  {isFirst && (
                    <div className="pt-2">
                      <Button
                        onClick={() => handleCompleteService(member.token)}
                        disabled={isCompleting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 cursor-pointer gap-2"
                      >
                        {isCompleting ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Completing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Mark as Complete
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Select Service Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Service</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-2.5 py-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => addToQueueMutation.mutate(service.id)}
                  disabled={addToQueueMutation.isPending}
                  className="w-full flex items-center justify-between border rounded-lg p-3 bg-background hover:bg-muted/40 hover:border-primary/40 cursor-pointer text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Scissors className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{service.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{service.category}</div>
                    </div>
                  </div>
                  <div className="text-right font-semibold">
                    <div className="text-sm text-primary">₹{service.price}</div>
                    <div className="text-xs text-muted-foreground">{service.duration} min</div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
