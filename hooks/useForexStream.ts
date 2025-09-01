import { useState, useEffect, useRef, useCallback } from 'react'
import type {
  ForexRate,
  CurrencyPair,
  ApiResponse,
  UseForexStreamState
} from '../types/forex'
import { FOREX_UPDATE_INTERVAL } from '../constants/Forex'

export default function useForexStream(currencyPair: CurrencyPair) {
  const [state, setState] = useState<UseForexStreamState>({
    data: null,
    loading: true,
    error: null,
    connectionStatus: 'connecting'
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)

  const pairString = `${currencyPair.base}/${currencyPair.quote}`

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const fetchForexData = useCallback(async () => {
    if (!mountedRef.current) return

    try {
      const response = await fetch(
        `/api/forex?pair=${encodeURIComponent(pairString)}`
      )
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
        setState((prev) => ({
          ...prev,
          error: result.error || 'Unknown error',
          connectionStatus: 'disconnected'
        }))
      }
    } catch (error) {
      console.error('Error fetching forex data:', error)
      if (!mountedRef.current) return

      setState((prev) => ({
        ...prev,
        error: 'Failed to fetch data',
        connectionStatus: 'disconnected'
      }))
    }
  }, [pairString])

  const startPolling = useCallback(() => {
    if (!mountedRef.current) return

    cleanup()

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

  // Effect to handle currency pair changes
  useEffect(() => {
    startPolling()
    return cleanup
  }, [startPolling, cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      cleanup()
    }
  }, [cleanup])

  return {
    ...state,
    reconnect: startPolling
  }
}
