# PlayOhCanada - Development Progress

## Project Overview
A sports booking application built with Ionic 8 + React + TypeScript that allows users to browse and join sports schedules, and admins to manage schedules with recurring event support.

**Technology Stack:**
- **Frontend:** Ionic 8.5.0, React 19.0.0, TypeScript 5.9.0
- **UI Components:** Ionic React Components, AG Grid Community
- **HTTP Client:** Axios 1.13.4
- **Routing:** React Router 5.3.4
- **Build Tool:** Vite 5.0.0
- **Backend API:** .NET API at https://localhost:7063/api

---

## Completed Features

### 1. Authentication System
**Status:** ✅ Complete

**Implementation:**
- JWT token-based authentication stored in localStorage
- Login page with email/password validation
- Registration page with comprehensive field validation
- Logout functionality with API endpoint integration
- Protected routes using AuthenticatedRoute wrapper component
- Automatic route re-check on navigation changes

**Files:**
- `src/pages/Login.tsx` - Email/password login with validation
- `src/pages/Register.tsx` - User registration with full validation
- `src/services/api.ts` - Authentication methods and JWT interceptor
- `src/App.tsx` - Protected route configuration

**Validation Rules:**
- Email: Valid email format using regex
- Password: Minimum 6 characters
- Name: 2-100 characters
- Phone: Optional, max 20 characters
- Confirm Password: Must match password

**Features:**
- Remembered email feature (persists last successful login email)
- Form borders for better UX
- Error handling with user-friendly messages
- Redirect to home after successful login

---

### 2. API Integration Layer
**Status:** ✅ Complete

**Implementation:**
- Centralized API service with Axios
- Automatic JWT token attachment via interceptors
- Complete CRUD operations for schedules, sports, bookings
- Type-safe API calls matching .NET backend schema

**Files:**
- `src/services/api.ts` - Main API service class
- `src/types/api.ts` - TypeScript interfaces matching backend DTOs
- `src/config/app.config.ts` - Centralized configuration

**API Endpoints Integrated:**
- **Auth:** `/api/Auth/register`, `/api/Auth/login`, `/api/Auth/me`, `/api/Auth/logout`
- **Schedules:** `/api/Schedules` (GET, POST, PUT, DELETE)
- **Sports:** `/api/Sports` (GET, POST, DELETE)
- **Bookings:** `/api/Bookings/join`, `/api/Bookings/my-bookings`, `/api/Bookings/{id}`

**Key Methods:**
```typescript
- login(credentials): Promise<AuthResponse>
- register(data): Promise<AuthResponse>
- logout(): Promise<void>
- getCurrentUser(): Promise<UserResponse>
- getSchedules(filters): Promise<ScheduleResponseDto[]>
- createSchedule(data): Promise<Schedule[]>
- updateSchedule(id, data): Promise<void>
- deleteSchedule(id): Promise<void>
- joinSchedule(data): Promise<Booking>
```

---

### 3. Admin Schedule Management
**Status:** ✅ Complete

**Implementation:**
- AG Grid React for professional data table
- Create, Read, Update, Delete schedules
- Recurring schedule support (Daily, Weekly, Monthly)
- Inline edit and delete actions
- Pagination (20 items per page)
- Sorting and filtering capabilities

**Files:**
- `src/pages/AdminSchedules.tsx` - Main admin interface
- `src/pages/AdminSchedules.css` - Grid styling

**Features:**
- **Toolbar Actions:** Add Schedule button, Refresh button
- **Grid Columns:** Sport, Venue, Start Time, End Time, Players (current/max), Spots Left
- **Modal Form:** Full schedule creation/editing with validation
- **Recurrence Options:**
  - Toggle for recurring schedules
  - Frequency: Daily, Weekly, Monthly
  - Days of week selection (for weekly)
  - Interval count (e.g., every 2 weeks)
  - Optional end date
- **Date/Time Structure:**
  - Separate date picker (startDate)
  - Separate time pickers (startTime, endTime)
  - Timezone offset automatic calculation
- **Validation:**
  - All required fields checked
  - Max players: 1-100
  - Date format: YYYY-MM-DD
  - Time format: HH:mm:ss

**AG Grid Configuration:**
- Module: AllCommunityModule registered
- Theme: ag-theme-alpine
- Features: Sorting, filtering, pagination, auto-height

---

### 4. User Profile & Account Management
**Status:** ✅ Complete

**Implementation:**
- User profile display page
- Admin badge for admin users
- Logout functionality with confirmation
- User information display

**Files:**
- `src/pages/Tab3.tsx` - Profile page
- `src/pages/Tab3.css` - Profile styling

**Profile Information:**
- Name
- Email
- Phone number
- Member since date
- Last login timestamp
- Admin status badge (if applicable)

**Features:**
- Async logout with API call
- Confirmation dialog before logout
- Navigation to login after logout
- Error handling

---

### 5. Configurable App Settings
**Status:** ✅ Complete

**Implementation:**
- Centralized configuration file
- Easy modification for app name and settings

**Files:**
- `src/config/app.config.ts`

**Configuration:**
```typescript
export const APP_CONFIG = {
  APP_NAME: 'PlayOhCanada',
  API_BASE_URL: 'https://localhost:7063/api',
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_PASSWORD_LENGTH: 6,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
  },
  STORAGE_KEYS: {
    TOKEN: 'auth_token',
    USER: 'user_data',
    REMEMBERED_EMAIL: 'remembered_email',
  },
};
```

---

### 6. Schedule Data Model (Latest API Structure)
**Status:** ✅ Complete

**Date/Time Format:**
The API uses separated date and time fields for better clarity:

