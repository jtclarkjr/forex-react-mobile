import React, { useState } from 'react'
import {
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar
} from 'react-native'
import { Text } from '@/components/common/Themed'
import { useAppTheme } from '@/styles/theme'
import { createMainScreenStyles } from '@/styles/mainScreen'
import SwipeableWatchlistItem from '@/components/watchlist/SwipeableWatchlistItem'
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams
} from 'react-native-draggable-flatlist'
import useWatchlist from '@/hooks/useWatchlist'
import type { WatchlistItem as WatchlistItemType } from '@/types/forex'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router } from 'expo-router'

export default function WatchlistScreen() {
  const {
    watchlistState,
    loading,
    addMultiplePairs,
    removePair,
    reorderPairs,
    getAvailableToAdd
  } = useWatchlist()

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPairsToAdd, setSelectedPairsToAdd] = useState<string[]>([])
  const [isAdding, setIsAdding] = useState(false)

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

  const handlePairSelection = (pair: string) => {
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
      Alert.alert('Error', 'Please select at least one currency pair to add')
      return
    }

    setIsAdding(true)
    try {
      // Add all selected pairs at once using the new bulk add function
      await addMultiplePairs(selectedPairsToAdd)

      // Clear selection and close modal
      setSelectedPairsToAdd([])
      setShowAddModal(false)
      // No success alert - just close modal
    } catch (error) {
      Alert.alert('Error', (error as Error).message)
    } finally {
      setIsAdding(false)
    }
  }


  const handleDelete = (itemId: string) => {
    Alert.alert(
      'Remove Pair',
      'Are you sure you want to remove this pair from your watchlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removePair(itemId)
        }
      ]
    )
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
        <SwipeableWatchlistItem
          item={item}
          index={watchlistState.items.findIndex((i) => i.id === item.id)}
          onToggleActive={() => {}} // Disabled for now
          onPress={handleItemPress}
          onDelete={handleDelete}
          onDrag={drag}
          isDragging={isActive}
        />
      </ScaleDecorator>
    )
  }

  const availablePairs = getAvailableToAdd()

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.screenBackground}
        />
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
        <Text style={styles.loadingText}>Loading watchlist...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screenBackground}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Forex Watchlist</Text>
        {/* <Text style={styles.subtitle}>
          {watchlistState.items.length} pairs • Tap to view • Hold & drag to
          reorder • Swipe to delete
        </Text> */}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.addButton,
            availablePairs.length === 0 && styles.addButtonDisabled
          ]}
          onPress={handleOpenModal}
          disabled={availablePairs.length === 0}
        >
          <FontAwesome 
            name="plus" 
            size={16} 
            color={availablePairs.length === 0 ? colors.inactiveText : "#FFFFFF"} 
          />
          <Text style={[
            styles.addButtonText,
            availablePairs.length === 0 && styles.addButtonTextDisabled
          ]}>
            Add Pair
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {watchlistState.items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="list" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No pairs in watchlist</Text>
            <Text style={styles.emptySubtext}>
              Tap "Add Pair" to get started
            </Text>
          </View>
        ) : (
          <DraggableFlatList
            data={watchlistState.items}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item?.id || `${Math.random()}`}
            renderItem={renderDragItem}
            contentContainerStyle={styles.listContent}
            extraData={watchlistState.items}
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
                <ActivityIndicator size="small" color={colors.buttonPrimary} />
              ) : (
                <Text style={styles.modalAddText}>
                  Add{' '}
                  {selectedPairsToAdd.length > 0
                    ? `(${selectedPairsToAdd.length})`
                    : ''}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Select currency pairs to add:</Text>

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
  )
}
