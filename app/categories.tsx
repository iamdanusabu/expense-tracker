import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Title, List, IconButton, TextInput, Button, FAB, Dialog, Portal } from 'react-native-paper';
import { useExpenses } from '../contexts/ExpenseContext';

/**
 * Categories Screen Component
 * Allows users to:
 * - View all expense categories
 * - Add new categories
 * - Delete existing categories
 * - Set a budget for each category
 * Each category has a name and color
 */
export default function CategoriesScreen() {
  const { categories, addCategory, deleteCategory, setCategoryBudget } = useExpenses();

  // State for adding new category
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');

  // State for setting category budget
  const [budgetDialogVisible, setBudgetDialogVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string; budget?: number } | null>(null);
  const [budgetInput, setBudgetInput] = useState('');

  // Predefined color palette for categories
  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#9575CD',
  ];

  // Handle adding a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a category name.');
      return;
    }

    // Check if category already exists
    const exists = categories.some(
      cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (exists) {
      Alert.alert('Duplicate Category', 'A category with this name already exists.');
      return;
    }

    // Add the category
    addCategory(newCategoryName.trim(), selectedColor);

    // Reset form
    setNewCategoryName('');
    setSelectedColor('#FF6B6B');
    setShowAddForm(false);

    Alert.alert('Success', 'Category added successfully!');
  };

  // Handle deleting a category
  const handleDeleteCategory = (id: string, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"? This won't delete associated expenses.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteCategory(id)
        },
      ]
    );
  };
  
  // Show the dialog to set category budget
  const showBudgetDialog = (category: { id: string; name: string; budget?: number }) => {
    setSelectedCategory(category);
    setBudgetInput(category.budget ? String(category.budget) : '');
    setBudgetDialogVisible(true);
  };

  // Hide the dialog
  const hideBudgetDialog = () => {
    setBudgetDialogVisible(false);
    setSelectedCategory(null);
    setBudgetInput('');
  };

  // Handle setting the category budget
  const handleSetCategoryBudget = () => {
    if (selectedCategory) {
      const budgetValue = parseFloat(budgetInput);
      if (!isNaN(budgetValue) && budgetValue >= 0) {
        setCategoryBudget(selectedCategory.id, budgetValue);
        hideBudgetDialog();
        Alert.alert('Success', `Budget for ${selectedCategory.name} has been set.`);
      } else {
        Alert.alert('Invalid Budget', 'Please enter a valid non-negative number for the budget.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Existing Categories List */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Your Categories</Title>
            {categories.length > 0 ? (
              <List.Section>
                {categories.map((category) => (
                  <List.Item
                    key={category.id}
                    title={category.name}
                    description={category.budget ? `Budget: $${category.budget.toFixed(2)}` : 'No budget set'}
                    left={() => (
                      <View 
                        style={[
                          styles.colorIndicator, 
                          { backgroundColor: category.color }
                        ]} 
                      />
                    )}
                    right={() => (
                      <View style={{flexDirection: 'row'}}>
                        <IconButton
                          icon="cash-plus"
                          size={20}
                          onPress={() => showBudgetDialog(category)}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          onPress={() => handleDeleteCategory(category.id, category.name)}
                        />
                      </View>
                    )}
                  />
                ))}
              </List.Section>
            ) : (
              <List.Item title="No categories yet. Add one below!" />
            )}
          </Card.Content>
        </Card>

        {/* Add Category Form */}
        {showAddForm && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Add New Category</Title>

              {/* Category Name Input */}
              <TextInput
                label="Category Name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Healthcare"
              />

              {/* Color Selection */}
              <Title style={styles.sectionTitle}>Choose Color</Title>
              <View style={styles.colorPalette}>
                {colorPalette.map((color) => (
                  <IconButton
                    key={color}
                    icon={selectedColor === color ? 'check-circle' : 'circle'}
                    iconColor={color}
                    size={40}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorButton,
                      selectedColor === color && styles.selectedColor
                    ]}
                  />
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <Button 
                  mode="contained" 
                  onPress={handleAddCategory}
                  style={styles.addButton}
                >
                  Add Category
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    setShowAddForm(false);
                    setNewCategoryName('');
                    setSelectedColor('#FF6B6B');
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Floating Action Button to show add form */}
      {!showAddForm && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setShowAddForm(true)}
          label="Add Category"
        />
      )}

      {/* Set Category Budget Dialog */}
      <Portal>
        <Dialog visible={budgetDialogVisible} onDismiss={hideBudgetDialog}>
          <Dialog.Title>Set Budget for {selectedCategory?.name}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Budget Amount"
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideBudgetDialog}>Cancel</Button>
            <Button onPress={handleSetCategoryBudget}>Set Budget</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  colorIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginTop: 8,
  },
  input: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  colorButton: {
    margin: 4,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 25,
  },
  buttonContainer: {
    marginTop: 16,
  },
  addButton: {
    marginVertical: 4,
    backgroundColor: '#6200ee',
  },
  cancelButton: {
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