import { StyleSheet, Platform, Dimensions } from 'react-native'
import type { AppThemeColors } from './theme'

const { width } = Dimensions.get('window')
const isWeb = Platform.OS === 'web'
const isLargeScreen = width > 768

export const createMainScreenStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.screenBackground,
      paddingTop: Platform.OS === 'ios' ? 50 : 25,
      ...(isWeb &&
        isLargeScreen && {
          maxWidth: 1200,
          alignSelf: 'center',
          width: '100%'
        })
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.screenBackground,
      paddingTop: Platform.OS === 'ios' ? 50 : 25
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary
    },
    header: {
      padding: 20,
      paddingTop: 10,
      alignItems: 'center',
      backgroundColor: 'transparent'
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.textColor,
      marginBottom: 8
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22
    },
    actions: {
      paddingHorizontal: 16,
      paddingBottom: 16
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.buttonPrimary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 8,
      elevation: 3,
      shadowColor: colors.buttonPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600'
    },
    addButtonDisabled: {
      backgroundColor: colors.buttonDisabled,
      elevation: 0,
      shadowOpacity: 0
    },
    addButtonTextDisabled: {
      color: colors.inactiveText
    },
    listContainer: {
      flex: 1
    },
    listContent: {
      paddingBottom: 20
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingTop: 60
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 16
    },
    emptySubtext: {
      fontSize: 16,
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: 8
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.cardBackground
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingTop: Platform.OS === 'ios' ? 60 : 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    modalCloseButton: {
      paddingVertical: 8,
      paddingHorizontal: 4
    },
    modalCloseText: {
      fontSize: 16,
      color: colors.buttonPrimary
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textColor
    },
    modalAddButton: {
      paddingVertical: 8,
      paddingHorizontal: 4
    },
    modalAddText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.buttonPrimary
    },
    modalContent: {
      flex: 1,
      padding: 20
    },
    modalLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textColor,
      marginBottom: 16
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.cardBackground
    },
    picker: {
      height: 50,
      color: colors.textColor
    },
    noAvailableContainer: {
      padding: 20,
      alignItems: 'center'
    },
    noAvailableText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center'
    },
    pairListContainer: {
      marginTop: 8
    },
    pairOption: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      marginBottom: 8,
      padding: 16,
      elevation: 1,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2
    },
    pairOptionSelected: {
      borderColor: colors.buttonPrimary,
      backgroundColor: colors.buttonPrimary + '10' // 10% opacity
    },
    pairOptionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    pairOptionText: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.textColor
    },
    pairOptionTextSelected: {
      color: colors.buttonPrimary,
      fontWeight: '600'
    }
  })