```typescript
export interface CreateScheduleDto {
  sportId: number;
  venue: string;
  startDate: string;           // format: date (YYYY-MM-DD)
  startTime: string;           // format: time (HH:mm:ss)
  endTime: string;             // format: time (HH:mm:ss)
  timezoneOffsetMinutes?: number; // -720 to 720, auto-calculated
  maxPlayers: number;          // 1-100
  equipmentDetails?: string | null;
  recurrence?: RecurrenceDto | null;
}

export interface RecurrenceDto {
  isRecurring: boolean;
  frequency?: RecurrenceFrequency | null; // Daily=0, Weekly=1, Monthly=2
  endDate?: string | null;     // format: date (YYYY-MM-DD)
  daysOfWeek?: DayOfWeek[] | null; // [0=Sunday, 1=Monday, ..., 6=Saturday]
  intervalCount?: number | null; // e.g., 1 = every week, 2 = every 2 weeks
}
```

**Example:**
A recurring basketball game every Wednesday from 7 PM to 8 PM:
```json
{
  "sportId": 1,
  "venue": "Community Center",
  "startDate": "2026-02-05",
  "startTime": "19:00:00",
  "endTime": "20:00:00",
  "timezoneOffsetMinutes": -300,
  "maxPlayers": 10,
  "recurrence": {
    "isRecurring": true,
    "frequency": 1,
    "endDate": "2026-12-31",
    "daysOfWeek": [3],
    "intervalCount": 1
  }
}
```

---

### 7. Timezone Handling
**Status:** ✅ Complete

**Implementation:**
- Automatic timezone offset calculation
- JavaScript's `Date.getTimezoneOffset()` used
- Offset sent with every schedule create/update

**Calculation:**
```javascript
timezoneOffsetMinutes: -new Date().getTimezoneOffset()
```

**Examples:**
- EST (UTC-5): `-300` minutes
- PST (UTC-8): `-480` minutes
- IST (UTC+5:30): `330` minutes
- GMT (UTC): `0` minutes

---

### 8. Navigation & Routing
**Status:** ✅ Complete

**Implementation:**
- Tab-based navigation (Home, Bookings, Profile)
- Public routes for login/register
- Protected routes requiring authentication

**Files:**
- `src/App.tsx` - Route configuration
- `src/pages/Bookings.tsx` (formerly Tab2.tsx) - Smart routing component

**Routes:**
- `/login` - Public
- `/register` - Public
- `/tabs/home` - Protected (HomeFeed)
- `/tabs/bookings` - Protected (Admin schedules or user bookings)
- `/tabs/profile` - Protected (User profile)

**Tab Bar:**
- Home icon (homeOutline)
- My Bookings icon (calendarOutline)
- Profile icon (personOutline)

---

### 9. Bookings Tab (Smart Routing)
**Status:** ⚠️ Partially Complete

**Implementation:**
- Renamed from Tab2 to Bookings
- Admin users see AdminSchedules component
- Regular users see placeholder for user bookings page

**Files:**
- `src/pages/Bookings.tsx`
- `src/pages/Bookings.css`

**Current Behavior:**
```typescript
if (isAdmin) {
  return <AdminSchedules />; // ✅ Complete
} else {
  return <UserBookingsPlaceholder />; // ❌ TODO
}
```

---

## Type Definitions Summary

### Core Interfaces

```typescript
// Authentication
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

// Schedules
export interface ScheduleResponseDto {
  id: number;
  sportId: number;
  sportName: string;
  sportIconUrl: string | null;
  venue: string;
  startTime: string; // date-time in response
  endTime: string;   // date-time in response
  maxPlayers: number;
  currentPlayers: number;
  spotsRemaining: number;
  equipmentDetails: string | null;
  participants: ParticipantDto[];
}

export interface Sport {
  id: number;
  name: string;
  iconUrl: string | null;
}

export interface Booking {
  id: number;
  scheduleId: number;
  bookingTime: string;
  userId: number | null;
  guestName: string | null;
  guestMobile: string | null;
}
```

---

## Known Issues & Fixes Applied

### Issue 1: AG Grid Not Displaying Data
**Problem:** Grid showed error #272 - No modules registered
**Solution:** Added ModuleRegistry and registered AllCommunityModule
```typescript
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
```

### Issue 2: Date Format Mismatch
**Problem:** Recurrence endDate sent as datetime instead of date
**Solution:** Extract date part only using `.split('T')[0]`
```typescript
endDate: recurrenceEndDate ? recurrenceEndDate.split('T')[0] : null
```

### Issue 3: Authentication Not Persisting
**Problem:** Protected routes not re-checking auth on navigation
**Solution:** Created AuthenticatedRoute component with useLocation hook
```typescript
const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(apiService.isAuthenticated());
  
  useEffect(() => {
    setIsAuthenticated(apiService.isAuthenticated());
  }, [location]);
  
  return isAuthenticated ? <>{children}</> : <Redirect to="/login" />;
};
```

---

## File Structure

```
c:\myProject\PlayOHCanada\
├── public/
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── ExploreContainer.tsx
│   │   └── ExploreContainer.css
│   ├── config/
│   │   └── app.config.ts                    # App configuration
│   ├── pages/
│   │   ├── AdminSchedules.tsx               # Admin schedule management (AG Grid)
│   │   ├── AdminSchedules.css
│   │   ├── Bookings.tsx                     # Smart routing (Admin/User)
│   │   ├── Bookings.css
│   │   ├── HomeFeed.tsx                     # Schedule listing & join
│   │   ├── Login.tsx                        # Authentication
│   │   ├── Login.css
│   │   ├── Register.tsx                     # User registration
│   │   ├── Register.css
│   │   ├── Tab1.tsx, Tab1.css               # Home tab
│   │   ├── Tab3.tsx                         # User profile
│   │   └── Tab3.css
│   ├── services/
│   │   └── api.ts                           # Axios API service
│   ├── theme/
│   │   └── variables.css                    # Ionic theme variables
│   ├── types/
│   │   └── api.ts                           # TypeScript type definitions
│   ├── App.tsx                              # Root component with routing
│   ├── App.test.tsx
│   ├── main.tsx                             # Entry point
│   ├── setupTests.ts
│   └── vite-env.d.ts
├── cypress/                                  # E2E tests
├── package.json
├── tsconfig.json
├── vite.config.ts
├── ionic.config.json
└── PROGRESS.md                              # This file
```

