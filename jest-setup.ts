import '@testing-library/jest-native/extend-expect'

// Mock React Native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')

// Mock React Native completely to avoid Flow type issues
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default)
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 }))
  },
  useColorScheme: jest.fn(() => 'light'),
  // Add other commonly needed mocks
  StyleSheet: {
    create: jest.fn((styles) => styles)
  },
  Text: 'Text',
  View: 'View',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity'
}))

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

// Mock react-native-uuid
jest.mock('react-native-uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-v4')
}))

// Mock react-native-reanimated with comprehensive setup
jest.mock('react-native-reanimated', () => {
  const mockUseSharedValue = jest.fn((value) => ({ value }))
  const mockUseAnimatedStyle = jest.fn((fn) => fn())
  const mockWithTiming = jest.fn((value) => value)

  return {
    useSharedValue: mockUseSharedValue,
    useAnimatedStyle: mockUseAnimatedStyle,
    withTiming: mockWithTiming,
    Easing: {
      out: jest.fn((fn) => fn),
      ease: jest.fn(),
      back: jest.fn(() => jest.fn())
    },
    // Include other commonly used exports
    runOnJS: jest.fn((fn) => fn),
    runOnUI: jest.fn((fn) => fn)
  }
})

// Mock gesture handler
jest.mock('react-native-gesture-handler', () =>
  require('react-native-gesture-handler/jestSetup')
)

// Mock fetch globally for API tests
global.fetch = jest.fn()

// Setup fetch mock reset
beforeEach(() => {
  ;(fetch as jest.Mock).mockClear()
})

// Mock console methods to reduce noise in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('An update to HookContainer inside a test was not wrapped in act(...)'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Note: Some React Native warnings are handled by the jest-expo preset
