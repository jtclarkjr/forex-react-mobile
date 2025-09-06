import '@testing-library/react-native/dont-cleanup-after-each'
import React from 'react'
import { render } from '@testing-library/react-native'
import { LoadingState, ErrorState, NoDataState } from '../DataStates'

// Mock the dependencies
jest.mock('@/styles/theme', () => ({
  useAppTheme: jest.fn(() => ({
    colors: {
      buttonPrimary: '#007AFF',
      textError: '#FF0000',
      textTertiary: '#999999',
      background: '#FFFFFF',
      cardBackground: '#F5F5F5',
      textPrimary: '#000000',
      textSecondary: '#666666'
    }
  }))
}))

jest.mock('@/styles/pairDetails', () => ({
  createPairDetailsStyles: jest.fn(() => ({
    loadingContainer: {},
    loadingText: {},
    errorContainer: {},
    errorTitle: {},
    errorText: {},
    noDataContainer: {},
    noDataText: {}
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

jest.mock('@expo/vector-icons/FontAwesome', () => {
  const React = require('react')
  return React.forwardRef((props: unknown, ref: unknown) => 
    React.createElement('FontAwesome', { ...props, ref })
  )
})

describe('DataStates Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('LoadingState', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<LoadingState />)
      expect(getByText('Loading forex data...')).toBeTruthy()
    })

    it('should display loading text', () => {
      const { getByText } = render(<LoadingState />)
      expect(getByText('Loading forex data...')).toBeTruthy()
    })

    it('should render ActivityIndicator', () => {
      const { UNSAFE_getByType } = render(<LoadingState />)
      const indicator = UNSAFE_getByType('ActivityIndicator')
      expect(indicator).toBeTruthy()
    })

    it('should apply correct size to ActivityIndicator', () => {
      const { UNSAFE_getByType } = render(<LoadingState />)
      const indicator = UNSAFE_getByType('ActivityIndicator')
      expect(indicator.props.size).toBe('large')
    })

    it('should apply theme color to ActivityIndicator', () => {
      const { UNSAFE_getByType } = render(<LoadingState />)
      const indicator = UNSAFE_getByType('ActivityIndicator')
      expect(indicator.props.color).toBe('#007AFF')
    })

    it('should use styles from createPairDetailsStyles', () => {
      const mockCreateStyles = require('@/styles/pairDetails').createPairDetailsStyles
      render(<LoadingState />)
      expect(mockCreateStyles).toHaveBeenCalled()
    })

    it('should use colors from useAppTheme', () => {
      const mockUseAppTheme = require('@/styles/theme').useAppTheme
      render(<LoadingState />)
      expect(mockUseAppTheme).toHaveBeenCalled()
    })

    it('should render container View', () => {
      const { UNSAFE_getAllByType } = render(<LoadingState />)
      const views = UNSAFE_getAllByType('View')
      expect(views.length).toBeGreaterThan(0)
    })
  })

  describe('ErrorState', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<ErrorState />)
      expect(getByText('Unable to load data')).toBeTruthy()
    })

    it('should display error title', () => {
      const { getByText } = render(<ErrorState />)
      expect(getByText('Unable to load data')).toBeTruthy()
    })

    it('should display error description', () => {
      const { getByText } = render(<ErrorState />)
      expect(getByText('Please check your connection and try again')).toBeTruthy()
    })

    it('should render error icon', () => {
      const { UNSAFE_getByType } = render(<ErrorState />)
      const icon = UNSAFE_getByType('FontAwesome')
      expect(icon).toBeTruthy()
    })

    it('should apply correct icon properties', () => {
      const { UNSAFE_getByType } = render(<ErrorState />)
      const icon = UNSAFE_getByType('FontAwesome')
      expect(icon.props.name).toBe('exclamation-triangle')
      expect(icon.props.size).toBe(48)
      expect(icon.props.color).toBe('#FF0000')
    })

    it('should use error color from theme', () => {
      const mockUseAppTheme = require('@/styles/theme').useAppTheme
      mockUseAppTheme.mockReturnValueOnce({
        colors: {
          textError: '#CC0000'
        }
      })

      const { UNSAFE_getByType } = render(<ErrorState />)
      const icon = UNSAFE_getByType('FontAwesome')
      expect(icon.props.color).toBe('#CC0000')
    })

    it('should use styles from createPairDetailsStyles', () => {
      const mockCreateStyles = require('@/styles/pairDetails').createPairDetailsStyles
      render(<ErrorState />)
      expect(mockCreateStyles).toHaveBeenCalled()
    })

    it('should render container View', () => {
      const { UNSAFE_getAllByType } = render(<ErrorState />)
      const views = UNSAFE_getAllByType('View')
      expect(views.length).toBeGreaterThan(0)
    })

    it('should render all text elements', () => {
      const { UNSAFE_getAllByType } = render(<ErrorState />)
      const texts = UNSAFE_getAllByType('Text')
      // Should have title and description texts
      expect(texts.length).toBe(2)
    })
  })

  describe('NoDataState', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<NoDataState />)
      expect(getByText('No data available')).toBeTruthy()
    })

    it('should display no data message', () => {
      const { getByText } = render(<NoDataState />)
      expect(getByText('No data available')).toBeTruthy()
    })

    it('should render chart icon', () => {
      const { UNSAFE_getByType } = render(<NoDataState />)
      const icon = UNSAFE_getByType('FontAwesome')
      expect(icon).toBeTruthy()
    })

    it('should apply correct icon properties', () => {
      const { UNSAFE_getByType } = render(<NoDataState />)
      const icon = UNSAFE_getByType('FontAwesome')
      expect(icon.props.name).toBe('line-chart')
      expect(icon.props.size).toBe(48)
      expect(icon.props.color).toBe('#999999')
    })

    it('should use tertiary color from theme', () => {
      const mockUseAppTheme = require('@/styles/theme').useAppTheme
      mockUseAppTheme.mockReturnValueOnce({
        colors: {
          textTertiary: '#AAAAAA'
        }
      })

      const { UNSAFE_getByType } = render(<NoDataState />)
      const icon = UNSAFE_getByType('FontAwesome')
      expect(icon.props.color).toBe('#AAAAAA')
    })

    it('should use styles from createPairDetailsStyles', () => {
      const mockCreateStyles = require('@/styles/pairDetails').createPairDetailsStyles
      render(<NoDataState />)
      expect(mockCreateStyles).toHaveBeenCalled()
    })

    it('should render container View', () => {
      const { UNSAFE_getAllByType } = render(<NoDataState />)
      const views = UNSAFE_getAllByType('View')
      expect(views.length).toBeGreaterThan(0)
    })

    it('should render single text element', () => {
      const { UNSAFE_getAllByType } = render(<NoDataState />)
      const texts = UNSAFE_getAllByType('Text')
      // Should have only the "No data available" text
      expect(texts.length).toBe(1)
    })
  })

  describe('Integration Tests', () => {
    it('should render different states independently', () => {
      const loading = render(<LoadingState />)
      expect(loading.getByText('Loading forex data...')).toBeTruthy()

      const error = render(<ErrorState />)
      expect(error.getByText('Unable to load data')).toBeTruthy()

      const noData = render(<NoDataState />)
      expect(noData.getByText('No data available')).toBeTruthy()
    })

    it('should all use consistent theme', () => {
      const mockUseAppTheme = require('@/styles/theme').useAppTheme
      
      render(<LoadingState />)
      render(<ErrorState />)
      render(<NoDataState />)

      // Each component should call useAppTheme once
      expect(mockUseAppTheme).toHaveBeenCalledTimes(3)
    })

    it('should all use consistent styles', () => {
      const mockCreateStyles = require('@/styles/pairDetails').createPairDetailsStyles
      
      render(<LoadingState />)
      render(<ErrorState />)
      render(<NoDataState />)

      // Each component should call createPairDetailsStyles once
      expect(mockCreateStyles).toHaveBeenCalledTimes(3)
    })
  })

  describe('Accessibility', () => {
    it('LoadingState should have descriptive text for screen readers', () => {
      const { getByText } = render(<LoadingState />)
      const loadingText = getByText('Loading forex data...')
      expect(loadingText).toBeTruthy()
    })

    it('ErrorState should have descriptive text for screen readers', () => {
      const { getByText } = render(<ErrorState />)
      expect(getByText('Unable to load data')).toBeTruthy()
      expect(getByText('Please check your connection and try again')).toBeTruthy()
    })

    it('NoDataState should have descriptive text for screen readers', () => {
      const { getByText } = render(<NoDataState />)
      const noDataText = getByText('No data available')
      expect(noDataText).toBeTruthy()
    })
  })

  describe('Theme Changes', () => {
    it('should respond to theme color changes', () => {
      const mockUseAppTheme = require('@/styles/theme').useAppTheme
      
      // First render with default colors
      mockUseAppTheme.mockReturnValueOnce({
        colors: {
          buttonPrimary: '#007AFF',
          textError: '#FF0000',
          textTertiary: '#999999'
        }
      })
      
      const { rerender, UNSAFE_getByType } = render(<LoadingState />)
      let indicator = UNSAFE_getByType('ActivityIndicator')
      expect(indicator.props.color).toBe('#007AFF')
      
      // Re-render with different colors
      mockUseAppTheme.mockReturnValueOnce({
        colors: {
          buttonPrimary: '#00AA00'
        }
      })
      
      rerender(<LoadingState />)
      indicator = UNSAFE_getByType('ActivityIndicator')
      expect(indicator.props.color).toBe('#00AA00')
    })
  })
})
