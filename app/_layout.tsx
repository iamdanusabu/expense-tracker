import { Stack } from "expo-router";
import { PaperProvider } from 'react-native-paper';
import { ExpenseProvider } from '../contexts/ExpenseContext';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';

/**
 * Root Layout Component
 * Wraps the entire app with:
 * 1. ExpenseProvider - for global state management
 * 2. PaperProvider - for React Native Paper UI components
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.otf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.otf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.otf'),
    'Inter-ExtraBold': require('../assets/fonts/Inter-ExtraBold.otf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ExpenseProvider>
      <PaperProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#f6f8f6', // background-light
            },
            headerTintColor: '#0d1b0d', // text-light-primary
            headerTitleStyle: {
              fontFamily: 'Inter-Bold',
            },
            contentStyle: {
              backgroundColor: '#f6f8f6', // background-light
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="add-expense"
            options={{
              title: 'Add Expense',
              presentation: 'modal',
              headerStyle: {
                backgroundColor: '#f6f8f6',
              },
              headerTitleStyle: {
                fontFamily: 'Inter-Bold',
              },
            }}
          />
          <Stack.Screen
            name="categories"
            options={{
              title: 'Categories',
              headerStyle: {
                backgroundColor: '#f6f8f6',
              },
              headerTitleStyle: {
                fontFamily: 'Inter-Bold',
              },
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: 'Settings',
              headerStyle: {
                backgroundColor: '#f6f8f6',
              },
              headerTitleStyle: {
                fontFamily: 'Inter-Bold',
              },
            }}
          />
        </Stack>
      </PaperProvider>
    </ExpenseProvider>
  );
}
