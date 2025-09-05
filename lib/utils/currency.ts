import { CURRENCY_NAMES, CURRENCY_SYMBOLS } from '@/constants/Forex'
import { SupportedCurrency } from '@/lib/types/forex'

/**
 * Get the full currency name from a currency code
 * @param code Currency code (e.g., 'USD', 'EUR')
 * @returns Full currency name (e.g., 'US Dollar', 'Euro')
 */
export const getCurrencyName = (code: string): string => {
  return CURRENCY_NAMES[code] || code
}

/**
 * Get currency symbol from currency code
 * @param code Currency code (e.g., 'USD', 'EUR')
 * @returns Currency symbol (e.g., '$', '€')
 */
export const getCurrencySymbol = (code: string): string => {
  return CURRENCY_SYMBOLS[code] || code
}

/**
 * Format a price value with appropriate decimal places for the currency
 * @param price Price value
 * @param currency Currency code
 * @param decimals Optional number of decimal places (default: auto-detect)
 * @returns Formatted price string
 */
export const formatPrice = (
  price: number,
  currency?: SupportedCurrency,
  decimals?: number
): string => {
  // Auto-detect decimal places based on currency if not specified
  if (decimals === undefined) {
    if (currency === 'JPY') {
      decimals = 0 // Yen typically don't use decimal places
    } else {
      decimals = 5 // Default for forex pairs
    }
  }

  return price.toFixed(decimals)
}
