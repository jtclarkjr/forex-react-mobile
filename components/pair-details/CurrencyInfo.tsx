import React from 'react'
import { View } from 'react-native'
import { Text } from '@/components/common/Themed'
import { useAppTheme } from '@/styles/theme'
import { createPairDetailsStyles } from '@/styles/pairDetails'
import { getCurrencyName } from '@/lib/utils'

interface CurrencyInfoProps {
  base: string
  quote: string
}

export default function CurrencyInfo({ base, quote }: CurrencyInfoProps) {
  const { colors } = useAppTheme()
  const styles = createPairDetailsStyles(colors)

  return (
    <View style={styles.currencyInfoContainer}>
      <View style={styles.currencyCard}>
        <Text style={styles.currencyLabel}>Base Currency</Text>
        <Text style={styles.currencyValue}>{base}</Text>
        <Text style={styles.currencyDescription}>{getCurrencyName(base)}</Text>
      </View>

      <View style={styles.currencyCard}>
        <Text style={styles.currencyLabel}>Quote Currency</Text>
        <Text style={styles.currencyValue}>{quote}</Text>
        <Text style={styles.currencyDescription}>{getCurrencyName(quote)}</Text>
      </View>
    </View>
  )
}
