import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native'
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler'
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
  const renderRightActions = (
    progress: Animated.AnimatedAddition,
    _dragX: Animated.AnimatedAddition
  ) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    })

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
      extrapolate: 'clamp'
    })

    return (
      <View style={styles.rightActionContainer}>
        <Animated.View
          style={[
            styles.deleteAction,
            {
              transform: [{ scale }],
              opacity
            }
          ]}
        >
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(item.id)}
          >
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
