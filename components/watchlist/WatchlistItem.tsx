import React, { useMemo } from 'react'
import { View, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Text } from '@/components/common/Themed'
import { useAppTheme } from '@/styles/theme'
import { createWatchlistItemStyles } from '@/styles/watchlistItem'
import useForexStream from '@/hooks/useForexStream'
import type {
  WatchlistItem as WatchlistItemType,
  CurrencyPair
} from '@/types/forex'
import FontAwesome from '@expo/vector-icons/FontAwesome'

interface WatchlistItemProps {
  item: WatchlistItemType
  index: number
  onToggleActive: (id: string) => void
  onPress?: (item: WatchlistItemType) => void
  onDrag?: () => void
  isDragging?: boolean
}

export default function WatchlistItem({
  item,
  index: _index,
  onToggleActive: _onToggleActive,
  onPress,
  onDrag,
  isDragging
}: WatchlistItemProps) {
  // Early return if item is null/undefined
  if (!item || !item.pairString) {
    return null
  }

  // Theme
  const { colors } = useAppTheme()
  const styles = createWatchlistItemStyles(colors)

  // Ensure pair exists, create it if missing
  if (!item.pair) {
    const [base, quote] = item.pairString.split('/')
    item.pair = {
      base: base as CurrencyPair['base'],
      quote: quote as CurrencyPair['quote']
    }
  }

  // Convert pair string to CurrencyPair object for the hook
  const currencyPair = useMemo((): CurrencyPair => {
    // Use item.pair if available, otherwise parse from pairString
    if (item?.pair && item.pair.base && item.pair.quote) {
      return item.pair
    }
    const [base, quote] = item.pairString.split('/')
    return {
      base: base as CurrencyPair['base'],
      quote: quote as CurrencyPair['quote']
    }
  }, [item?.pair, item?.pairString])

  // Use streaming forex data - only stream when active
  const forexStream = item.isActive ? useForexStream(currencyPair) : null
  const data = forexStream?.data
  const loading = forexStream?.loading
  const error = forexStream?.error
  const connectionStatus = forexStream?.connectionStatus

  const formatPrice = (price: number) => {
    return price.toFixed(5)
  }

  const getConnectionStatusColor = () => {
    if (!item.isActive) return colors.inactiveText
    switch (connectionStatus) {
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

  const getConnectionStatusText = () => {
    if (!item.isActive) return ''
    switch (connectionStatus) {
      case 'connected':
        return 'Live'
      case 'connecting':
        return 'Connecting'
      case 'disconnected':
        return 'Disconnected'
      default:
        return ''
    }
  }

  return (
    <View style={[styles.container, isDragging && styles.dragging]}>
      {/* Drag Handle */}
      {onDrag && (
        <TouchableOpacity
          style={styles.dragHandle}
          onLongPress={onDrag}
          delayLongPress={200}
        >
          <FontAwesome name="bars" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.content}
        onPress={() => onPress?.(item)}
        disabled={!item.isActive || isDragging}
      >
        {/* Currency Pair */}
        <View style={styles.pairSection}>
          <Text
            style={[styles.pairText, !item.isActive && styles.inactiveText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.pairString}
          </Text>
          {!item.isActive ? (
            <Text style={styles.inactiveLabel}>Inactive</Text>
          ) : (
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getConnectionStatusColor() }
                ]}
              />
              <Text style={styles.statusText}>{getConnectionStatusText()}</Text>
            </View>
          )}
        </View>

        {/* Rate Display */}
        <View style={styles.rateSection}>
          {loading && !data ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : data && item.isActive ? (
            <View style={styles.rateInfo}>
              <Text
                style={styles.priceText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {formatPrice(data.price)}
              </Text>
              <View style={styles.bidAskRow}>
                <Text
                  style={styles.bidAskText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  Bid: {formatPrice(data.bid)}
                </Text>
                <Text style={{ width: 8 }} />
                <Text
                  style={styles.bidAskText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  Ask: {formatPrice(data.ask)}
                </Text>
              </View>
            </View>
          ) : error && item.isActive ? (
            <Text style={styles.errorText}>Error loading data</Text>
          ) : (
            <Text style={styles.noDataText}>--</Text>
          )}
        </View>

      </TouchableOpacity>
    </View>
  )
}
