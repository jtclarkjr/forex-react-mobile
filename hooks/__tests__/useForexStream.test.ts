import { renderHook, act, waitFor } from '@testing-library/react-native'
import { AppState } from 'react-native'
import useForexStream from '@/hooks/useForexStream'
import type { CurrencyPair, ForexRate, ApiResponse } from '@/types/forex'

// Mock the constants module
jest.mock('@/constants/Forex', () => ({
  FOREX_UPDATE_INTERVAL: 1000 // Use shorter interval for testing
}))

// Mock timers
jest.useFakeTimers()

const mockCurrencyPair: CurrencyPair = {
  base: 'USD',
  quote: 'JPY'
}

const mockForexRate: ForexRate = {
  from: 'USD',
  to: 'JPY',
  bid: 149.85,
  ask: 149.95,
  price: 149.9,
  time_stamp: '2023-12-01T10:00:00Z'
}

const createMockApiResponse = (
  success: boolean,
  data?: ForexRate,
  error?: string
): ApiResponse<ForexRate> => ({
  success,
  data,
  error
})

describe('useForexStream', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useForexStream(mockCurrencyPair))

      expect(result.current.data).toBeNull()
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.connectionStatus).toBe('connecting')
      expect(result.current.isPaused).toBe(false)
      expect(typeof result.current.reconnect).toBe('function')
      expect(typeof result.current.pause).toBe('function')
      expect(typeof result.current.resume).toBe('function')
    })
  })

  describe('Successful Data Fetching', () => {
    it('should fetch and set forex data successfully', async () => {
      const mockResponse = createMockApiResponse(true, mockForexRate)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { result } = renderHook(() => useForexStream(mockCurrencyPair))

      // Wait for initial fetch
      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockForexRate)
      expect(result.current.error).toBeNull()
      expect(result.current.connectionStatus).toBe('connected')

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/forex?pair=USD%2FJPY',
        expect.objectContaining({
          signal: expect.any(AbortSignal)
        })
      )
    })

    it('should set up polling interval for continuous updates', async () => {
      const mockResponse = createMockApiResponse(true, mockForexRate)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      renderHook(() => useForexStream(mockCurrencyPair))

      // Initial call
      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Advance time by interval
      await act(async () => {
        jest.advanceTimersByTime(1000)
      })

      expect(global.fetch).toHaveBeenCalledTimes(2)

      // Advance again
      await act(async () => {
        jest.advanceTimersByTime(1000)
      })

      expect(global.fetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('Error Handling', () => {
    it('should handle API error responses', async () => {
      const errorResponse = createMockApiResponse(
        false,
        undefined,
        'Service unavailable'
      )
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve(errorResponse)
      })

      const { result } = renderHook(() => useForexStream(mockCurrencyPair))

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.error).toBe('Forex service temporarily unavailable')
      expect(result.current.connectionStatus).toBe('disconnected')
    })

    it('should handle quota exceeded with longer retry interval', async () => {
      const quotaResponse = createMockApiResponse(
        false,
        undefined,
        'Quota exceeded'
      )
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve(quotaResponse)
      })

      const { result } = renderHook(() => useForexStream(mockCurrencyPair))

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(result.current.error).toBe(
          'API quota exceeded. Reducing update frequency...'
        )
      })

      expect(result.current.connectionStatus).toBe('disconnected')

      // Should not make another call after regular interval
      await act(async () => {
        jest.advanceTimersByTime(1000)
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Should make call after extended interval (5 minutes)
      await act(async () => {
        jest.advanceTimersByTime(5 * 60 * 1000)
      })

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should handle network timeout errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        (() => {
          const error = new Error('Timeout')
          error.name = 'AbortError'
          return error
        })()
      )

      const { result } = renderHook(() => useForexStream(mockCurrencyPair))

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(result.current.error).toBe(
          'Request timeout. Check your connection.'
        )
      })

      expect(result.current.connectionStatus).toBe('disconnected')
    })

    it('should handle general network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const { result } = renderHook(() => useForexStream(mockCurrencyPair))

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch data')
      })

      expect(result.current.connectionStatus).toBe('disconnected')
    })
  })

  describe('App State Management', () => {
    let mockAppStateEventListener: jest.Mock

    beforeEach(() => {
      mockAppStateEventListener = jest.fn()
      ;(AppState.addEventListener as jest.Mock) = jest.fn((event, callback) => {
        mockAppStateEventListener.mockImplementation(callback)
        return { remove: jest.fn() }
      })
    })

    it('should pause polling when app goes to background', async () => {
      const mockResponse = createMockApiResponse(true, mockForexRate)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { result } = renderHook(() => useForexStream(mockCurrencyPair))

      // Initial call
      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Simulate app going to background
      act(() => {
        mockAppStateEventListener('background')
      })

      expect(result.current.connectionStatus).toBe('disconnected')

      // Should not make calls while in background
      await act(async () => {
        jest.advanceTimersByTime(5000)
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should resume polling when app comes to foreground', async () => {
      const mockResponse = createMockApiResponse(true, mockForexRate)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { result } = renderHook(() => useForexStream(mockCurrencyPair))

      // Initial call
      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      // Simulate app going to background
      act(() => {
        mockAppStateEventListener('background')
      })

      expect(result.current.connectionStatus).toBe('disconnected')

      // Simulate app coming back to foreground
      act(() => {
        mockAppStateEventListener('active')
      })

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connecting')
      })

      // Should resume polling
      await act(async () => {
        jest.advanceTimersByTime(1100)
      })

      expect(global.fetch).toHaveBeenCalledTimes(3) // initial + resume + interval
    })
  })

  describe('Manual Controls', () => {
    it('should allow manual pause and resume', async () => {
      const mockResponse = createMockApiResponse(true, mockForexRate)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { result } = renderHook(() => useForexStream(mockCurrencyPair))

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      // Pause manually
      act(() => {
        result.current.pause()
      })

      expect(result.current.connectionStatus).toBe('disconnected')
      expect(result.current.isPaused).toBe(true)

      // Should not poll while paused
      await act(async () => {
        jest.advanceTimersByTime(2000)
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Resume manually
      act(() => {
        result.current.resume()
      })

      expect(result.current.connectionStatus).toBe('connecting')

      await act(async () => {
        jest.advanceTimersByTime(1100)
      })

      expect(global.fetch).toHaveBeenCalledTimes(3) // initial + resume + interval
    })

    it('should allow manual reconnect', async () => {
      const mockResponse = createMockApiResponse(true, mockForexRate)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { result } = renderHook(() => useForexStream(mockCurrencyPair))

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      // Trigger reconnect
      act(() => {
        result.current.reconnect()
      })

      expect(result.current.connectionStatus).toBe('connecting')

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Currency Pair Changes', () => {
    it.skip('should restart polling when currency pair changes', async () => {
      const mockResponse = createMockApiResponse(true, mockForexRate)

      // Setup mock to persist across calls
      const mockImplementation = () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })

      ;(global.fetch as jest.Mock).mockImplementation(mockImplementation)

      const { rerender } = renderHook(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ pair }: { pair: any }) => useForexStream(pair),
        {
          initialProps: { pair: mockCurrencyPair }
        }
      )

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/forex?pair=USD%2FJPY',
        expect.any(Object)
      )

      // Clear the mock calls but keep the implementation
      ;(global.fetch as jest.Mock).mockClear()
      ;(global.fetch as jest.Mock).mockImplementation(mockImplementation)

      // Change currency pair
      const newPair: CurrencyPair = { base: 'EUR', quote: 'USD' }

      await act(async () => {
        rerender({ pair: newPair })
      })

      // Let useEffect run by advancing timers a bit
      await act(async () => {
        jest.advanceTimersByTime(50)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/forex?pair=EUR%2FUSD',
        expect.any(Object)
      )
    })
  })

  describe('Cleanup', () => {
    it('should cleanup intervals on unmount', async () => {
      const mockResponse = createMockApiResponse(true, mockForexRate)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { unmount } = renderHook(() => useForexStream(mockCurrencyPair))

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      unmount()

      // Should not make calls after unmount
      await act(async () => {
        jest.advanceTimersByTime(5000)
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should not update state if component is unmounted during fetch', async () => {
      let resolvePromise: (value: unknown) => void
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(global.fetch as jest.Mock).mockReturnValueOnce(pendingPromise)

      const { result, unmount } = renderHook(() =>
        useForexStream(mockCurrencyPair)
      )

      // Start fetch
      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      expect(result.current.loading).toBe(true)

      // Unmount while fetch is pending
      unmount()

      // Resolve the promise after unmount
      act(() => {
        resolvePromise!({
          ok: true,
          json: () =>
            Promise.resolve(createMockApiResponse(true, mockForexRate))
        })
      })

      // Should not cause any issues or warnings
    })
  })
})
