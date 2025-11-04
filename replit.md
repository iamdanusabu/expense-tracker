# Expense Tracker - Expo React Native Application

## Overview

This is a mobile expense tracking application built with Expo and React Native. The app enables users to manage their personal finances by tracking expenses against a monthly budget. Users can categorize expenses, monitor spending across different categories, and manage their budget through an intuitive mobile interface. The application supports iOS, Android, and web platforms through Expo's cross-platform framework.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework: Expo with React Native**
- **Chosen Solution:** Expo SDK 54 with React Native 0.81.4
- **Rationale:** Expo provides a managed workflow that simplifies mobile development, offering built-in tooling for iOS, Android, and web deployment without requiring native code configuration
- **Pros:** Faster development, easier deployment, cross-platform consistency, hot reloading
- **Cons:** Larger bundle sizes, some limitations on native module access

**Navigation Pattern: File-based Routing**
- **Chosen Solution:** Expo Router v6 with typed routes
- **Rationale:** File-based routing (similar to Next.js) provides an intuitive way to structure app screens where the file system mirrors the navigation structure
- **Key Routes:**
  - `/` (index.tsx) - Home screen with budget overview
  - `/add-expense` - Modal for adding new expenses
  - `/categories` - Category management screen
  - `/settings` - Budget configuration and expense management

**UI Component Library**
- **Chosen Solution:** React Native Paper v5.14.5
- **Rationale:** Material Design components provide consistent, accessible UI patterns across platforms
- **Components Used:** Cards, Buttons, TextInput, Lists, FAB (Floating Action Button), SegmentedButtons

**Animation and Gestures**
- **Libraries:** React Native Reanimated (v4.1.0), React Native Gesture Handler (v2.28.0)
- **Purpose:** Smooth animations and touch interactions for enhanced user experience

### State Management Architecture

**Global State: React Context API**
- **Chosen Solution:** Custom `ExpenseContext` with React Context and Hooks
- **Rationale:** For this application's scope, Context API provides sufficient state management without the overhead of Redux or similar libraries
- **State Managed:**
  - Budget configuration (monthly budget amount)
  - Categories (user-defined expense categories with colors)
  - Expenses (transaction records with amount, category, description, date)
  - Computed values (total spent, remaining balance, category summaries)

**State Persistence**
- **Solution:** AsyncStorage from `@react-native-async-storage/async-storage`
- **Rationale:** Provides persistent storage across app sessions using native storage APIs
- **Storage Keys:**
  - `@expense_tracker_budget` - Budget amount
  - `@expense_tracker_categories` - Category definitions
  - `@expense_tracker_expenses` - Expense transactions

**Data Flow Pattern**
- Provider wraps entire application at root layout
- Screens consume context via `useExpenses()` custom hook
- State updates trigger AsyncStorage persistence
- Computed values (totalSpent, remainingBalance) are derived in real-time from expenses array

### Data Models

**Category Model**
```typescript
{
  id: string (UUID),
  name: string,
  color: string (hex color code)
}
```

**Expense Model**
```typescript
{
  id: string (UUID),
  amount: number,
  category: string (category ID reference),
  description: string,
  date: string (ISO date format)
}
```

**Design Decision:** Simple, flat data structures without relationships, suitable for client-side storage and computation

### Type Safety

**TypeScript Configuration**
- Strict mode enabled for comprehensive type checking
- Path aliases configured (`@/*` maps to project root)
- Typed routes via Expo Router for navigation type safety

### Platform Support

**Multi-platform Build Strategy**
- **iOS:** Native builds with edge-to-edge UI support
- **Android:** Adaptive icons, edge-to-edge rendering
- **Web:** Metro bundler with static output, React Native Web for web compatibility

**Adaptive UI Considerations**
- Safe area handling via `react-native-safe-area-context`
- Platform-specific screen configurations
- Responsive layouts using flexbox

### Development Tools

**Linting and Code Quality**
- ESLint with Expo configuration
- TypeScript for static type checking
- Jest for testing infrastructure (configured but not implemented)

## External Dependencies

### Core Framework Dependencies

**Expo Platform (v54.0.9)**
- expo-router - File-based navigation
- expo-splash-screen - Splash screen management
- expo-status-bar - Status bar styling
- expo-constants - App constants and configuration
- expo-font - Custom font loading
- expo-linking - Deep linking support
- expo-image - Optimized image component
- expo-blur, expo-haptics, expo-symbols, expo-system-ui, expo-web-browser - Platform features

### Navigation Libraries

**React Navigation Ecosystem**
- @react-navigation/native (v7.1.6) - Core navigation primitives
- @react-navigation/bottom-tabs (v7.3.10) - Tab navigation (available for future use)
- @react-navigation/elements (v2.3.8) - Shared navigation UI components

### UI and Styling

**UI Components**
- react-native-paper (v5.14.5) - Material Design component library
- @expo/vector-icons (v15.0.2) - Icon sets

**Animation and Interaction**
- react-native-reanimated (v4.1.0) - Performant animations
- react-native-gesture-handler (v2.28.0) - Native gesture recognition
- react-native-worklets (v0.5.1) - JavaScript worklet support for animations

### Platform Compatibility

**Cross-platform Support**
- react-native-web (v0.21.0) - Web platform compatibility
- react-native-webview (v13.15.0) - Embedded web content
- react-native-screens (v4.16.0) - Native screen management
- react-native-safe-area-context (v5.6.0) - Safe area handling

### Storage

**Local Persistence**
- @react-native-async-storage/async-storage (v2.2.0) - Asynchronous, persistent key-value storage for React Native
- **Use Case:** Storing budget, categories, and expenses locally on device
- **Alternative Considered:** No remote database; app operates fully offline as a personal finance tool

### Build and Development Tools

**Build System**
- @expo/metro-runtime (v6.1.2) - Metro bundler runtime
- Babel (v7.25.2) - JavaScript transpilation

**Testing**
- jest (v29.2.1) - Testing framework
- jest-expo (v54.0.12) - Expo-specific Jest configuration

**Code Quality**
- eslint (v9.25.0) - Linting
- eslint-config-expo (v10.0.0) - Expo ESLint rules
- typescript (v5.9.2) - Type checking

### Notable Architectural Choices

1. **No Remote Backend:** Application operates entirely client-side with local storage, suitable for personal use without cloud sync requirements
2. **Context Over Redux:** Given the moderate state complexity, React Context provides sufficient state management with less boilerplate
3. **Expo Managed Workflow:** Prioritizes development speed and ease of deployment over native module flexibility
4. **Material Design:** React Native Paper provides consistent cross-platform UI without custom component development
5. **File-based Routing:** Modern routing pattern that simplifies navigation structure and enables type-safe navigation