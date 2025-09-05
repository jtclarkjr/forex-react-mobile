import { useCallback } from 'react'

export function useFormatters() {
  const formatPrice = useCallback((price: number, decimals = 5) => {
    return price.toFixed(decimals)
  }, [])

  const formatTimestamp = useCallback((timeStamp: string) => {
    return new Date(timeStamp).toLocaleTimeString()
  }, [])

  const formatSpread = useCallback((bid: number, ask: number, decimals = 5) => {
    return (ask - bid).toFixed(decimals)
  }, [])

  return {
    formatPrice,
    formatTimestamp,
    formatSpread
  }
}
