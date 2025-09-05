import type {
  ForexRate,
  SupportedPair,
  ConnectionStatus,
  UseForexStreamState
} from './forex'

/** Type helper for partial records mapped by currency pairs */
export type PairState<T> = Partial<Record<SupportedPair, T>>

/** Type for polling interval handles */
export type PollingInterval = ReturnType<typeof setInterval>

/** Return type for forex data queries - reuses existing UseForexStreamState */
export type ForexDataResult = UseForexStreamState

/**
 * Main forex store interface for Zustand store
 */
export interface ForexStore {
  // Per-pair state maps
  rates: PairState<ForexRate | null>
  loading: PairState<boolean>
  errors: PairState<string | null>
  connectionStatus: PairState<ConnectionStatus>

  // Stream management
  activeStreams: Set<SupportedPair>
  streamRefCounts: PairState<number>
  pollingIntervals: PairState<PollingInterval>

  // Global state
  isPaused: boolean

  // Stream lifecycle actions
  startStream: (pairString: SupportedPair) => void
  stopStream: (pairString: SupportedPair) => void
  reconnect: (pairString: SupportedPair) => void

  // State update actions
  updateRate: (pairString: SupportedPair, rate: ForexRate) => void
  setLoading: (pairString: SupportedPair, loading: boolean) => void
  setError: (pairString: SupportedPair, error: string | null) => void
  setConnectionStatus: (
    pairString: SupportedPair,
    status: ConnectionStatus
  ) => void

  // Global control actions
  pauseAll: () => void
  resumeAll: () => void

  // Data access methods
  getForexData: (pairString: SupportedPair) => ForexDataResult
  getStreamRefCount: (pairString: SupportedPair) => number
}
