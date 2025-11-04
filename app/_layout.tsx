import { Stack } from "expo-router";
import { PaperProvider } from 'react-native-paper';
import { ExpenseProvider } from '../contexts/ExpenseContext';

/**
 * Root Layout Component
 * Wraps the entire app with:
 * 1. ExpenseProvider - for global state management
 * 2. PaperProvider - for React Native Paper UI components
 */
export default function RootLayout() {
  return (
    <ExpenseProvider>
      <PaperProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#6200ee',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              title: 'Expense Tracker',
              headerShown: true,
            }} 
          />
          <Stack.Screen 
            name="add-expense" 
            options={{ 
              title: 'Add Expense',
              presentation: 'modal',
            }} 
          />
          <Stack.Screen 
            name="categories" 
            options={{ 
              title: 'Categories',
            }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ 
              title: 'Settings',
            }} 
          />
        </Stack>
      </PaperProvider>
    </ExpenseProvider>
  );
}
