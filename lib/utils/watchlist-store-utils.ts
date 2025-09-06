import uuid from 'react-native-uuid'
import type {
  WatchlistItem,
  CurrencyPair,
  SupportedPair
} from '@/lib/types/forex'
import type {
  CreateItemOptions,
  PairValidationResult
} from '@/lib/types/watchlistStore'
import { SUPPORTED_PAIRS, AVAILABLE_PAIRS } from '@/constants/Forex'

/** Configuration constants for watchlist store */
export const WATCHLIST_CONFIG = {
  /** Storage key for persisting watchlist data */
  STORAGE_KEY: process.env.EXPO_PUBLIC_STORAGE_KEY || 'forex_watchlist_v2',
  /** Default active state for new watchlist items */
  DEFAULT_ITEM_ACTIVE_STATE: true,
  /** Refresh delay for UX feedback */
  REFRESH_DELAY_MS: 300
} as const

/** Base class for watchlist-specific errors */
class WatchlistError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'WatchlistError'
  }
}

/** Error thrown when trying to add invalid currency pairs */
export class InvalidPairError extends WatchlistError {
  constructor(pairs: SupportedPair[]) {
    super(`Invalid currency pairs: ${pairs.join(', ')}`, 'INVALID_PAIRS')
    this.name = 'InvalidPairError'
  }
}

/** Error thrown when trying to add pairs that already exist */
export class DuplicatePairError extends WatchlistError {
  constructor(pair: SupportedPair) {
    super(`Pair already exists in watchlist: ${pair}`, 'DUPLICATE_PAIR')
    this.name = 'DuplicatePairError'
  }
}

/** Error thrown when no pairs are provided for bulk operations */
export class EmptyPairsError extends WatchlistError {
  constructor() {
    super('No currency pairs provided', 'EMPTY_PAIRS')
    this.name = 'EmptyPairsError'
  }
}

/**
 * Creates a new watchlist item from a currency pair string
 */
export const createWatchlistItem = (
  pairString: SupportedPair,
  options: CreateItemOptions = {}
): WatchlistItem => {
  const [base, quote] = pairString.split('/')

  if (!base || !quote) {
    throw new Error(`Invalid pair format: ${pairString}`)
  }

  return {
    id: uuid.v4() as string,
    pair: {
      base: base as CurrencyPair['base'],
      quote: quote as CurrencyPair['quote']
    },
    pairString,
    isActive: options.isActive || WATCHLIST_CONFIG.DEFAULT_ITEM_ACTIVE_STATE
  }
}

/**
 * Validates an array of currency pairs and categorizes them
 */
export const validateCurrencyPairs = (
  pairStrings: SupportedPair[],
  existingPairs: SupportedPair[]
): PairValidationResult => {
  const invalid: SupportedPair[] = []
  const existing: SupportedPair[] = []
  const valid: SupportedPair[] = []

  for (const pair of pairStrings) {
    if (!SUPPORTED_PAIRS.includes(pair)) {
      invalid.push(pair)
    } else if (existingPairs.includes(pair)) {
      existing.push(pair)
    } else {
      valid.push(pair)
    }
  }

  return { valid, invalid, existing }
}

/**
 * Calculates available pairs that can be added to the watchlist
 */
export const calculateAvailablePairs = (
  items: WatchlistItem[]
): SupportedPair[] => {
  const existingPairs = items.map((item) => item.pairString as SupportedPair)
  return AVAILABLE_PAIRS.filter((pair) => !existingPairs.includes(pair))
}

/**
 * Updates the available pairs state after items change
 */
export const updateAvailablePairs = (state: {
  items: WatchlistItem[]
  availablePairs: SupportedPair[]
}): void => {
  state.availablePairs = calculateAvailablePairs(state.items)
}
