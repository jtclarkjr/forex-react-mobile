import { useThemeColor } from '@/components/common/Themed'
import { useColorScheme } from '@/hooks/ui/useColorScheme'

export interface AppThemeColors {
  // Core theme colors
  background: string
  screenBackground: string
  cardBackground: string
  cardShadow: string
  headerBackground: string
  headerText: string
  textColor: string
  textSecondary: string
  textTertiary: string
  border: string

  // Semantic colors
  textError: string
  textSuccess: string
  textWarning: string
  priceText: string
  inactiveText: string

  // Button colors
  buttonPrimary: string
  buttonSecondary: string
  buttonDisabled: string

  // Component specific
  dragHandle: string

  // Status colors
  statusConnected: string
  statusConnecting: string
  statusDisconnected: string
  statusDefault: string
}

/**
 * Custom hook to get all app theme colors
 */
export const useAppTheme = () => {
  const colorScheme = useColorScheme()

  const colors: AppThemeColors = {
    // Core theme colors
    background: useThemeColor({}, 'background'),
    screenBackground: useThemeColor({}, 'screenBackground'),
    cardBackground: useThemeColor({}, 'cardBackground'),
    cardShadow: useThemeColor({}, 'cardShadow'),
    headerBackground: useThemeColor({}, 'headerBackground'),
    headerText: useThemeColor({}, 'headerText'),
    textColor: useThemeColor({}, 'text'),
    textSecondary: useThemeColor({}, 'textSecondary'),
    textTertiary: useThemeColor({}, 'textTertiary'),
    border: useThemeColor({}, 'border'),

    // Semantic colors
    textError: useThemeColor({}, 'textError'),
    textSuccess: useThemeColor({}, 'textSuccess'),
    textWarning: useThemeColor({}, 'textWarning'),
    priceText: useThemeColor({}, 'priceText'),
    inactiveText: useThemeColor({}, 'inactiveText'),

    // Button colors
    buttonPrimary: useThemeColor({}, 'buttonPrimary'),
    buttonSecondary: useThemeColor({}, 'buttonSecondary'),
    buttonDisabled: useThemeColor({}, 'buttonDisabled'),

    // Component specific
    dragHandle: useThemeColor({}, 'dragHandle'),

    // Status colors
    statusConnected: useThemeColor({}, 'statusConnected'),
    statusConnecting: useThemeColor({}, 'statusConnecting'),
    statusDisconnected: useThemeColor({}, 'statusDisconnected'),
    statusDefault: useThemeColor({}, 'statusDefault')
  }

  return { colorScheme, colors }
}
