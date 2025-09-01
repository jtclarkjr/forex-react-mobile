import { StyleSheet, Platform, Dimensions } from 'react-native'
import type { AppThemeColors } from './theme'

const { width } = Dimensions.get('window')
const isWeb = Platform.OS === 'web'
const isLargeScreen = width > 768

export const createWatchlistItemStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.cardBackground,
      marginHorizontal: isWeb && isLargeScreen ? 32 : 16,
      marginVertical: 4,
      borderRadius: 8,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 2,
      ...(isWeb &&
        isLargeScreen && {
          maxWidth: 800,
          alignSelf: 'center',
          width: '95%'
        })
    },
    dragging: {
      opacity: 0.8,
      transform: [{ scale: 1.05 }],
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 8
    },
    dragHandle: {
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      backgroundColor: colors.dragHandle
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: isWeb && isLargeScreen ? 24 : 16,
      minHeight: isWeb && isLargeScreen ? 100 : 80
    },
    pairSection: {
      flex: 0,
      flexBasis: isWeb && isLargeScreen ? 120 : 80,
      flexShrink: 0
    },
    pairText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textColor
    },
    inactiveText: {
      color: colors.inactiveText
    },
    inactiveLabel: {
      fontSize: 10,
      color: colors.textWarning,
      fontWeight: '500',
      marginTop: 2
    },
    rateSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      minWidth: 0
    },
    rateInfo: {
      alignItems: 'center',
      width: '100%'
    },
    priceText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.priceText,
      fontFamily: 'SpaceMono',
      textAlign: 'center'
    },
    bidAskRow: {
      flexDirection: 'row',
      marginTop: 2,
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 4
    },
    bidAskText: {
      fontSize: 10,
      color: colors.textSecondary,
      fontFamily: 'SpaceMono'
    },
    noDataText: {
      fontSize: 16,
      color: colors.textTertiary,
      textAlign: 'center'
    },
    errorText: {
      fontSize: 12,
      color: colors.textError,
      textAlign: 'center',
      fontStyle: 'italic'
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2
    },
    statusIndicator: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 4
    },
    statusText: {
      fontSize: 9,
      color: colors.textSecondary,
      fontWeight: '500'
    },
    controlsSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 0,
      flexBasis: 80,
      flexShrink: 0,
      justifyContent: 'flex-end'
    },
    reorderButtons: {
      flexDirection: 'column',
      gap: 2
    },
    reorderButton: {
      padding: 4,
      borderRadius: 12,
      backgroundColor: colors.buttonSecondary,
      minWidth: 24,
      alignItems: 'center'
    },
    disabledButton: {
      backgroundColor: colors.buttonDisabled
    },
    controlButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.buttonSecondary
    }
  })
