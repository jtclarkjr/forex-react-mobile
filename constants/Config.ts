// Forex service configuration
export const FOREX_SERVICE_CONFIG = {
  // Default to localhost, can be overridden by environment variables
  BASE_URL: process.env.FOREX_SERVICE_URL,
  API_TOKEN: process.env.FOREX_SERVICE_TOKEN
}

// Supported currency pairs that we know the forex service supports
export const SUPPORTED_PAIRS = [
  'USD/JPY',
  'EUR/USD',
  'GBP/USD',
  'AUD/USD',
  'USD/CAD',
  'USD/CHF',
  'USD/CNY',
  'EUR/JPY',
  'GBP/JPY'
] as const

export type SupportedPair = (typeof SUPPORTED_PAIRS)[number]
