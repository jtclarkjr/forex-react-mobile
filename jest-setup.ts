// Override afterEach before importing testing library to prevent hanging
const originalAfterEach = global.afterEach
global.afterEach = (fn) => {
  if (fn && fn.toString().includes('cleanup')) {
    // Skip automatic cleanup
    return
  }
  return originalAfterEach(fn)
}

import '@testing-library/jest-native/extend-expect'

// Restore afterEach and set our own
global.afterEach = originalAfterEach

// Increase timeout for React Native tests  
jest.setTimeout(10000)

// Manual cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
})

// Mock React Native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')

// Mock React Native completely to avoid Flow type issues
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  const React = require('react')
  
  // Create mock components that render as strings but satisfy TypeScript
  const createMockComponent = (name: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Component = React.forwardRef((props: any, ref: any) => 
      React.createElement(name, { ...(props as object), ref })
    )
    Component.displayName = name
    return Component
  }
  
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default)
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 }))
    },
    useColorScheme: jest.fn(() => 'light'),
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((styles) => {
        if (!styles) return undefined
        if (Array.isArray(styles)) {
          return Object.assign({}, ...styles.filter(s => s))
        }
        return styles
      }),
      hairlineWidth: 1,
      absoluteFillObject: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    },
    Text: createMockComponent('Text'),
    View: createMockComponent('View'),
    ScrollView: createMockComponent('ScrollView'),
    TouchableOpacity: createMockComponent('TouchableOpacity'),
    ActivityIndicator: createMockComponent('ActivityIndicator'),
    NativeModules: RN.NativeModules || {},
    NativeEventEmitter: jest.fn(() => ({
      addListener: jest.fn(),
      removeAllListeners: jest.fn(),
      emit: jest.fn()
    })),
    Animated: {
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        setOffset: jest.fn(),
        flattenOffset: jest.fn(),
        extractOffset: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn(),
        stopAnimation: jest.fn(),
        resetAnimation: jest.fn(),
        interpolate: jest.fn(),
        animate: jest.fn()
      })),
      timing: jest.fn(() => ({
        start: jest.fn()
      })),
      View: 'Animated.View',
      Text: 'Animated.Text',
      Image: 'Animated.Image'
    },
    AppState: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      currentState: 'active'
    },
    Linking: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      openURL: jest.fn(),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
      getInitialURL: jest.fn(() => Promise.resolve())
    },
    PixelRatio: {
      get: jest.fn(() => 2),
      getFontScale: jest.fn(() => 1),
      getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
      roundToNearestPixel: jest.fn((size) => Math.round(size * 2) / 2)
    },
    I18nManager: {
      isRTL: false,
      doLeftAndRightSwapInRTL: true,
      allowRTL: jest.fn(),
      forceRTL: jest.fn(),
      getConstants: jest.fn(() => ({ isRTL: false, doLeftAndRightSwapInRTL: true }))
    }
  }
})

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
        args[0].includes(
          'An update to HookContainer inside a test was not wrapped in act(...)'
        ))
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
