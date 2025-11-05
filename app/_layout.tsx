import { Stack } from "expo-router";
import { PaperProvider } from 'react-native-paper';
import { ExpenseProvider } from '../contexts/ExpenseContext';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { startNotificationListener, setupNotificationTapListener } from '../services/NotificationService';

// Configure the notification handler for how notifications should appear
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Root Layout Component
 * Wraps the entire app with necessary providers and sets up global listeners.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.otf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.otf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.otf'),
    'Inter-ExtraBold': require('../assets/fonts/Inter-ExtraBold.otf'),
  });

  useEffect(() => {
    // Request notification permissions for showing our own local notifications
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('You need to enable notifications for the app to suggest expenses.');
      }
    };

    requestPermissions();

    // Start the SMS notification listener (Android only)
    if (Platform.OS === 'android') {
      startNotificationListener();
    }
    
    // Set up the listener for handling taps on our app's notifications
    setupNotificationTapListener();

  }, []);

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
              backgroundColor: '#f6f8f6',
            },
            headerTintColor: '#0d1b0d',
            headerTitleStyle: {
              fontFamily: 'Inter-Bold',
            },
            contentStyle: {
              backgroundColor: '#f6f8f6',
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
