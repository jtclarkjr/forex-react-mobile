import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { WatchlistItem, SupportedPair } from '@/lib/types/forex'
import type { WatchlistStore } from '@/lib/types/watchlistStore'
import {
  DEFAULT_WATCHLIST_PAIRS,
  AVAILABLE_PAIRS,
  SUPPORTED_PAIRS
} from '@/lib/constants/forex'
import {
  WATCHLIST_CONFIG,
  InvalidPairError,
  DuplicatePairError,
  EmptyPairsError,
  createWatchlistItem,
  validateCurrencyPairs,
  updateAvailablePairs,
  calculateAvailablePairs
} from '@/lib/utils/watchlist-store-utils'

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    immer((set, get) => ({
      items: [],
      loading: false,
      refreshing: false,
      availablePairs: AVAILABLE_PAIRS,

      /**
       * Adds a single currency pair to the watchlist
       * @param pairString - The currency pair to add (e.g., "USD/JPY")
       * @throws {InvalidPairError} When the pair is not supported
       * @throws {DuplicatePairError} When the pair already exists in the watchlist
       */
      addPair: async (pairString: SupportedPair): Promise<void> => {
        const { items } = get()

        // Validate the currency pair
        if (!SUPPORTED_PAIRS.includes(pairString)) {
          throw new InvalidPairError([pairString])
        }

        // Check for duplicates
        const exists = items.some((item) => item.pairString === pairString)
        if (exists) {
          throw new DuplicatePairError(pairString)
        }

        // Create and add the new item
        const newItem = createWatchlistItem(pairString)
        set((state) => {
          state.items.push(newItem)
          updateAvailablePairs(state)
        })
      },

      /**
       * Adds multiple currency pairs to the watchlist in a single operation
       * @param pairStrings - Array of currency pairs to add
       * @throws {EmptyPairsError} When no pairs are provided
       * @throws {InvalidPairError} When any pairs are not supported
       */
      addMultiplePairs: async (pairStrings: SupportedPair[]): Promise<void> => {
        if (pairStrings.length === 0) {
          throw new EmptyPairsError()
        }

        const { items } = get()
        const existingPairs = items.map(
          (item) => item.pairString as SupportedPair
        )

        // Validate all pairs and categorize them
        const validation = validateCurrencyPairs(pairStrings, existingPairs)

        // Throw error if any pairs are invalid
        if (validation.invalid.length > 0) {
          throw new InvalidPairError(validation.invalid)
        }

        // If no new pairs to add, return silently
        if (validation.valid.length === 0) {
          return
        }

        // Create new items for all valid pairs
        const newItems = validation.valid.map((pairString: SupportedPair) =>
          createWatchlistItem(pairString)
        )

        set((state) => {
          state.items.push(...newItems)
          updateAvailablePairs(state)
        })
      },

      /**
       * Removes a currency pair from the watchlist
       * @param id - The unique identifier of the item to remove
       */
      removePair: (id: string): void => {
        set((state) => {
          const initialLength = state.items.length
          state.items = state.items.filter((item) => item.id !== id)

          // Only update available pairs if something was actually removed
          if (state.items.length < initialLength) {
            updateAvailablePairs(state)
          }
        })
      },

      /**
       * Reorders the watchlist items (typically used for drag-and-drop)
       * @param newItems - The new order of watchlist items
       */
      reorderPairs: (newItems: WatchlistItem[]): void => {
        set((state) => {
          // Validate that we're not losing or gaining items during reorder
          if (newItems.length === state.items.length) {
            state.items = newItems
          } else {
            console.warn('Reorder operation rejected: item count mismatch')
          }
        })
      },

      /**
       * Toggles the active state of a watchlist item
       * @param id - The unique identifier of the item to toggle
       */
      togglePairActive: (id: string): void => {
        set((state) => {
          const item = state.items.find((item) => item.id === id)
          if (item) {
            item.isActive = !item.isActive
          }
        })
      },

      // =========================================================================
      // DATA ACCESS METHODS
      // =========================================================================

      /**
       * Gets all currency pairs that can be added to the watchlist
       * @returns Array of available currency pairs
       */
      getAvailableToAdd: (): SupportedPair[] => {
        const { items } = get()
        return calculateAvailablePairs(items)
      },

      /**
       * Refreshes the watchlist data (mainly for UI feedback)
       * @returns Promise that resolves when refresh is complete
       */
      refreshWatchlist: async (): Promise<void> => {
        set((state) => {
          state.refreshing = true
        })

        try {
          // With Zustand persist middleware, data is automatically synced
          // This method primarily provides UI feedback for pull-to-refresh
          await new Promise((resolve) =>
            setTimeout(resolve, WATCHLIST_CONFIG.REFRESH_DELAY_MS)
          )
        } finally {
          set((state) => {
            state.refreshing = false
          })
        }
      },

      /**
       * Initializes the store with default pairs if empty
       * This is called automatically when the store is rehydrated from storage
       * @private
       */
      _initializeWithDefaults: (): void => {
        set((state) => {
          // Only initialize if the watchlist is completely empty
          if (state.items.length === 0) {
            try {
              state.items = DEFAULT_WATCHLIST_PAIRS.map((pairString) =>
                createWatchlistItem(pairString)
              )
            } catch (error) {
              console.error(
                'Failed to initialize default watchlist items:',
                error
              )
              state.items = [] // Ensure we have a valid state even if defaults fail
            }
          }

          // Always update available pairs and clear loading state
          updateAvailablePairs(state)
          state.loading = false
        })
      }
    })),
    {
      name: WATCHLIST_CONFIG.STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._initializeWithDefaults()
        }
      }
    }
  )
)
