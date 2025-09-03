import React, { useMemo } from 'react'
import { View, ScrollView, StatusBar, ActivityIndicator } from 'react-native'
import { Text } from '@/components/common/Themed'
import { useAppTheme } from '@/styles/theme'
import { createPairDetailsStyles } from '@/styles/pairDetails'
import { useLocalSearchParams } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import useForexStream from '@/hooks/useForexStream'
import { getCurrencyName } from '@/lib/utils'
import type { CurrencyPair } from '@/types/forex'

export default function PairDetailsModal() {
  const params = useLocalSearchParams<{
    base: string
    quote: string
    pairString: string
  }>()

  const { base, quote, pairString } = params

  // Theme
  const { colorScheme, colors } = useAppTheme()
  const styles = createPairDetailsStyles(colors)

  // Create currency pair object
  const currencyPair = useMemo(
    (): CurrencyPair => ({
      base: base as CurrencyPair['base'],
      quote: quote as CurrencyPair['quote']
    }),
    [base, quote]
  )

  // Stream forex data
  const { data, loading, error, connectionStatus } =
    useForexStream(currencyPair)

  const formatPrice = (price: number, decimals = 5) => {
    return price.toFixed(decimals)
  }

  const formatTimestamp = (timeStamp: string) => {
    return new Date(timeStamp).toLocaleTimeString()
  }

  const getConnectionStatusColor = () => {
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
    switch (connectionStatus) {
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
    <View style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.textColor}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pairTitle}>{pairString}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getConnectionStatusColor() }
              ]}
            />
            <Text style={styles.statusText}>{getConnectionStatusText()}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && !data ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.buttonPrimary} />
            <Text style={styles.loadingText}>Loading forex data...</Text>
          </View>
        ) : error ? (
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
        ) : data ? (
          <>
            {/* Main Price Card */}
            <View style={styles.priceCard}>
              <Text style={styles.currentPriceLabel}>Current Price</Text>
              <Text style={styles.currentPrice}>{formatPrice(data.price)}</Text>
              <Text style={styles.lastUpdated}>
                Last updated: {formatTimestamp(data.time_stamp)}
              </Text>
            </View>

            {/* Bid/Ask Card */}
            <View style={styles.bidAskCard}>
              <View style={styles.bidAskRow}>
                <View style={styles.bidContainer}>
                  <Text style={styles.bidAskLabel}>Bid</Text>
                  <Text
                    style={[styles.bidAskValue, { color: colors.textError }]}
                  >
                    {formatPrice(data.bid)}
                  </Text>
                </View>
                <View style={styles.askContainer}>
                  <Text style={styles.bidAskLabel}>Ask</Text>
                  <Text
                    style={[styles.bidAskValue, { color: colors.textSuccess }]}
                  >
                    {formatPrice(data.ask)}
                  </Text>
                </View>
              </View>

              <View style={styles.spreadContainer}>
                <Text style={styles.spreadLabel}>Spread</Text>
                <Text style={styles.spreadValue}>
                  {formatPrice(data.ask - data.bid)}
                </Text>
              </View>
            </View>

            {/* Currency Info Cards */}
            <View style={styles.currencyInfoContainer}>
              <View style={styles.currencyCard}>
                <Text style={styles.currencyLabel}>Base Currency</Text>
                <Text style={styles.currencyValue}>{base}</Text>
                <Text style={styles.currencyDescription}>
                  {getCurrencyName(base)}
                </Text>
              </View>

              <View style={styles.currencyCard}>
                <Text style={styles.currencyLabel}>Quote Currency</Text>
                <Text style={styles.currencyValue}>{quote}</Text>
                <Text style={styles.currencyDescription}>
                  {getCurrencyName(quote)}
                </Text>
              </View>
            </View>

            {/* Technical Details Card */}
            <View style={styles.technicalCard}>
              <Text style={styles.technicalTitle}>Technical Details</Text>

              <View style={styles.technicalRow}>
                <Text style={styles.technicalLabel}>Pair</Text>
                <Text style={styles.technicalValue}>
                  {data.from}/{data.to}
                </Text>
              </View>

              <View style={styles.technicalRow}>
                <Text style={styles.technicalLabel}>Precision</Text>
                <Text style={styles.technicalValue}>5 decimal places</Text>
              </View>

              <View style={styles.technicalRow}>
                <Text style={styles.technicalLabel}>Data Source</Text>
                <Text style={styles.technicalValue}>Real-time stream</Text>
              </View>

              <View style={styles.technicalRow}>
                <Text style={styles.technicalLabel}>Update Frequency</Text>
                <Text style={styles.technicalValue}>Live</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <FontAwesome
              name="line-chart"
              size={48}
              color={colors.textTertiary}
            />
            <Text style={styles.noDataText}>No data available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