---

## Pending Features (TODO)

### High Priority

#### 1. User Bookings Page
**Status:** 🔴 Not Started
**Description:** Regular users need to see their joined schedules
**Requirements:**
- List of user's bookings via `/api/Bookings/my-bookings`
- Display schedule details for each booking
- Cancel booking functionality
- Empty state when no bookings
- Refresh capability

**Estimated Complexity:** Medium

#### 2. Schedule Details Page
**Status:** 🔴 Not Started
**Description:** Detailed view of a specific schedule
**Requirements:**
- Full schedule information
- Participant list (when includeParticipants=true)
- Join/Leave functionality
- Equipment details display
- Spots remaining indicator
- Back navigation

**Estimated Complexity:** Medium

#### 3. Home Feed Schedule List
**Status:** 🟡 Partially Complete
**Description:** HomeFeed.tsx exists but may need refinement
**Requirements:**
- Filter schedules (by sport, venue, date range)
- Search functionality
- Sort options
- Join schedule from list
- View details link
- Loading states
- Empty states

**Estimated Complexity:** Medium-High

### Medium Priority

#### 4. Sports Management (Admin)
**Status:** 🔴 Not Started
**Description:** Admin interface to manage sports
**Requirements:**
- List all sports
- Add new sport with icon URL
- Delete sport
- Validation

**Estimated Complexity:** Low-Medium

#### 5. Schedule Filters & Search
**Status:** 🔴 Not Started
**Description:** Advanced filtering for schedules
**Requirements:**
- Filter by sport type
- Filter by venue
- Date range picker
- Search by venue name
- Clear filters option

**Estimated Complexity:** Medium

#### 6. Real-time Updates
**Status:** 🔴 Not Started
**Description:** Auto-refresh when spots fill up
**Requirements:**
- Polling or WebSocket integration
- Update spots remaining
- Update participant count
- Notification when schedule is full

**Estimated Complexity:** High

### Low Priority

#### 7. Password Recovery
**Status:** 🔴 Not Started
**Description:** Reset forgotten password
**Requirements:**
- Forgot password link
- Email verification flow
- Reset password form

**Estimated Complexity:** Medium

#### 8. Phone/SSO Login
**Status:** 🔴 Not Started (API returns 501 Not Implemented)
**Description:** Alternative login methods
**Requirements:**
- Phone number with verification code
- SSO provider integration

**Estimated Complexity:** High

#### 9. Guest Booking
**Status:** 🔴 Not Started
**Description:** Allow non-registered users to join
**Requirements:**
- Guest name and mobile fields in join form
- No authentication required
- Validation

**Estimated Complexity:** Low

---

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- Functional components with hooks
- Async/await for API calls
- Error handling with try/catch
- User-friendly error messages via IonToast

### Component Patterns
```typescript
// Standard page component structure
const MyPage: React.FC = () => {
  // State
  const [data, setData] = useState<Type[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [present] = useIonToast();

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await apiService.getData();
      setData(result);
    } catch (error: any) {
      present({
        message: 'Error loading data',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render
  return <IonPage>...</IonPage>;
};
```

### API Service Pattern
```typescript
async methodName(params): Promise<ReturnType> {
  const response = await this.api.get('/endpoint', { params });
  return response.data;
}
```

### Error Handling
- Always catch errors in async functions
- Display user-friendly messages
- Log detailed errors to console
- Use IonToast for notifications

---

## Testing Strategy

### Current State
- No automated tests implemented yet
- Manual testing performed for all features

### Recommended Tests
1. **Unit Tests:**
   - API service methods
   - Validation functions
   - Utility functions

2. **Integration Tests:**
   - Authentication flow
   - Schedule CRUD operations
   - Booking flow

3. **E2E Tests (Cypress):**
   - User registration and login
   - Admin schedule creation
   - User booking flow
   - Navigation between pages

---

## Performance Considerations

### Current Optimizations
- `useMemo` for AG Grid column definitions
- `useCallback` where appropriate
- Lazy loading of routes (if needed)
- Pagination in AG Grid (20 items/page)

### Future Optimizations
- Implement virtual scrolling for large lists
- Cache API responses (React Query or similar)
- Debounce search inputs
- Optimize image loading (sports icons)

---

## Deployment Checklist

### Before Production
- [ ] Remove console.log statements
- [ ] Update API_BASE_URL to production endpoint
- [ ] Enable production build optimizations
- [ ] Test on multiple devices/browsers
- [ ] Security audit (token storage, XSS, CSRF)
- [ ] Add error tracking (Sentry, LogRocket)
- [ ] Setup CI/CD pipeline
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] SEO optimization (if web deployment)

### Environment Variables
```typescript
// Recommended structure for env-specific config
const ENV = {
  development: {
    API_BASE_URL: 'https://localhost:7063/api',
    DEBUG: true,
  },
  production: {
    API_BASE_URL: 'https://api.playohcanada.com/api',
    DEBUG: false,
  },
};
```

---

## API Integration Notes

### Authentication Flow
1. User submits login credentials
2. API returns JWT token + user data
3. Token stored in localStorage
4. Axios interceptor attaches token to all requests
5. Token checked on protected route access
6. Logout clears token and redirects to login

