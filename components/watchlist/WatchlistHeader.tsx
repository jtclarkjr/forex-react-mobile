import React from 'react'
import { View, TouchableOpacity, StatusBar } from 'react-native'
import { Text } from '@/components/common/Themed'
import { useAppTheme } from '@/styles/theme'
import { createMainScreenStyles } from '@/styles/mainScreen'

interface WatchlistHeaderProps {
  title?: string
  onAddPress: () => void
  canAdd: boolean
}

export default function WatchlistHeader({
  title = 'Forex Watchlist',
  onAddPress,
  canAdd
}: WatchlistHeaderProps) {
  const { colorScheme, colors } = useAppTheme()
  const styles = createMainScreenStyles(colors)

  return (
    <>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screenBackground}
      />

      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.toolbarTrailing}>
          <TouchableOpacity
            onPress={onAddPress}
            disabled={!canAdd}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={[
                styles.toolbarAction,
                !canAdd && styles.toolbarActionDisabled
              ]}
            >
              + Add Pair
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}
