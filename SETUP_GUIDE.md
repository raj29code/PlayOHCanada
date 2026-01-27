# PlayOH Canada - Sports Booking App Setup Guide

## 🎯 Initial Phase Implementation

This setup includes:
- ✅ TypeScript API type definitions
- ✅ Axios-based service layer with JWT authentication
- ✅ Configurable app name and settings
- ✅ Login page with email/password validation
- ✅ Registration page with comprehensive validation
- ✅ Home Feed page with schedule listings
- ✅ Pull-to-refresh functionality
- ✅ Loading and error states
- ✅ Protected routes

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- .NET 8 Backend API running (default: https://localhost:7063)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Update the API URL (if different from default):
   - Edit `src/config/app.config.ts`
   - Change `API_BASE_URL` to match your backend URL
   - You can also customize `APP_NAME` here

### Running the App

```bash
npm start
```

The app will open at `http://localhost:3000`

## 📱 Features Implemented

### 0. Configuration System (`src/config/app.config.ts`)
- **Centralized app configuration**:
  - App name and branding
  - API base URL
  - Validation rules (min/max lengths)
  - Storage keys
- Easy to modify for different environments or rebranding

### 1. Authentication Flow
- **Login Page** (`/login`)
  - Email/password authentication
  - **Email validation**: Valid format required
  - **Password validation**: Minimum length enforcement
  - Real-time error messages on blur
  - JWT token storage in localStorage
  - Automatic redirect after successful login
  - Error handling with toast notifications

- **Registration Page** (`/register`)
  - Complete user registration form
  - **Name validation**: 2-100 characters required
  - **Email validation**: Valid email format required
  - **Phone validation**: Optional, max 20 characters, format check
  - **Password validation**: 6-100 characters required
  - **Confirm Password validation**: Must match password
  - Real-time validation feedback
  - Back button to return to login
  - Auto-login after successful registration

### 2. Home Feed (`/tabs/home`)
- **Schedule Cards** displaying:
  - Sport name and icon
  - Venue location
  - Date and time (formatted)
  - Available spots badge
  - Equipment details (if available)
  - Join button
- **Pull-to-refresh** to reload schedules
- **Loading states** with spinner
- **Empty states** when no schedules available
- **Responsive grid layout** for larger screens

### 3. API Service Layer (`src/services/api.ts`)
- Axios instance with automatic JWT token attachment
- Token expiration handling (auto-logout on 401)
- Comprehensive API methods:
  - `login(credentials)` - User authentication
  - `register(data)` - User registration
  - `getSchedules(params)` - Fetch schedules with filters
  - `getSports()` - Fetch all sports
  - `joinSchedule(data)` - Join a schedule
  - `getMyBookings()` - Fetch user's bookings
  - `cancelBooking(id)` - Cancel a booking

### 4. Type Safety (`src/types/api.ts`)
- Complete TypeScript interfaces matching the .NET API:
  - `Sport`, `ScheduleResponseDto`, `Booking`
  - `LoginRequest`, `RegisterRequest`, `AuthResponse`
  - `JoinScheduleDto`, `UserResponse`, `ApiError`

## 🔐 Authentication

The app uses JWT token-based authentication:
- Token stored in `localStorage` under key `auth_token`
- User data stored in `localStorage` under key `user_data`
- Automatic token attachment to all API requests
- Auto-logout on token expiration (401 response)

## 🎨 UI Components

Built with Ionic 8 components:
- `IonCard` - Schedule cards
- `IonRefresher` - Pull-to-refresh
- `IonSpinner` - Loading indicators
- `IonToast` - Notifications
- `IonBadge` - Status indicators
- `IonAvatar` - Sport icons

## 📂 Project Structure

```
src/
├── config/
│   └── app.config.ts       # Centralized app configuration
├── types/
│   └── api.ts              # TypeScript type definitions
├── services/
│   └── api.ts              # API service layer
├── pages/
│   ├── Login.tsx           # Login page
│   ├── Login.css           # Login styles
│   ├── Register.tsx        # Registration page
│   ├── Register.css        # Registration styles
│   ├── HomeFeed.tsx        # Home feed page
│   ├── HomeFeed.css        # Home feed styles
│   ├── Tab2.tsx            # My Bookings (placeholder)
│   └── Tab3.tsx            # Profile (placeholder)
└── App.tsx                 # Main app with routing
```

## 🔄 Routing

- `/login` - Public login page
- `/register` - Public registration page
- `/tabs/home` - Protected home feed
- `/tabs/bookings` - Protected bookings page (placeholder)
- `/tabs/profile` - Protected profile page (placeholder)
- `/` - Redirects to home if authenticated, login otherwise

## 🎯 Next Steps

To continue development:

1. **My Bookings Page** (Tab2.tsx)
   - Display user's bookings using `getMyBookings()`
   - Add cancel booking functionality
   - Show booking details

2. **Profile Page** (Tab3.tsx)
   - Display user information
   - Add logout button using `apiService.logout()`
   - Edit profile settings

3. **Schedule Details Page**
   - View full schedule details
   - See participant list
   - Additional schedule information

4. **Filters and Search**
   - Add sport filter dropdown
   - Venue search
   - Date range picker
   - Use `getSchedules(params)` with filters

5. **Password Recovery**
   - Forgot password flow
   - Email verification
   - Password reset

## 🐛 Troubleshooting

### HTTPS Certificate Issues
If you get SSL certificate errors when connecting to the .NET backend:
```typescript
// In api.ts, add to axios config:
httpsAgent: new https.Agent({  
  rejectUnauthorized: false
})
```

### CORS Issues
Ensure your .NET backend has CORS configured to allow your Ionic app's origin.

## 📝 API Endpoints Used

- `POST /api/Auth/login` - User login
- `POST /api/Auth/register` - User registration
- `GET /api/Auth/me` - Get current user
- `GET /api/Schedules` - List schedules
- `GET /api/Sports` - List sports
- `POST /api/Bookings/join` - Join a schedule
- `GET /api/Bookings/my-bookings` - Get user bookings
- `DELETE /api/Bookings/{id}` - Cancel booking

## 🎉 Testing the App

1. **Start your .NET backend** (should be running on https://localhost:7063)
2. **Run the Ionic app** (`npm start`)
3. **Register a new account** on `/register` or use existing credentials
4. **Login** with your credentials
5. **View schedules** on the home feed
6. **Join a schedule** by clicking the "Join Schedule" button
7. **Pull down** to refresh the schedule list

## ⚙️ Configuration

To customize the app, edit [src/config/app.config.ts](src/config/app.config.ts):

```typescript
export const APP_CONFIG = {
  APP_NAME: 'Your App Name',              // Change app branding
  API_BASE_URL: 'https://your-api.com',   // Change API endpoint
  VALIDATION: {
    NAME_MIN_LENGTH: 2,                    // Validation rules
    PASSWORD_MIN_LENGTH: 6,
    // ... more validation config
  }
};
```

---

**Built with** ❤️ using Ionic 8, React, and TypeScript
