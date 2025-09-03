import { useState, useEffect, useRef, useCallback } from 'react'
import { AppState } from 'react-native'
import type {
  ForexRate,
  CurrencyPair,
  ApiResponse,
  UseForexStreamState
} from '../types/forex'
import { FOREX_UPDATE_INTERVAL } from '../constants/Forex'

// Enhanced error state for better UX
interface ErrorState {
  message: string
  type: 'network' | 'quota' | 'service' | 'unknown'
  canRetry: boolean
  retryAfter?: number
}

export default function useForexStream(currencyPair: CurrencyPair) {
  const [state, setState] = useState<UseForexStreamState>({
    data: null,
    loading: true,
    error: null,
    connectionStatus: 'connecting'
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)
  const isPausedRef = useRef(false)

  const pairString = `${currencyPair.base}/${currencyPair.quote}`

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const parseErrorFromResponse = (
    response: Response,
    result: ApiResponse<ForexRate>
  ): ErrorState => {
    switch (response.status) {
      case 429:
        return {
          message: 'API quota exceeded. Reducing update frequency...',
          type: 'quota',
          canRetry: true,
          retryAfter: 60 // Default to 60 seconds
        }
      case 502:
      case 503:
        return {
          message: 'Forex service temporarily unavailable',
          type: 'service',
          canRetry: true
        }
      default:
        return {
          message: result.error || 'Unknown server error',
          type: 'unknown',
          canRetry: true
        }
    }
  }

  const fetchForexData = useCallback(async () => {
    if (!mountedRef.current || isPausedRef.current) return

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      const response = await fetch(
        `/api/forex?pair=${encodeURIComponent(pairString)}`,
        {
          signal: controller.signal
        }
      )

      // Clear timeout if request completes successfully
      clearTimeout(timeoutId)
      timeoutId = null

      const result: ApiResponse<ForexRate> = await response.json()

      if (!mountedRef.current) return

      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          data: result.data!,
          loading: false,
          error: null,
          connectionStatus: 'connected'
        }))
      } else {
        const errorInfo = parseErrorFromResponse(response, result)
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorInfo.message,
          connectionStatus: 'disconnected'
        }))

        // Handle quota exceeded by increasing interval
        if (errorInfo.type === 'quota' && intervalRef.current) {
          cleanup()
          // Retry with longer interval (5 minutes for quota issues)
          intervalRef.current = setInterval(fetchForexData, 5 * 60 * 1000)
        }
      }
    } catch (error) {
      console.error('Error fetching forex data:', error)
      if (!mountedRef.current) return

      let errorMessage = 'Failed to fetch data'

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout. Check your connection.'
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Check your connection.'
        }
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        connectionStatus: 'disconnected'
      }))
    } finally {
      // Ensure timeout is always cleaned up
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [pairString, cleanup])

  const startPolling = useCallback(() => {
    if (!mountedRef.current) return

    cleanup()
    isPausedRef.current = false

    setState((prev) => ({
      ...prev,
      connectionStatus: 'connecting',
      error: null
    }))

    // Fetch initial data
    fetchForexData()

    // Set up polling to simulate real-time updates
    intervalRef.current = setInterval(fetchForexData, FOREX_UPDATE_INTERVAL)
  }, [fetchForexData, cleanup])

  const pausePolling = useCallback(() => {
    isPausedRef.current = true
    cleanup()
    setState((prev) => ({
      ...prev,
      connectionStatus: 'disconnected'
    }))
  }, [cleanup])

  const resumePolling = useCallback(() => {
    if (!mountedRef.current || !isPausedRef.current) return

    isPausedRef.current = false
    setState((prev) => ({
      ...prev,
      connectionStatus: 'connecting'
    }))

    // Fetch fresh data when resuming
    fetchForexData()

    // Restart polling
    intervalRef.current = setInterval(fetchForexData, FOREX_UPDATE_INTERVAL)
  }, [fetchForexData])

  // Effect to handle currency pair changes
  useEffect(() => {
    startPolling()
    return cleanup
  }, [startPolling, cleanup])

  // Handle app state changes to pause/resume polling
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState.match(/inactive|background/)) {
        console.log('useForexStream: App backgrounded, pausing polling')
        pausePolling()
      } else if (nextAppState === 'active' && isPausedRef.current) {
        console.log('useForexStream: App foregrounded, resuming polling')
        resumePolling()
      }
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )
    return () => subscription?.remove()
  }, [pausePolling, resumePolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      cleanup()
    }
  }, [cleanup, pausePolling, resumePolling])

  return {
    ...state,
    reconnect: startPolling,
    pause: pausePolling,
    resume: resumePolling,
    isPaused: isPausedRef.current
  }
}
