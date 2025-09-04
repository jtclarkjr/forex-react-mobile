import { renderHook, act } from '@testing-library/react-native'
import { AppState, AppStateStatus } from 'react-native'
import useAppState from '@/hooks/useAppState'

// Mock AppState
const mockAppStateListener = jest.fn()
const mockRemove = jest.fn()

jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active' as AppStateStatus,
    addEventListener: jest.fn(() => ({ remove: mockRemove }))
  }
}))

const mockAppState = AppState as jest.Mocked<typeof AppState>

describe('useAppState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAppState.currentState = 'active'
    mockAppState.addEventListener.mockImplementation((event, callback) => {
      mockAppStateListener.mockImplementation(callback)
      return { remove: mockRemove }
    })
  })

  describe('Initialization', () => {
    it('should initialize with current app state', () => {
      const { result } = renderHook(() => useAppState())

      expect(result.current.appState).toBe('active')
      expect(result.current.isActive).toBe(true)
      expect(result.current.isBackground).toBe(false)
      expect(result.current.isInactive).toBe(false)
    })

    it('should initialize with background state when app starts in background', () => {
      mockAppState.currentState = 'background'

      const { result } = renderHook(() => useAppState())

      expect(result.current.appState).toBe('background')
      expect(result.current.isActive).toBe(false)
      expect(result.current.isBackground).toBe(true)
      expect(result.current.isInactive).toBe(false)
    })

    it('should initialize with inactive state', () => {
      mockAppState.currentState = 'inactive'

      const { result } = renderHook(() => useAppState())

      expect(result.current.appState).toBe('inactive')
      expect(result.current.isActive).toBe(false)
      expect(result.current.isBackground).toBe(false)
      expect(result.current.isInactive).toBe(true)
    })

    it('should set up event listener on mount', () => {
      renderHook(() => useAppState())

      expect(mockAppState.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })
  })

  describe('State Changes', () => {
    it('should update state when app goes to background', () => {
      const { result } = renderHook(() => useAppState())

      expect(result.current.isActive).toBe(true)

      act(() => {
        mockAppStateListener('background')
      })

      expect(result.current.appState).toBe('background')
      expect(result.current.isActive).toBe(false)
      expect(result.current.isBackground).toBe(true)
      expect(result.current.isInactive).toBe(false)
    })

    it('should update state when app becomes inactive', () => {
      const { result } = renderHook(() => useAppState())

      act(() => {
        mockAppStateListener('inactive')
      })

      expect(result.current.appState).toBe('inactive')
      expect(result.current.isActive).toBe(false)
      expect(result.current.isBackground).toBe(false)
      expect(result.current.isInactive).toBe(true)
    })

    it('should update state when app becomes active', () => {
      mockAppState.currentState = 'background'
      const { result } = renderHook(() => useAppState())

      expect(result.current.isBackground).toBe(true)

      act(() => {
        mockAppStateListener('active')
      })

      expect(result.current.appState).toBe('active')
      expect(result.current.isActive).toBe(true)
      expect(result.current.isBackground).toBe(false)
      expect(result.current.isInactive).toBe(false)
    })
  })

  describe('Callbacks', () => {
    it('should call onChange callback when state changes', () => {
      const onChangeMock = jest.fn()

      renderHook(() => useAppState({ onChange: onChangeMock }))

      act(() => {
        mockAppStateListener('background')
      })

      expect(onChangeMock).toHaveBeenCalledWith('background')

      act(() => {
        mockAppStateListener('active')
      })

      expect(onChangeMock).toHaveBeenCalledWith('active')
      expect(onChangeMock).toHaveBeenCalledTimes(2)
    })

    it('should call onBackground callback when transitioning to background', () => {
      const onBackgroundMock = jest.fn()

      renderHook(() => useAppState({ onBackground: onBackgroundMock }))

      act(() => {
        mockAppStateListener('background')
      })

      expect(onBackgroundMock).toHaveBeenCalledTimes(1)

      // Should not call when already in background
      act(() => {
        mockAppStateListener('background')
      })

      expect(onBackgroundMock).toHaveBeenCalledTimes(1)
    })

    it('should call onBackground callback when transitioning to inactive', () => {
      const onBackgroundMock = jest.fn()

      renderHook(() => useAppState({ onBackground: onBackgroundMock }))

      act(() => {
        mockAppStateListener('inactive')
      })

      expect(onBackgroundMock).toHaveBeenCalledTimes(1)
    })

    it('should call onForeground callback when transitioning from background to active', () => {
      const onForegroundMock = jest.fn()
      mockAppState.currentState = 'background'

      renderHook(() => useAppState({ onForeground: onForegroundMock }))

      act(() => {
        mockAppStateListener('active')
      })

      expect(onForegroundMock).toHaveBeenCalledTimes(1)

      // Should not call when already active
      act(() => {
        mockAppStateListener('active')
      })

      expect(onForegroundMock).toHaveBeenCalledTimes(1)
    })

    it('should call onForeground callback when transitioning from inactive to active', () => {
      const onForegroundMock = jest.fn()
      mockAppState.currentState = 'inactive'

      renderHook(() => useAppState({ onForeground: onForegroundMock }))

      act(() => {
        mockAppStateListener('active')
      })

      expect(onForegroundMock).toHaveBeenCalledTimes(1)
    })

    it('should handle all callbacks together', () => {
      const onChangeMock = jest.fn()
      const onForegroundMock = jest.fn()
      const onBackgroundMock = jest.fn()

      renderHook(() =>
        useAppState({
          onChange: onChangeMock,
          onForeground: onForegroundMock,
          onBackground: onBackgroundMock
        })
      )

      // Go to background
      act(() => {
        mockAppStateListener('background')
      })

      expect(onChangeMock).toHaveBeenCalledWith('background')
      expect(onBackgroundMock).toHaveBeenCalledTimes(1)
      expect(onForegroundMock).toHaveBeenCalledTimes(0)

      // Return to foreground
      act(() => {
        mockAppStateListener('active')
      })

      expect(onChangeMock).toHaveBeenCalledWith('active')
      expect(onBackgroundMock).toHaveBeenCalledTimes(1)
      expect(onForegroundMock).toHaveBeenCalledTimes(1)
    })

    it('should work without callbacks', () => {
      const { result } = renderHook(() => useAppState())

      // Should not throw errors
      act(() => {
        mockAppStateListener('background')
      })

      expect(result.current.isBackground).toBe(true)

      act(() => {
        mockAppStateListener('active')
      })

      expect(result.current.isActive).toBe(true)
    })
  })

  describe('Dynamic Config Updates', () => {
    it('should use updated callbacks when config changes', () => {
      const firstCallback = jest.fn()
      const secondCallback = jest.fn()

      const { rerender } = renderHook(
        ({ onChange }: { onChange: () => void }) => useAppState({ onChange }),
        { initialProps: { onChange: firstCallback } }
      )

      act(() => {
        mockAppStateListener('background')
      })

      expect(firstCallback).toHaveBeenCalledWith('background')
      expect(secondCallback).not.toHaveBeenCalled()

      // Update the callback
      rerender({ onChange: secondCallback })

      act(() => {
        mockAppStateListener('active')
      })

      expect(firstCallback).toHaveBeenCalledTimes(1)
      expect(secondCallback).toHaveBeenCalledWith('active')
    })

    it('should handle callback removal', () => {
      const callback = jest.fn()

      const { rerender } = renderHook(
        ({ onChange }: { onChange: () => void }) => useAppState({ onChange }),
        { initialProps: { onChange: callback } }
      )

      act(() => {
        mockAppStateListener('background')
      })

      expect(callback).toHaveBeenCalledWith('background')

      // Remove callback
      rerender({ onChange: () => {} })

      act(() => {
        mockAppStateListener('active')
      })

      // Should not call the old callback again
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const { unmount } = renderHook(() => useAppState())

      expect(mockAppState.addEventListener).toHaveBeenCalled()

      unmount()

      expect(mockRemove).toHaveBeenCalled()
    })

    it('should not crash if remove function is not available', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockAppState.addEventListener.mockReturnValueOnce({} as any)

      const { unmount } = renderHook(() => useAppState())

      // Should not throw
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid state changes', () => {
      const onChangeMock = jest.fn()

      renderHook(() => useAppState({ onChange: onChangeMock }))

      act(() => {
        mockAppStateListener('inactive')
        mockAppStateListener('background')
        mockAppStateListener('active')
        mockAppStateListener('inactive')
      })

      expect(onChangeMock).toHaveBeenCalledTimes(4)
      expect(onChangeMock).toHaveBeenNthCalledWith(1, 'inactive')
      expect(onChangeMock).toHaveBeenNthCalledWith(2, 'background')
      expect(onChangeMock).toHaveBeenNthCalledWith(3, 'active')
      expect(onChangeMock).toHaveBeenNthCalledWith(4, 'inactive')
    })

    it('should handle same state transitions', () => {
      const onChangeMock = jest.fn()
      const onForegroundMock = jest.fn()
      const onBackgroundMock = jest.fn()

      renderHook(() =>
        useAppState({
          onChange: onChangeMock,
          onForeground: onForegroundMock,
          onBackground: onBackgroundMock
        })
      )

      // Multiple active states
      act(() => {
        mockAppStateListener('active')
        mockAppStateListener('active')
      })

      expect(onChangeMock).toHaveBeenCalledTimes(2)
      expect(onForegroundMock).toHaveBeenCalledTimes(0) // Already active
      expect(onBackgroundMock).toHaveBeenCalledTimes(0)
    })
  })

  describe('Return Value Properties', () => {
    it('should provide correct boolean properties for active state', () => {
      const { result } = renderHook(() => useAppState())

      expect(result.current.appState).toBe('active')
      expect(result.current.isActive).toBe(true)
      expect(result.current.isBackground).toBe(false)
      expect(result.current.isInactive).toBe(false)
    })

    it('should provide correct boolean properties for background state', () => {
      mockAppState.currentState = 'background'
      const { result } = renderHook(() => useAppState())

      expect(result.current.appState).toBe('background')
      expect(result.current.isActive).toBe(false)
      expect(result.current.isBackground).toBe(true)
      expect(result.current.isInactive).toBe(false)
    })

    it('should provide correct boolean properties for inactive state', () => {
      mockAppState.currentState = 'inactive'
      const { result } = renderHook(() => useAppState())

      expect(result.current.appState).toBe('inactive')
      expect(result.current.isActive).toBe(false)
      expect(result.current.isBackground).toBe(false)
      expect(result.current.isInactive).toBe(true)
    })
  })
})
