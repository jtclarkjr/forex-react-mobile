import { renderHook, act, waitFor } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import uuidv4 from 'react-native-uuid'
import useWatchlist from '@/hooks/useWatchlist'
import type { WatchlistItem, SupportedPair } from '@/types/forex'

// Mock the constants
jest.mock('@/constants/Forex', () => ({
  DEFAULT_WATCHLIST_PAIRS: ['USD/JPY', 'EUR/USD'],
  AVAILABLE_PAIRS: [
    'USD/JPY',
    'EUR/USD',
    'GBP/USD',
    'AUD/USD',
    'USD/CAD',
    'USD/CHF'
  ],
  SUPPORTED_PAIRS: [
    'USD/JPY',
    'EUR/USD',
    'GBP/USD',
    'AUD/USD',
    'USD/CAD',
    'USD/CHF'
  ]
}))

// Mock react-native-uuid
jest.mock('react-native-uuid', () => ({
  v4: jest.fn()
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUuid = (uuidv4 as any).v4 as jest.MockedFunction<() => string>

const STORAGE_KEY = 'forex_watchlist'

const createMockItem = (pairString: string, id = 'test-id'): WatchlistItem => {
  const [base, quote] = pairString.split('/')
  return {
    id,
    pair: {
      base: base as
        | 'USD'
        | 'EUR'
        | 'GBP'
        | 'AUD'
        | 'JPY'
        | 'CAD'
        | 'CHF'
        | 'CNY',
      quote: quote as
        | 'USD'
        | 'EUR'
        | 'GBP'
        | 'AUD'
        | 'JPY'
        | 'CAD'
        | 'CHF'
        | 'CNY'
    },
    pairString,
    isActive: true
  }
}

describe('useWatchlist', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.clear()

    // Setup mock to return unique IDs
    let idCounter = 0
    mockUuid.mockImplementation(() => `mock-uuid-${++idCounter}`)
  })

  describe('Initialization', () => {
    it('should initialize with default state when storage is empty', async () => {
      const { result } = renderHook(() => useWatchlist())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.watchlistState.items).toHaveLength(2)
      expect(result.current.watchlistState.items[0].pairString).toBe('USD/JPY')
      expect(result.current.watchlistState.items[1].pairString).toBe('EUR/USD')
      expect(result.current.watchlistState.availablePairs).toEqual([
        'USD/JPY',
        'EUR/USD',
        'GBP/USD',
        'AUD/USD',
        'USD/CAD',
        'USD/CHF'
      ])

      // Should save to storage
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          expect.any(String)
        )
      })
    })

    it('should load existing data from storage', async () => {
      const existingData = [
        createMockItem('GBP/USD', 'existing-1'),
        createMockItem('AUD/USD', 'existing-2')
      ]

      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(existingData)
      )

      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.watchlistState.items).toHaveLength(2)
      expect(result.current.watchlistState.items[0].pairString).toBe('GBP/USD')
      expect(result.current.watchlistState.items[1].pairString).toBe('AUD/USD')
    })

    it('should handle storage errors gracefully', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      )

      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should fallback to defaults
      expect(result.current.watchlistState.items).toHaveLength(2)
      expect(result.current.watchlistState.items[0].pairString).toBe('USD/JPY')
    })
  })

  describe('Data Migration', () => {
    it('should migrate old format items without pair property', async () => {
      const oldFormatData = [
        {
          id: 'old-1',
          pairString: 'USD/JPY',
          isActive: true
          // Missing pair property
        },
        {
          id: 'old-2',
          pairString: 'EUR/USD',
          isActive: false
          // Missing pair property
        }
      ]

      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(oldFormatData)
      )

      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.watchlistState.items).toHaveLength(2)

      const firstItem = result.current.watchlistState.items[0]
      expect(firstItem.id).toBe('old-1')
      expect(firstItem.pairString).toBe('USD/JPY')
      expect(firstItem.pair).toEqual({ base: 'USD', quote: 'JPY' })
      expect(firstItem.isActive).toBe(true)

      const secondItem = result.current.watchlistState.items[1]
      expect(secondItem.isActive).toBe(false)

      // Should save migrated data
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEY,
          expect.stringContaining('USD')
        )
      })
    })

    it('should handle invalid data during migration', async () => {
      const invalidData = [
        { id: 'valid-1', pairString: 'USD/JPY', isActive: true },
        { id: 'invalid-1' }, // Missing pairString
        { pairString: 'EUR/USD', isActive: true } // Missing id
      ]

      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(invalidData)
      )

      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should fallback to defaults on migration error
      expect(result.current.watchlistState.items).toHaveLength(2)
      expect(result.current.watchlistState.items[0].pairString).toBe('USD/JPY')
    })
  })

  describe('Adding Pairs', () => {
    it('should add a single pair successfully', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCount = result.current.watchlistState.items.length

      await act(async () => {
        await result.current.addPair('GBP/USD' as SupportedPair)
      })

      expect(result.current.watchlistState.items).toHaveLength(initialCount + 1)

      const addedItem = result.current.watchlistState.items.find(
        (item) => item.pairString === 'GBP/USD'
      )
      expect(addedItem).toBeDefined()
      expect(addedItem?.pair).toEqual({ base: 'GBP', quote: 'USD' })
      expect(addedItem?.isActive).toBe(true)

      // Should save to storage
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      )
    })

    it('should add multiple pairs at once', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCount = result.current.watchlistState.items.length
      const pairsToAdd: SupportedPair[] = ['GBP/USD', 'AUD/USD']

      await act(async () => {
        await result.current.addMultiplePairs(pairsToAdd)
      })

      expect(result.current.watchlistState.items).toHaveLength(initialCount + 2)

      const gbpItem = result.current.watchlistState.items.find(
        (item) => item.pairString === 'GBP/USD'
      )
      const audItem = result.current.watchlistState.items.find(
        (item) => item.pairString === 'AUD/USD'
      )

      expect(gbpItem).toBeDefined()
      expect(audItem).toBeDefined()
    })

    it('should reject invalid currency pairs', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.addPair('INVALID/PAIR' as SupportedPair)
        })
      ).rejects.toThrow('Invalid currency pair')
    })

    it('should reject duplicate pairs', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Try to add a pair that's already in defaults
      await expect(
        act(async () => {
          await result.current.addPair('USD/JPY' as SupportedPair)
        })
      ).rejects.toThrow('Pair already in watchlist')
    })

    it('should handle empty array in addMultiplePairs', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.addMultiplePairs([])
        })
      ).rejects.toThrow('No pairs to add')
    })

    it('should filter out existing pairs in addMultiplePairs', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Try to add pairs where USD/JPY already exists and GBP/USD is new
      const pairsToAdd: SupportedPair[] = ['USD/JPY', 'GBP/USD']
      const initialCount = result.current.watchlistState.items.length

      await act(async () => {
        await result.current.addMultiplePairs(pairsToAdd)
      })

      // Should only add the new pair (GBP/USD), filtering out the existing one (USD/JPY)
      expect(result.current.watchlistState.items).toHaveLength(initialCount + 1)
      expect(
        result.current.watchlistState.items.some(
          (item) => item.pairString === 'GBP/USD'
        )
      ).toBe(true)
    })
  })

  describe('Removing Pairs', () => {
    it('should remove a pair by id', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCount = result.current.watchlistState.items.length
      expect(initialCount).toBeGreaterThan(0) // Ensure we have items to remove

      const itemToRemove = result.current.watchlistState.items[0]
      const itemToRemoveId = itemToRemove.id

      await act(async () => {
        await result.current.removePair(itemToRemoveId)
      })

      // Wait for state to update after removal
      await waitFor(() => {
        expect(result.current.watchlistState.items).toHaveLength(
          initialCount - 1
        )
      })

      expect(
        result.current.watchlistState.items.find(
          (item) => item.id === itemToRemoveId
        )
      ).toBeUndefined()

      // Should save to storage
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      )
    })
  })

  describe('Reordering Pairs', () => {
    it('should reorder pairs', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const originalItems = [...result.current.watchlistState.items]
      const reorderedItems = [originalItems[1], originalItems[0]] // Swap order

      await act(async () => {
        await result.current.reorderPairs(reorderedItems)
      })

      expect(result.current.watchlistState.items[0].id).toBe(
        originalItems[1].id
      )
      expect(result.current.watchlistState.items[1].id).toBe(
        originalItems[0].id
      )

      // Should save to storage
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      )
    })
  })

  describe('Toggling Active State', () => {
    it('should toggle pair active state', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const itemToToggle = result.current.watchlistState.items[0]
      const originalState = itemToToggle.isActive

      await act(async () => {
        await result.current.togglePairActive(itemToToggle.id)
      })

      const toggledItem = result.current.watchlistState.items.find(
        (item) => item.id === itemToToggle.id
      )
      expect(toggledItem?.isActive).toBe(!originalState)

      // Should save to storage
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      )
    })
  })

  describe('Available Pairs', () => {
    it('should return correct available pairs to add', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const availablePairs = result.current.getAvailableToAdd()

      // Should exclude pairs already in watchlist
      expect(availablePairs).not.toContain('USD/JPY')
      expect(availablePairs).not.toContain('EUR/USD')
      expect(availablePairs).toContain('GBP/USD')
      expect(availablePairs).toContain('AUD/USD')
    })

    it('should update available pairs when items are added', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let availablePairs = result.current.getAvailableToAdd()
      expect(availablePairs).toContain('GBP/USD')

      await act(async () => {
        await result.current.addPair('GBP/USD' as SupportedPair)
      })

      availablePairs = result.current.getAvailableToAdd()
      expect(availablePairs).not.toContain('GBP/USD')
    })
  })

  describe('Refresh Operations', () => {
    it('should refresh watchlist data from storage', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Modify storage directly to simulate external changes
      const newData = [createMockItem('USD/CAD', 'external-1')]
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(newData)
      )

      expect(result.current.refreshing).toBe(false)

      await act(async () => {
        await result.current.refreshWatchlistData()
      })

      await waitFor(() => {
        expect(result.current.refreshing).toBe(false)
      })

      expect(result.current.watchlistState.items).toHaveLength(1)
      expect(result.current.watchlistState.items[0].pairString).toBe('USD/CAD')
    })

    it('should handle refresh errors gracefully', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      ;(AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Refresh error')
      )

      await act(async () => {
        await result.current.refreshWatchlistData()
      })

      // Should not crash and should reset refreshing state
      await waitFor(() => {
        expect(result.current.refreshing).toBe(false)
      })
    })
  })

  describe('Storage Management', () => {
    it('should clear storage and reload with defaults', async () => {
      // Start with some custom data
      const customData = [createMockItem('GBP/USD')]
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(customData)
      )

      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.watchlistState.items).toHaveLength(1)
      })

      // Clear storage
      await act(async () => {
        await result.current.clearStorage()
      })

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY)

      // Should reload with defaults
      await waitFor(() => {
        expect(result.current.watchlistState.items).toHaveLength(2)
        expect(result.current.watchlistState.items[0].pairString).toBe(
          'USD/JPY'
        )
      })
    })

    it('should handle clear storage errors', async () => {
      ;(AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error('Remove error')
      )

      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should not crash
      await act(async () => {
        await result.current.clearStorage()
      })
    })
  })

  describe('Return Interface', () => {
    it('should provide all expected functions and properties', async () => {
      const { result } = renderHook(() => useWatchlist())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current).toHaveProperty('watchlistState')
      expect(result.current).toHaveProperty('loading')
      expect(result.current).toHaveProperty('refreshing')
      expect(result.current).toHaveProperty('addPair')
      expect(result.current).toHaveProperty('addMultiplePairs')
      expect(result.current).toHaveProperty('removePair')
      expect(result.current).toHaveProperty('reorderPairs')
      expect(result.current).toHaveProperty('togglePairActive')
      expect(result.current).toHaveProperty('getAvailableToAdd')
      expect(result.current).toHaveProperty('refreshWatchlist')
      expect(result.current).toHaveProperty('refreshWatchlistData')
      expect(result.current).toHaveProperty('clearStorage')

      expect(typeof result.current.addPair).toBe('function')
      expect(typeof result.current.addMultiplePairs).toBe('function')
      expect(typeof result.current.removePair).toBe('function')
      expect(typeof result.current.reorderPairs).toBe('function')
      expect(typeof result.current.togglePairActive).toBe('function')
      expect(typeof result.current.getAvailableToAdd).toBe('function')
      expect(typeof result.current.refreshWatchlist).toBe('function')
      expect(typeof result.current.refreshWatchlistData).toBe('function')
      expect(typeof result.current.clearStorage).toBe('function')
    })
  })
})
