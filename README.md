# Expense Tracker - React Native App

A simple and beginner-friendly mobile expense tracking application built with Expo and React Native.

## Features

- 📊 **Budget Management**: Set a monthly budget and track your spending
- 💰 **Expense Tracking**: Add daily expenses with amount, category, description, and date
- 🏷️ **Category Management**: Create and manage custom expense categories with colors
- 📈 **Real-time Overview**: See total spent, remaining balance, and category-wise summaries
- 💾 **Local Storage**: All data saved locally using AsyncStorage (no internet required)

## Screens

1. **Home Screen** - View budget overview and category-wise expense summary
2. **Add Expense** - Add new expenses with all details
3. **Categories** - Manage your expense categories
4. **Settings** - Set monthly budget and manage all expenses

## Tech Stack

- **Expo SDK 54** - Cross-platform mobile framework
- **React Native** - Native mobile UI
- **TypeScript** - Type-safe code
- **React Native Paper** - Material Design UI components
- **AsyncStorage** - Local data persistence
- **Expo Router** - File-based navigation

## Getting Started

1. Install dependencies (if needed):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Open the app:
   - Scan the QR code with **Expo Go** app (Android/iOS)
   - Press **w** to open in web browser
   - Press **a** to open in Android emulator
   - Press **i** to open in iOS simulator

## Project Structure

```
├── app/                    # Screen components (file-based routing)
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Home screen
│   ├── add-expense.tsx    # Add expense screen
│   ├── categories.tsx     # Categories management
│   └── settings.tsx       # Settings and budget
├── contexts/              # React Context for state management
│   └── ExpenseContext.tsx # Global state and AsyncStorage logic
└── assets/                # Images, fonts, etc.
```

## How to Use

1. **Set Your Budget**: Go to Settings and enter your monthly budget
2. **Create Categories**: Visit Categories screen to add custom expense categories
3. **Add Expenses**: Tap the + button on Home screen to add a new expense
4. **Track Spending**: View your budget overview and category summaries on Home screen
5. **Manage Data**: Go to Settings to view all expenses and delete if needed

## Key Learning Points

This app demonstrates:
- React Context API for global state management
- AsyncStorage for data persistence
- React Navigation with Expo Router
- Form handling and validation
- TypeScript interfaces and type safety
- React Native Paper UI components
- Hooks (useState, useEffect, useContext)

## Expand and Customize

You can easily extend this app with:
- Monthly/weekly expense views
- Charts and graphs for spending visualization
- Export data to CSV
- Recurring expenses
- Multiple budget periods
- Cloud sync with backend service

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [TypeScript](https://www.typescriptlang.org/)
