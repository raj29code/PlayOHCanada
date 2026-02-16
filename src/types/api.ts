// API Type Definitions based on PlayOhCanada API

export interface Sport {
  id: number;
  name: string;
  iconUrl: string | null;
}

export interface CreateSportDto {
  name: string;
  iconUrl?: string;
}

export interface UpdateSportDto {
  name?: string;
  iconUrl?: string;
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

export interface BookingResponseDto {
  id: number;
  scheduleId: number;
  bookingTime: string;
  sportName: string;
  sportIconUrl: string;
  venue: string;
  scheduleStartTime: string;
  scheduleEndTime: string;
  maxPlayers: number;
  currentPlayers: number;
  equipmentDetails: string | null;
  isPast: boolean;
  canCancel: boolean;
}

export interface JoinScheduleDto {
  scheduleId: number;
  guestName?: string | null;
  guestMobile?: string | null;
}

export enum RecurrenceFrequency {
  Daily = 0,
  Weekly = 1,
  Monthly = 2,
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export interface RecurrenceDto {
  isRecurring: boolean;
  frequency?: RecurrenceFrequency | null;
  endDate?: string | null; // format: date
  daysOfWeek?: DayOfWeek[] | null;
  intervalCount?: number | null;
}

export interface CreateScheduleDto {
  sportId: number;
  venue: string;
  startDate: string; // format: date (YYYY-MM-DD)
  startTime: string; // format: time (HH:mm:ss)
  endTime: string;   // format: time (HH:mm:ss)
  timezoneOffsetMinutes?: number; // -720 to 720, offset from UTC
  maxPlayers: number;
  equipmentDetails?: string | null;
  recurrence?: RecurrenceDto | null;
}

export interface UpdateScheduleDto {
  venue?: string | null;
  date?: string | null;      // format: date (YYYY-MM-DD)
  startTime?: string | null; // format: time (HH:mm:ss)
  endTime?: string | null;   // format: time (HH:mm:ss)
  timezoneOffsetMinutes?: number | null; // -720 to 720, offset from UTC
  maxPlayers?: number | null;
  equipmentDetails?: string | null;
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
  isAdmin?: boolean;
}

export interface AuthResponse {
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isAdmin: boolean;
  token: string;
  expiresAt: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isAdmin: boolean;
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

export interface VenueDto {
  name: string;
  scheduleCount: number;
  availableSchedules: number;
  sports: string[];
  nextScheduleTime: string;
}

export interface VenueStatisticsDto {
  venueName: string;
  totalSchedules: number;
  futureSchedules: number;
  pastSchedules: number;
  totalBookings: number;
  mostPopularSport: string;
  firstScheduleDate: string;
  lastScheduleDate: string;
  averageBookingsPerSchedule: number;
}

export interface RenameVenueDto {
  oldName: string;
  newName: string;
}

export interface VenueRenameResultDto {
  oldName: string;
  newName: string;
  schedulesUpdated: number;
  message: string;
}

export interface MergeVenuesDto {
  targetName: string;
  venuesToMerge: string[];
}

export interface VenueMergeResultDto {
  targetName: string;
  mergedVenues: string[];
  schedulesUpdated: number;
  message: string;
}

export interface VenueDeleteResultDto {
  venueName: string;
  schedulesDeleted: number;
  bookingsAffected: number;
  message: string;
}

export interface ValidateVenueDto {
  venueName: string;
}

export interface VenueValidationDto {
  venueName: string;
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}
