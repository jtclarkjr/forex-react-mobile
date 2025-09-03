// Import utilities and services
import {
  validatePairFormat,
  createErrorResponse,
  createSuccessResponse
} from '@/lib/utils/forex-utils'
import {
  fetchFromForexService,
  isForexServiceError
} from '@/lib/services/forex-service'
import { createStreamingResponse } from '@/lib/services/streaming-service'

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const pair = url.searchParams.get('pair') || 'USD/JPY' // Default to USD/JPY if not provided
  const isStream = url.searchParams.get('stream') === 'true'

  if (!validatePairFormat(pair)) {
    return createErrorResponse(
      `Invalid currency pair format: ${pair}. Use format like USD/JPY`
    )
  }

  try {
    if (isStream) {
      return createStreamingResponse(pair)
    } else {
      const rate = await fetchFromForexService(pair)
      return createSuccessResponse(rate)
    }
  } catch (error) {
    console.error('API Error:', error)

    // Handle ForexServiceError with appropriate HTTP status codes
    if (isForexServiceError(error)) {
      switch (error.type) {
        case 'quota_exceeded':
          return createErrorResponse(error.message, 429)
        case 'service_unavailable':
          return createErrorResponse(error.message, 503)
        case 'connection_failed':
          return createErrorResponse(error.message, 502)
        case 'invalid_response':
          return createErrorResponse(error.message, 502)
        default:
          return createErrorResponse(error.message, 500)
      }
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    )
  }
}

