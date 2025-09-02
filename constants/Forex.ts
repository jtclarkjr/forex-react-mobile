import type { SupportedCurrency } from '@/types/forex'
import { SUPPORTED_PAIRS } from '@/constants/Config'

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  'USD',
  'JPY',
  'EUR',
  'GBP',
  'AUD',
  'CAD',
  'CHF',
  'CNY'
]

export const DEFAULT_CURRENCY_PAIR = {
  base: 'USD' as SupportedCurrency,
  quote: 'JPY' as SupportedCurrency
}

export const FOREX_UPDATE_INTERVAL = 2000 // 2 seconds

// Default watchlist pairs (using forex service supported pairs)
export const DEFAULT_WATCHLIST_PAIRS = [
  'USD/JPY',
  'EUR/USD',
  'GBP/USD',
  'AUD/USD',
  'USD/CAD'
]

// All available pairs (using forex service supported pairs)
export const AVAILABLE_PAIRS = [...SUPPORTED_PAIRS]
