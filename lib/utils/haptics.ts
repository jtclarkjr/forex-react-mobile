import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

/**
 * Haptic feedback utility for consistent tactile responses across the app
 * Provides different feedback types for various user interactions
 */

/**
 * Helper function to execute haptic feedback only on mobile platforms
 */
const executeHaptic = (hapticFunction: () => void) => {
  if (Platform.OS !== 'web') {
    hapticFunction()
  }
}

/**
 * Light tactile feedback for subtle interactions
 * Use for: Selection, toggle states, minor interactions
 */
export const lightHaptic = () => {
  executeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light))
}

/**
 * Medium tactile feedback for standard interactions
 * Use for: Button presses, swipe actions, moderate interactions
 */
export const mediumHaptic = () => {
  executeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium))
}

/**
 * Heavy tactile feedback for significant interactions
 * Use for: Drag start, important confirmations, major actions
 */
export const heavyHaptic = () => {
  executeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy))
}

/**
 * Success feedback for positive outcomes
 * Use for: Successful additions, completed actions, positive confirmations
 */
export const successHaptic = () => {
  executeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
}

/**
 * Error feedback for negative outcomes
 * Use for: Errors, failed actions, validation failures, deletions
 */
export const errorHaptic = () => {
  executeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error))
}

/**
 * Warning feedback for cautionary actions
 * Use for: Warnings, potential issues, confirmations needed
 */
export const warningHaptic = () => {
  executeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning))
}

/**
 * Selection changed feedback for UI selections
 * Use for: Selection changes, picker changes, option toggles
 */
export const selectionHaptic = () => {
  executeHaptic(() => Haptics.selectionAsync())
}