### Timezone Logic
- Client sends timezone offset in minutes
- Server interprets times in user's timezone
- Displayed times converted to user's local time

### Recurrence Logic
- Client sends recurrence pattern
- Server generates multiple schedule instances
- Each instance is a separate schedule in DB
- All instances share same time pattern

---

## Dependencies

### Production Dependencies
```json
{
  "@ionic/react": "^8.5.0",
  "@ionic/react-router": "^8.5.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router": "^5.3.4",
  "react-router-dom": "^5.3.4",
  "axios": "^1.13.4",
  "ag-grid-react": "^latest",
  "ag-grid-community": "^latest",
  "ionicons": "^7.0.0"
}
```

### Dev Dependencies
```json
{
  "typescript": "~5.9.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^latest",
  "eslint": "^latest",
  "cypress": "^latest"
}
```

---

## Troubleshooting

### Common Issues

#### Issue: "No AG Grid modules registered"
**Solution:** Import and register AllCommunityModule
```typescript
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
```

#### Issue: Schedule not showing after creation
**Solutions:**
1. Check console for API errors
2. Verify loadData() is called after create
3. Check if data format matches grid columns
4. Verify AG Grid modules registered

#### Issue: Authentication not persisting
**Solutions:**
1. Check localStorage has token
2. Verify Axios interceptor is configured
3. Check AuthenticatedRoute implementation
4. Verify token format (Bearer prefix)

#### Issue: Timezone offset incorrect
**Solution:** Verify calculation uses negative offset:
```typescript
-new Date().getTimezoneOffset()
```

---

## Next Immediate Actions

### Priority 1: User Bookings Page
**Goal:** Allow regular users to see their bookings

**Steps:**
1. Create UserBookings component in `src/pages/`
2. Fetch bookings via `apiService.getMyBookings()`
3. Display in card list or simple grid
4. Add cancel booking functionality
5. Update Bookings.tsx to render UserBookings for non-admin users

**Time Estimate:** 2-3 hours

### Priority 2: Enhanced Home Feed
**Goal:** Improve schedule browsing experience

**Steps:**
1. Review current HomeFeed.tsx implementation
2. Add filter controls (sport, venue, date)
3. Implement search functionality
4. Add join schedule button with confirmation
5. Show loading and empty states

**Time Estimate:** 3-4 hours

### Priority 3: Schedule Details Page
**Goal:** Show full schedule information with participants

**Steps:**
1. Create ScheduleDetails component
2. Add route `/tabs/schedule/:id`
3. Fetch schedule with participants
4. Display all details
5. Add join/leave actions
6. Show participant list

**Time Estimate:** 2-3 hours

---

---

## Recent Updates (February 7, 2026)

### Sports Management System (CRUD)
**Status:** ✅ Complete

**Implementation:**
- Full sports CRUD operations for admin users
- Create new sports with name and optional icon URL
- **Edit/Update sports** with name and icon URL changes
- Delete sports (with warning about existing schedules)
- Visual sport cards with icons and IDs
- Admin-only access control
- **Free icon URLs provided** via Iconify CDN for all sports

**Features:**
1. **Sports List View:**
   - Card-based layout with sport avatars
   - Default icon when no URL provided
   - Sport ID display for reference
   - Edit and delete buttons on each card
   - Empty state with call-to-action

2. **Create Sport:**
   - Sport name (required)
   - Icon URL (optional)
   - Live preview of icon when URL provided
   - Helpful notes about icon resources

3. **Edit Sport:**
   - Update sport name
   - Update icon URL
   - Live preview of new icon
   - Success notifications

4. **Delete Sport:**
   - Confirmation dialog with warnings
   - Error handling for sports in use by schedules
   - Success notifications

5. **Icon Resources:**
   - Iconify CDN integration (free, reliable)
   - Pre-configured URLs for all sports
   - Customizable colors and sizes
   - Documentation in sports-icons.md

**API Integration:**
- `POST /api/Sports` - Create new sport
- `GET /api/Sports` - List all sports
- `GET /api/Sports/{id}` - Get sport details
- `PUT /api/Sports/{id}` - Update sport (newly added)
- `DELETE /api/Sports/{id}` - Delete sport

**Files Created:**
- `src/pages/SportsManagement.tsx` - Complete sports CRUD interface
- `sports-icons.md` - Free icon URLs and resources guide

**Files Modified:**
- `src/types/api.ts` - Added CreateSportDto and UpdateSportDto interfaces
- `src/services/api.ts` - Added createSport(), updateSport(), and deleteSport() methods
- `src/pages/Tab3.tsx` - Added "Manage Sports" button for admins
- `src/App.tsx` - Added route for /tabs/sports-management

### Admin Schedules Grid - Mobile Optimization
**Status:** ✅ Complete

**Implementation:**
- Responsive AG Grid configuration for mobile devices
- Optimized column layout and sizing
- Action buttons repositioned and styled for mobile
- Improved touch targets and spacing

**Mobile Optimizations:**
1. **Column Management:**
   - Actions column moved to first position on mobile
   - Actions column pinned left for easy access
   - Hidden "End Time" and "Spots Left" columns on screens < 768px
   - Minimum widths set for all columns (80-130px)
   - Horizontal scrolling enabled for full data access

2. **Responsive Sizing:**
   - Desktop: 14px font, standard row/header heights
   - Mobile (< 768px): 12px font, 60px rows, 45px headers
   - Small screens (< 480px): 11px font, 55px rows, 42px headers

3. **Action Icons:**
   - Fixed icon distortion with explicit sizing (20px desktop, 18px mobile)
   - Properly centered vertically in cells
   - Touch-friendly button sizing (36px desktop, 32px mobile)
   - Consistent spacing and alignment

