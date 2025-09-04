import { renderHook } from '@testing-library/react-native'
import { useClientOnlyValue } from '@/hooks/useClientOnlyValue'
import { useColorScheme } from '@/hooks/useColorScheme'

// Mock react-native's useColorScheme
jest.mock('react-native', () => ({
  useColorScheme: jest.fn()
}))

describe('Utility Hooks', () => {
  describe('useClientOnlyValue', () => {
    it('should return client value on React Native', () => {
      const serverValue = 'server-value'
      const clientValue = 'client-value'

      const { result } = renderHook(() =>
        useClientOnlyValue(serverValue, clientValue)
      )

      // On React Native, should always return client value
      expect(result.current).toBe(clientValue)
    })

    it('should work with different data types', () => {
      const testCases = [
        { server: 'string-server', client: 'string-client' },
        { server: 42, client: 100 },
        { server: true, client: false },
        { server: null, client: undefined },
        { server: { server: true }, client: { client: true } },
        { server: ['server'], client: ['client'] }
      ]

      testCases.forEach(({ server, client }) => {
        const { result } = renderHook(() => useClientOnlyValue(server, client))
        expect(result.current).toBe(client)
      })
    })

    it('should handle complex objects and arrays', () => {
      const serverObject = {
        theme: 'light',
        features: ['feature1', 'feature2']
      }
      const clientObject = {
        theme: 'dark',
        features: ['feature3', 'feature4']
      }

      const { result } = renderHook(() =>
        useClientOnlyValue(serverObject, clientObject)
      )

      expect(result.current).toBe(clientObject)
      expect(result.current).not.toBe(serverObject)
    })

    it('should maintain referential equality across re-renders with same values', () => {
      const serverValue = { data: 'server' }
      const clientValue = { data: 'client' }

      const { result, rerender } = renderHook(() =>
        useClientOnlyValue(serverValue, clientValue)
      )

      const firstResult = result.current
      rerender(undefined)
      const secondResult = result.current

      // Should return same client value reference
      expect(firstResult).toBe(clientValue)
      expect(secondResult).toBe(clientValue)
      expect(firstResult).toBe(secondResult)
    })

    it('should handle function values', () => {
      const serverFunction = () => 'server'
      const clientFunction = () => 'client'

      const { result } = renderHook(() =>
        useClientOnlyValue(serverFunction, clientFunction)
      )

      expect(result.current).toBe(clientFunction)
      expect(result.current()).toBe('client')
    })

    it('should work with identical server and client values', () => {
      const sameValue = 'same-value'

      const { result } = renderHook(() =>
        useClientOnlyValue(sameValue, sameValue)
      )

      expect(result.current).toBe(sameValue)
    })

    it('should handle edge case values', () => {
      const edgeCases = [
        { server: '', client: 'non-empty' },
        { server: 0, client: 1 },
        { server: NaN, client: 42 },
        { server: Infinity, client: -Infinity },
        { server: Symbol('server'), client: Symbol('client') }
      ]

      edgeCases.forEach(({ server, client }) => {
        const { result } = renderHook(() => useClientOnlyValue(server, client))
        expect(result.current).toBe(client)
      })
    })
  })

  describe('useColorScheme', () => {
    const mockReactNativeUseColorScheme = require('react-native').useColorScheme

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should return color scheme from React Native', () => {
      mockReactNativeUseColorScheme.mockReturnValue('dark')

      const { result } = renderHook(() => useColorScheme())

      expect(result.current).toBe('dark')
      expect(mockReactNativeUseColorScheme).toHaveBeenCalled()
    })

    it('should handle light color scheme', () => {
      mockReactNativeUseColorScheme.mockReturnValue('light')

      const { result } = renderHook(() => useColorScheme())

      expect(result.current).toBe('light')
    })

    it('should handle null/undefined color scheme', () => {
      mockReactNativeUseColorScheme.mockReturnValue(null)

      const { result } = renderHook(() => useColorScheme())

      expect(result.current).toBe(null)

      mockReactNativeUseColorScheme.mockReturnValue(undefined)

      const { result: result2 } = renderHook(() => useColorScheme())

      expect(result2.current).toBe(undefined)
    })

    it('should update when color scheme changes', () => {
      mockReactNativeUseColorScheme.mockReturnValue('light')

      const { result, rerender } = renderHook(() => useColorScheme())

      expect(result.current).toBe('light')

      // Simulate color scheme change
      mockReactNativeUseColorScheme.mockReturnValue('dark')
      rerender(undefined)

      expect(result.current).toBe('dark')
    })

    it('should call React Native useColorScheme on every render', () => {
      mockReactNativeUseColorScheme.mockReturnValue('dark')

      const { rerender } = renderHook(() => useColorScheme())

      expect(mockReactNativeUseColorScheme).toHaveBeenCalledTimes(1)

      rerender(undefined)
      expect(mockReactNativeUseColorScheme).toHaveBeenCalledTimes(2)

      rerender(undefined)
      expect(mockReactNativeUseColorScheme).toHaveBeenCalledTimes(3)
    })

    it('should be a direct export from React Native', () => {
      // This test ensures we're not adding any extra logic
      const { useColorScheme: exportedHook } = require('@/hooks/useColorScheme')
      const { useColorScheme: rnHook } = require('react-native')

      expect(exportedHook).toBe(rnHook)
    })

    it('should handle rapid color scheme changes', () => {
      const changes = ['light', 'dark', 'light', 'dark', null, 'light']

      changes.forEach((scheme, index) => {
        mockReactNativeUseColorScheme.mockReturnValue(scheme)

        const { result } = renderHook(() => useColorScheme())

        expect(result.current).toBe(scheme)
        expect(mockReactNativeUseColorScheme).toHaveBeenCalledTimes(index + 1)
      })
    })
  })

  describe('Integration Tests', () => {
    it('should work together in real-world scenarios', () => {
      const mockReactNativeUseColorScheme =
        require('react-native').useColorScheme
      mockReactNativeUseColorScheme.mockReturnValue('dark')

      // Simulate using both hooks together (common pattern)
      const { result } = renderHook(() => {
        const colorScheme = useColorScheme()
        const clientOnlyTheme = useClientOnlyValue(
          'light', // server default
          colorScheme || 'light' // client respects system preference
        )

        return { colorScheme, theme: clientOnlyTheme }
      })

      expect(result.current.colorScheme).toBe('dark')
      expect(result.current.theme).toBe('dark')
    })

    it('should handle system color scheme changes in integration', () => {
      const mockReactNativeUseColorScheme =
        require('react-native').useColorScheme
      mockReactNativeUseColorScheme.mockReturnValue('light')

      const { result, rerender } = renderHook(() => {
        const colorScheme = useColorScheme()
        const effectiveTheme = useClientOnlyValue(
          'light', // server fallback
          colorScheme === 'dark' ? 'dark' : 'light'
        )

        return effectiveTheme
      })

      expect(result.current).toBe('light')

      // System changes to dark
      mockReactNativeUseColorScheme.mockReturnValue('dark')
      rerender(undefined)

      expect(result.current).toBe('dark')
    })
  })
})
