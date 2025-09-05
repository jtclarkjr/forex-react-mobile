import React from 'react'
import { View, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native'
import { Text } from '@/components/common/Themed'
import { useAppTheme } from '@/styles/theme'
import { createMainScreenStyles } from '@/styles/mainScreen'

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({
  message = 'Loading watchlist...'
}: LoadingScreenProps) {
  const { colorScheme, colors } = useAppTheme()
  const styles = createMainScreenStyles(colors)

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.screenBackground}
        />
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </SafeAreaView>
  )
}
