import React from 'react'
import { View } from 'react-native'
import { Text } from '@/components/common/Themed'
import { useAppTheme } from '@/styles/theme'
import { createPairDetailsStyles } from '@/styles/pairDetails'

type ConnectionStatusType = 'connected' | 'connecting' | 'disconnected'

interface ConnectionStatusProps {
  status: ConnectionStatusType
  pairString: string
}

export default function ConnectionStatus({
  status,
  pairString
}: ConnectionStatusProps) {
  const { colors } = useAppTheme()
  const styles = createPairDetailsStyles(colors)

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return colors.statusConnected
      case 'connecting':
        return colors.statusConnecting
      case 'disconnected':
        return colors.statusDisconnected
      default:
        return colors.statusDefault
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Live Data'
      case 'connecting':
        return 'Connecting...'
      case 'disconnected':
        return 'Disconnected'
      default:
        return 'Unknown'
    }
  }

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.pairTitle}>{pairString}</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor() }
            ]}
          />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>
    </View>
  )
}
