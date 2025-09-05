// Forex service configuration
export const FOREX_SERVICE_CONFIG = {
  // Default to localhost, can be overridden by environment variables
  BASE_URL: process.env.EXPO_PUBLIC_FOREX_SERVICE_URL,
  API_TOKEN: process.env.EXPO_PUBLIC_FOREX_SERVICE_TOKEN
}
