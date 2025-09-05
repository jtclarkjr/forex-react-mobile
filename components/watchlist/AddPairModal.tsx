import React from 'react'
import {
  Modal,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native'
import { Text } from '@/components/common/Themed'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useAppTheme } from '@/styles/theme'
import { createMainScreenStyles } from '@/styles/mainScreen'
import type { SupportedPair } from '@/types/forex'
import { lightHaptic, errorHaptic } from '@/lib/utils/haptics'

interface AddPairModalProps {
  visible: boolean
  availablePairs: SupportedPair[]
  selectedPairs: SupportedPair[]
  isAdding: boolean
  onClose: () => void
  onPairToggle: (pair: SupportedPair) => void
  onAddPairs: () => Promise<void>
}

export default function AddPairModal({
  visible,
  availablePairs,
  selectedPairs,
  isAdding,
  onClose,
  onPairToggle,
  onAddPairs
}: AddPairModalProps) {
  const { colors } = useAppTheme()
  const styles = createMainScreenStyles(colors)

  const handlePairSelection = (pair: SupportedPair) => {
    lightHaptic()
    onPairToggle(pair)
  }

  const handleAdd = async () => {
    if (selectedPairs.length === 0) {
      errorHaptic()
      Alert.alert('Error', 'Please select at least one currency pair to add')
      return
    }
    await onAddPairs()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Currency Pair</Text>
          <TouchableOpacity
            onPress={handleAdd}
            style={styles.modalAddButton}
            disabled={selectedPairs.length === 0 || isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color={colors.buttonPrimary} />
            ) : (
              <Text style={styles.modalAddText}>
                Add
                {selectedPairs.length > 0 ? `(${selectedPairs.length})` : ''}
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
                const isSelected = selectedPairs.includes(pair)
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
  )
}
