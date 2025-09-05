import { enableMapSet } from 'immer'

// Enable Immer plugins for Zustand stores
enableMapSet()

// Export stores after enabling plugins
export * from './watchlistStore'
export * from './forexStore'
