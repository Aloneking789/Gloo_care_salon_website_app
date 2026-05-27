import type {
  ApiResponse,
  BarberData,
  BookingData,
  CreateServiceRequest,
  DashboardOverviewData,
  SalonProfileData,
  ServiceData,
  UpdateSalonProfileRequest,
  WalletData,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from './types';

export const API_BASE = 'https://apigcare.vercel.app/api/v1';
const TOKEN_KEY = 'gloocare_token';
const USER_KEY = 'gloocare_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  auth?: boolean;
  formData?: FormData;
  query?: Record<string, string | number | undefined>;
}

export class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, formData, query } = opts;

  let url = `${API_BASE}${path}`;
  if (query) {
    const usp = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
    });
    const qs = usp.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body: payload });
  } catch (e) {
    throw new ApiClientError('Network error. Please check your connection.', 0);
  }

  let json: ApiResponse<T> | { message?: string } | null = null;
  try {
    json = await res.json();
  } catch {
    /* ignore */
  }

  if (!res.ok || (json && 'success' in json && !json.success)) {
    const msg =
      (json && 'message' in json && json.message) ||
      `Request failed (${res.status})`;

    // If the server indicates the token is invalid or expired, clear stored
    // auth and notify the app so it can reset UI and prompt for login.
    if (res.status === 401) {
      try {
        clearToken();
        if (typeof globalThis !== 'undefined' && typeof globalThis.dispatchEvent === 'function') {
          globalThis.dispatchEvent(new CustomEvent('gloocare:logged-out'));
        }
      } catch {
        // ignore
      }
      throw new ApiClientError('Session expired. Please sign in again.', 401);
    }

    throw new ApiClientError(msg, res.status);
  }

  if (json && 'data' in json) return (json as ApiResponse<T>).data;
  return json as T;
}

export const api = {
  // Auth
  register: (body: RegisterRequest) =>
    request<AuthUser>('/salon/auth/register', { method: 'POST', body, auth: false }),
  login: (body: LoginRequest) =>
    request<AuthUser>('/salon/auth/login', { method: 'POST', body, auth: false }),
  sendOtp: (phone: string) =>
    request<{ message?: string }>('/salon/auth/login-sendotp', {
      method: 'POST',
      body: { phone },
      auth: false,
    }),
  verifyOtp: (phone: string, otp: string) =>
    request<AuthUser>('/salon/auth/login-verifyotp', {
      method: 'POST',
      body: { phone, otp },
      auth: false,
    }),
  referralCode: () => request<{ referralCode: string }>('/salon/auth/referral-code'),

  // Wallet
  wallet: () => request<WalletData>('/salon/wallet'),

  // Profile
  profile: () => request<SalonProfileData>('/salon/profile/'),
  updateProfile: (body: UpdateSalonProfileRequest) =>
    request<SalonProfileData>('/salon/profile/', { method: 'PUT', body }),
  uploadProfileImages: (files: File[], extra?: UpdateSalonProfileRequest) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    if (extra) {
      Object.entries(extra).forEach(([k, v]) => {
        if (v !== undefined) fd.append(k, typeof v === 'string' ? v : JSON.stringify(v));
      });
    }
    return request<SalonProfileData>('/salon/profile/', { method: 'PUT', formData: fd });
  },

  // Services
  services: () => request<ServiceData[]>('/salon/services'),
  createService: (body: CreateServiceRequest) =>
    request<ServiceData>('/salon/services', { method: 'POST', body }),
  updateService: (id: string, body: CreateServiceRequest) =>
    request<ServiceData>(`/salon/services/${id}`, { method: 'PUT', body }),
  deleteService: (id: string) =>
    request<unknown>(`/salon/services/${id}`, { method: 'DELETE' }),

  // Barbers / staff
  barbers: () => request<BarberData[]>('/salon/barbers'),
  createBarber: (body: Partial<BarberData>) =>
    request<BarberData>('/salon/barbers', { method: 'POST', body }),
  updateBarber: (id: string, body: Partial<BarberData>) =>
    request<BarberData>(`/salon/barbers/${id}`, { method: 'PUT', body }),
  deleteBarber: (id: string) =>
    request<unknown>(`/salon/barbers/${id}`, { method: 'DELETE' }),

  // Bookings
  bookings: (query?: { status?: string; date?: string }) =>
    request<BookingData[]>('/salon/bookings', { query }),

  // Dashboard
  dashboard: () => request<DashboardOverviewData>('/salon/dashboard/overview'),
};
