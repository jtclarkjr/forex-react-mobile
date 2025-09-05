import React, { useMemo } from 'react'
import { View, ScrollView, StatusBar } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

import { useAppTheme } from '@/styles/theme'
import { createPairDetailsStyles } from '@/styles/pairDetails'

import type { CurrencyPair } from '@/lib/types/forex'

// components
import useForexStream from '@/hooks/adapters/useForexStreamAdapter'
import ConnectionStatus from '@/components/pair-details/ConnectionStatus'
import PriceCard from '@/components/pair-details/PriceCard'
import BidAskCard from '@/components/pair-details/BidAskCard'
import CurrencyInfo from '@/components/pair-details/CurrencyInfo'
import TechnicalDetails from '@/components/pair-details/TechnicalDetails'
import {
  LoadingState,
  ErrorState,
  NoDataState
} from '@/components/pair-details/DataStates'

export default function PairDetailsModal() {
  const params = useLocalSearchParams<{
    base: string
    quote: string
    pairString: string
  }>()

  const { base, quote, pairString } = params
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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.textColor}
      />
      <ConnectionStatus status={connectionStatus} pairString={pairString} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && !data ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
        ) : data ? (
          <>
            <PriceCard price={data.price} timestamp={data.time_stamp} />
            <BidAskCard bid={data.bid} ask={data.ask} />
            <CurrencyInfo base={base} quote={quote} />
            <TechnicalDetails from={data.from} to={data.to} />
          </>
        ) : (
          <NoDataState />
        )}
      </ScrollView>
    </View>
  )
}