4. **Layout Improvements:**
   - Minimal padding on mobile for maximum content area
   - Full-width grid container with horizontal scroll
   - Text selection enabled
   - Optimized grid height calculations

**Files Modified:**
- `src/pages/AdminSchedules.tsx` - Updated column definitions, added mobile-specific settings
- `src/pages/AdminSchedules.css` - Added comprehensive mobile media queries and responsive styles

**Result:**
- Clean, readable grid on all screen sizes
- Touch-friendly interface with proper spacing
- Essential information prioritized on small screens
- Smooth scrolling and interaction

### Venue Management System
**Status:** ✅ Complete

**Implementation:**
- Added comprehensive venue management APIs integration
- Venue autocomplete with suggestions in schedule creation modal
- Dedicated Venue Management page for admins with full CRUD operations
- Statistics dashboard for each venue

**Features:**
1. **Venue Autocomplete in Schedule Creation:**
   - Real-time suggestions as admin types venue name
   - Filters existing venues from API suggestions
   - Shows top 5 matching venues in dropdown
   - Click to select venue from list

2. **Venue Management Page (Admin Only):**
   - View all venues with detailed statistics
   - Rename venues (updates all associated schedules)
   - Merge multiple venues into one
   - Delete venues (removes all schedules and bookings)
   - Statistics display: total/future/past schedules, bookings, popular sport
   - Pull-to-refresh functionality

**API Endpoints:**
- `GET /api/Venues/suggestions` - Get list of venue names for autocomplete
- `GET /api/Venues/statistics` - Get detailed statistics for all venues
- `PUT /api/Venues/rename` - Rename venue and update all schedules
- `POST /api/Venues/merge` - Merge multiple venues into target venue
- `DELETE /api/Venues/{venueName}` - Delete venue and associated data
- `POST /api/Venues/validate` - Validate venue name (not yet used in UI)

**Files Created:**
- `src/pages/VenueManagement.tsx` - Full venue management interface

**Files Modified:**
- `src/types/api.ts` - Added VenueStatisticsDto, RenameVenueDto, VenueRenameResultDto, MergeVenuesDto, VenueMergeResultDto, VenueDeleteResultDto, ValidateVenueDto, VenueValidationDto
- `src/services/api.ts` - Added getVenueSuggestions(), getVenueStatistics(), renameVenue(), mergeVenues(), deleteVenue(), validateVenue()
- `src/pages/AdminSchedules.tsx` - Added venue autocomplete with suggestions dropdown
- `src/pages/Tab3.tsx` - Added "Manage Venues" button for admins
- `src/App.tsx` - Added route for /tabs/venue-management

**Venue Statistics Include:**
- Total schedules, future schedules, past schedules
- Total bookings
- Most popular sport at venue
- First and last schedule dates
- Average bookings per schedule

### Schedule Deletion Event Propagation
**Status:** ✅ Complete

**Implementation:**
- Added custom window events: `scheduleDeleted` and `allSchedulesDeleted`
- HomeFeed.tsx listens for these events and automatically refreshes schedule list
- Ensures data consistency across components when schedules are deleted

**Files Modified:**
- `src/pages/HomeFeed.tsx` - Added event listeners in useEffect
- `src/pages/AdminSchedules.tsx` - Dispatches events after deletions

### Venue Filtering for Non-Admin Users
**Status:** ✅ Complete

**Implementation:**
- Added venue dropdown in HomeFeed for non-admin users only
- Dropdown shows venue name with available schedule counts
- API endpoint `GET /api/Schedules/venues` with timezoneOffsetMinutes
- Filter schedules by selected venue
- Disabled state when no venues available

**Files Modified:**
- `src/pages/HomeFeed.tsx` - Added venue state, dropdown, filtering logic
- `src/services/api.ts` - Added `getVenues()` method and `VenueDto` type

**VenueDto Type:**
```typescript
interface VenueDto {
  name: string;
  scheduleCount: number;
  availableSchedules: number;
  sports: string[];
  nextScheduleTime: string | null;
}
```

### Schedule Filtering (Available & Exclude Joined)
**Status:** ✅ Complete

**Implementation:**
- Added `availableOnly=true` parameter to show only schedules with open spots
- Added `excludeJoined=true` parameter to hide schedules user already joined
- Prevents users from attempting to join full or already-joined schedules

**Files Modified:**
- `src/pages/HomeFeed.tsx` - Updated getSchedules API call with new parameters
- Backend API supports these query parameters

### Join Schedule Confirmation Dialog
**Status:** ✅ Complete

**Implementation:**
- IonAlert confirmation dialog before joining schedules
- Shows sport name, venue, date/time details in confirmation message
- User must explicitly confirm before booking is created

**Files Modified:**
- `src/pages/HomeFeed.tsx` - Added confirmation state and IonAlert component

### Admin User Creation Feature
**Status:** ✅ Complete

**Implementation:**
- "Add User" button in Profile page (Tab3.tsx), visible only for admins
- Modal form with fields: name, email, phone, password, confirmPassword
- Toggle switch to create admin or regular users
- Form validation: required fields, password match, minimum 6 character length
- Uses existing `apiService.register()` with isAdmin support

**Files Modified:**
- `src/pages/Tab3.tsx` - Added Add User button and modal
- `src/services/api.ts` - Updated `RegisterRequest` interface to include `isAdmin?: boolean`

### My Bookings Page
**Status:** ✅ Complete

**Implementation:**
- Complete booking management interface for regular users
- Toggle to show/hide past bookings
- Booking cards display: sport icon, name, venue, start/end times, player counts
- Cancel button visible only when `canCancel=true`
- Confirmation alert before canceling bookings
- Pull-to-refresh functionality
- Loading states and empty states for better UX

