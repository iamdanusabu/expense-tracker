import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, List, FAB, Chip, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useExpenses } from '../contexts/ExpenseContext';

/**
 * Home Screen Component
 * Displays:
 * - Month selector to view current or past months
 * - Budget overview (total budget, spent, remaining)
 * - Category-wise expense summary
 * - Quick navigation buttons to other screens
 */
export default function HomeScreen() {
  const router = useRouter();
  const { 
    budget, 
    totalSpent, 
    remainingBalance, 
    categoryWiseSummary,
    categories,
    expenses,
    getAvailableMonths,
    getMonthlySpent,
    getMonthlyCategoryWiseSummary,
  } = useExpenses();

  // Get available months
  const availableMonths = getAvailableMonths();
  
  // State for selected view: 'total' or specific month 'YYYY-MM'
  const [selectedView, setSelectedView] = useState<string>('total');
  
  // State for month selector dialog
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  
  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Log values for debugging
  useEffect(() => {
    console.log('Home Screen - Budget:', budget);
    console.log('Home Screen - Total Spent:', totalSpent);
    console.log('Home Screen - Expenses count:', expenses.length);
  }, [budget, totalSpent, expenses]);

  // Determine if budget is set
  const hasBudget = budget > 0;
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Force re-render by toggling a state
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

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

  // Calculate displayed values based on selected view
  const displaySpent = selectedView === 'total' 
    ? totalSpent 
    : (() => {
        const [year, month] = selectedView.split('-').map(Number);
        return getMonthlySpent(year, month - 1);
      })();

  const displayCategorySummary = selectedView === 'total'
    ? categoryWiseSummary
    : (() => {
        const [year, month] = selectedView.split('-').map(Number);
        return getMonthlyCategoryWiseSummary(year, month - 1);
      })();

  const displayRemaining = budget - displaySpent;

  // Format month for display
  const formatMonthLabel = (monthKey: string) => {
    if (monthKey === 'total') return 'All Time';
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  // Handle month selection
  const handleMonthSelect = (month: string) => {
    setSelectedView(month);
    setShowMonthSelector(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Month Selector Chip */}
        <View style={styles.chipContainer}>
          <Chip 
            icon="calendar" 
            onPress={() => setShowMonthSelector(true)}
            style={styles.chip}
            mode="outlined"
          >
            {formatMonthLabel(selectedView)}
          </Chip>
        </View>

        {/* Budget Overview Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Budget Overview</Title>
            {hasBudget ? (
              <>
                <View style={styles.budgetRow}>
                  <Paragraph>Total Budget:</Paragraph>
                  <Paragraph style={styles.amount}>₹{budget.toFixed(2)}</Paragraph>
                </View>
                <View style={styles.budgetRow}>
                  <Paragraph>{selectedView === 'total' ? 'Total' : 'Month'} Spent:</Paragraph>
                  <Paragraph style={[styles.amount, styles.spent]}>
                    ₹{displaySpent.toFixed(2)}
                  </Paragraph>
                </View>
                <View style={styles.budgetRow}>
                  <Paragraph>Remaining:</Paragraph>
                  <Paragraph 
                    style={[
                      styles.amount, 
                      displayRemaining >= 0 ? styles.positive : styles.negative
                    ]}
                  >
                    ₹{displayRemaining.toFixed(2)}
                  </Paragraph>
                </View>
              </>
            ) : (
              <Paragraph>No budget set. Go to Settings to set your total budget.</Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Category-wise Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Expenses by Category</Title>
            {Object.keys(displayCategorySummary).length > 0 ? (
              <List.Section>
                {Object.entries(displayCategorySummary).map(([categoryId, amount]) => (
                  <List.Item
                    key={categoryId}
                    title={getCategoryName(categoryId)}
                    description={`₹${amount.toFixed(2)}`}
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
              <Paragraph>
                {selectedView === 'total' 
                  ? 'No expenses yet. Tap the + button to add your first expense!'
                  : 'No expenses for this month.'}
              </Paragraph>
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

      {/* Month Selector Dialog */}
      <Portal>
        <Dialog visible={showMonthSelector} onDismiss={() => setShowMonthSelector(false)}>
          <Dialog.Title>Select Time Period</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView>
              {/* All Time Option */}
              <List.Item
                title="All Time"
                description="View total expenses"
                onPress={() => handleMonthSelect('total')}
                left={props => <List.Icon {...props} icon="calendar-multiselect" />}
                right={props => selectedView === 'total' ? <List.Icon {...props} icon="check" color="#6200ee" /> : null}
              />
              
              {/* Monthly Options */}
              {availableMonths.map((month) => (
                <List.Item
                  key={month}
                  title={formatMonthLabel(month)}
                  onPress={() => handleMonthSelect(month)}
                  left={props => <List.Icon {...props} icon="calendar-month" />}
                  right={props => selectedView === month ? <List.Icon {...props} icon="check" color="#6200ee" /> : null}
                />
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowMonthSelector(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  chipContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  chip: {
    minWidth: 200,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  dialogScroll: {
    maxHeight: 400,
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
