import '@testing-library/react-native/dont-cleanup-after-each'
import React from 'react'
import { render } from '@testing-library/react-native'
import CurrencyInfo from '../CurrencyInfo'

// Mock the dependencies
jest.mock('@/styles/theme', () => ({
  useAppTheme: jest.fn(() => ({
    colors: {
      background: '#FFFFFF',
      cardBackground: '#F5F5F5',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999'
    }
  }))
}))

jest.mock('@/styles/pairDetails', () => ({
  createPairDetailsStyles: jest.fn(() => ({
    currencyInfoContainer: {},
    currencyCard: {},
    currencyLabel: {},
    currencyValue: {},
    currencyDescription: {}
  }))
}))

jest.mock('@/components/common/Themed', () => {
  const React = require('react')
  return {
    Text: React.forwardRef((props: unknown, ref: unknown) => 
      React.createElement('Text', { ...props, ref })
    )
  }
})

jest.mock('@/lib/utils', () => ({
  getCurrencyName: jest.fn((code: string) => {
    const names: Record<string, string> = {
      'USD': 'US Dollar',
      'EUR': 'Euro',
      'GBP': 'British Pound',
      'JPY': 'Japanese Yen',
      'AUD': 'Australian Dollar',
      'CAD': 'Canadian Dollar',
      'CHF': 'Swiss Franc',
      'CNY': 'Chinese Yuan'
    }
    return names[code] || code
  })
}))

