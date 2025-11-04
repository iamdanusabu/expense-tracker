import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Card, Title, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useExpenses } from '../contexts/ExpenseContext';

/**
 * Add Expense Screen Component
 * Allows users to add a new expense with:
 * - Amount
 * - Category (from available categories)
 * - Description
 * - Date (defaults to today)
 */
export default function AddExpenseScreen() {
  const router = useRouter();
  const { categories, addExpense } = useExpenses();

  // Form state
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD format

  // Handle form submission
  const handleSubmit = () => {
    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    // Validate category
    if (!selectedCategory) {
      Alert.alert('No Category', 'Please select a category.');
      return;
    }

    // Validate description
    if (!description.trim()) {
      Alert.alert('No Description', 'Please enter a description.');
      return;
    }

    // Add the expense
    addExpense({
      amount: parsedAmount,
      category: selectedCategory,
      description: description.trim(),
      date,
    });

    // Show success message and go back
    Alert.alert('Success', 'Expense added successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>New Expense</Title>

          {/* Amount Input */}
          <TextInput
            label="Amount ($)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
          />

          {/* Description Input */}
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Lunch at restaurant"
            left={<TextInput.Icon icon="text" />}
          />

          {/* Date Input */}
          <TextInput
            label="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            mode="outlined"
            style={styles.input}
            placeholder="2024-01-01"
            left={<TextInput.Icon icon="calendar" />}
          />

          {/* Category Selection */}
          <Title style={styles.sectionTitle}>Select Category</Title>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <Button
                key={category.id}
                mode={selectedCategory === category.id ? 'contained' : 'outlined'}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && { backgroundColor: category.color }
                ]}
                labelStyle={selectedCategory === category.id && { color: '#fff' }}
              >
                {category.name}
              </Button>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              Add Expense
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => router.back()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  input: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  categoryButton: {
    margin: 4,
  },
  buttonContainer: {
    marginTop: 24,
  },
  submitButton: {
    marginVertical: 4,
    backgroundColor: '#6200ee',
  },
  cancelButton: {
    marginVertical: 4,
  },
});
