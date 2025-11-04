import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, List, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useExpenses } from '../contexts/ExpenseContext';

/**
 * Home Screen Component
 * Displays:
 * - Budget overview (total, spent, remaining)
 * - Category-wise expense summary
 * - Quick navigation buttons to other screens
 */
export default function HomeScreen() {
  const router = useRouter();
  const { budget, totalSpent, remainingBalance, categoryWiseSummary, categories } = useExpenses();

  // Determine if budget is set
  const hasBudget = budget > 0;

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Get category color by ID
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#ccc';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Budget Overview Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Budget Overview</Title>
            {hasBudget ? (
              <>
                <View style={styles.budgetRow}>
                  <Paragraph>Monthly Budget:</Paragraph>
                  <Paragraph style={styles.amount}>${budget.toFixed(2)}</Paragraph>
                </View>
                <View style={styles.budgetRow}>
                  <Paragraph>Total Spent:</Paragraph>
                  <Paragraph style={[styles.amount, styles.spent]}>
                    ${totalSpent.toFixed(2)}
                  </Paragraph>
                </View>
                <View style={styles.budgetRow}>
                  <Paragraph>Remaining:</Paragraph>
                  <Paragraph 
                    style={[
                      styles.amount, 
                      remainingBalance >= 0 ? styles.positive : styles.negative
                    ]}
                  >
                    ${remainingBalance.toFixed(2)}
                  </Paragraph>
                </View>
              </>
            ) : (
              <Paragraph>No budget set. Go to Settings to set your monthly budget.</Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Category-wise Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Expenses by Category</Title>
            {Object.keys(categoryWiseSummary).length > 0 ? (
              <List.Section>
                {Object.entries(categoryWiseSummary).map(([categoryId, amount]) => (
                  <List.Item
                    key={categoryId}
                    title={getCategoryName(categoryId)}
                    description={`$${amount.toFixed(2)}`}
                    left={() => (
                      <View 
                        style={[
                          styles.categoryIndicator, 
                          { backgroundColor: getCategoryColor(categoryId) }
                        ]} 
                      />
                    )}
                  />
                ))}
              </List.Section>
            ) : (
              <Paragraph>No expenses yet. Tap the + button to add your first expense!</Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Quick Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            onPress={() => router.push('/categories')}
            style={styles.button}
          >
            Manage Categories
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => router.push('/settings')}
            style={styles.button}
          >
            Settings
          </Button>
        </View>
      </ScrollView>

      {/* Floating Action Button to add expense */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/add-expense')}
        label="Add Expense"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  spent: {
    color: '#f57c00',
  },
  positive: {
    color: '#2e7d32',
  },
  negative: {
    color: '#c62828',
  },
  categoryIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginTop: 8,
    marginRight: 8,
  },
  buttonContainer: {
    margin: 16,
    marginTop: 8,
  },
  button: {
    marginVertical: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});
