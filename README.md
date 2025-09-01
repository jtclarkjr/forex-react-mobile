# Forex Watchlist App

A mobile-first React Native Expo application that provides a customizable forex
watchlist with real-time exchange rates and detailed pair information.

## Features

- **Customizable Watchlist**: Add/remove currency pairs to your personal
  watchlist
- **Real-time Forex Data**: Live streaming of currency exchange rates with
  automatic updates every 2 seconds
- **iOS-Style Interactions**:
  - Drag & drop to reorder pairs
  - Swipe to delete pairs
  - Tap to view detailed information
- **Detailed Pair View**: iOS modal with comprehensive forex data including
  bid/ask spread, currency information, and technical details
- **Live Connection Status**: Visual indicators showing real-time connection
  status
- **Persistent Storage**: Your watchlist configuration is saved locally
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

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npx expo start
```

3. Choose your platform:
   - Press `w` for web
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## Project Structure

```
├── app/
│   ├── api/
│   │   └── forex+api.ts          # API route for forex data
│   ├── index.tsx                 # Main watchlist screen
│   ├── pair-details.tsx          # Pair details modal
│   ├── _layout.tsx               # Root layout
│   ├── +html.tsx                 # HTML document wrapper
│   └── +not-found.tsx            # 404 page
├── components/
│   ├── watchlist/
│   │   ├── WatchlistItem.tsx     # Individual watchlist item
│   │   ├── SwipeableWatchlistItem.tsx # Swipeable wrapper
│   │   └── index.ts              # Watchlist exports
│   ├── common/
│   │   ├── Themed.tsx            # Theme-aware components
│   │   ├── StyledText.tsx        # Styled text components
│   │   ├── ExternalLink.tsx      # External link component
│   │   └── index.ts              # Common component exports
│   └── index.ts                  # Main component exports
├── constants/
│   ├── Forex.ts                  # Forex-related constants
│   └── Colors.ts                 # Theme color definitions
├── hooks/
│   ├── useForexStream.ts         # Custom hook for streaming data
│   ├── useWatchlist.ts           # Watchlist management hook
│   ├── useColorScheme.ts         # Color scheme hook
│   ├── useColorScheme.web.ts     # Web-specific color scheme hook
│   ├── useClientOnlyValue.ts     # Client-only value hook
│   └── useClientOnlyValue.web.ts # Web-specific client-only hook
├── styles/
│   ├── index.ts                  # Style exports
│   ├── theme.ts                  # Theme definitions
│   ├── mainScreen.ts             # Main screen styles
│   ├── pairDetails.ts            # Pair details modal styles
│   └── watchlistItem.ts          # Watchlist item styles
├── types/
│   └── forex.ts                  # TypeScript type definitions
├── utils/
│   ├── index.ts                  # Utility exports
│   └── currency.ts               # Currency-related utilities
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
  timestamp: number // Unix timestamp
}
```

## Development Scripts

The project includes several development scripts for maintaining code quality:

```bash
# Start development server
npm start

# Platform-specific development
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser

# Code quality
npm run lint     # Run oxlint with auto-fix
npm run format   # Format code with Prettier
npm test         # Run tests with Jest
```

## Development Tools

- **Oxlint**: Fast JavaScript/TypeScript linter with auto-fixing
- **Prettier**: Code formatter for consistent styling
- **Jest**: Testing framework with Expo preset
- **TypeScript**: Static type checking
- **Expo Router**: File-based routing system

## Development Notes

- The app uses simulated forex data with realistic volatility
- Rates update every 2 seconds to simulate real-time streaming
- Includes proper error handling and connection status management
- TypeScript is used throughout for type safety
- Follows React Native best practices and Expo Router conventions
- Code is automatically linted and formatted with oxlint and Prettier

## License

MIT License
