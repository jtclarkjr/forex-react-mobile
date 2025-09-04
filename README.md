# Forex Watchlist App

A mobile-first (iOS and Web Safari focused) React Native Expo application that
provides a customizable forex watchlist with real-time exchange rates and
detailed pair information.

## Features

- **Customizable Watchlist**: Add/remove currency pairs to your personal
  watchlist with bulk selection support
- **Real-time Forex Data**: Live streaming of currency exchange rates with
  automatic updates every 2 seconds
- **Smooth Animations**:
  - Animated item removal with slide-left, fade, and height collapse effects
  - Smooth drag & drop reordering
  - Swipe-to-delete with animated reveal
- **iOS-Style Interactions**:
  - Drag & drop to reorder pairs
  - Swipe to delete pairs with confirmation dialogs
  - Tap to view detailed information
- **Detailed Pair View**: iOS modal with comprehensive forex data including
  bid/ask spread, currency information, and technical details
- **Enhanced Error Handling**: Robust error management with retry mechanisms and
  user-friendly error messages
- **Live Connection Status**: Visual indicators showing real-time connection
  status with color-coded states
- **Persistent Storage**: Your watchlist configuration is saved locally with
  automatic migration support
- **Mobile-Optimized**: Single-page design focused on core functionality

## Technical Stack

- **React Native + Expo**: Cross-platform mobile development
- **Expo API Routes**: Server-side API endpoints with `+api.ts` files
- **TypeScript**: Type-safe development
- **Server-Sent Events**: Real-time data streaming (fallback to polling for
  React Native)

## API Endpoints

### Get Current Rate

```
GET /api/forex?pair=USD/JPY
```

### Stream Real-time Data

```
GET /api/forex?pair=USD/JPY&stream=true
```

## Supported Currency Pairs

- USD/JPY (default)
- EUR/USD
- GBP/USD
- AUD/USD
- USD/CAD
- USD/CHF
- USD/CNY
- EUR/JPY
- GBP/JPY

## API Setup

Before running the application, you need to pull and run the required API
service:

1. Pull the Docker image:

```bash
docker pull paidyinc/one-frame:latest
```

2. Run the service:

```bash
docker run -p 8080:8080 paidyinc/one-frame
```

The API service will be available at `http://localhost:8080`.

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Start the development server:

```bash
bun start
```

3. Choose your platform:
   - Press `w` for web
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## Building to Physical Device (iOS)

For production builds and testing on physical iOS devices, you can use Xcode:

### Prerequisites

- Xcode installed (latest version recommended)
- Apple Developer account (free tier works for personal development)
- iOS device connected via USB

### Steps

1. **Generate native iOS project**:

   ```bash
   bunx expo prebuild --platform ios
   ```

2. **Open in Xcode**:

   ```bash
   open ios/forexrn.xcworkspace
   ```

3. **Configure signing**:
   - In Xcode, select your project in the navigator
   - Go to "Signing & Capabilities" tab
   - Select your team/Apple ID for automatic signing
   - Ensure a valid bundle identifier is set

4. **Select target device**:
   - Connect your iOS device via USB
   - Select your device from the device dropdown in Xcode toolbar
   - Trust the developer certificate on your device when prompted

5. **Build and run**:
   - Click the "Play" button in Xcode or press `Cmd+R`
   - App will compile and install directly to your device

### Development vs. Production Builds

- **Development builds**: Include debugging capabilities and faster reload
- **Production builds**: Optimized, smaller size, ready for App Store

For production builds:

```bash
bunx expo build:ios
# or
eas build --platform ios
```

### Troubleshooting

- **Code signing issues**: Ensure your Apple ID is added in Xcode preferences
- **Device trust**: Make sure to "Trust this computer" on your iOS device
- **Bundle ID conflicts**: Use a unique bundle identifier in `app.json`
- **Clean builds**: In Xcode, use `Product > Clean Build Folder` if issues
  persist

## Project Structure

