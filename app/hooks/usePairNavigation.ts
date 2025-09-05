import { router } from 'expo-router'
import type { WatchlistItem } from '@/types/forex'

export function usePairNavigation() {
  const navigateToPairDetails = (item: WatchlistItem) => {
    if (!item.isActive) return

    let base: string, quote: string

    if (item.pair) {
      // Use pair object if available
      base = item.pair.base
      quote = item.pair.quote
    } else if (item.pairString) {
      // Fallback: parse from pairString
      const parts = item.pairString.split('/')
      if (parts.length !== 2) return
      base = parts[0]
      quote = parts[1]
    } else {
      return
    }

    router.push({
      pathname: '/pair-details',
      params: {
        base,
        quote,
        pairString: item.pairString
      }
    })
  }

  return { navigateToPairDetails }
}
