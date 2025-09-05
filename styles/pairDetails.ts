import { StyleSheet } from 'react-native'
import type { AppThemeColors } from './theme'

export const createPairDetailsStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.screenBackground
    },
    header: {
      backgroundColor: colors.headerBackground,
      paddingTop: 30,
      paddingBottom: 20,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    pairTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.headerText,
      marginBottom: 4
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6
    },
    statusText: {
      fontSize: 14,
      color: colors.headerText,
      fontWeight: '500'
    },
    content: {
      flex: 1,
      padding: 20
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
      paddingHorizontal: 40
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textError,
      marginTop: 16,
      marginBottom: 8
    },
    errorText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center'
    },
    priceCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      marginBottom: 16,
      alignItems: 'center',
      elevation: 3,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: colors.border
    },
    currentPriceLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 8
    },
    currentPrice: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.priceText,
      fontFamily: 'SpaceMono',
      marginBottom: 8
    },
    lastUpdated: {
      fontSize: 14,
      color: colors.textTertiary
    },
    bidAskCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      elevation: 3,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: colors.border
    },
    bidAskRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20
    },
    bidContainer: {
      alignItems: 'center',
      flex: 1
    },
    askContainer: {
      alignItems: 'center',
      flex: 1
    },
    bidAskLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      fontWeight: '500'
    },
    bidAskValue: {
      fontSize: 20,
      fontWeight: 'bold',
      fontFamily: 'SpaceMono'
    },
    spreadContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 16,
      alignItems: 'center'
    },
    spreadLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4
    },
    spreadValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textSecondary,
      fontFamily: 'SpaceMono'
    },
    currencyInfoContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16
    },
    currencyCard: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      elevation: 3,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: colors.border
    },
    currencyLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      fontWeight: '500'
    },
    currencyValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textColor,
      marginBottom: 4
    },
    currencyDescription: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: 'center'
    },
    technicalCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      elevation: 3,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: colors.border
    },
    technicalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textColor,
      marginBottom: 16
    },
    technicalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    technicalLabel: {
      fontSize: 16,
      color: colors.textSecondary
    },
    technicalValue: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textColor
    },
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100
    },
    noDataText: {
      fontSize: 18,
      color: colors.textTertiary,
      marginTop: 16
    }
  })
