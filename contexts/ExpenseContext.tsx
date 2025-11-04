import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define TypeScript interfaces for our data structures
export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ExpenseContextType {
  // Budget
  budget: number;
  setBudget: (amount: number) => void;
  
  // Categories
  categories: Category[];
  addCategory: (name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  
  // Computed values
  totalSpent: number;
  remainingBalance: number;
  categoryWiseSummary: { [key: string]: number };
}

// Create the context
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Storage keys for AsyncStorage
const STORAGE_KEYS = {
  BUDGET: '@expense_tracker_budget',
  CATEGORIES: '@expense_tracker_categories',
  EXPENSES: '@expense_tracker_expenses',
};

// Default categories to start with
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food', color: '#FF6B6B' },
  { id: '2', name: 'Transport', color: '#4ECDC4' },
  { id: '3', name: 'Shopping', color: '#45B7D1' },
  { id: '4', name: 'Entertainment', color: '#FFA07A' },
  { id: '5', name: 'Bills', color: '#98D8C8' },
];

// Provider component that wraps the app
export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budget, setBudgetState] = useState<number>(0);
  const [categories, setCategoriesState] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [expenses, setExpensesState] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from AsyncStorage when app starts
  useEffect(() => {
    loadData();
  }, []);

  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [budget, categories, expenses, isLoaded]);

  // Load all data from AsyncStorage
  const loadData = async () => {
    try {
      const [budgetData, categoriesData, expensesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BUDGET),
        AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES),
        AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
      ]);

      if (budgetData) setBudgetState(JSON.parse(budgetData));
      if (categoriesData) setCategoriesState(JSON.parse(categoriesData));
      if (expensesData) setExpensesState(JSON.parse(expensesData));

      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoaded(true);
    }
  };

  // Save all data to AsyncStorage
  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget)),
        AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)),
        AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)),
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Set the monthly budget
  const setBudget = (amount: number) => {
    setBudgetState(amount);
  };

  // Add a new category
  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
    };
    setCategoriesState([...categories, newCategory]);
  };

  // Delete a category
  const deleteCategory = (id: string) => {
    setCategoriesState(categories.filter(cat => cat.id !== id));
  };

  // Add a new expense
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpensesState([...expenses, newExpense]);
  };

  // Delete an expense
  const deleteExpense = (id: string) => {
    setExpensesState(expenses.filter(exp => exp.id !== id));
  };

  // Calculate total spent across all expenses
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate remaining balance
  const remainingBalance = budget - totalSpent;

  // Calculate category-wise summary of expenses
  const categoryWiseSummary = expenses.reduce((summary, expense) => {
    summary[expense.category] = (summary[expense.category] || 0) + expense.amount;
    return summary;
  }, {} as { [key: string]: number });

  const value: ExpenseContextType = {
    budget,
    setBudget,
    categories,
    addCategory,
    deleteCategory,
    expenses,
    addExpense,
    deleteExpense,
    totalSpent,
    remainingBalance,
    categoryWiseSummary,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

// Custom hook to use the expense context
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
