import { useEffect, useRef, useCallback } from 'react'
import { AppState } from 'react-native'
import { useForexStore } from '@/stores'
import type {
  CurrencyPair,
  UseForexStreamReturn,
  SupportedPair
} from '@/types/forex'

/**
 * Adapter hook that maintains the same interface as the original useForexStream hook
 * but uses the Zustand store internally for state management.
 *
 * This hook provides a clean interface while leveraging centralized state management
 * with reference counting for efficient resource management.
 */
export default function useForexStream(
  currencyPair: CurrencyPair
): UseForexStreamReturn {
  const isComponentMountedRef = useRef(true)
  const pairString =
    `${currencyPair.base}/${currencyPair.quote}` as SupportedPair

  // Subscribe to individual pieces of state with stable selectors to prevent infinite re-renders
  const data = useForexStore(
    useCallback((state) => state.rates[pairString] || null, [pairString])
  )
  const loading = useForexStore(
    useCallback((state) => state.loading[pairString] || false, [pairString])
  )
  const error = useForexStore(
    useCallback((state) => state.errors[pairString] || null, [pairString])
  )
  const connectionStatus = useForexStore(
    useCallback(
      (state) => state.connectionStatus[pairString] || 'disconnected',
      [pairString]
    )
  )
  const isPaused = useForexStore(useCallback((state) => state.isPaused, []))

  // Stream control actions
  const reconnect = useCallback(() => {
    if (!isComponentMountedRef.current) return
    useForexStore.getState().startStream(pairString)
  }, [pairString])

  const pause = useCallback(() => {
    useForexStore.getState().stopStream(pairString)
  }, [pairString])

  const resume = useCallback(() => {
    if (!isComponentMountedRef.current) return

    const store = useForexStore.getState()
    if (store.activeStreams.has(pairString)) {
      store.setConnectionStatus(pairString, 'connecting')
    }
  }, [pairString])

  // Initialize stream when component mounts or pair changes
  useEffect(() => {
    reconnect()
  }, [reconnect])

  // Handle app state changes for background/foreground management
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      const store = useForexStore.getState()

      if (nextAppState.match(/inactive|background/)) {
        store.pauseAll()
      } else if (nextAppState === 'active' && store.isPaused) {
        store.resumeAll()
        resume()
      }
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )
    return () => subscription?.remove()
  }, [resume])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false
      useForexStore.getState().stopStream(pairString)
    }
  }, [pairString])

  return {
    data,
    loading,
    error,
    connectionStatus,
    reconnect,
    pause,
    resume,
    isPaused
  }
}
