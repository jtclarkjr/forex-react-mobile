import type { ForexRate, ForexServiceResponse } from '@/types/forex'
import { FOREX_SERVICE_CONFIG } from '@/constants/Config'
import { formatForexResponse, formatPairForApi } from '../utils/forex-utils'

const FOREX_SERVICE_URL = FOREX_SERVICE_CONFIG.BASE_URL
const API_TOKEN = FOREX_SERVICE_CONFIG.API_TOKEN

// Fetches forex rates from external service
export const fetchFromForexService = async (pair: string): Promise<ForexRate> => {
  const pairFormatted = formatPairForApi(pair)
  
  const response = await fetch(
    `${FOREX_SERVICE_URL}/rates?pair=${pairFormatted}`,
    {
      headers: {
        'token': API_TOKEN || ''
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Forex service error: ${response.status}`)
  }

  const data: ForexServiceResponse[] = await response.json()
  
  if (!data || data.length === 0) {
    throw new Error('No data received from forex service')
  }

  return formatForexResponse(data[0])
}
