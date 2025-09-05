import React from 'react'
import { Text } from '@/components/common/Themed'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Animated from 'react-native-reanimated'
import { useAppTheme } from '@/styles/theme'
import { createMainScreenStyles } from '@/styles/mainScreen'
import { useEmptyStateAnimation } from '@/hooks/ui/useEmptyStateAnimation'

interface EmptyStateProps {
  visible: boolean
  loading: boolean
  message?: string
  submessage?: string
  icon?: string
  iconSize?: number
}

export default function EmptyState({
  visible,
  loading,
  message = 'No pairs in watchlist',
  submessage = 'Tap "Add Pair" to get started',
  icon = 'list',
  iconSize = 48
}: EmptyStateProps) {
  const { colors } = useAppTheme()
  const styles = createMainScreenStyles(colors)
  const animatedEmptyStyle = useEmptyStateAnimation(visible, loading)

  if (!visible) return null

  return (
    <Animated.View style={[styles.emptyContainer, animatedEmptyStyle]}>
      <FontAwesome
        name={icon as keyof typeof FontAwesome.glyphMap}
        size={iconSize}
        color={colors.textTertiary}
      />
      <Text style={styles.emptyText}>{message}</Text>
      <Text style={styles.emptySubtext}>{submessage}</Text>
    </Animated.View>
  )
}
