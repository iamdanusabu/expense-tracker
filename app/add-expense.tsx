
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useExpenses } from '../contexts/ExpenseContext';

// Mocks for category icons - replace with your actual logic
const getCategoryIcon = (categoryName) => {
    const icons = {
      'Food & Drink': 'restaurant',
      'Groceries': 'shopping-cart',
      'Transport': 'directions-bus',
      'Utilities': 'receipt',
       'Rent': 'home',
      'Entertainment': 'movie',
      'Health': 'health_and_safety',
      // ... add other mappings
    };
    return icons[categoryName] || 'category'; // default icon
};

export default function AddExpenseScreen() {
  const router = useRouter();
  const { categories, addExpense } = useExpenses();

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('No Category', 'Please select a category.');
      return;
    }

    addExpense({
      amount: parsedAmount,
      category: selectedCategory.id,
      description,
      date,
    });
    router.back();
  };

  const onSelectCategory = (category) => {
      setSelectedCategory(category)
      setCategoryModalVisible(false)
  }

  return (
    <View style={styles.container}>
      <Header onSave={handleSave} />
      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="#9E9E9E"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setCategoryModalVisible(true)}>
            <View style={styles.pickerButtonContent}>
                <MaterialIcons name={getCategoryIcon(selectedCategory?.name)} size={24} color="#4CAF50" />
                <Text style={styles.pickerButtonText}>{selectedCategory ? selectedCategory.name : 'Select a category'}</Text>
            </View>
            <MaterialIcons name="arrow-drop-down" size={24} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateInputContainer}>
            <MaterialIcons name="calendar-today" size={24} color="#9E9E9E" style={styles.dateIcon} />
            <TextInput
              style={styles.dateInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., Lunch with a client"
            placeholderTextColor="#9E9E9E"
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomSaveButton} onPress={handleSave}>
          <Text style={styles.bottomSaveButtonText}>Save Expense</Text>
        </TouchableOpacity>
      </View>

      <CategoryPickerModal 
        visible={categoryModalVisible} 
        categories={categories}
        onClose={() => setCategoryModalVisible(false)}
        onSelect={onSelectCategory}
      />
    </View>
  );
}

const Header = ({ onSave }) => {
    const router = useRouter();
    return(
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <TouchableOpacity onPress={onSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    )
};

const CategoryPickerModal = ({ visible, categories, onClose, onSelect }) => (
  <Modal visible={visible} transparent={true} animationType="slide">
    <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Choose Category</Text>
        <ScrollView>
            {categories.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.categoryOption} onPress={() => onSelect(cat)}>
                <MaterialIcons name={getCategoryIcon(cat.name)} size={24} color="#4CAF50" />
                <Text style={styles.categoryOptionText}>{cat.name}</Text>
            </TouchableOpacity>
            ))}
        </ScrollView>
        </View>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F7F8FC',
  },
  headerButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#333333' },
  saveButton: { backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 9999 },
  saveButtonText: { color: '#FFFFFF', fontFamily: 'Inter-Bold' },
  mainContent: { padding: 16, gap: 24 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#333333' },
  amountInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, height: 80 },
  currencySymbol: { fontSize: 24, color: '#9E9E9E', paddingLeft: 16, fontFamily: 'Inter-Regular' },
  amountInput: { flex: 1, padding: 16, fontSize: 36, fontFamily: 'Inter-Bold', color: '#333333' },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    height: 56,
  },
  pickerButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pickerButtonText: { fontSize: 16, fontFamily: 'Inter-Regular' },
  dateInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      height: 56,
  },
  dateIcon: { paddingHorizontal: 16 },
  dateInput: { flex: 1, paddingRight: 16, fontSize: 16, fontFamily: 'Inter-Regular' },
  descriptionInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    minHeight: 112,
    textAlignVertical: 'top',
    fontSize: 16,
    fontFamily: 'Inter-Regular'
  },
  bottomBar: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#F7F8FC',
    borderTopWidth: 1,
    borderColor: '#E0E0E0'
  },
  bottomSaveButton: {
    backgroundColor: '#4CAF50',
    height: 56,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomSaveButtonText: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter-Bold' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '50%' },
  modalTitle: { fontSize: 20, fontFamily: 'Inter-Bold', marginBottom: 16, textAlign: 'center' },
  categoryOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#E0E0E0', gap: 16 },
  categoryOptionText: { fontSize: 16, fontFamily: 'Inter-Regular' },
});