**Files Modified:**
- `src/pages/Bookings.tsx` - Complete implementation
- `src/services/api.ts` - Added `BookingResponseDto` type, updated `getMyBookings()` and added `cancelBooking()`

**BookingResponseDto Type:**
```typescript
interface BookingResponseDto {
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
  equipmentDetails: string;
  isPast: boolean;
  canCancel: boolean;
}
```

**API Methods:**
- `getMyBookings(timezoneOffsetMinutes?, includeAll?)` - Get user's bookings
- `cancelBooking(id)` - Cancel a specific booking

### Admin Schedules - Participants Viewing
**Status:** ✅ Complete

**Implementation:**
- Added "View Participants" button (people icon, green color) in Actions column of AG Grid
- Opens modal displaying schedule details and participant list
- Participant list shows names and formatted booking times (e.g., "Jan 15, 3:30 PM")
- Empty state when no participants have joined
- Increased Actions column flex from 1 to 1.5 to accommodate third button

**Files Modified:**
- `src/pages/AdminSchedules.tsx` - Added participants modal, view button, state management
- `src/services/api.ts` - Updated `getScheduleById()` to accept `includeParticipants` parameter

**ParticipantDto Type:**
```typescript
interface ParticipantDto {
  name: string;
  bookingTime: string;
}
```

**API Method Updated:**
- `getScheduleById(id, timezoneOffsetMinutes?, includeParticipants?)` - Default `includeParticipants=true`

### Bulk Schedule Deletion
**Status:** ✅ Complete

**Implementation:**
- "Delete All" button in AdminSchedules header (trash bin icon)
- Confirmation alert before deleting all admin's schedules
- Dispatches `allSchedulesDeleted` event to notify other components

**Files Modified:**
- `src/pages/AdminSchedules.tsx` - Added delete all button and confirmation
- `src/services/api.ts` - Added `deleteMySchedules()` method

---

## Bug Fixes

### Tab3.tsx Corruption
**Issue:** File had JSX code incorrectly inserted in middle of function  
**Resolution:** Deleted and recreated file with proper structure  
**Date:** February 7, 2026

### Venue Dropdown Not Visible
**Issue:** Dropdown not showing for non-admin users  
**Resolution:** Removed overly restrictive `venues.length > 0` condition; dropdown now shows for all non-admin users and is disabled when empty  
**Date:** February 7, 2026

### Users Joining Full/Already Joined Schedules
**Issue:** Users could attempt to join schedules they already joined or that were full  
**Resolution:** Added `availableOnly=true` and `excludeJoined=true` API filters  
**Date:** February 7, 2026

---

## Key Architecture Decisions

### Custom Event System
Using browser's native CustomEvent API for component communication:
- `scheduleDeleted` - Single schedule deletion
- `allSchedulesDeleted` - Bulk schedule deletion
- Ensures HomeFeed stays synchronized with AdminSchedules

### Timezone Handling
All API calls include `timezoneOffsetMinutes` parameter:
```typescript
const timezoneOffsetMinutes = -new Date().getTimezoneOffset();
```
Ensures correct local time display across all components.

### Confirmation Dialogs
All destructive actions require confirmation:
- Joining schedules (to prevent accidental bookings)
- Canceling bookings
- Deleting schedules (single and bulk)

### Admin vs Regular User Flow
- **Tab2 (Bookings tab):** Shows Bookings.tsx for regular users, AdminSchedules.tsx for admins
- **Tab3 (Profile tab):** Shows "Add User" button only for admins
- **HomeFeed:** Venue filtering only for non-admin users

---

## API Endpoints Summary

### Schedule Endpoints
- `GET /api/Schedules` - Query params: venue, timezoneOffsetMinutes, availableOnly, excludeJoined, includeParticipants
- `GET /api/Schedules/{id}` - Query params: timezoneOffsetMinutes, includeParticipants
- `POST /api/Schedules` - Create schedule(s) with recurrence support
- `PUT /api/Schedules/{id}` - Update schedule
- `DELETE /api/Schedules/{id}` - Delete single schedule
- `DELETE /api/Schedules/my-schedules` - Delete all user's schedules
- `GET /api/Schedules/venues` - Query params: timezoneOffsetMinutes

### Booking Endpoints
- `POST /api/Bookings/join` - Join schedule
- `GET /api/Bookings/my-bookings` - Query params: timezoneOffsetMinutes, includeAll
- `DELETE /api/Bookings/{id}` - Cancel booking

---

---

## Deployment Plan - Azure Static Web Apps

### Prerequisites
- GitHub account with repository for this project
- Azure account with Visual Studio subscription ($50 monthly credit)
- Code pushed to GitHub repository

### Step 1: Prepare the Application

**1.1 Update API Base URL for Production**
- File: `src/config/app.config.ts`
- Change `API_BASE_URL` from `https://localhost:7063/api` to your production API URL
- Consider using environment variables:
  ```typescript
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://your-backend.azurewebsites.net/api'
  ```

**1.2 Add Build Configuration**
- Ensure `vite.config.ts` has proper build settings
- Verify `package.json` has build script: `"build": "tsc && vite build"`

**1.3 Create `.gitignore` entries (if not present)**
```
node_modules/
dist/
.env
.env.local
```

**1.4 Commit and Push to GitHub**
```bash
git add .
git commit -m "Prepare for Azure deployment"
git push origin main
```

### Step 2: Create Azure Static Web App

**2.1 Via Azure Portal (Recommended for First Time)**
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "+ Create a resource"
3. Search for "Static Web App"
4. Click "Create"
5. Fill in details:
   - **Subscription:** Visual Studio Professional Subscription
   - **Resource Group:** Create new "PlayOHCanada-rg"
   - **Name:** playohcanada (must be globally unique)
   - **Region:** East US 2 (or closest to you)
   - **Deployment source:** GitHub
