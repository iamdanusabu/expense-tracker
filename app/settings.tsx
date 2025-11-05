
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput as RNTextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useExpenses } from '../contexts/ExpenseContext';

export default function SettingsScreen() {
  const { budget, setBudget, expenses, deleteExpense, categories } = useExpenses();
  const [budgetInput, setBudgetInput] = useState(budget.toString());
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setBudgetInput(budget.toString());
    const date = new Date();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    setCurrentDate(`${month} ${year}`);
  }, [budget]);

  const handleUpdateBudget = () => {
    const parsedBudget = parseFloat(budgetInput);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid budget amount.');
      return;
    }
    setBudget(parsedBudget);
    Alert.alert('Success', 'Budget updated successfully!');
  };

  const handleDeleteExpense = (id, description) => {
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
          },
        },
      ]
    );
  };
  
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
    const getCategoryIcon = (categoryName) => {
    const icons = {
      'Groceries': 'shopping-cart',
      'Transport': 'directions-bus',
      'Entertainment': 'movie',
      'Utilities': 'receipt',
      'Food': 'fastfood',
      'Shopping': 'shopping-bag',
      'Bills': 'receipt-long',
    };
    return icons[categoryName] || 'receipt-long'; // default icon
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetSpentPercentage = budget > 0 ? (totalSpent / budget) * 100 : 0;

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{currentDate}</Text>
        </View>
      <ScrollView style={styles.mainContent}>
        <View style={styles.budgetCard}>
          <Text style={styles.cardTitle}>Monthly Budget</Text>
          <View style={styles.budgetDetails}>
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetText}>₹{totalSpent.toFixed(2)} of ₹{budget.toFixed(2)} spent</Text>
              <Text style={styles.remainingText}>{100-budgetSpentPercentage.toFixed(0)}% left</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${budgetSpentPercentage}%` }]} />
            </View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <RNTextInput
              style={styles.input}
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
              placeholder="Enter new budget"
            />
            <TouchableOpacity style={styles.editButton} onPress={handleUpdateBudget}>
                <MaterialIcons name="edit" size={20} color="#2ECC71" />
                <Text style={styles.editButtonText}>Edit Budget</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.transactionsTitle}>All Transactions</Text>
        <View style={styles.transactionsList}>
          {expenses.map((expense) => {
            const categoryName = getCategoryName(expense.category);
            const categoryIcon = getCategoryIcon(categoryName);
            return (
              <View key={expense.id} style={styles.transactionItem}>
                  <View style={styles.transactionIconContainer}>
                      <MaterialIcons name={categoryIcon} size={24} color="#2ECC71" />
                  </View>
                  <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription}>{expense.description}</Text>
                      <Text style={styles.transactionDate}>{new Date(expense.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                  </View>
                  <Text style={styles.transactionAmount}>-₹{expense.amount.toFixed(2)}</Text>
                   <TouchableOpacity onPress={() => handleDeleteExpense(expense.id, expense.description)} style={{marginLeft: 10}}>
                       <MaterialIcons name="delete" size={24} color="#E74C3C" />
                   </TouchableOpacity>
              </View>
          );
})}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        fontFamily: 'Inter-Regular'
    },
    header: {
        paddingTop: 40,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(242, 242, 247, 0.8)',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: '#1C1C1E',
        textAlign: 'center'
    },
    mainContent: {
        paddingHorizontal: 16,
    },
    budgetCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
        color: '#1C1C1E',
        marginBottom: 16,
    },
    budgetDetails: {
        gap: 8,
    },
    budgetInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    budgetText: {
        color: '#2ECC71',
        fontSize: 14,
        fontFamily: 'Inter-Medium',
    },
    remainingText: {
        color: '#8E8E93',
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        borderRadius: 9999,
    },
    progressBar: {
        height: 10,
        backgroundColor: '#2ECC71',
        borderRadius: 9999,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        height: 40,
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        borderRadius: 8,
        gap: 8,
        marginLeft: 10
    },
    editButtonText: {
        color: '#2ECC71',
        fontSize: 14,
        fontFamily: 'Inter-Bold',
    },
    transactionsTitle: {
        fontSize: 22,
        fontFamily: 'Inter-Bold',
        color: '#1C1C1E',
        marginBottom: 12,
        paddingTop: 8,
    },
    transactionsList: {
        gap: 12,
    },
    transactionItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    transactionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
    },
    transactionDetails: {
        flex: 1,
    },
    transactionDescription: {
        fontFamily: 'Inter-Bold',
        color: '#1C1C1E',
    },
    transactionDate: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'Inter-Regular',
    },
    transactionAmount: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: '#1C1C1E',
    },
    input: {
      flex: 1,
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      fontFamily: 'Inter-Regular',
    }
});
