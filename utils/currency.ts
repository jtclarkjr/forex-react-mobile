/**
 * Currency utility functions
 */

/**
 * Get the full currency name from a currency code
 * @param code Currency code (e.g., 'USD', 'EUR')
 * @returns Full currency name (e.g., 'US Dollar', 'Euro')
 */
export const getCurrencyName = (code: string): string => {
  const currencyNames: Record<string, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    JPY: 'Japanese Yen',
    GBP: 'British Pound',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    NZD: 'New Zealand Dollar',
    SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone',
    DKK: 'Danish Krone',
    PLN: 'Polish Zloty',
    CZK: 'Czech Koruna',
    HUF: 'Hungarian Forint',
    TRY: 'Turkish Lira',
    ZAR: 'South African Rand',
    MXN: 'Mexican Peso',
    SGD: 'Singapore Dollar',
    HKD: 'Hong Kong Dollar'
  }
  return currencyNames[code] || code
}

/**
 * Get currency symbol from currency code
 * @param code Currency code (e.g., 'USD', 'EUR')
 * @returns Currency symbol (e.g., '$', '€')
 */
export const getCurrencySymbol = (code: string): string => {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    JPY: '¥',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    NZD: 'NZ$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    TRY: '₺',
    ZAR: 'R',
    MXN: '$',
    SGD: 'S$',
    HKD: 'HK$'
  }
  return currencySymbols[code] || code
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
  currency?: string,
  decimals?: number
): string => {
  // Auto-detect decimal places based on currency if not specified
  if (decimals === undefined) {
    if (currency === 'JPY' || currency === 'KRW') {
      decimals = 0 // Yen and Won typically don't use decimal places
    } else {
      decimals = 5 // Default for forex pairs
    }
  }

  return price.toFixed(decimals)
}
