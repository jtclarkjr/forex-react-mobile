import { StyleSheet } from 'react-native'
import { AppThemeColors } from './theme'

export const createSwipeableWatchlistItemStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    rightActionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      backgroundColor: 'transparent',
      width: 96, // 80 + 16 (right margin)
      paddingRight: 16
    },
    deleteAction: {
      backgroundColor: colors.textError,
      justifyContent: 'center',
      alignItems: 'center',
      width: 96,
      height: '100%',
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8
    },
    deleteButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%'
    },
    deleteText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4
    }
  })
