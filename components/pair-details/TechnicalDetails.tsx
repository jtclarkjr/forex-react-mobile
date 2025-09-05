import React from 'react'
import { View } from 'react-native'
import { Text } from '@/components/common/Themed'
import { useAppTheme } from '@/styles/theme'
import { createPairDetailsStyles } from '@/styles/pairDetails'

interface TechnicalDetailsProps {
  from: string
  to: string
}

export default function TechnicalDetails({ from, to }: TechnicalDetailsProps) {
  const { colors } = useAppTheme()
  const styles = createPairDetailsStyles(colors)

  const details = [
    { label: 'Pair', value: `${from}/${to}` },
    { label: 'Precision', value: '5 decimal places' },
    { label: 'Data Source', value: 'Real-time stream' },
    { label: 'Update Frequency', value: 'Live' }
  ]

  return (
    <View style={styles.technicalCard}>
      <Text style={styles.technicalTitle}>Technical Details</Text>

      {details.map((detail, index) => (
        <View key={index} style={styles.technicalRow}>
          <Text style={styles.technicalLabel}>{detail.label}</Text>
          <Text style={styles.technicalValue}>{detail.value}</Text>
        </View>
      ))}
    </View>
  )
}
