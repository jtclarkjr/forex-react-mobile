export type SupportedCurrency =
  | 'USD'
  | 'JPY'
  | 'EUR'
  | 'GBP'
  | 'AUD'
  | 'CAD'
  | 'CHF'
  | 'CNY'


export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

// Main forex rate interface (using service format directly)
export interface ForexRate {
  from: string
  to: string
  bid: number
  ask: number
  price: number
  time_stamp: string
}

// Type alias for external service response (same as ForexRate)
export type ForexServiceResponse = ForexRate

export interface ForexStreamData {
  rates: ForexRate[]
  lastUpdated: string
}

export interface CurrencyPair {
  base: SupportedCurrency
  quote: SupportedCurrency
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface UseForexStreamState {
  data: ForexRate | null
  loading: boolean
  error: string | null
  connectionStatus: ConnectionStatus
}

export interface WatchlistItem {
  id: string
  pair?: CurrencyPair // Made optional to handle migration from old format
  pairString: string
  isActive: boolean
}

export interface WatchlistState {
  items: WatchlistItem[]
  availablePairs: string[]
}
