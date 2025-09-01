export type SupportedCurrency =
  | 'USD'
  | 'JPY'
  | 'EUR'
  | 'GBP'
  | 'AUD'
  | 'CAD'
  | 'CHF'
  | 'CNY'

export interface ForexRate {
  from: string
  to: string
  bid: number
  ask: number
  price: number
  timestamp: number
}

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
  connectionStatus: 'connected' | 'connecting' | 'disconnected'
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