```
├── app/
│   ├── api/
│   │   └── forex+api.ts          # API route for forex data (GET only)
│   ├── index.tsx                 # Main watchlist screen with animations
│   ├── pair-details.tsx          # Pair details modal
│   ├── _layout.tsx               # Root layout
│   ├── +html.tsx                 # HTML document wrapper
│   └── +not-found.tsx            # 404 page
├── components/
│   ├── watchlist/
│   │   ├── AnimatedWatchlistItem.tsx # Animated wrapper with removal effects
│   │   ├── SwipeableWatchlistItem.tsx # Swipeable wrapper
│   │   ├── WatchlistItem.tsx     # Individual watchlist item
│   │   └── index.ts              # Watchlist exports
│   ├── common/
│   │   ├── Themed.tsx            # Theme-aware components
│   │   ├── StyledText.tsx        # Styled text components
│   │   ├── ExternalLink.tsx      # External link component
│   │   └── index.ts              # Common component exports
│   └── index.ts                  # Main component exports
├── constants/
│   ├── Config.ts                 # Configuration constants
│   ├── Forex.ts                  # Forex-related constants
│   └── Colors.ts                 # Theme color definitions
├── hooks/
│   ├── useForexStream.ts         # Enhanced streaming with error handling
│   ├── useWatchlist.ts           # Watchlist management with bulk operations
│   ├── useColorScheme.ts         # Color scheme hook
│   ├── useColorScheme.web.ts     # Web-specific color scheme hook
│   ├── useClientOnlyValue.ts     # Client-only value hook
│   └── useClientOnlyValue.web.ts # Web-specific client-only hook
├── lib/
│   ├── services/
│   │   ├── forex-service.ts      # External forex API service
│   │   └── streaming-service.ts  # Server-sent events streaming
│   └── utils/
│       ├── forex-utils.ts        # Forex-specific utilities
│       ├── currency.ts           # Currency name mappings
│       └── index.ts              # Utility exports
├── styles/
│   ├── index.ts                  # Style exports
│   ├── theme.ts                  # Enhanced theme definitions
│   ├── mainScreen.ts             # Main screen styles
│   ├── pairDetails.ts            # Pair details modal styles
│   ├── watchlistItem.ts          # Watchlist item styles
│   └── swipeableWatchlistItem.ts # Swipeable item styles
├── types/
│   └── forex.ts                  # Comprehensive TypeScript definitions
└── README.md
```

## Data Format

The API returns forex data in the following format:

```typescript
interface ForexRate {
  from: string // Base currency (e.g., "USD")
  to: string // Quote currency (e.g., "JPY")
  bid: number // Bid price
  ask: number // Ask price
  price: number // Current rate
  time_stamp: string // ISO timestamp
}
```

## Development Scripts

The project includes several development scripts for maintaining code quality:

```bash
# Start development server
bun start

# Platform-specific development
bun ios      # iOS simulator
bun android  # Android emulator
bun web      # Web browser

# Code quality
bun lint     # Run oxlint with auto-fix
bun format   # Format code with Prettier
bun test         # Run tests with Jest
```

## Development Tools

- **Oxlint**: Fast JavaScript/TypeScript linter with auto-fixing (optimized for
  React Native/Expo)
- **Prettier**: Code formatter for consistent styling
- **Jest**: Testing framework with Expo preset
- **TypeScript**: Static type checking with strict mode
- **Expo Router**: File-based routing system
- **React Native Reanimated**: High-performance animations
- **React Native Gesture Handler**: Native gesture recognition

## Architecture Highlights

### Service Layer

- **Forex Service**: Handles external API communication with comprehensive error
  handling
- **Streaming Service**: Manages Server-Sent Events for real-time data
- **Utility Functions**: Centralized validation and formatting logic

### Error Handling

- **Typed Errors**: Custom error types with specific handling strategies
- **Retry Logic**: Automatic retry with backoff for transient failures
- **User Feedback**: Clear error messages and retry options
- **Graceful Degradation**: Fallback behaviors for network issues

### Animation System

- **Reanimated Integration**: Smooth 60fps animations using native drivers
- **Removal Animations**: Multi-stage animations (slide, fade, collapse)
- **Gesture Animations**: Smooth swipe-to-delete and drag-to-reorder
- **State Management**: Coordinated animation states with React state

### Data Management

- **AsyncStorage**: Persistent watchlist storage with migration support
- **Real-time Updates**: Live data streaming with connection status tracking
- **Bulk Operations**: Efficient multi-item selection and operations
- **Type Safety**: Comprehensive TypeScript coverage

## Development Notes

- The app uses external forex data via Docker containerized service
- Rates update every 2 seconds with intelligent error handling
- Includes comprehensive connection status management
- TypeScript is used throughout with strict type checking
- Follows React Native best practices and Expo Router conventions
- Code is automatically linted and formatted with oxlint and Prettier
- Animation performance is optimized using native drivers
- Storage includes automatic data migration for version compatibility
- NEED TODO: For WEB fix rearrange, Delete, Close details from screen (not just
  browser back)

## License

MIT License
