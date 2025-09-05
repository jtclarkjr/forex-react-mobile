import type { ForexRate, ForexServiceResponse } from '@/lib/types/forex'
import { FOREX_SERVICE_CONFIG } from '@/constants/Config'
import { formatForexResponse, formatPairForApi } from '@/lib/utils/forex-utils'

const FOREX_SERVICE_URL = FOREX_SERVICE_CONFIG.BASE_URL
const API_TOKEN = FOREX_SERVICE_CONFIG.API_TOKEN

// Enhanced error types for better error handling
export type ForexServiceErrorType =
  | 'quota_exceeded'
  | 'connection_failed'
  | 'service_unavailable'
  | 'invalid_response'
  | 'unknown'

export interface ForexServiceError {
  message: string
  type: ForexServiceErrorType
  statusCode?: number
  retryAfter?: number
  isForexServiceError: true
}

// Helper function to create forex service errors
export const createForexServiceError = (
  message: string,
  type: ForexServiceErrorType,
  statusCode?: number,
  retryAfter?: number
): ForexServiceError => ({
  message,
  type,
  statusCode,
  retryAfter,
  isForexServiceError: true
})

// Type guard to check if error is ForexServiceError
export const isForexServiceError = (
  error: unknown
): error is ForexServiceError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isForexServiceError' in error
  )
}

// Fetches forex rates from external service with enhanced error handling
export const fetchFromForexService = async (
  pair: string
): Promise<ForexRate> => {
  const pairFormatted = formatPairForApi(pair)

  let timeoutId: ReturnType<typeof setTimeout> | null = null

  try {
    // Create AbortController for timeout
    const controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(
      `${FOREX_SERVICE_URL}/rates?pair=${pairFormatted}`,
      {
        headers: {
          token: API_TOKEN || ''
        },
        signal: controller.signal
      }
    )

    // Clear timeout if request completes successfully
    clearTimeout(timeoutId)
    timeoutId = null

    // Handle different HTTP status codes
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')

      switch (response.status) {
        case 429:
          // Rate limit/quota exceeded
          const retryAfter = response.headers.get('Retry-After')
          throw createForexServiceError(
            'API quota exceeded. Please try again later.',
            'quota_exceeded',
            response.status,
            retryAfter ? parseInt(retryAfter) : 60
          )
        case 500:
        case 502:
        case 503:
        case 504:
          throw createForexServiceError(
            'Forex service is temporarily unavailable. Please try again later.',
            'service_unavailable',
            response.status
          )
        default:
          throw createForexServiceError(
            `Forex service error: ${response.status} - ${errorText}`,
            'unknown',
            response.status
          )
      }
    }

    let data: ForexServiceResponse[]

    try {
      const responseText = await response.text()

      // Check if the response contains quota error messages
      if (
        responseText.includes('Quota reached') ||
        responseText.includes('QuotaReached')
      ) {
        throw createForexServiceError(
          'API quota exceeded. Please try again later.',
          'quota_exceeded',
          429,
          60
        )
      }

      data = JSON.parse(responseText)
    } catch (jsonError) {
      if (isForexServiceError(jsonError)) {
        throw jsonError
      }
      throw createForexServiceError(
        'Invalid JSON response from forex service',
        'invalid_response'
      )
    }

    if (!data || data.length === 0) {
      throw createForexServiceError(
        'No data received from forex service',
        'invalid_response'
      )
    }

    const firstItem = data[0]

    // Validate that the response has required properties
    if (
      !firstItem ||
      typeof firstItem.bid !== 'number' ||
      typeof firstItem.ask !== 'number' ||
      typeof firstItem.price !== 'number' ||
      !firstItem.from ||
      !firstItem.to ||
      !firstItem.time_stamp
    ) {
      throw createForexServiceError(
        'Invalid response format from forex service',
        'invalid_response'
      )
    }

    return formatForexResponse(firstItem)
  } catch (error) {
    // Handle network/connection errors
    if (isForexServiceError(error)) {
      throw error
    }

    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      throw createForexServiceError(
        'Unable to connect to forex service. Please check your internet connection.',
        'connection_failed'
      )
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw createForexServiceError(
        'Request timeout. Please try again.',
        'connection_failed'
      )
    }

    // Fallback for unexpected errors
    throw createForexServiceError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'unknown'
    )
  } finally {
    // Ensure timeout is always cleaned up
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}
