import React, { useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  runOnJS
} from 'react-native-reanimated'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import WatchlistItem from './WatchlistItem'
import type { WatchlistItem as WatchlistItemType } from '@/lib/types/forex'
import { useAppTheme } from '@/styles/theme'
import { createSwipeableWatchlistItemStyles } from '@/styles/swipeableWatchlistItem'
import { mediumHaptic } from '@/lib/utils/haptics'

interface SwipeableWatchlistItemProps {
  item: WatchlistItemType
  index: number
  onToggleActive: (id: string) => void
  onPress?: (item: WatchlistItemType) => void
  onDelete: (id: string) => void
  onDrag?: () => void
  isDragging?: boolean
}

export default function SwipeableWatchlistItem({
  item,
  index,
  onToggleActive,
  onPress,
  onDelete,
  onDrag,
  isDragging
}: SwipeableWatchlistItemProps) {
  const { colors } = useAppTheme()
  const styles = createSwipeableWatchlistItemStyles(colors)
  const swipeableRef = useRef<React.ComponentRef<typeof Swipeable> | null>(null)

  const handleAutoDelete = useCallback(() => {
    onDelete(item.id)
  }, [item.id, onDelete])

  const renderRightActions = (progressAnimatedValue: SharedValue<number>) => {
    const handleDelete = () => {
      onDelete(item.id)
    }

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        progressAnimatedValue.value,
        [0, 1],
        [0, 1],
        'clamp'
      )

      const opacity = interpolate(
        progressAnimatedValue.value,
        [0, 0.5, 1],
        [0, 0.5, 1],
        'clamp'
      )

      // If swiped far enough, trigger auto-delete
      if (progressAnimatedValue.value > 1.8) {
        runOnJS(handleAutoDelete)()
      }

      return {
        transform: [{ scale }],
        opacity
      }
    })

    return (
      <View style={styles.rightActionContainer}>
        <Animated.View style={[styles.deleteAction, animatedStyle]}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <FontAwesome name="trash" size={20} color={colors.background} />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    )
  }

  return (
    <GestureHandlerRootView>
      <Swipeable
        ref={(ref) => {
          swipeableRef.current = ref
        }}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        friction={1.5}
        overshootRight
        enabled={!isDragging}
        onSwipeableWillOpen={() => {
          mediumHaptic() // Haptic feedback when swipe actions are revealed
        }}
      >
        <WatchlistItem
          item={item}
          index={index}
          onToggleActive={onToggleActive}
          onPress={onPress}
          onDrag={onDrag}
          isDragging={isDragging}
        />
      </Swipeable>
    </GestureHandlerRootView>
  )
}
