import type { SupportedCurrency, SupportedPair } from '@/lib/types/forex'

export const API_ENDPOINT = '/api/forex'

// Currency names mapping
export const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  JPY: 'Japanese Yen',
  GBP: 'British Pound',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  NZD: 'New Zealand Dollar',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  PLN: 'Polish Zloty',
  CZK: 'Czech Koruna',
  HUF: 'Hungarian Forint',
  TRY: 'Turkish Lira',
  ZAR: 'South African Rand',
  MXN: 'Mexican Peso',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar'
}

// Currency symbols mapping
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  NZD: 'NZ$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  TRY: '₺',
  ZAR: 'R',
  MXN: '$',
  SGD: 'S$',
  HKD: 'HK$'
}

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
