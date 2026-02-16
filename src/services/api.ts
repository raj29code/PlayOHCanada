import axios from 'axios';
import {
  Sport,
  CreateSportDto,
  UpdateSportDto,
  ScheduleResponseDto,
  Booking,
  JoinScheduleDto,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserResponse,
  ApiError,
  CreateScheduleDto,
  UpdateScheduleDto,
  VenueStatisticsDto,
  RenameVenueDto,
  VenueRenameResultDto,
  MergeVenuesDto,
  VenueMergeResultDto,
  VenueDeleteResultDto,
  ValidateVenueDto,
  VenueValidationDto,
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

  async logout(): Promise<void> {
    try {
      // Call the logout API endpoint
      await this.api.post('/Auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Always clear local authentication data
      this.clearAuth();
    }
  }

  // ==================== Schedules Methods ====================

  async getSchedules(params?: {
    sportId?: number;
    venue?: string;
    startDate?: string;
    endDate?: string;
    includeParticipants?: boolean;
    timezoneOffsetMinutes?: number;
  }): Promise<ScheduleResponseDto[]> {
    const response = await this.api.get('/Schedules', { params });
    return response.data;
  }

  async getScheduleById(id: number, timezoneOffsetMinutes?: number, includeParticipants: boolean = true): Promise<ScheduleResponseDto> {
    const params: any = { includeParticipants };
    if (timezoneOffsetMinutes !== undefined) {
      params.timezoneOffsetMinutes = timezoneOffsetMinutes;
    }
    const response = await this.api.get(`/Schedules/${id}`, { params });
    return response.data;
  }

  async createSchedule(data: CreateScheduleDto): Promise<ScheduleResponseDto[]> {
    const response = await this.api.post('/Schedules', data);
    return response.data;
  }

  async updateSchedule(id: number, data: UpdateScheduleDto): Promise<void> {
    await this.api.put(`/Schedules/${id}`, data);
  }

  async deleteSchedule(id: number): Promise<void> {
    await this.api.delete(`/Schedules/${id}`);
  }

  async deleteMySchedules(): Promise<void> {
    await this.api.delete('/Schedules/my-schedules');
  }

  async getVenues(timezoneOffsetMinutes?: number): Promise<any[]> {
    const params = timezoneOffsetMinutes !== undefined ? { timezoneOffsetMinutes } : {};
    const response = await this.api.get('/Schedules/venues', { params });
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

  async createSport(data: CreateSportDto): Promise<Sport> {
    const response = await this.api.post('/Sports', data);
    return response.data;
  }

  async updateSport(id: number, data: UpdateSportDto): Promise<void> {
    await this.api.put(`/Sports/${id}`, data);
  }

  async deleteSport(id: number): Promise<void> {
    await this.api.delete(`/Sports/${id}`);
  }

  // ==================== Bookings Methods ====================

  async joinSchedule(data: JoinScheduleDto): Promise<Booking> {
    const response = await this.api.post('/Bookings/join', data);
    return response.data;
  }

  async getMyBookings(timezoneOffsetMinutes?: number, includeAll?: boolean): Promise<any[]> {
    const params: any = {};
    if (timezoneOffsetMinutes !== undefined) {
      params.timezoneOffsetMinutes = timezoneOffsetMinutes;
    }
    if (includeAll !== undefined) {
      params.includeAll = includeAll;
    }
    const response = await this.api.get('/Bookings/my-bookings', { params });
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

  // ==================== Venue Management Methods ====================

  async getVenueSuggestions(): Promise<string[]> {
    const response = await this.api.get('/Venues/suggestions');
    return response.data;
  }

  async getVenueStatistics(): Promise<VenueStatisticsDto[]> {
    const response = await this.api.get('/Venues/statistics');
    return response.data;
  }

  async renameVenue(data: RenameVenueDto): Promise<VenueRenameResultDto> {
    const response = await this.api.put('/Venues/rename', data);
    return response.data;
  }

  async mergeVenues(data: MergeVenuesDto): Promise<VenueMergeResultDto> {
    const response = await this.api.post('/Venues/merge', data);
    return response.data;
  }

  async deleteVenue(venueName: string): Promise<VenueDeleteResultDto> {
    const response = await this.api.delete(`/Venues/${encodeURIComponent(venueName)}`);
    return response.data;
  }

  async validateVenue(data: ValidateVenueDto): Promise<VenueValidationDto> {
    const response = await this.api.post('/Venues/validate', data);
    return response.data;
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
