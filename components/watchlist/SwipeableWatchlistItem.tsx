import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle
} from 'react-native-reanimated'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import WatchlistItem from './WatchlistItem'
import type { WatchlistItem as WatchlistItemType } from '@/types/forex'

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

      return {
        transform: [{ scale }],
        opacity
      }
    })

    return (
      <View style={styles.rightActionContainer}>
        <Animated.View style={[styles.deleteAction, animatedStyle]}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <FontAwesome name="trash" size={20} color="white" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    )
  }

  return (
    <GestureHandlerRootView>
      <Swipeable
        renderRightActions={renderRightActions}
        rightThreshold={40}
        friction={1.5}
        overshootRight={false}
        enabled={!isDragging}
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

const styles = StyleSheet.create({
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    width: 96, // 80 + 16 (right margin)
    paddingRight: 16
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  }
})
