import type { WatchlistItem, SupportedPair } from './forex'

/** Options for creating a watchlist item */
export interface CreateItemOptions {
  isActive?: boolean
}

/** Validation result for currency pairs */
export interface PairValidationResult {
  valid: SupportedPair[]
  invalid: SupportedPair[]
  existing: SupportedPair[]
}

/** Interface for the main watchlist store */
export interface WatchlistStore {
  // Core state
  items: WatchlistItem[]
  loading: boolean
  refreshing: boolean
  availablePairs: SupportedPair[]

  // Item management actions
  addPair: (pairString: SupportedPair) => Promise<void>
  addMultiplePairs: (pairStrings: SupportedPair[]) => Promise<void>
  removePair: (id: string) => void
  reorderPairs: (newItems: WatchlistItem[]) => void
  togglePairActive: (id: string) => void

  // Data access methods
  getAvailableToAdd: () => SupportedPair[]
  refreshWatchlist: () => Promise<void>

  // Internal methods
  _initializeWithDefaults: () => void
}
