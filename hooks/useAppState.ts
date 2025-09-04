import { useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'

interface UseAppStateConfig {
  // Callback fired when app state changes
  onChange?: (status: AppStateStatus) => void
  // Callback fired when app comes to foreground
  onForeground?: () => void
  // Callback fired when app goes to background
  onBackground?: () => void
}

interface UseAppStateReturn {
  appState: AppStateStatus
  isActive: boolean
  isBackground: boolean
  isInactive: boolean
}

export default function useAppState(
  config?: UseAppStateConfig
): UseAppStateReturn {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  )
  const appStateRef = useRef(AppState.currentState)
  const configRef = useRef(config)

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = config
  }, [config])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const currentConfig = configRef.current
      const previousAppState = appStateRef.current

      // Update refs
      appStateRef.current = nextAppState
      setAppState(nextAppState)

      // Call onChange callback if provided
      currentConfig?.onChange?.(nextAppState)

      // Handle foreground transition
      if (
        previousAppState.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        currentConfig?.onForeground?.()
      }

      // Handle background transition
      if (
        previousAppState === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        currentConfig?.onBackground?.()
      }
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )

    return () => {
      if (subscription?.remove) {
        subscription.remove()
      }
    }
  }, [])

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive'
  }
}
