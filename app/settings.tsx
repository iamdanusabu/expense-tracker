import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Title, TextInput, Button, Paragraph, List } from 'react-native-paper';
import { useExpenses } from '../contexts/ExpenseContext';

/**
 * Settings Screen Component
 * Allows users to:
 * - Set/update total budget
 * - View all expenses with details
 * - Delete individual expenses
 */
export default function SettingsScreen() {
  const { budget, setBudget, expenses, deleteExpense, categories } = useExpenses();

  // Local state for budget input
  const [budgetInput, setBudgetInput] = useState(budget.toString());

  // Update local state when budget changes
  useEffect(() => {
    setBudgetInput(budget.toString());
  }, [budget]);

  // Handle budget update
  const handleUpdateBudget = () => {
    const parsedBudget = parseFloat(budgetInput);
    
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid budget amount (0 or greater).');
      return;
    }

    setBudget(parsedBudget);
    Alert.alert('Success', 'Budget updated successfully!');
  };

  // Handle deleting an expense
  const handleDeleteExpense = (id: string, description: string) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteExpense(id);
            Alert.alert('Success', 'Expense deleted successfully!');
          }
        },
      ]
    );
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <ScrollView style={styles.container}>
      {/* Budget Settings Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Total Budget</Title>
          <Paragraph style={styles.description}>
            Set your total budget to track your spending and see how much you have left.
          </Paragraph>

          {/* Budget Input */}
          <TextInput
            label="Total Budget (₹)"
            value={budgetInput}
            onChangeText={setBudgetInput}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="currency-inr" />}
          />

          {/* Update Button */}
          <Button 
            mode="contained" 
            onPress={handleUpdateBudget}
            style={styles.updateButton}
          >
            Update Budget
          </Button>

          {/* Current Budget Display */}
          {budget > 0 && (
            <Paragraph style={styles.currentBudget}>
              Current budget: ₹{budget.toFixed(2)}
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* All Expenses Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>All Expenses</Title>
          {sortedExpenses.length > 0 ? (
            <List.Section>
              {sortedExpenses.map((expense) => (
                <List.Item
                  key={expense.id}
                  title={expense.description}
                  description={`${getCategoryName(expense.category)} - ${expense.date}`}
                  left={() => (
                    <Paragraph style={styles.expenseAmount}>
                      ₹{expense.amount.toFixed(2)}
                    </Paragraph>
                  )}
                  right={() => (
                    <Button
                      mode="text"
                      onPress={() => handleDeleteExpense(expense.id, expense.description)}
                      textColor="#c62828"
                    >
                      Delete
                    </Button>
                  )}
                  style={styles.expenseItem}
                />
              ))}
            </List.Section>
          ) : (
            <Paragraph>No expenses recorded yet.</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* App Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>About</Title>
          <Paragraph>Expense Tracker v1.0</Paragraph>
          <Paragraph style={styles.infoText}>
            Track your daily expenses, manage categories, and stay within your budget.
            All data is saved locally on your device.
          </Paragraph>
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
    marginBottom: 8,
  },
  description: {
    marginVertical: 8,
    color: '#666',
  },
  input: {
    marginVertical: 8,
  },
  updateButton: {
    marginVertical: 8,
    backgroundColor: '#6200ee',
  },
  currentBudget: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  expenseItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  expenseAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 12,
    marginRight: 8,
  },
  infoText: {
    marginTop: 8,
    color: '#666',
  },
});
