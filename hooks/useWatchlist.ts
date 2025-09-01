import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type {
  WatchlistItem,
  WatchlistState,
  CurrencyPair
} from '../types/forex'
import { DEFAULT_WATCHLIST_PAIRS, AVAILABLE_PAIRS } from '../constants/Forex'

const STORAGE_KEY = 'forex_watchlist'

function createWatchlistItem(pairString: string): WatchlistItem {
  const [base, quote] = pairString.split('/')
  return {
    id: `${Date.now()}-${Math.random()}`,
    pair: {
      base: base as CurrencyPair['base'],
      quote: quote as CurrencyPair['quote']
    },
    pairString,
    isActive: true
  }
}

export default function useWatchlist() {
  const [watchlistState, setWatchlistState] = useState<WatchlistState>({
    items: [],
    availablePairs: AVAILABLE_PAIRS
  })
  const [loading, setLoading] = useState(true)

  // Load watchlist from storage on mount
  useEffect(() => {
    loadWatchlist()
  }, [])

  const migrateWatchlistItem = (item: unknown): WatchlistItem => {
    const typedItem = item as Record<string, unknown> // Type assertion after unknown check
    // Handle old format that might not have the pair property
    if (!typedItem.pair && typedItem.pairString) {
      const [base, quote] = typedItem.pairString.split('/')
      return {
        ...typedItem,
        pair: {
          base: base as CurrencyPair['base'],
          quote: quote as CurrencyPair['quote']
        }
      }
    }
    return typedItem
  }

  const loadWatchlist = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedItems: unknown[] = JSON.parse(stored)
        // Migrate old format items
        const migratedItems = parsedItems.map(migrateWatchlistItem)
        setWatchlistState({
          items: migratedItems,
          availablePairs: AVAILABLE_PAIRS
        })
        // Save migrated data back to storage
        await saveWatchlist(migratedItems)
      } else {
        // Initialize with default pairs
        const defaultItems = DEFAULT_WATCHLIST_PAIRS.map(createWatchlistItem)
        setWatchlistState({
          items: defaultItems,
          availablePairs: AVAILABLE_PAIRS
        })
        await saveWatchlist(defaultItems)
      }
    } catch (error) {
      console.error('Error loading watchlist:', error)
      // Fallback to default
      const defaultItems = DEFAULT_WATCHLIST_PAIRS.map(createWatchlistItem)
      setWatchlistState({
        items: defaultItems,
        availablePairs: AVAILABLE_PAIRS
      })
    } finally {
      setLoading(false)
    }
  }

  const saveWatchlist = async (items: WatchlistItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Error saving watchlist:', error)
    }
  }

  const addPair = async (pairString: string) => {
    if (!AVAILABLE_PAIRS.includes(pairString)) {
      throw new Error('Invalid currency pair')
    }

    const exists = watchlistState.items.some(
      (item) => item.pairString === pairString
    )
    if (exists) {
      throw new Error('Pair already in watchlist')
    }

    const newItem = createWatchlistItem(pairString)
    const updatedItems = [...watchlistState.items, newItem]

    setWatchlistState((prev) => ({
      ...prev,
      items: updatedItems
    }))

    await saveWatchlist(updatedItems)
  }

  const addMultiplePairs = async (pairStrings: string[]) => {
    if (pairStrings.length === 0) {
      throw new Error('No pairs to add')
    }

    // Validate all pairs first
    const invalidPairs = pairStrings.filter(
      (pair) => !AVAILABLE_PAIRS.includes(pair)
    )
    if (invalidPairs.length > 0) {
      throw new Error(`Invalid currency pairs: ${invalidPairs.join(', ')}`)
    }

    // Filter out pairs that already exist
    const existingPairs = watchlistState.items.map((item) => item.pairString)
    const newPairs = pairStrings.filter((pair) => !existingPairs.includes(pair))

    if (newPairs.length === 0) {
      throw new Error('All selected pairs are already in watchlist')
    }

    // Create new items for all valid pairs
    const newItems = newPairs.map((pairString) =>
      createWatchlistItem(pairString)
    )
    const updatedItems = [...watchlistState.items, ...newItems]

    setWatchlistState((prev) => ({
      ...prev,
      items: updatedItems
    }))

    await saveWatchlist(updatedItems)
  }

  const removePair = async (id: string) => {
    const updatedItems = watchlistState.items.filter((item) => item.id !== id)
    setWatchlistState((prev) => ({
      ...prev,
      items: updatedItems
    }))
    await saveWatchlist(updatedItems)
  }

  const reorderPairs = async (newItems: WatchlistItem[]) => {
    setWatchlistState((prev) => ({
      ...prev,
      items: newItems
    }))
    await saveWatchlist(newItems)
  }

  const togglePairActive = async (id: string) => {
    const updatedItems = watchlistState.items.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    )
    setWatchlistState((prev) => ({
      ...prev,
      items: updatedItems
    }))
    await saveWatchlist(updatedItems)
  }

  const getAvailableToAdd = () => {
    const existingPairs = watchlistState.items.map((item) => item.pairString)
    return AVAILABLE_PAIRS.filter((pair) => !existingPairs.includes(pair))
  }

  const clearStorage = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY)
      console.log('Watchlist storage cleared')
      // Reload with defaults
      await loadWatchlist()
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }

  return {
    watchlistState,
    loading,
    addPair,
    addMultiplePairs,
    removePair,
    reorderPairs,
    togglePairActive,
    getAvailableToAdd,
    refreshWatchlist: loadWatchlist,
    clearStorage
  }
}
