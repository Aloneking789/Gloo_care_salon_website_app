import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { BookingData } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Phone,
  User,
  Clock,
  Calendar,
  ChevronRight,
  Store,
  Home,
  Info,
  CalendarDays,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/salon/bookings')({
  component: BookingsPage,
});

type FilterType = 'all' | 'today' | 'upcoming' | 'completed' | 'cancelled';

function BookingsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [detailsBooking, setDetailsBooking] = useState<BookingData | null>(null);

  // Fetch all bookings with 10-second polling interval
  const { data: bookings = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.bookings(),
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  // Keep details modal synchronized with polling data updates
  useEffect(() => {
    if (detailsBooking) {
      const updated = bookings.find(b => b.id === detailsBooking.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(detailsBooking)) {
        setDetailsBooking(updated);
      }
    }
  }, [bookings, detailsBooking]);

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.confirmBooking(id),
    onSuccess: (updated) => {
      toast.success('Booking confirmed successfully!');
      qc.invalidateQueries({ queryKey: ['bookings'] });
      if (detailsBooking?.id === updated.id) setDetailsBooking(updated);
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to confirm booking'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.rejectBooking(id),
    onSuccess: (updated) => {
      toast.success('Booking rejected successfully');
      qc.invalidateQueries({ queryKey: ['bookings'] });
      if (detailsBooking?.id === updated.id) setDetailsBooking(updated);
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to reject booking'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.cancelBooking(id),
    onSuccess: (updated) => {
      toast.success('Booking cancelled successfully');
      qc.invalidateQueries({ queryKey: ['bookings'] });
      if (detailsBooking?.id === updated.id) setDetailsBooking(updated);
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to cancel booking'),
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => api.startBooking(id),
    onSuccess: (updated) => {
      toast.success(`Service started successfully!`);
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setSelectedBooking(null);
      if (detailsBooking?.id === updated.id) setDetailsBooking(updated);
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to start service'),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.completeBooking(id),
    onSuccess: (res) => {
      toast.success('Service completed successfully!');
      qc.invalidateQueries({ queryKey: ['bookings'] });
      if (detailsBooking?.id === res.booking.id) setDetailsBooking(res.booking);
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to complete service'),
  });

  const getStatusColor = (status: BookingData['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'CONFIRMED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'STARTED': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'CANCELLED': 
      case 'REJECTED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: BookingData['status']) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'CONFIRMED': return 'Confirmed';
      case 'STARTED': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      case 'REJECTED': return 'Rejected';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
  };

  const getServicesText = (services: BookingData['services']) => {
    if (!services || !Array.isArray(services)) return 'No services';
    return services
      .map(s => s?.service?.name || 'Unknown Service')
      .filter(Boolean)
      .join(' + ') || 'No services';
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const bookingDate = new Date(booking.date);
      const today = new Date();
      return bookingDate.toDateString() === today.toDateString();
    }
    if (filter === 'upcoming') {
      return booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'STARTED';
    }
    if (filter === 'completed') return booking.status === 'COMPLETED';
    if (filter === 'cancelled') return booking.status === 'CANCELLED' || booking.status === 'REJECTED';
    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Bookings' },
    { key: 'today', label: "Today's Bookings" },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description={`${bookings.length} total appointments`}
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isLoading || isRefetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.key)}
            className="rounded-full px-4 text-xs h-8 cursor-pointer"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl bg-muted/20">
          <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold text-foreground">No Bookings Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {filter === 'all' 
              ? 'No bookings yet. Once customers schedule appointments, they will show up here.'
              : `No ${filter} bookings matches the current filter.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-md">
              <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
                {/* Clickable Info Area */}
                <div 
                  className="flex gap-4 cursor-pointer align-top"
                  onClick={() => setDetailsBooking(booking)}
                >
                  {/* Avatar falls back to UI avatar API */}
                  <img 
                    src={booking.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.user?.name || 'Customer')}&background=8B7355&color=fff&size=150`} 
                    alt={booking.user?.name || 'Customer'}
                    className="h-14 w-14 rounded-full object-cover shrink-0 border bg-muted shadow-xs"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-base truncate">{booking.user?.name || 'Customer'}</h4>
                      <Badge className={`capitalize text-xs font-semibold px-2 py-0.5 border select-none shrink-0 ${getStatusColor(booking.status)}`} variant="outline">
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{getServicesText(booking.services)}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
                      <span>{formatDate(booking.date)} • {booking.time}</span>
                      <span className="text-muted-foreground/30">•</span>
                      <span className="inline-flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-foreground">
                        {booking.type === 'SALON' ? <Store className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                        {booking.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[120px] sm:max-w-[160px]">{booking.barber?.name || 'Not assigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">₹{booking.totalPrice}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 cursor-pointer"
                      onClick={() => setDetailsBooking(booking)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Inline Card Actions */}
                {booking.status === 'CONFIRMED' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8 cursor-pointer border-destructive/20 hover:bg-destructive/10 hover:text-destructive transition-all"
                      onClick={() => cancelMutation.mutate(booking.id)}
                      disabled={cancelMutation.isPending || startMutation.isPending}
                    >
                      {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs h-8 cursor-pointer gap-1"
                      onClick={() => setSelectedBooking(booking)}
                      disabled={cancelMutation.isPending || startMutation.isPending}
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Start
                    </Button>
                  </div>
                )}

                {booking.status === 'STARTED' && (
                  <div className="pt-1">
                    <Button
                      size="sm"
                      className="w-full text-xs h-8 cursor-pointer gap-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => completeMutation.mutate(booking.id)}
                      disabled={completeMutation.isPending}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      {completeMutation.isPending ? 'Completing...' : 'Complete Service'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Start Service Confirmation Modal */}
      <Dialog open={selectedBooking !== null} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary fill-current" />
              Start Service
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you ready to start the service for <span className="font-semibold text-foreground">{selectedBooking?.user?.name || 'Customer'}</span>?
            </p>

            {selectedBooking && (
              <div className="rounded-lg bg-muted/40 p-4 border space-y-2.5 text-sm">
                <div className="flex gap-2">
                  <span className="font-semibold shrink-0 text-muted-foreground w-20">Services:</span>
                  <span className="font-medium">{getServicesText(selectedBooking.services)}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold shrink-0 text-muted-foreground w-20">Time:</span>
                  <span className="font-medium">{selectedBooking.time} • {selectedBooking.estimatedDuration} min</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold shrink-0 text-muted-foreground w-20">Total:</span>
                  <span className="font-bold text-primary">₹{selectedBooking.totalPrice}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedBooking(null)} disabled={startMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={() => selectedBooking && startMutation.mutate(selectedBooking.id)} disabled={startMutation.isPending}>
              {startMutation.isPending ? 'Starting...' : 'Start Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Modal */}
      <Dialog open={detailsBooking !== null} onOpenChange={() => setDetailsBooking(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start pr-6">
              <div>
                <DialogTitle className="text-xl font-bold">Booking Details</DialogTitle>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-1">Code: {detailsBooking?.confirmationCode}</p>
              </div>
            </div>
          </DialogHeader>

          {detailsBooking && (
            <div className="space-y-6 py-2">
              {/* Customer Details */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Customer Information</h5>
                <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border">
                  <img 
                    src={detailsBooking.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(detailsBooking.user?.name || 'Customer')}&background=8B7355&color=fff&size=150`} 
                    alt={detailsBooking.user?.name}
                    className="h-14 w-14 rounded-full object-cover border bg-muted shadow-xs"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="font-bold text-base text-foreground">{detailsBooking.user?.name || 'Customer'}</h4>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{detailsBooking.user?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 shrink-0" />
                        <span className="truncate">{detailsBooking.user?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Appointment Status</span>
                <Badge className={`capitalize text-xs font-bold px-3 py-1 border select-none ${getStatusColor(detailsBooking.status)}`} variant="outline">
                  {getStatusLabel(detailsBooking.status)}
                </Badge>
              </div>

              {/* Services details */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Services ({detailsBooking.services?.length || 0})</h5>
                <div className="space-y-2">
                  {detailsBooking.services?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/20 border p-3 rounded-lg text-sm">
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground">{item.service?.name}</p>
                        <p className="text-xs text-muted-foreground">{item.service?.duration} mins</p>
                      </div>
                      <span className="font-bold text-primary">₹{item.service?.price}</span>
                    </div>
                  )) ?? <p className="text-sm text-muted-foreground">No services selected.</p>}
                </div>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-muted/30 border rounded-lg p-3 text-center space-y-1">
                  <Calendar className="h-4.5 w-4.5 text-blue-500 mx-auto" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date</p>
                  <p className="font-semibold text-xs text-foreground">
                    {new Date(detailsBooking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="bg-muted/30 border rounded-lg p-3 text-center space-y-1">
                  <Clock className="h-4.5 w-4.5 text-amber-500 mx-auto" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Time</p>
                  <p className="font-semibold text-xs text-foreground">{detailsBooking.time}</p>
                </div>
                <div className="bg-muted/30 border rounded-lg p-3 text-center space-y-1">
                  <Clock className="h-4.5 w-4.5 text-indigo-500 mx-auto" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</p>
                  <p className="font-semibold text-xs text-foreground">{detailsBooking.estimatedDuration} mins</p>
                </div>
                <div className="bg-muted/30 border rounded-lg p-3 text-center space-y-1">
                  {detailsBooking.type === 'SALON' ? <Store className="h-4.5 w-4.5 text-emerald-500 mx-auto" /> : <Home className="h-4.5 w-4.5 text-emerald-500 mx-auto" />}
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Type</p>
                  <p className="font-semibold text-xs text-foreground">{detailsBooking.type}</p>
                </div>
              </div>

              {/* Barber information */}
              <div className="flex items-center justify-between border-t border-border/50 pt-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Barber Assigned</span>
                <span className="font-semibold text-sm text-foreground">{detailsBooking.barber?.name || 'Any Available Barber'}</span>
              </div>

              {/* Special notes */}
              {detailsBooking.notes && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Special Notes</h5>
                  <div className="rounded-lg bg-amber-500/5 text-sm p-3 border border-amber-500/10 text-muted-foreground">
                    {detailsBooking.notes}
                  </div>
                </div>
              )}

              {/* Service timeline */}
              {detailsBooking.serviceStartedAt && (
                <div className="space-y-2 border-t border-border/50 pt-4">
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Service Timeline</h5>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-muted/20 border p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-muted-foreground">Started At</p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {new Date(detailsBooking.serviceStartedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {detailsBooking.expectedCompletion && (
                      <div>
                        <p className="font-medium text-muted-foreground">Expected Completion</p>
                        <p className="font-semibold text-foreground mt-0.5">
                          {new Date(detailsBooking.expectedCompletion).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="flex justify-between items-center border-t border-border/50 pt-4">
                <span className="text-sm font-bold text-foreground">Total Amount</span>
                <span className="text-2xl font-bold text-primary">₹{detailsBooking.totalPrice}</span>
              </div>

              {/* Metadata dates */}
              <div className="text-[10px] text-muted-foreground/60 space-y-0.5">
                <p>Booked on: {new Date(detailsBooking.createdAt).toLocaleString('en-IN')}</p>
                {detailsBooking.updatedAt !== detailsBooking.createdAt && (
                  <p>Last updated: {new Date(detailsBooking.updatedAt).toLocaleString('en-IN')}</p>
                )}
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/50">
                {detailsBooking.status === 'PENDING' && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 text-xs border-destructive/20 text-destructive hover:bg-destructive/10 cursor-pointer gap-1.5"
                      onClick={() => rejectMutation.mutate(detailsBooking.id)}
                      disabled={rejectMutation.isPending || confirmMutation.isPending}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 cursor-pointer gap-1.5"
                      onClick={() => confirmMutation.mutate(detailsBooking.id)}
                      disabled={rejectMutation.isPending || confirmMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept
                    </Button>
                  </>
                )}

                {detailsBooking.status === 'CONFIRMED' && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 text-xs border-destructive/20 text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => cancelMutation.mutate(detailsBooking.id)}
                      disabled={cancelMutation.isPending || startMutation.isPending}
                    >
                      Cancel Booking
                    </Button>
                    <Button
                      className="flex-1 text-xs cursor-pointer gap-1.5"
                      onClick={() => {
                        setSelectedBooking(detailsBooking);
                        setDetailsBooking(null);
                      }}
                      disabled={cancelMutation.isPending || startMutation.isPending}
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Start Service
                    </Button>
                  </>
                )}

                {detailsBooking.status === 'STARTED' && (
                  <Button
                    className="w-full text-xs cursor-pointer gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => completeMutation.mutate(detailsBooking.id)}
                    disabled={completeMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Complete Service
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-xs cursor-pointer gap-1.5 border-primary/20 text-primary hover:bg-primary/10"
                  asChild
                >
                  <a href={`tel:${detailsBooking.user?.phone}`}>
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    Call Customer
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