6. Click "Sign in with GitHub" and authorize Azure
7. Select:
   - **Organization:** Your GitHub username
   - **Repository:** PlayOHCanada (or your repo name)
   - **Branch:** main
8. Build Details:
   - **Build Presets:** Custom
   - **App location:** `/` (root)
   - **Api location:** (leave empty for now)
   - **Output location:** `dist`
9. Click "Review + Create"
10. Click "Create"

**2.2 What Happens Next**
- Azure creates a GitHub Actions workflow file in your repo (`.github/workflows/azure-static-web-apps-*.yml`)
- Automatic deployment starts
- You'll get a URL like: `https://playohcanada.azurestaticapps.net`

### Step 3: Configure Build Settings (if needed)

**3.1 Review Auto-Generated Workflow**
- File location: `.github/workflows/azure-static-web-apps-*.yml`
- Verify build command: `npm run build`
- Verify output location: `dist`

**3.2 Add Environment Variables (if needed)**
In Azure Portal → Your Static Web App → Configuration → Add:
- `VITE_API_URL` = `https://your-backend.azurewebsites.net/api`

### Step 4: Deploy .NET Backend to Azure

**4.1 Create Azure App Service for Backend**
1. In Azure Portal → "+ Create a resource"
2. Search for "App Service"
3. Configuration:
   - **Resource Group:** PlayOHCanada-rg (same as frontend)
   - **Name:** playohcanada-api (must be unique)
   - **Publish:** Code
   - **Runtime stack:** .NET 8 (or your version)
   - **Region:** Same as frontend
   - **Pricing plan:** Basic B1 (~$13/month, covered by credit)
4. Create

**4.2 Configure CORS**
In App Service → CORS → Add allowed origins:
- `https://playohcanada.azurestaticapps.net`
- `http://localhost:5173` (for local development)

**4.3 Deploy Backend**
Option A - Via Visual Studio:
1. Right-click .NET project → Publish
2. Target: Azure
3. Select your App Service
4. Publish

Option B - Via Azure CLI:
```bash
cd path/to/your/backend
az webapp up --name playohcanada-api --resource-group PlayOHCanada-rg
```

**4.4 Configure Connection String (if using database)**
- App Service → Configuration → Connection strings
- Add your database connection string

### Step 5: Update Frontend API URL

**5.1 Update config with production backend URL**
```typescript
// src/config/app.config.ts
API_BASE_URL: 'https://playohcanada-api.azurewebsites.net/api'
```

**5.2 Commit and push**
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```
- GitHub Actions will auto-deploy the updated frontend

### Step 6: Configure Custom Domain (Optional)

**6.1 In Azure Portal**
- Static Web App → Custom domains
- Add custom domain (e.g., playohcanada.com)
- Follow DNS configuration instructions

**6.2 Update CORS in Backend**
- Add custom domain to allowed origins

### Step 7: Testing

**7.1 Test Checklist**
- [ ] Frontend loads at Azure URL
- [ ] Can login/register
- [ ] Can view schedules
- [ ] Can create schedules (admin)
- [ ] Can join schedules (user)
- [ ] Can view bookings
- [ ] All API calls work
- [ ] No CORS errors in console

**7.2 Common Issues**
- **CORS errors:** Check backend CORS configuration
- **API 404:** Verify API base URL in config
- **Build fails:** Check Node version in workflow file
- **White screen:** Check browser console for errors

### Step 8: Monitoring & Maintenance

**8.1 Monitor Usage**
- Azure Portal → Static Web App → Metrics
- Check bandwidth usage (100 GB free/month)

**8.2 View Logs**
- Static Web App → Log Stream (frontend)
- App Service → Log Stream (backend)

**8.3 Cost Monitoring**
- Azure Portal → Cost Management
- Set up budget alerts
- Expected monthly cost: $18-20 (well within $50 credit)

### Step 9: Continuous Deployment

**9.1 Workflow**
- Push to `main` branch → Auto-deploy to production
- Create `dev` branch for testing
- Create pull requests for code review

**9.2 Staging Environments**
- Azure Static Web Apps creates preview URLs for PRs
- Test changes before merging to main

### Step 10: Advanced CI/CD with GitHub Actions

**10.1 Auto-Generated Workflow**
When you create Azure Static Web App, it automatically creates:
- File: `.github/workflows/azure-static-web-apps-<unique-id>.yml`
- Triggers on push to `main` and pull requests
- Handles build and deployment automatically

**10.2 Understanding the Workflow**

The auto-generated workflow includes:
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/" # App source code path
          api_location: "" # Api source code path - optional
          output_location: "dist" # Built app content directory
```

**10.3 Customize Workflow for Production**

Create: `.github/workflows/deploy-production.yml`
```yaml
name: Production Deployment

on:
  push:
    branches: [main]
  workflow_dispatch: # Allows manual trigger

env:
  NODE_VERSION: '18.x'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linter
      run: npm run lint
      continue-on-error: true
      
    - name: Run tests
      run: npm test
      continue-on-error: true
      
    - name: Build application
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: production-build
        path: dist/
        retention-days: 7
        
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build with production config
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        
    - name: Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/"
        output_location: "dist"
```

**10.4 Create Staging Environment Workflow**

Create: `.github/workflows/deploy-staging.yml`
```yaml
name: Staging Deployment

on:
  push:
    branches: [develop, dev]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18.x'

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build for staging
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.STAGING_API_URL }}
        
    - name: Deploy to Azure Static Web Apps (Staging)
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/"
        output_location: "dist"
```

**10.5 Setup GitHub Secrets**

In GitHub Repository → Settings → Secrets and variables → Actions → New repository secret:

