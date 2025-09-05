import { useEffect } from 'react'
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing
} from 'react-native-reanimated'

/**
 * Custom hook for animating empty state UI
 * Provides fade-in and scale animations when content becomes empty
 */
export function useEmptyStateAnimation(isEmpty: boolean, isLoading: boolean) {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.8)

  useEffect(() => {
    if (isEmpty && !isLoading) {
      // Animate in the empty state with smooth transitions
      opacity.value = withTiming(1, {
        duration: 80,
        easing: Easing.out(Easing.ease)
      })
      scale.value = withTiming(1, {
        duration: 80,
        easing: Easing.out(Easing.back(1.2))
      })
    } else {
      // Reset animation values when content is added
      opacity.value = 0
      scale.value = 0.8
    }
  }, [isEmpty, isLoading, opacity, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }))

  return animatedStyle
}
