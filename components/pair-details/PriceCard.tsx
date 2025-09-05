import React from 'react'
import { View } from 'react-native'
import { Text } from '@/components/common/Themed'
import { useAppTheme } from '@/styles/theme'
import { createPairDetailsStyles } from '@/styles/pairDetails'
import { useFormatters } from '@/hooks/useFormatters'

interface PriceCardProps {
  price: number
  timestamp: string
}

export default function PriceCard({ price, timestamp }: PriceCardProps) {
  const { colors } = useAppTheme()
  const styles = createPairDetailsStyles(colors)
  const { formatPrice, formatTimestamp } = useFormatters()

  return (
    <View style={styles.priceCard}>
      <Text style={styles.currentPriceLabel}>Current Price</Text>
      <Text style={styles.currentPrice}>{formatPrice(price)}</Text>
      <Text style={styles.lastUpdated}>
        Last updated: {formatTimestamp(timestamp)}
      </Text>
    </View>
  )
}
