import { StyleSheet, Platform } from 'react-native'
import type { AppThemeColors } from './theme'

export const createMainScreenStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.screenBackground,
      height: '100%'
    },
    container: {
      flex: 1,
      backgroundColor: colors.screenBackground
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.screenBackground
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary
    },
    header: {
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
    toolbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 8
    },
    toolbarLeading: {
      flex: 1,
      alignItems: 'flex-start'
    },
    toolbarTitle: {
      flex: 2,
      alignItems: 'center'
    },
    toolbarTrailing: {
      flex: 1,
      alignItems: 'flex-end'
    },
    toolbarAction: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.buttonPrimary
    },
    toolbarActionDisabled: {
      color: colors.inactiveText
    },
    emptyContainer: {
      justifyContent: 'center',
      alignItems: 'center'
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
