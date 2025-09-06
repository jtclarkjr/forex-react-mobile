import type { ForexRate, SupportedPair, ApiResponse } from '@/lib/types/forex'

/**
 * Creates the API URL for fetching forex data for a specific pair
 */
export const createForexApiUrl = (
  pairString: SupportedPair,
  endpoint = '/api/forex'
): string => {
  return `${endpoint}?pair=${encodeURIComponent(pairString)}`
}

/**
 * Handles API response and determines if it's successful
 */
export const parseForexApiResponse = (
  result: unknown
): ApiResponse<ForexRate> => {
  // Type guard for API response structure
  if (typeof result === 'object' && result !== null) {
    const apiResult = result as ApiResponse<ForexRate>
    if (apiResult.success && apiResult.data) {
      return { success: true, data: apiResult.data }
    }
    return { success: false, error: apiResult.error || 'Failed to fetch data' }
  }
  return { success: false, error: 'Invalid API response format' }
}

/**
 * Processes different types of fetch errors into user-friendly messages
 */
export const processForexError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return 'Request timeout'
    }
    if (error.message.includes('fetch')) {
      return 'Network error'
    }
    return error.message
  }
  return 'Unknown error'
}

/**
 * Configuration constants for forex store
 */
export const FOREX_CONFIG = {
  /** Polling interval in milliseconds */
  POLLING_INTERVAL_MS: 2000,
  /** Default API endpoint */
  API_ENDPOINT: '/api/forex'
} as const
