import React from 'react'
import { View } from 'react-native'
import { Text } from '@/components/common/Themed'
import { useAppTheme } from '@/styles/theme'
import { createPairDetailsStyles } from '@/styles/pairDetails'
import { useFormatters } from '@/hooks/useFormatters'

interface BidAskCardProps {
  bid: number
  ask: number
}

export default function BidAskCard({ bid, ask }: BidAskCardProps) {
  const { colors } = useAppTheme()
  const styles = createPairDetailsStyles(colors)
  const { formatPrice, formatSpread } = useFormatters()

  return (
    <View style={styles.bidAskCard}>
      <View style={styles.bidAskRow}>
        <View style={styles.bidContainer}>
          <Text style={styles.bidAskLabel}>Bid</Text>
          <Text style={[styles.bidAskValue, { color: colors.textError }]}>
            {formatPrice(bid)}
          </Text>
        </View>
        <View style={styles.askContainer}>
          <Text style={styles.bidAskLabel}>Ask</Text>
          <Text style={[styles.bidAskValue, { color: colors.textSuccess }]}>
            {formatPrice(ask)}
          </Text>
        </View>
      </View>

      <View style={styles.spreadContainer}>
        <Text style={styles.spreadLabel}>Spread</Text>
        <Text style={styles.spreadValue}>{formatSpread(bid, ask)}</Text>
      </View>
    </View>
  )
}
