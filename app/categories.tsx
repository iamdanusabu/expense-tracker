
import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useExpenses } from '../contexts/ExpenseContext';

const colorPalette = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E57373',
  '#FFC107', '#009688', '#795548', '#607D8B', '#8BC34A'
];

const categoryIcons = {
    'Food': 'restaurant',
    'Rent': 'home',
    'Utilities': 'electric_bolt',
    'Entertainment': 'movie',
    'Health': 'health_and_safety',
    'Groceries': 'shopping_cart',
    'Transport': 'directions-bus',
    'Shopping': 'shopping-bag',
    'Bills': 'receipt-long',
};

const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || 'category';
}


export default function CategoriesScreen() {
  const { categories, addCategory, deleteCategory, setCategoryBudget } = useExpenses();
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryBudgetInput, setCategoryBudgetInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorPalette[0]);

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedCategory(null);
    setCategoryName('');
    setCategoryBudgetInput('');
    setSelectedColor(colorPalette[0]);
    setModalVisible(true);
  };

  const openEditModal = (category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryBudgetInput(category.budget ? category.budget.toString() : '');
    setSelectedColor(category.color);
    setModalVisible(true);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Category name cannot be empty.');
      return;
    }
    const budgetValue = parseFloat(categoryBudgetInput) || 0;

    if (isEditMode && selectedCategory) {
      // This is an update. We need a function for this in the context.
      // For now, let's assume we can update budget this way.
      setCategoryBudget(selectedCategory.id, budgetValue); 
      // We may need an `updateCategory` function for name and color.
    } else {
      addCategory(categoryName, selectedColor, budgetValue);
    }
    setModalVisible(false);
  };
  
  const handleDelete = (id) => {
      Alert.alert("Delete Category", "Are you sure you want to delete this category?", [
          {text: "Cancel", style: "cancel"},
          {text: "Delete", style: "destructive", onPress: () => deleteCategory(id)}
      ])
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.mainContent}>
        {categories.map((cat) => (
          <CategoryItem 
            key={cat.id} 
            category={cat} 
            onEdit={() => openEditModal(cat)}
            onDelete={() => handleDelete(cat.id)}
          />
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <MaterialIcons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      <CategoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveCategory}
        isEditMode={isEditMode}
        categoryName={categoryName}
        setCategoryName={setCategoryName}
        categoryBudget={categoryBudgetInput}
        setCategoryBudget={setCategoryBudgetInput}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />
    </View>
  );
}

const Header = () => (
  <View style={styles.header}>
    <TouchableOpacity>
      <MaterialIcons name="arrow-back" size={24} color="#333333" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Manage Categories</Text>
    <View style={{ width: 24 }} />
  </View>
);

const CategoryItem = ({ category, onEdit, onDelete }) => (
  <View style={styles.itemContainer}>
    <View style={styles.itemInfo}>
      <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
        <MaterialIcons name={getCategoryIcon(category.name)} size={24} color="#FFFFFF" />
      </View>
      <View>
        <Text style={styles.itemName}>{category.name}</Text>
        <Text style={styles.itemBudget}>
          {category.budget ? `Budget: ₹${category.budget.toFixed(2)}` : 'No budget set'}
        </Text>
      </View>
    </View>
    <View style={styles.itemActions}>
      <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
        <MaterialIcons name="edit" size={20} color="#333333" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
        <MaterialIcons name="delete" size={20} color="#E57373" />
      </TouchableOpacity>
    </View>
  </View>
);

const CategoryModal = ({ visible, onClose, onSave, isEditMode, ...props }) => (
  <Modal visible={visible} transparent={true} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{isEditMode ? 'Edit Category' : 'New Category'}</Text>
        
        <Text style={styles.label}>Category Name</Text>
        <TextInput
          style={styles.input}
          value={props.categoryName}
          onChangeText={props.setCategoryName}
          placeholder="e.g., Groceries"
        />
        
        <Text style={styles.label}>Monthly Budget (Optional)</Text>
        <View style={styles.budgetInputContainer}>
            <Text style={{fontSize: 16, color: '#333333/50', fontFamily: 'Inter-Regular'}}>₹</Text>
            <TextInput
            style={styles.budgetTextInput}
            value={props.categoryBudget}
            onChangeText={props.setCategoryBudget}
            placeholder="0.00"
            keyboardType="numeric"
            />
        </View>

        <Text style={styles.label}>Choose a Color</Text>
        <View style={styles.colorGrid}>
          {colorPalette.map(color => (
            <TouchableOpacity 
              key={color} 
              style={[styles.colorOption, { backgroundColor: color }, props.selectedColor === color && styles.selectedColor ]} 
              onPress={() => props.setSelectedColor(color)}
            />
          ))}
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity onPress={onClose} style={[styles.modalButton, styles.cancelButton]}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSave} style={[styles.modalButton, styles.saveButton]}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
      backgroundColor: 'rgba(247, 248, 252, 0.8)'
  },
  headerTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#333333' },
  mainContent: { padding: 16 },
  itemContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      backgroundColor: '#FFFFFF', 
      padding: 12, 
      borderRadius: 8,
      marginBottom: 8
  },
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  itemName: { fontSize: 16, fontFamily: 'Inter-Medium', color: '#333333' },
  itemBudget: { fontSize: 12, color: '#333333', fontFamily: 'Inter-Regular' },
  itemActions: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 8 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { 
      width: '90%',
      backgroundColor: '#F7F8FC',
      borderRadius: 16,
      padding: 24,
      gap: 16
  },
  modalTitle: { fontSize: 20, fontFamily: 'Inter-Bold', color: '#333333' },
  label: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#333333' },
  input: { 
      backgroundColor: '#FFFFFF', 
      borderWidth: 1, 
      borderColor: '#E0E0E0', 
      borderRadius: 8, 
      padding: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular'
  },
  budgetInputContainer: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: '#FFFFFF', 
      borderWidth: 1, 
      borderColor: '#E0E0E0', 
      borderRadius: 8, 
      paddingHorizontal: 12,
  },
  budgetTextInput: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      fontSize: 16,
      fontFamily: 'Inter-Regular'
  },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorOption: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  selectedColor: { borderColor: '#4CAF50' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingTop: 16 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  cancelButton: { backgroundColor: '#E0E0E0' },
  cancelButtonText: { fontFamily: 'Inter-Regular' },
  saveButton: { backgroundColor: '#4CAF50' },
  saveButtonText: { color: '#FFFFFF', fontFamily: 'Inter-Bold' },
});
