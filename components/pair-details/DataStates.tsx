import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Text } from '@/components/common/Themed'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useAppTheme } from '@/styles/theme'
import { createPairDetailsStyles } from '@/styles/pairDetails'

export function LoadingState() {
  const { colors } = useAppTheme()
  const styles = createPairDetailsStyles(colors)

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.buttonPrimary} />
      <Text style={styles.loadingText}>Loading forex data...</Text>
    </View>
  )
}

export function ErrorState() {
  const { colors } = useAppTheme()
  const styles = createPairDetailsStyles(colors)

  return (
    <View style={styles.errorContainer}>
      <FontAwesome
        name="exclamation-triangle"
        size={48}
        color={colors.textError}
      />
      <Text style={styles.errorTitle}>Unable to load data</Text>
      <Text style={styles.errorText}>
        Please check your connection and try again
      </Text>
    </View>
  )
}

export function NoDataState() {
  const { colors } = useAppTheme()
  const styles = createPairDetailsStyles(colors)

  return (
    <View style={styles.noDataContainer}>
      <FontAwesome name="line-chart" size={48} color={colors.textTertiary} />
      <Text style={styles.noDataText}>No data available</Text>
    </View>
  )
}
