import React, { useState } from 'react'
import { View, Alert, SafeAreaView, RefreshControl } from 'react-native'

import { useAppTheme } from '@/styles/theme'
import { createMainScreenStyles } from '@/styles/mainScreen'

import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams
} from 'react-native-draggable-flatlist'
import { useWatchlistStore } from '@/stores'
import type {
  SupportedPair,
  WatchlistItem as WatchlistItemType
} from '@/types/forex'
import { successHaptic, errorHaptic } from '@/lib/utils/haptics'

// components
import { usePairNavigation } from '@/hooks/usePairNavigation'
import LoadingScreen from '@/components/common/LoadingScreen'
import EmptyState from '@/components/watchlist/EmptyState'
import AddPairModal from '@/components/watchlist/AddPairModal'
import AnimatedWatchlistItem from '@/components/watchlist/AnimatedWatchlistItem'
import WatchlistHeader from '@/components/watchlist/WatchlistHeader'

export default function WatchlistScreen() {
  const {
    items,
    loading,
    refreshing,
    addMultiplePairs,
    removePair,
    reorderPairs,
    getAvailableToAdd,
    refreshWatchlist
  } = useWatchlistStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPairsToAdd, setSelectedPairsToAdd] = useState<SupportedPair[]>(
    []
  )
  const [isAdding, setIsAdding] = useState(false)
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  // Theme and navigation
  const { colors } = useAppTheme()
  const styles = createMainScreenStyles(colors)
  const { navigateToPairDetails } = usePairNavigation()

  const handlePairToggle = (pair: SupportedPair) => {
    setSelectedPairsToAdd((prev) =>
      prev.includes(pair) ? prev.filter((p) => p !== pair) : [...prev, pair]
    )
  }

  const handleAddPairs = async () => {
    setIsAdding(true)
    try {
      await addMultiplePairs(selectedPairsToAdd)
      successHaptic()
      setSelectedPairsToAdd([])
      setShowAddModal(false)
    } catch (error) {
      errorHaptic()
      Alert.alert('Error', (error as Error).message)
    } finally {
      setIsAdding(false)
    }
  }

  const handleAnimatedDelete = (itemId: string) => {
    setRemovingItems((prev) => new Set([...prev, itemId]))
  }

  const handleRemovalComplete = (itemId: string) => {
    setRemovingItems((prev) => {
      const newSet = new Set(prev)
      newSet.delete(itemId)
      return newSet
    })
    removePair(itemId)
  }

  const renderDragItem = ({
    item,
    drag,
    isActive
  }: RenderItemParams<WatchlistItemType>) => {
    if (!item) return null

    return (
      <ScaleDecorator>
        <AnimatedWatchlistItem
          item={item}
          index={items.findIndex((i) => i.id === item.id)}
          onToggleActive={() => {}} // Disabled for now
          onPress={navigateToPairDetails}
          onDelete={handleAnimatedDelete}
          onDrag={drag}
          isDragging={isActive}
          isRemoving={removingItems.has(item.id)}
          onRemovalComplete={handleRemovalComplete}
        />
      </ScaleDecorator>
    )
  }

  const availablePairs = getAvailableToAdd()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <WatchlistHeader
          onAddPress={() => setShowAddModal(true)}
          canAdd={availablePairs.length > 0}
        />

        <View style={{ flex: 1 }}>
          {!items.length ? (
            <EmptyState visible={items.length === 0} loading={loading} />
          ) : (
            <DraggableFlatList
              data={items}
              onDragEnd={({ data }) => reorderPairs(data)}
              keyExtractor={(item) => item?.id || `${Math.random()}`}
              renderItem={renderDragItem}
              style={{ height: '100%' }}
              extraData={[items, removingItems]}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshWatchlist}
                  tintColor={colors.buttonPrimary}
                  colors={[colors.buttonPrimary]}
                />
              }
            />
          )}
        </View>

        <AddPairModal
          visible={showAddModal}
          availablePairs={availablePairs}
          selectedPairs={selectedPairsToAdd}
          isAdding={isAdding}
          onClose={() => setShowAddModal(false)}
          onPairToggle={handlePairToggle}
          onAddPairs={handleAddPairs}
        />
      </View>
    </SafeAreaView>
  )
}
