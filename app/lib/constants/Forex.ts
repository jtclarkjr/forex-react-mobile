import type { SupportedCurrency, SupportedPair } from '@/lib/types/forex'

export const API_ENDPOINT = '/api/forex'

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
] as const satisfies readonly SupportedPair[]

export const DEFAULT_CURRENCY_PAIR = {
  base: 'USD' as SupportedCurrency,
  quote: 'JPY' as SupportedCurrency
}

export const FOREX_UPDATE_INTERVAL = 5000 // 5 seconds, TradingView as reference

// Default watchlist pairs (using forex service supported pairs)
export const DEFAULT_WATCHLIST_PAIRS: SupportedPair[] = [
  'USD/JPY',
  'EUR/USD',
  'GBP/USD',
  'AUD/USD',
  'USD/CAD'
]

// All available pairs (using forex service supported pairs)
export const AVAILABLE_PAIRS = [...SUPPORTED_PAIRS]