describe('CurrencyInfo', () => {
  const defaultProps = {
    base: 'EUR',
    quote: 'USD'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    const { getByText } = render(<CurrencyInfo {...defaultProps} />)
    expect(getByText('Base Currency')).toBeTruthy()
    expect(getByText('Quote Currency')).toBeTruthy()
  })

  it('should display currency labels', () => {
    const { getByText } = render(<CurrencyInfo {...defaultProps} />)
    expect(getByText('Base Currency')).toBeTruthy()
    expect(getByText('Quote Currency')).toBeTruthy()
  })

  it('should display currency codes', () => {
    const { getByText } = render(<CurrencyInfo {...defaultProps} />)
    expect(getByText('EUR')).toBeTruthy()
    expect(getByText('USD')).toBeTruthy()
  })

  it('should display currency names using getCurrencyName', () => {
    const { getByText } = render(<CurrencyInfo {...defaultProps} />)
    expect(getByText('Euro')).toBeTruthy()
    expect(getByText('US Dollar')).toBeTruthy()
  })

  it('should call getCurrencyName with correct parameters', () => {
    const getCurrencyName = require('@/lib/utils').getCurrencyName
    render(<CurrencyInfo {...defaultProps} />)
    
    expect(getCurrencyName).toHaveBeenCalledWith('EUR')
    expect(getCurrencyName).toHaveBeenCalledWith('USD')
    expect(getCurrencyName).toHaveBeenCalledTimes(2)
  })

  it('should handle different currency pairs', () => {
    const pairs = [
      { base: 'GBP', quote: 'USD', baseName: 'British Pound', quoteName: 'US Dollar' },
      { base: 'USD', quote: 'JPY', baseName: 'US Dollar', quoteName: 'Japanese Yen' },
      { base: 'AUD', quote: 'CAD', baseName: 'Australian Dollar', quoteName: 'Canadian Dollar' },
      { base: 'EUR', quote: 'CHF', baseName: 'Euro', quoteName: 'Swiss Franc' }
    ]

    pairs.forEach(({ base, quote, baseName, quoteName }) => {
      const { getByText } = render(<CurrencyInfo base={base} quote={quote} />)
      expect(getByText(base)).toBeTruthy()
      expect(getByText(quote)).toBeTruthy()
      expect(getByText(baseName)).toBeTruthy()
      expect(getByText(quoteName)).toBeTruthy()
    })
  })

  it('should handle unknown currency codes', () => {
    const { getAllByText } = render(<CurrencyInfo base="XXX" quote="YYY" />)
    // For unknown codes, getCurrencyName returns the code itself
    // Each code appears twice (once as code, once as name)
    expect(getAllByText('XXX').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('YYY').length).toBeGreaterThanOrEqual(1)
  })

  it('should handle empty currency codes', () => {
    const { queryByText } = render(<CurrencyInfo base="" quote="" />)
    // Should still render labels
    expect(queryByText('Base Currency')).toBeTruthy()
    expect(queryByText('Quote Currency')).toBeTruthy()
  })

  it('should render two currency cards', () => {
    const { UNSAFE_getAllByType } = render(<CurrencyInfo {...defaultProps} />)
    const views = UNSAFE_getAllByType('View')
    
    // Should have container and two currency cards
    expect(views.length).toBeGreaterThanOrEqual(3)
  })

  it('should maintain proper structure for base currency', () => {
    const { getAllByText } = render(<CurrencyInfo {...defaultProps} />)
    const texts = getAllByText(/Base Currency|EUR|Euro/i)
    expect(texts.length).toBeGreaterThan(0)
  })

  it('should maintain proper structure for quote currency', () => {
    const { getAllByText } = render(<CurrencyInfo {...defaultProps} />)
    const texts = getAllByText(/Quote Currency|USD|US Dollar/i)
    expect(texts.length).toBeGreaterThan(0)
  })

  it('should use styles from createPairDetailsStyles', () => {
    const mockCreateStyles = require('@/styles/pairDetails').createPairDetailsStyles
    render(<CurrencyInfo {...defaultProps} />)
    expect(mockCreateStyles).toHaveBeenCalled()
  })

  it('should use colors from useAppTheme', () => {
    const mockUseAppTheme = require('@/styles/theme').useAppTheme
    render(<CurrencyInfo {...defaultProps} />)
    expect(mockUseAppTheme).toHaveBeenCalled()
  })

  it('should handle same base and quote currencies', () => {
    const { getAllByText } = render(<CurrencyInfo base="USD" quote="USD" />)
    const usdTexts = getAllByText('USD')
    // Should display USD twice (once for base, once for quote)
    expect(usdTexts.length).toBe(2)
    
    const dollarTexts = getAllByText('US Dollar')
    expect(dollarTexts.length).toBe(2)
  })

  it('should handle currency code case sensitivity', () => {
    const getCurrencyName = require('@/lib/utils').getCurrencyName
    getCurrencyName.mockImplementation((code: string) => {
      if (code === 'eur') return 'Euro (lowercase)'
      if (code === 'EUR') return 'Euro'
      return code
    })

    const { getByText } = render(<CurrencyInfo base="EUR" quote="eur" />)
    expect(getByText('Euro')).toBeTruthy()
    expect(getByText('Euro (lowercase)')).toBeTruthy()
  })

  it('should handle special currency codes', () => {
    const specialCodes = [
      { base: 'XAU', quote: 'USD' }, // Gold
      { base: 'BTC', quote: 'USD' }, // Bitcoin
      { base: 'EUR', quote: 'XXX' }  // Unknown
    ]

    specialCodes.forEach(({ base, quote }) => {
      const { getAllByText } = render(<CurrencyInfo base={base} quote={quote} />)
      expect(getAllByText(base).length).toBeGreaterThanOrEqual(1)
      expect(getAllByText(quote).length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should handle numeric-like currency codes', () => {
    const { getAllByText } = render(<CurrencyInfo base="123" quote="456" />)
    expect(getAllByText('123').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('456').length).toBeGreaterThanOrEqual(1)
  })

  it('should re-render when props change', () => {
    const { rerender, getByText, getAllByText } = render(<CurrencyInfo base="EUR" quote="USD" />)
    expect(getByText('EUR')).toBeTruthy()
    expect(getAllByText('USD').length).toBeGreaterThanOrEqual(1)

    rerender(<CurrencyInfo base="GBP" quote="JPY" />)
    expect(getAllByText('GBP').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('JPY').length).toBeGreaterThanOrEqual(1)
  })

  it('should handle long currency names gracefully', () => {
    const getCurrencyName = require('@/lib/utils').getCurrencyName
    getCurrencyName.mockImplementation((code: string) => {
      if (code === 'TEST') return 'This is a very long currency name that might cause layout issues'
      return code
    })

    const { getByText } = render(<CurrencyInfo base="TEST" quote="USD" />)
    expect(getByText('This is a very long currency name that might cause layout issues')).toBeTruthy()
  })
})