Required Secrets:
- `AZURE_STATIC_WEB_APPS_API_TOKEN` (auto-created by Azure)
- `VITE_API_URL` (production API URL)
- `STAGING_API_URL` (staging API URL - optional)

**10.6 Add Backend Deployment Workflow (Optional)**

Create: `.github/workflows/deploy-backend.yml`
```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [main]
    paths:
      - 'backend/**' # Only trigger if backend code changes
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '8.0.x'
        
    - name: Restore dependencies
      run: dotnet restore
      working-directory: ./backend
      
    - name: Build
      run: dotnet build --configuration Release --no-restore
      working-directory: ./backend
      
    - name: Publish
      run: dotnet publish --configuration Release --output ./publish
      working-directory: ./backend
      
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: playohcanada-api
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./backend/publish
```

**10.7 Branch Protection Rules**

In GitHub → Settings → Branches → Add branch protection rule for `main`:

Enable:
- [x] Require a pull request before merging
- [x] Require status checks to pass before merging
  - Select: `build-and-test`
- [x] Require conversation resolution before merging
- [x] Include administrators

**10.8 Setup Automated Testing**

Create: `.github/workflows/test.yml`
```yaml
name: Run Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run unit tests
      run: npm test -- --coverage
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/coverage-final.json
        fail_ci_if_error: false
```

**10.9 Add Code Quality Checks**

Create: `.github/workflows/code-quality.yml`
```yaml
name: Code Quality

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run ESLint
      run: npm run lint
      
    - name: Check formatting
      run: npx prettier --check "src/**/*.{ts,tsx}"
      
  type-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Type check
      run: npx tsc --noEmit
```

**10.10 Environment-Specific Deployments**

Setup multiple environments in Azure:
1. **Production:** `main` branch → `playohcanada.azurestaticapps.net`
2. **Staging:** `develop` branch → `staging.playohcanada.azurestaticapps.net`
3. **Preview:** Pull Requests → Auto-generated URLs

**10.11 Deployment Notifications**

Add to workflows for Slack/Discord notifications:
```yaml
- name: Notify deployment success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: custom
    custom_payload: |
      {
        text: "✅ Deployment to production successful!",
        attachments: [{
          color: 'good',
          text: `Build: ${process.env.GITHUB_SHA.substring(0, 7)}`
        }]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

**10.12 Rollback Strategy**

To rollback a deployment:
```bash
# Via GitHub
# Go to Actions → Select workflow run → Re-run previous successful deployment

# Via Azure CLI
az staticwebapp environment list --name playohcanada
az staticwebapp environment show --name playohcanada --environment-name default
```

**10.13 CI/CD Best Practices**

1. **Version Tagging**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. **Semantic Versioning**
   - Major: Breaking changes (v2.0.0)
   - Minor: New features (v1.1.0)
   - Patch: Bug fixes (v1.0.1)

3. **Release Notes**
   - Auto-generate with GitHub Releases
   - Include changelog for each deployment

4. **Monitoring**
   - Setup Azure Application Insights
   - Track deployment success rate
   - Monitor error rates post-deployment

**10.14 Complete CI/CD Pipeline Flow**

```
Developer Push → GitHub
                    ↓
            GitHub Actions Triggered
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
   Lint & Test              Build App
        ↓                       ↓
   Code Quality            Create Artifacts
        ↓                       ↓
        └───────────┬───────────┘
                    ↓
          Deploy to Staging (PR)
                    ↓
              Manual Review
                    ↓
           Merge to Main Branch
                    ↓
        Deploy to Production (Azure)
                    ↓
          Run Smoke Tests
                    ↓
        Send Notifications
                    ↓
          Monitor Metrics
```

**10.15 Useful GitHub Actions Commands**

```bash
# View workflow runs
gh run list

# View specific run details
gh run view <run-id>

# Re-run failed jobs
gh run rerun <run-id>

# Cancel a running workflow
gh run cancel <run-id>

# Manually trigger a workflow
gh workflow run deploy-production.yml
```

### Deployment Architecture

```
User Browser
    ↓
Azure Static Web Apps (Frontend - FREE)
  - React App (dist/)
  - CDN Distribution
  - SSL Certificate
    ↓
Azure App Service (Backend - ~$13/month)
  - .NET API
  - Port 443 (HTTPS)
    ↓
Azure SQL Database (Optional - ~$5/month)
  - User data
  - Schedules
  - Bookings
```

### Estimated Costs with $50 Credit

| Service | Cost/Month | Covered by Credit |
|---------|-----------|-------------------|
| Static Web App | FREE | ✅ |
| App Service (Basic B1) | $13 | ✅ |
| Azure SQL Database (Basic) | $5 | ✅ |
| Bandwidth | Included | ✅ |
| **Total** | **~$18** | **$32 credit remaining** |

### Useful Commands

```bash
# Check Azure CLI version
az --version

# Login to Azure
az login

# List resource groups
az group list --output table

# View Static Web App details
az staticwebapp show --name playohcanada --resource-group PlayOHCanada-rg

# View App Service details
az webapp show --name playohcanada-api --resource-group PlayOHCanada-rg

# Stream logs
az webapp log tail --name playohcanada-api --resource-group PlayOHCanada-rg
```

### References
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Deploy .NET to Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-dotnetcore)
- [GitHub Actions for Azure](https://learn.microsoft.com/en-us/azure/developer/github/github-actions)

---

## Conclusion

The PlayOhCanada application has a solid foundation with authentication, admin schedule management, and user profiles fully implemented. The core architecture supports future features with proper separation of concerns, type safety, and API integration.

**Current State:** 85% Complete
**Next Milestone:** Production deployment to Azure

**Last Updated:** February 7, 2026
