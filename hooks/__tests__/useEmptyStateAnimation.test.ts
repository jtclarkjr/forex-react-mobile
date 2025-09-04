import { renderHook } from '@testing-library/react-native'
import { useEmptyStateAnimation } from '@/hooks/useEmptyStateAnimation'
import * as Reanimated from 'react-native-reanimated'

// Access the mocked functions from the global setup
const mockWithTiming = Reanimated.withTiming as jest.MockedFunction<
  typeof Reanimated.withTiming
>
const mockUseSharedValue = Reanimated.useSharedValue as jest.MockedFunction<
  typeof Reanimated.useSharedValue
>
const mockUseAnimatedStyle = Reanimated.useAnimatedStyle as jest.MockedFunction<
  typeof Reanimated.useAnimatedStyle
>

describe('useEmptyStateAnimation', () => {
  const mockOpacityValue = { value: 0 }
  const mockScaleValue = { value: 0.8 }

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset mock values
    mockOpacityValue.value = 0
    mockScaleValue.value = 0.8

    // Setup default mock implementations
    mockUseSharedValue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockReturnValueOnce(mockOpacityValue as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockReturnValueOnce(mockScaleValue as any)

    mockWithTiming.mockImplementation((value) => {
      // Simulate immediate value assignment for testing
      return value
    })

    mockUseAnimatedStyle.mockImplementation((fn) => {
      return fn()
    })
  })

  describe('Initialization', () => {
    it('should initialize with default animation values', () => {
      renderHook(() => useEmptyStateAnimation(false, false))

      expect(mockUseSharedValue).toHaveBeenCalledWith(0) // opacity
      expect(mockUseSharedValue).toHaveBeenCalledWith(0.8) // scale
    })

    it('should create animated style with initial values', () => {
      renderHook(() => useEmptyStateAnimation(false, false))

      expect(mockUseAnimatedStyle).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('Animation Triggers', () => {
    it('should animate in when isEmpty is true and not loading', () => {
      renderHook(() => useEmptyStateAnimation(true, false))

      expect(mockWithTiming).toHaveBeenCalledWith(1, {
        duration: 80,
        easing: expect.any(Function)
      })

      expect(mockWithTiming).toHaveBeenCalledWith(1, {
        duration: 80,
        easing: expect.any(Function)
      })

      // Simulate the timing completion
      mockOpacityValue.value = 1
      mockScaleValue.value = 1
    })

    it('should not animate when isEmpty is false', () => {
      renderHook(() => useEmptyStateAnimation(false, false))

      // Values should remain at initial state
      expect(mockOpacityValue.value).toBe(0)
      expect(mockScaleValue.value).toBe(0.8)
    })

    it('should not animate when loading is true even if empty', () => {
      renderHook(() => useEmptyStateAnimation(true, true))

      // Should reset to initial values, not animate in
      expect(mockOpacityValue.value).toBe(0)
      expect(mockScaleValue.value).toBe(0.8)
    })

    it('should reset values when transitioning from empty to not empty', () => {
      const { rerender } = renderHook(
        ({ isEmpty, isLoading }: { isEmpty: boolean; isLoading: boolean }) =>
          useEmptyStateAnimation(isEmpty, isLoading),
        { initialProps: { isEmpty: true, isLoading: false } }
      )

      // Initially empty, should animate in
      expect(mockWithTiming).toHaveBeenCalled()

      // Clear previous calls
      mockWithTiming.mockClear()

      // Change to not empty
      rerender({ isEmpty: false, isLoading: false })

      // Should not trigger animations when becoming not empty
      expect(mockWithTiming).not.toHaveBeenCalled()
    })

    it('should reset values when starting to load', () => {
      const { rerender } = renderHook(
        ({ isEmpty, isLoading }: { isEmpty: boolean; isLoading: boolean }) =>
          useEmptyStateAnimation(isEmpty, isLoading),
        { initialProps: { isEmpty: true, isLoading: false } }
      )

      // Initially empty and not loading, should animate in
      expect(mockWithTiming).toHaveBeenCalled()

      // Clear previous calls
      mockWithTiming.mockClear()

      // Start loading
      rerender({ isEmpty: true, isLoading: true })

      // Should not trigger new animations when loading starts
      expect(mockWithTiming).not.toHaveBeenCalled()
    })
  })

  describe('Animation Parameters', () => {
    it('should use correct timing parameters for opacity', () => {
      renderHook(() => useEmptyStateAnimation(true, false))

      expect(mockWithTiming).toHaveBeenCalledWith(1, {
        duration: 80,
        easing: expect.any(Function)
      })
    })

    it('should use correct timing parameters for scale with back easing', () => {
      renderHook(() => useEmptyStateAnimation(true, false))

      // Check that scale animation uses back easing
      const calls = mockWithTiming.mock.calls
      const scaleCall = calls.find(
        (call) => call[1]?.easing !== calls[0][1]?.easing
      )

      expect(scaleCall).toBeDefined()
      expect(scaleCall?.[0]).toBe(1) // Target value
      expect(scaleCall?.[1]?.duration).toBe(80)
    })
  })

  describe('Animated Style Return', () => {
    it('should return animated style with opacity and scale', () => {
      const { result } = renderHook(() => useEmptyStateAnimation(false, false))

      // Mock the animated style function return
      const mockStyleReturn = {
        opacity: mockOpacityValue.value,
        transform: [{ scale: mockScaleValue.value }]
      }

      mockUseAnimatedStyle.mockReturnValue(mockStyleReturn)

      expect(result.current).toBeDefined()
      expect(mockUseAnimatedStyle).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should call useAnimatedStyle with correct function', () => {
      renderHook(() => useEmptyStateAnimation(false, false))

      const animatedStyleFn = mockUseAnimatedStyle.mock.calls[0][0]
      const style = animatedStyleFn()

      expect(style).toEqual({
        opacity: mockOpacityValue.value,
        transform: [{ scale: mockScaleValue.value }]
      })
    })
  })

  describe('State Transitions', () => {
    it('should handle loading -> empty transition correctly', () => {
      const { rerender } = renderHook(
        ({ isEmpty, isLoading }: { isEmpty: boolean; isLoading: boolean }) =>
          useEmptyStateAnimation(isEmpty, isLoading),
        { initialProps: { isEmpty: true, isLoading: true } }
      )

      // Initially loading and empty - should not animate
      expect(mockWithTiming).not.toHaveBeenCalled()

      // Stop loading while still empty
      rerender({ isEmpty: true, isLoading: false })

      // Now should animate in
      expect(mockWithTiming).toHaveBeenCalled()
    })

    it('should handle not empty -> loading -> empty transition', () => {
      const { rerender } = renderHook(
        ({ isEmpty, isLoading }: { isEmpty: boolean; isLoading: boolean }) =>
          useEmptyStateAnimation(isEmpty, isLoading),
        { initialProps: { isEmpty: false, isLoading: false } }
      )

      // Initially not empty and not loading
      expect(mockWithTiming).not.toHaveBeenCalled()

      // Start loading
      rerender({ isEmpty: false, isLoading: true })
      expect(mockWithTiming).not.toHaveBeenCalled()

      // Finish loading and become empty
      rerender({ isEmpty: true, isLoading: false })
      expect(mockWithTiming).toHaveBeenCalled()
    })

    it('should handle multiple rapid state changes', () => {
      const { rerender } = renderHook(
        ({ isEmpty, isLoading }: { isEmpty: boolean; isLoading: boolean }) =>
          useEmptyStateAnimation(isEmpty, isLoading),
        { initialProps: { isEmpty: false, isLoading: false } }
      )

      mockWithTiming.mockClear()

      // Rapid changes
      rerender({ isEmpty: true, isLoading: false }) // Should animate
      rerender({ isEmpty: false, isLoading: false }) // Should reset
      rerender({ isEmpty: true, isLoading: true }) // Should reset
      rerender({ isEmpty: true, isLoading: false }) // Should animate again

      // Should have been called for the animate cases
      expect(mockWithTiming).toHaveBeenCalled()
    })
  })

  describe('Dependency Updates', () => {
    it('should respond to changes in isEmpty prop', () => {
      const { rerender } = renderHook(
        (isEmpty: boolean) => useEmptyStateAnimation(isEmpty, false),
        { initialProps: false }
      )

      mockWithTiming.mockClear()

      rerender(true)
      expect(mockWithTiming).toHaveBeenCalled()

      mockWithTiming.mockClear()
      rerender(false)
      expect(mockWithTiming).not.toHaveBeenCalled()
    })

    it('should respond to changes in isLoading prop', () => {
      const { rerender } = renderHook(
        (isLoading: boolean) => useEmptyStateAnimation(true, isLoading),
        { initialProps: true }
      )

      mockWithTiming.mockClear()

      rerender(false)
      expect(mockWithTiming).toHaveBeenCalled()

      mockWithTiming.mockClear()
      rerender(true)
      expect(mockWithTiming).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined or null values gracefully', () => {
      // Should not crash with edge case inputs
      expect(() => {
        renderHook(() =>
          useEmptyStateAnimation(
            null as unknown as boolean,
            undefined as unknown as boolean
          )
        )
      }).not.toThrow()
    })

    it('should maintain stable animated style output', () => {
      const { result, rerender } = renderHook(
        ({ isEmpty, isLoading }: { isEmpty: boolean; isLoading: boolean }) =>
          useEmptyStateAnimation(isEmpty, isLoading),
        { initialProps: { isEmpty: false, isLoading: false } }
      )

      // Get the initial result
      const initialResult = result.current

      // Rerender with same props
      rerender({ isEmpty: false, isLoading: false })

      // The style output should be equivalent (showing consistent behavior)
      expect(result.current).toStrictEqual(initialResult)
    })
  })
})
