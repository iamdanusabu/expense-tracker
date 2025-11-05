
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useExpenses } from '../contexts/ExpenseContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function SettingsScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { budget, setBudget, expenses, deleteExpense, categories, totalSpent, allExpenses } = useExpenses(currentDate);
  const [budgetInput, setBudgetInput] = useState(budget.toString());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

  useEffect(() => {
    setBudgetInput(budget.toString());
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

  const handleExport = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Missing Dates', 'Please enter both a start and end date.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        Alert.alert('Invalid Dates', 'Please enter valid dates in YYYY-MM-DD format.');
        return;
    }

    end.setHours(23, 59, 59, 999);

    const filteredExpenses = allExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= start && expenseDate <= end;
    });

    if (filteredExpenses.length === 0) {
        Alert.alert('No Data', 'No expenses found in the selected date range.');
        return;
    }

    const totalSpentInRange = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const categoryWiseSummaryInRange = filteredExpenses.reduce((acc, expense) => {
        const categoryName = getCategoryName(expense.category);
        if (!acc[categoryName]) {
            acc[categoryName] = 0;
        }
        acc[categoryName] += expense.amount;
        return acc;
    }, {});


    let csvContent = "";
    
    csvContent += "Type,Value\n";
    csvContent += `Budget for Period,${budget}\n`;
    csvContent += `Total Spent,${totalSpentInRange.toFixed(2)}\n\n`;
    
    csvContent += "Category,Amount Spent\n";
    for (const category in categoryWiseSummaryInRange) {
        csvContent += `${category},${categoryWiseSummaryInRange[category].toFixed(2)}\n`;
    }
    csvContent += "\n";

    csvContent += "Date,Description,Category,Amount\n";
    filteredExpenses.forEach(expense => {
        const categoryName = getCategoryName(expense.category);
        csvContent += `${new Date(expense.date).toISOString().split('T')[0]},"${expense.description}",${categoryName},${expense.amount.toFixed(2)}\n`;
    });

    try {
        if (Platform.OS === 'web') {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', 'expenses.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const uri = FileSystem.cacheDirectory + 'expenses.csv';
            await FileSystem.writeAsStringAsync(uri, csvContent, {
                encoding: 'utf8',
            });
            await Sharing.shareAsync(uri, {
                mimeType: 'text/csv',
                dialogTitle: 'Export Expense Data',
            });
        }
    } catch (error) {
        console.error('Export failed:', error);
        Alert.alert('Export Failed', 'Could not save or share the file.');
    }
  };

  const showDatePicker = (type) => {
    if (type === 'start') {
      setStartDatePickerVisibility(true);
    } else {
      setEndDatePickerVisibility(true);
    }
  };

  const hideDatePicker = (type) => {
    if (type === 'start') {
      setStartDatePickerVisibility(false);
    } else {
      setEndDatePickerVisibility(false);
    }
  };

  const handleConfirm = (date, type) => {
    const formattedDate = date.toISOString().split('T')[0];
    if (type === 'start') {
      setStartDate(formattedDate);
    } else {
      setEndDate(formattedDate);
    }
    hideDatePicker(type);
  };

  const budgetSpentPercentage = budget > 0 ? (totalSpent / budget) * 100 : 0;

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
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
            <TextInput
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

        <View style={styles.exportCard}>
          <Text style={styles.cardTitle}>Export Data</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.dateRangeContainer}>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.webDateInput} />
                <Text style={styles.dateRangeSeparator}>to</Text>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.webDateInput} />
            </View>
          ) : (
            <View style={styles.dateRangeContainer}>
                <TouchableOpacity onPress={() => showDatePicker('start')} style={styles.dateInput}>
                    <Text style={styles.dateText}>{startDate || 'YYYY-MM-DD'}</Text>
                </TouchableOpacity>
                <Text style={styles.dateRangeSeparator}>to</Text>
                <TouchableOpacity onPress={() => showDatePicker('end')} style={styles.dateInput}>
                    <Text style={styles.dateText}>{endDate || 'YYYY-MM-DD'}</Text>
                </TouchableOpacity>
            </View>
          )}
          <DateTimePickerModal
            isVisible={isStartDatePickerVisible}
            mode="date"
            onConfirm={(date) => handleConfirm(date, 'start')}
            onCancel={() => hideDatePicker('start')}
          />
          <DateTimePickerModal
            isVisible={isEndDatePickerVisible}
            mode="date"
            onConfirm={(date) => handleConfirm(date, 'end')}
            onCancel={() => hideDatePicker('end')}
          />
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
              <Text style={styles.exportButtonText}>Export CSV</Text>
          </TouchableOpacity>
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
    exportCard: {
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
    dateRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateInput: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontFamily: 'Inter-Regular',
        justifyContent: 'center',
    },
    webDateInput: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontFamily: 'Inter-Regular',
    },
    dateText: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    dateRangeSeparator: {
        marginHorizontal: 10,
        fontFamily: 'Inter-Regular',
        color: '#8E8E93',
    },
    exportButton: {
        backgroundColor: '#2ECC71',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    exportButtonText: {
        color: '#FFFFFF',
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
