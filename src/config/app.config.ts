// Application Configuration
export const APP_CONFIG = {
  // App Identity
  APP_NAME: 'PlayOH Canada',
  APP_SHORT_NAME: 'PlayOH',
  
  // API Configuration
  API_BASE_URL: 'https://localhost:7063/api',
  
  // Validation Rules
  VALIDATION: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 100,
    PHONE_MAX_LENGTH: 20,
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    REMEMBERED_EMAIL: 'remembered_email',
  },
};

export default APP_CONFIG;
