import type { SupportedCurrency, ConnectionStatus } from '@/types/forex'
import type { AppThemeColors } from '@/styles/theme'
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

// Connection status configuration factory
export const createConnectionStatusConfig = (colors: AppThemeColors, options?: { shortText?: boolean }) => ({
  connected: { color: colors.statusConnected, text: options?.shortText ? 'Live' : 'Live Data' },
  connecting: { color: colors.statusConnecting, text: options?.shortText ? 'Connecting' : 'Connecting...' },
  disconnected: { color: colors.statusDisconnected, text: 'Disconnected' },
  default: { color: colors.statusDefault, text: options?.shortText ? '' : 'Unknown' }
} as const)

// Helper function to get connection status info
export const getConnectionStatusInfo = (status?: ConnectionStatus, colors?: AppThemeColors, options?: { shortText?: boolean }) => {
  const config = colors && createConnectionStatusConfig(colors, options)
  return config?.[status as keyof typeof config] || config?.default
}

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
