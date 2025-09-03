// Import utilities and services
import { validatePairFormat, createErrorResponse, createSuccessResponse } from './utils/forex-utils'
import { fetchFromForexService } from './services/forex-service'
import { createStreamingResponse } from './services/streaming-service'

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const pair = url.searchParams.get('pair') || 'USD/JPY' // Default to USD/JPY if not provided
  const isStream = url.searchParams.get('stream') === 'true'

  if (!validatePairFormat(pair)) {
    return createErrorResponse(`Invalid currency pair format: ${pair}. Use format like USD/JPY`)
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
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    )
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { pair } = body

    if (!pair || !validatePairFormat(pair)) {
      return createErrorResponse('Invalid currency pair format. Use format like USD/JPY')
    }

    const rate = await fetchFromForexService(pair)
    return createSuccessResponse(rate)
  } catch (err) {
    console.error('Error in POST request:', err)
    return createErrorResponse(
      err instanceof Error ? err.message : 'Unknown error',
      500
    )
  }
}
