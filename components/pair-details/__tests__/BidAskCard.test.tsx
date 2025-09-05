import '@testing-library/react-native/dont-cleanup-after-each'
import React from 'react'
import { render } from '@testing-library/react-native'
import BidAskCard from '../BidAskCard'

// Mock the dependencies
jest.mock('@/styles/theme', () => ({
  useAppTheme: jest.fn(() => ({
    colors: {
      textError: '#FF0000',
      textSuccess: '#00FF00',
      background: '#FFFFFF',
      cardBackground: '#F5F5F5',
      textPrimary: '#000000',
      textSecondary: '#666666'
    }
  }))
}))

jest.mock('@/styles/pairDetails', () => ({
  createPairDetailsStyles: jest.fn(() => ({
    bidAskCard: {},
    bidAskRow: {},
    bidContainer: {},
    askContainer: {},
    bidAskLabel: {},
    bidAskValue: {},
    spreadContainer: {},
    spreadLabel: {},
    spreadValue: {}
  }))
}))

jest.mock('@/hooks/useFormatters', () => ({
  useFormatters: jest.fn(() => ({
    formatPrice: jest.fn((price: number) => price.toFixed(5)),
    formatSpread: jest.fn((bid: number, ask: number) => (ask - bid).toFixed(5))
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

describe('BidAskCard', () => {
  const defaultProps = {
    bid: 1.23456,
    ask: 1.23466
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    const { getByText } = render(<BidAskCard {...defaultProps} />)
    expect(getByText('Bid')).toBeTruthy()
    expect(getByText('Ask')).toBeTruthy()
  })

  it('should display bid and ask labels', () => {
    const { getByText } = render(<BidAskCard {...defaultProps} />)
    expect(getByText('Bid')).toBeTruthy()
    expect(getByText('Ask')).toBeTruthy()
    expect(getByText('Spread')).toBeTruthy()
  })

  it('should format and display bid price correctly', () => {
    const { getByText } = render(<BidAskCard {...defaultProps} />)
    expect(getByText('1.23456')).toBeTruthy()
  })

  it('should format and display ask price correctly', () => {
    const { getByText } = render(<BidAskCard {...defaultProps} />)
    expect(getByText('1.23466')).toBeTruthy()
  })

  it('should calculate and display spread correctly', () => {
    const { getByText } = render(<BidAskCard {...defaultProps} />)
    const expectedSpread = (defaultProps.ask - defaultProps.bid).toFixed(5)
    expect(getByText(expectedSpread)).toBeTruthy()
  })

  it('should handle zero values', () => {
    const { getAllByText } = render(<BidAskCard bid={0} ask={0} />)
    // Should show 0.00000 for both bid, ask, and spread
    const zeros = getAllByText('0.00000')
    expect(zeros.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle negative spread (inverted bid/ask)', () => {
    const { getByText } = render(<BidAskCard bid={1.5} ask={1.4} />)
    expect(getByText('-0.10000')).toBeTruthy()
  })

  it('should handle very large numbers', () => {
    const { getAllByText, getByText } = render(<BidAskCard bid={999999.99999} ask={999999.99999} />)
    // Should show the same value for both bid and ask
    const largeNumbers = getAllByText('999999.99999')
    expect(largeNumbers.length).toBe(2)
    // Spread should be 0
    expect(getByText('0.00000')).toBeTruthy()
  })

  it('should apply correct color styles for bid (red)', () => {
    const { UNSAFE_getByProps } = render(<BidAskCard {...defaultProps} />)
    const bidValue = UNSAFE_getByProps({ children: '1.23456' })
    expect(bidValue.props.style).toContainEqual({ color: '#FF0000' })
  })

  it('should apply correct color styles for ask (green)', () => {
    const { UNSAFE_getByProps } = render(<BidAskCard {...defaultProps} />)
    const askValue = UNSAFE_getByProps({ children: '1.23466' })
    expect(askValue.props.style).toContainEqual({ color: '#00FF00' })
  })

  it('should use formatters from useFormatters hook', () => {
    const mockFormatPrice = jest.fn((price: number) => `$${price}`)
    const mockFormatSpread = jest.fn((bid: number, ask: number) => `Spread: ${ask - bid}`)
    
    const useFormatters = require('@/hooks/useFormatters').useFormatters
    useFormatters.mockReturnValueOnce({
      formatPrice: mockFormatPrice,
      formatSpread: mockFormatSpread
    })

    render(<BidAskCard {...defaultProps} />)
    
    expect(mockFormatPrice).toHaveBeenCalledWith(defaultProps.bid)
    expect(mockFormatPrice).toHaveBeenCalledWith(defaultProps.ask)
    expect(mockFormatSpread).toHaveBeenCalledWith(defaultProps.bid, defaultProps.ask)
  })

  it('should handle decimal precision correctly', () => {
    const props = {
      bid: 1.234567890,
      ask: 1.234667890
    }
    const { getByText } = render(<BidAskCard {...props} />)
    
    // Should be formatted to 5 decimal places
    expect(getByText('1.23457')).toBeTruthy()
    expect(getByText('1.23467')).toBeTruthy()
  })
})
