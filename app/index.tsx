import React, { useState } from 'react'
import {
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  SafeAreaView,
  RefreshControl
} from 'react-native'
import { Text } from '@/components/common/Themed'
import { useAppTheme } from '@/styles/theme'
import { createMainScreenStyles } from '@/styles/mainScreen'
import AnimatedWatchlistItem from '@/components/watchlist/AnimatedWatchlistItem'
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams
} from 'react-native-draggable-flatlist'
import useWatchlist from '@/hooks/useWatchlist'
import type {
  SupportedPair,
  WatchlistItem as WatchlistItemType
} from '@/types/forex'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router } from 'expo-router'
import { successHaptic, errorHaptic, lightHaptic } from '@/lib/utils/haptics'
import Animated from 'react-native-reanimated'
import { useEmptyStateAnimation } from '@/hooks/useEmptyStateAnimation'

export default function WatchlistScreen() {
  const {
    watchlistState,
    loading,
    refreshing,
    addMultiplePairs,
    removePair,
    reorderPairs,
    getAvailableToAdd,
    refreshWatchlistData
  } = useWatchlist()

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPairsToAdd, setSelectedPairsToAdd] = useState<SupportedPair[]>(
    []
  )
  const [isAdding, setIsAdding] = useState(false)
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  // Use custom hook for empty state animation
  const animatedEmptyStyle = useEmptyStateAnimation(
    watchlistState.items.length === 0,
    loading
  )

  const handleOpenModal = () => {
    setSelectedPairsToAdd([])
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setSelectedPairsToAdd([])
    setShowAddModal(false)
  }

  // Theme
  const { colorScheme, colors } = useAppTheme()
  const styles = createMainScreenStyles(colors)

  const handleItemPress = (item: WatchlistItemType) => {
    if (item.isActive && item.pair) {
      // Navigate to pair details modal
      router.push({
        pathname: '/pair-details',
        params: {
          base: item.pair.base,
          quote: item.pair.quote,
          pairString: item.pairString
        }
      })
    } else if (item.isActive && item.pairString) {
      // Fallback: parse from pairString if pair is missing
      const [base, quote] = item.pairString.split('/')
      router.push({
        pathname: '/pair-details',
        params: {
          base,
          quote,
          pairString: item.pairString
        }
      })
    }
  }

  const handlePairSelection = (pair: SupportedPair) => {
    lightHaptic() // Light haptic feedback for selection/deselection
    setSelectedPairsToAdd((prev) => {
      if (prev.includes(pair)) {
        return prev.filter((p) => p !== pair)
      } else {
        return [...prev, pair]
      }
    })
  }

  const handleAddPairs = async () => {
    if (selectedPairsToAdd.length === 0) {
      errorHaptic() // Error haptic for validation failure
      Alert.alert('Error', 'Please select at least one currency pair to add')
      return
    }

    setIsAdding(true)
    try {
      // Add all selected pairs at once using the new bulk add function
      await addMultiplePairs(selectedPairsToAdd)

      successHaptic() // Success haptic when pairs are added successfully
      // Clear selection and close modal
      setSelectedPairsToAdd([])
      setShowAddModal(false)
      // No success alert - just close modal
    } catch (error) {
      errorHaptic() // Error haptic for failed addition
      Alert.alert('Error', (error as Error).message)
    } finally {
      setIsAdding(false)
    }
  }

  const handleAnimatedDelete = (itemId: string) => {
    // Start the removal animation
    setRemovingItems((prev) => new Set([...prev, itemId]))
  }

  const handleRemovalComplete = (itemId: string) => {
    // Remove from removing set and actually delete from watchlist
    setRemovingItems((prev) => {
      const newSet = new Set(prev)
      newSet.delete(itemId)
      return newSet
    })
    removePair(itemId)
  }

  const handleDelete = (itemId: string) => {
    // Immediate delete: trigger haptic and start animated removal without confirmation
    handleAnimatedDelete(itemId)
  }

  const handleDragEnd = ({ data }: { data: WatchlistItemType[] }) => {
    reorderPairs(data)
  }

  const renderDragItem = ({
    item,
    drag,
    isActive
  }: RenderItemParams<WatchlistItemType>) => {
    if (!item) {
      return null
    }

    return (
      <ScaleDecorator>
        <AnimatedWatchlistItem
          item={item}
          index={watchlistState.items.findIndex((i) => i.id === item.id)}
          onToggleActive={() => {}} // Disabled for now
          onPress={handleItemPress}
          onDelete={handleDelete}
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
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <StatusBar
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={colors.screenBackground}
          />
          <ActivityIndicator size="large" color={colors.buttonPrimary} />
          <Text style={styles.loadingText}>Loading watchlist...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.screenBackground}
        />

        <View style={styles.header}>
          <Text style={styles.title}>Forex Watchlist</Text>
        </View>

        <View style={styles.toolbar}>
          <View style={styles.toolbarLeading}>
            {/* Left side of toolbar - empty for now */}
          </View>

          <View style={styles.toolbarTitle}>
            {/* Center of toolbar - could put title here if needed */}
          </View>

          <View style={styles.toolbarTrailing}>
            <TouchableOpacity
              onPress={handleOpenModal}
              disabled={availablePairs.length === 0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text
                style={[
                  styles.toolbarAction,
                  availablePairs.length === 0 && styles.toolbarActionDisabled
                ]}
              >
                + Add Pair
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          {!watchlistState.items.length ? (
            <Animated.View style={[styles.emptyContainer, animatedEmptyStyle]}>
              <FontAwesome name="list" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No pairs in watchlist</Text>
              <Text style={styles.emptySubtext}>
                Tap "Add Pair" to get started
              </Text>
            </Animated.View>
          ) : (
            <DraggableFlatList
              data={watchlistState.items}
              onDragEnd={handleDragEnd}
              keyExtractor={(item) => item?.id || `${Math.random()}`}
              renderItem={renderDragItem}
              style={{ height: '100%' }}
              extraData={[watchlistState.items, removingItems]}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshWatchlistData}
                  tintColor={colors.buttonPrimary}
                  colors={[colors.buttonPrimary]}
                />
              }
            />
          )}
        </View>

        {/* Add Pair Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Currency Pair</Text>
              <TouchableOpacity
                onPress={handleAddPairs}
                style={styles.modalAddButton}
                disabled={selectedPairsToAdd.length === 0 || isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.buttonPrimary}
                  />
                ) : (
                  <Text style={styles.modalAddText}>
                    Add
                    {selectedPairsToAdd.length > 0
                      ? `(${selectedPairsToAdd.length})`
                      : ''}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalLabel}>
                Select currency pairs to add:
              </Text>

              {availablePairs.length === 0 ? (
                <View style={styles.noAvailableContainer}>
                  <Text style={styles.noAvailableText}>
                    All available pairs are already in your watchlist
                  </Text>
                </View>
              ) : (
                <View style={styles.pairListContainer}>
                  {availablePairs.map((pair) => {
                    const isSelected = selectedPairsToAdd.includes(pair)
                    return (
                      <TouchableOpacity
                        key={pair}
                        style={[
                          styles.pairOption,
                          isSelected && styles.pairOptionSelected
                        ]}
                        onPress={() => handlePairSelection(pair)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.pairOptionContent}>
                          <Text
                            style={[
                              styles.pairOptionText,
                              isSelected && styles.pairOptionTextSelected
                            ]}
                          >
                            {pair}
                          </Text>
                          {isSelected && (
                            <FontAwesome
                              name="check"
                              size={18}
                              color={colors.buttonPrimary}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}
