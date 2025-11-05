
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import NotificationListener from 'react-native-notification-listener';
import { AppState, Platform } from 'react-native';

/**
 * A set of robust regex patterns to parse transaction messages from various Indian banks and UPI apps.
 * @param {string} text - The notification text to parse.
 * @returns {{amount: number} | null} - The extracted amount or null if no match.
 */
function extractTransactionData(text: string): { amount: number } | null {
  const patterns = [
    // Standard debit messages (e.g., "debited by INR 250", "spent Rs. 1,250.50")
    /(?:debited|spent|charged|withdrawn).+?(?:INR|Rs\.?|₹)\s*([\d,]+\.?\d*)/i,
    // Amount first messages (e.g., "INR 1,250.50 was spent")
    /(?:INR|Rs\.?|₹)\s*([\d,]+\.?\d*)\s*(?:was\s?spent|debited)/i,
    // UPI payment messages (e.g., "paid ₹120 to X", "sent ₹450 to Y")
    /(?:paid|sent|transferred)\s*(?:₹|INR|Rs\.?)\s*([\d,]+\.?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount)) {
        return { amount };
      }
    }
  }
  return null;
}

/**
 * Starts the notification listener service and sets up the event handler.
 * This should only be called on Android.
 */
export const startNotificationListener = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  // Check for permission and redirect user if needed
  const status = await NotificationListener.getPermissionStatus();
  if (status !== 'authorized') {
    // On Android, this opens the settings screen for the user to grant the permission.
    await NotificationListener.requestPermission();
  }

  // Start the service
  NotificationListener.startService();

  // Add a listener for new notifications
  NotificationListener.onNotificationReceived(notification => {
    const text = notification?.text || '';
    console.log("Notification received:", text); // For debugging
    const result = extractTransactionData(text);

    if (result && result.amount > 0) {
      console.log(`Expense found: ${result.amount}`);
      // Schedule our own local notification that the user can interact with
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Expense Detected",
          body: `We detected a transaction of ₹${result.amount}. Tap to add it as an expense.`,
          data: { amount: result.amount }, // Pass amount in the data payload
        },
        trigger: null, // Show immediately
      });
    }
  });
};

/**
 * Sets up a listener for when the user taps on one of OUR app's notifications.
 */
export const setupNotificationTapListener = () => {
  Notifications.addNotificationResponseReceivedListener(response => {
    const amount = response.notification.request.content.data?.amount;
    if (amount) {
      // Create a deep link to the add-expense screen with the amount as a query param
      const url = Linking.createURL('add-expense', {
        queryParams: { amount: String(amount) },
      });
      // Open the deep link
      Linking.openURL(url);
    }
  });
};
