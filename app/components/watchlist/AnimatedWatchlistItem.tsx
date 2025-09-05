import React, { useEffect } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS
} from 'react-native-reanimated'
import SwipeableWatchlistItem from './SwipeableWatchlistItem'
import type { WatchlistItem as WatchlistItemType } from '@/types/forex'

interface AnimatedWatchlistItemProps {
  item: WatchlistItemType
  index: number
  onToggleActive: (id: string) => void
  onPress?: (item: WatchlistItemType) => void
  onDelete: (id: string) => void
  onDrag?: () => void
  isDragging?: boolean
  isRemoving?: boolean
  onRemovalComplete?: (id: string) => void
}

export default function AnimatedWatchlistItem({
  item,
  index,
  onToggleActive,
  onPress,
  onDelete,
  onDrag,
  isDragging,
  isRemoving = false,
  onRemovalComplete
}: AnimatedWatchlistItemProps) {
  const opacity = useSharedValue(1)
  const translateX = useSharedValue(0)
  const scale = useSharedValue(1)
  const height = useSharedValue(80) // Approximate height of a watchlist item

  // Trigger removal animation when isRemoving becomes true
  useEffect(() => {
    if (isRemoving) {
      // Animate removal: slide out to left, fade out, and collapse height
      opacity.value = withTiming(0, { duration: 300 })
      translateX.value = withTiming(-300, { duration: 300 })
      scale.value = withTiming(0.8, { duration: 300 })
      height.value = withSequence(
        withTiming(height.value, { duration: 150 }), // Keep height briefly
        withTiming(0, { duration: 200 }, () => {
          // Call removal complete callback on JS thread
          if (onRemovalComplete) {
            runOnJS(onRemovalComplete)(item.id)
          }
        })
      )
    }
  }, [
    isRemoving,
    item.id,
    onRemovalComplete,
    opacity,
    translateX,
    scale,
    height
  ])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height: height.value,
    marginVertical: 4,
    transform: [{ translateX: translateX.value }, { scale: scale.value }]
  }))

  const handleDelete = (id: string) => {
    // Instead of immediate deletion, trigger the animation
    onDelete(id)
  }

  return (
    <Animated.View style={animatedStyle}>
      <SwipeableWatchlistItem
        item={item}
        index={index}
        onToggleActive={onToggleActive}
        onPress={onPress}
        onDelete={handleDelete}
        onDrag={onDrag}
        isDragging={isDragging}
      />
    </Animated.View>
  )
}
