// API Type Definitions based on PlayOhCanada API

export interface Sport {
  id: number;
  name: string;
  iconUrl: string | null;
}

export interface ParticipantDto {
  name: string;
  bookingTime: string;
}

export interface ScheduleResponseDto {
  id: number;
  sportId: number;
  sportName: string;
  sportIconUrl: string | null;
  venue: string;
  startTime: string;
  endTime: string;
  maxPlayers: number;
  currentPlayers: number;
  spotsRemaining: number;
  equipmentDetails: string | null;
  participants: ParticipantDto[];
}

export interface Booking {
  id: number;
  scheduleId: number;
  bookingTime: string;
  userId: number | null;
  guestName: string | null;
  guestMobile: string | null;
}

export interface JoinScheduleDto {
  scheduleId: number;
  guestName?: string | null;
  guestMobile?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  token: string;
  expiresAt: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface ApiError {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
}
