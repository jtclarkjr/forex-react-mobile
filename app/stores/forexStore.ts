import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { ForexRate, SupportedPair, ConnectionStatus } from '@/types/forex'
import type { ForexStore, ForexDataResult } from '@/types/forexStore'
import { API_ENDPOINT, FOREX_UPDATE_INTERVAL } from '@/lib/constants/Forex'
import {
  createForexApiUrl,
  parseForexApiResponse,
  processForexError
} from '@/lib/utils/forex-store-utils'

export const useForexStore = create<ForexStore>()(
  subscribeWithSelector(
    immer((set, get) => {
      /**
       * Creates a polling function for a specific currency pair
       */
      const createPollingFunction = (pairString: SupportedPair) => {
        return async (): Promise<void> => {
          try {
            const response = await fetch(
              createForexApiUrl(pairString, API_ENDPOINT)
            )
            const result = await response.json()
            const parsed = parseForexApiResponse(result)

            if (parsed.success && parsed.data) {
              get().updateRate(pairString, parsed.data)
            } else {
              get().setError(pairString, parsed.error || 'Failed to fetch data')
            }
          } catch (error) {
            console.error('Error fetching forex data:', error)
            get().setError(pairString, processForexError(error))
          }
        }
      }

      /**
       * Initializes streaming for a currency pair
       */
      const initializeStream = (
        state: ForexStore,
        pairString: SupportedPair
      ): void => {
        state.activeStreams.add(pairString)
        state.connectionStatus[pairString] = 'connecting'
        state.loading[pairString] = true
        state.errors[pairString] = null

        // Start polling interval
        const fetchData = createPollingFunction(pairString)
        state.pollingIntervals[pairString] = setInterval(
          fetchData,
          FOREX_UPDATE_INTERVAL
        )
      }

      /**
       * Cleans up streaming resources for a currency pair
       */
      const cleanupStream = (
        state: ForexStore,
        pairString: SupportedPair
      ): void => {
        state.activeStreams.delete(pairString)
        state.connectionStatus[pairString] = 'disconnected'
        state.loading[pairString] = false

        // Clear polling interval
        if (state.pollingIntervals[pairString]) {
          clearInterval(state.pollingIntervals[pairString])
          delete state.pollingIntervals[pairString]
        }

        delete state.streamRefCounts[pairString]
      }

      return {
        rates: {},
        loading: {},
        errors: {},
        connectionStatus: {},
        activeStreams: new Set<SupportedPair>(),
        streamRefCounts: {},
        pollingIntervals: {},
        isPaused: false,

        /**
         * Starts streaming forex data for a currency pair.
         * Uses reference counting to manage multiple subscribers.
         */
        startStream: (pairString: SupportedPair): void => {
          set((state) => {
            // Increment reference count
            const currentCount = state.streamRefCounts[pairString] || 0
            state.streamRefCounts[pairString] = currentCount + 1

            // If this is the first reference, initialize the stream
            if (state.streamRefCounts[pairString] === 1) {
              initializeStream(state, pairString)
            }
          })
        },

        /**
         * Stops streaming forex data for a currency pair.
         * Uses reference counting to manage multiple subscribers.
         */
        stopStream: (pairString: SupportedPair): void => {
          set((state) => {
            const currentCount = state.streamRefCounts[pairString]

            if (currentCount && currentCount > 0) {
              state.streamRefCounts[pairString] = currentCount - 1

              // If no more references, cleanup the stream
              if (state.streamRefCounts[pairString] <= 0) {
                cleanupStream(state, pairString)
              }
            }
          })
        },

        /**
         * Reconnects a currency pair stream (resets connection status)
         */
        reconnect: (pairString: SupportedPair): void => {
          set((state) => {
            state.connectionStatus[pairString] = 'connecting'
            state.errors[pairString] = null
          })
        },

        /**
         * Updates the forex rate for a currency pair
         */
        updateRate: (pairString: SupportedPair, rate: ForexRate): void => {
          set((state) => {
            state.rates[pairString] = rate
            state.loading[pairString] = false
            state.errors[pairString] = null
            state.connectionStatus[pairString] = 'connected'
          })
        },

        /**
         * Sets the loading state for a currency pair
         */
        setLoading: (pairString: SupportedPair, loading: boolean): void => {
          set((state) => {
            state.loading[pairString] = loading
          })
        },

        /**
         * Sets an error for a currency pair
         */
        setError: (pairString: SupportedPair, error: string | null): void => {
          set((state) => {
            state.errors[pairString] = error
            state.loading[pairString] = false
            if (error) {
              state.connectionStatus[pairString] = 'disconnected'
            }
          })
        },

        /**
         * Sets the connection status for a currency pair
         */
        setConnectionStatus: (
          pairString: SupportedPair,
          status: ConnectionStatus
        ): void => {
          set((state) => {
            state.connectionStatus[pairString] = status
          })
        },

        /**
         * Pauses all active streams (e.g., when app goes to background)
         */
        pauseAll: (): void => {
          set((state) => {
            state.isPaused = true
            // Set all active streams to disconnected
            state.activeStreams.forEach((pairString) => {
              state.connectionStatus[pairString] = 'disconnected'
            })
          })
        },

        /**
         * Resumes all active streams (e.g., when app comes to foreground)
         */
        resumeAll: (): void => {
          set((state) => {
            state.isPaused = false
            // Set all active streams to connecting
            state.activeStreams.forEach((pairString) => {
              state.connectionStatus[pairString] = 'connecting'
            })
          })
        },

        /**
         * Gets all forex data for a specific currency pair
         */
        getForexData: (pairString: SupportedPair): ForexDataResult => {
          const state = get()
          return {
            data: state.rates[pairString] || null,
            loading: state.loading[pairString] || false,
            error: state.errors[pairString] || null,
            connectionStatus:
              state.connectionStatus[pairString] || 'disconnected'
          }
        },

        /**
         * Gets the reference count for a currency pair (useful for debugging)
         */
        getStreamRefCount: (pairString: SupportedPair): number => {
          const state = get()
          return state.streamRefCounts[pairString] || 0
        }
      }
    })
  )
)
