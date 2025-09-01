import type { SupportedCurrency } from '../types/forex'

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

// Base exchange rates for simulation
export const BASE_RATES: Record<string, number> = {
  'USD/JPY': 150.25,
  'EUR/USD': 1.0845,
  'GBP/USD': 1.2678,
  'AUD/USD': 0.6534,
  'USD/CAD': 1.3542,
  'USD/CHF': 0.8756,
  'USD/CNY': 7.2345,
  'EUR/JPY': 162.95,
  'GBP/JPY': 190.45
}

// Default watchlist pairs
export const DEFAULT_WATCHLIST_PAIRS = [
  'USD/JPY',
  'EUR/USD',
  'GBP/USD',
  'AUD/USD',
  'USD/CAD'
]

// All available pairs
export const AVAILABLE_PAIRS = Object.keys(BASE_RATES)
