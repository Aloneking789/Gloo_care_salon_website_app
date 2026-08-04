export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  status?: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface SalonProfileData {
  salonId: string;
  salonName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: Address;
  location: GeoLocation;
  images: string[];
  rating: number;
  barbersCount: number;
  mode: string;
}

export interface UpdateSalonProfileRequest {
  address?: Address;
  location?: GeoLocation;
  salonName?: string;
  email?: string;
  phone?: string;
}

export interface ServiceData {
  id: string;
  salonId: string;
  name: string;
  duration: number;
  price: number;
  category: string;
}

export interface CreateServiceRequest {
  name: string;
  duration: number;
  price: number;
  category: string;
}

export interface BarberData {
  id: string;
  salonId: string;
  name: string;
  phone?: string;
  email?: string;
  specialization?: string;
  isActive?: boolean;
}

export interface BookingData {
  id: string;
  salonId: string;
  customerName?: string;
  customerPhone?: string;
  serviceName?: string;
  barberName?: string;
  date: string;
  time?: string;
  status: string;
  amount?: number;
}

export interface SalonWalletTransaction {
  id: string;
  walletId: string;
  type: 'CREDIT' | 'DEBIT';
  reason: string;
  amount: number;
  bookingId?: string | null;
  createdAt: string;
}

export interface WalletData {
  balance: number;
  transactions: SalonWalletTransaction[];
}

export interface PeriodTotal {
  amount: number;
  commissionAmount: number;
  inHand: number;
}

export interface DashboardOverviewData {
  commissionPercentage?: number;
  totals?: {
    allTime?: PeriodTotal;
    today?: PeriodTotal;
    weekly?: PeriodTotal;
    monthly?: PeriodTotal;
  };
  bookings?: {
    completed?: number;
    upcoming?: number;
    today?: number;
  };
}

export interface AuthUser {
  salonId: string;
  salonName: string;
  ownerName: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  ownerName: string;
  salonName: string;
  email: string;
  password: string;
  phone: string;
  referralCode?: string;
}
