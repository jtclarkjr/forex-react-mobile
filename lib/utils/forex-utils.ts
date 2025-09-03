import type { ForexRate, ApiResponse, ForexServiceResponse } from '@/types/forex'

// Formats service response numbers to consistent precision
export const formatForexResponse = (serviceResponse: ForexServiceResponse): ForexRate => {
  return {
    ...serviceResponse,
    bid: parseFloat(serviceResponse.bid.toFixed(5)),
    ask: parseFloat(serviceResponse.ask.toFixed(5)),
    price: parseFloat(serviceResponse.price.toFixed(5))
  }
}

// Converts USD/JPY to USDJPY for API requests
export const formatPairForApi = (pair: string): string => {
  return pair.replace('/', '')
}

// Validates currency pair has correct format (e.g., USD/JPY)
export const validatePairFormat = (pair: string): boolean => {
  return pair.includes('/')
}

// Creates standardized error response
export const createErrorResponse = (error: string, status = 400): Response => {
  const response: ApiResponse<null> = {
    success: false,
    error
  }
  return Response.json(response, { status })
}

// Creates standardized success response
export const createSuccessResponse = <T>(data: T): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data
  }
  return Response.json(response)
}
