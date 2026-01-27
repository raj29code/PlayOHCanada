import axios from 'axios';
import {
  Sport,
  ScheduleResponseDto,
  Booking,
  JoinScheduleDto,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserResponse,
  ApiError,
} from '../types/api';
import APP_CONFIG from '../config/app.config';

// Base API URL - update this to match your .NET backend port
const BASE_URL = APP_CONFIG.API_BASE_URL;

// Storage keys
const TOKEN_KEY = APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN;
const USER_KEY = APP_CONFIG.STORAGE_KEYS.USER_DATA;

class ApiService {
  private api: any;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to attach JWT token
    this.api.interceptors.request.use(
      (config: any) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear auth data
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== Auth Methods ====================

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  saveUserData(user: Partial<AuthResponse>): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUserData(): Partial<AuthResponse> | null {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post('/Auth/login', credentials);
    const { token, ...userData } = response.data;
    this.setToken(token);
    this.saveUserData(userData);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post('/Auth/register', data);
    const { token, ...userData } = response.data;
    this.setToken(token);
    this.saveUserData(userData);
    return response.data;
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response = await this.api.get('/Auth/me');
    return response.data;
  }

  logout(): void {
    this.clearAuth();
  }

  // ==================== Schedules Methods ====================

  async getSchedules(params?: {
    sportId?: number;
    venue?: string;
    startDate?: string;
    endDate?: string;
    includeParticipants?: boolean;
  }): Promise<ScheduleResponseDto[]> {
    const response = await this.api.get('/Schedules', { params });
    return response.data;
  }

  async getScheduleById(id: number): Promise<ScheduleResponseDto> {
    const response = await this.api.get(`/Schedules/${id}`);
    return response.data;
  }

  // ==================== Sports Methods ====================

  async getSports(): Promise<Sport[]> {
    const response = await this.api.get('/Sports');
    return response.data;
  }

  async getSportById(id: number): Promise<Sport> {
    const response = await this.api.get(`/Sports/${id}`);
    return response.data;
  }

  // ==================== Bookings Methods ====================

  async joinSchedule(data: JoinScheduleDto): Promise<Booking> {
    const response = await this.api.post('/Bookings/join', data);
    return response.data;
  }

  async getMyBookings(): Promise<Booking[]> {
    const response = await this.api.get('/Bookings/my-bookings');
    return response.data;
  }

  async getBookingById(id: number): Promise<Booking> {
    const response = await this.api.get(`/Bookings/${id}`);
    return response.data;
  }

  async cancelBooking(id: number): Promise<void> {
    await this.api.delete(`/Bookings/${id}`);
  }

  async getScheduleBookings(scheduleId: number): Promise<Booking[]> {
    const response = await this.api.get(`/Bookings/schedule/${scheduleId}`);
    return response.data;
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
