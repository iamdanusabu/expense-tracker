import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define TypeScript interfaces for our data structures
export interface Category {
  id: string;
  name: string;
  color: string;
  budget?: number;
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
  setCategoryBudget: (categoryId: string, budget: number) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  
  // Computed values (Total across all time)
  totalSpent: number;
  remainingBalance: number;
  categoryWiseSummary: { [key: string]: { spent: number; budget?: number; remaining?: number } };
  
  // Helper functions for filtering by month
  getExpensesForMonth: (year: number, month: number) => Expense[];
  getMonthlySpent: (year: number, month: number) => number;
  getMonthlyCategoryWiseSummary: (year: number, month: number) => { [key: string]: { spent: number; budget?: number; remaining?: number } };
  getAvailableMonths: () => string[];
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
  
  // Set the category budget
  const setCategoryBudget = (categoryId: string, budget: number) => {
    setCategoriesState(prevCategories =>
      prevCategories.map(category =>
        category.id === categoryId ? { ...category, budget } : category
      )
    );
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

  // Calculate category-wise summary of expenses (total across all time)
    const categoryWiseSummary = expenses.reduce((summary, expense) => {
        const category = categories.find(c => c.id === expense.category);
        if (category) {
            const spent = (summary[expense.category]?.spent || 0) + expense.amount;
            const budget = category.budget;
            const remaining = budget !== undefined ? budget - spent : undefined;
            summary[expense.category] = { spent, budget, remaining };
        }
        return summary;
    }, {} as { [key: string]: { spent: number; budget?: number; remaining?: number } });

    categories.forEach(category => {
        if (!categoryWiseSummary[category.id]) {
            const budget = category.budget;
            const remaining = budget !== undefined ? budget : undefined;
            categoryWiseSummary[category.id] = { spent: 0, budget, remaining };
        }
    });

  // Get expenses for a specific month
  const getExpensesForMonth = (year: number, month: number): Expense[] => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
  };

  // Get total spent for a specific month
  const getMonthlySpent = (year: number, month: number): number => {
    const monthExpenses = getExpensesForMonth(year, month);
    return monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Get category-wise summary for a specific month
    const getMonthlyCategoryWiseSummary = (year: number, month: number): { [key: string]: { spent: number; budget?: number; remaining?: number } } => {
        const monthExpenses = getExpensesForMonth(year, month);
        const summary = monthExpenses.reduce((summary, expense) => {
            const category = categories.find(c => c.id === expense.category);
            if (category) {
                const spent = (summary[expense.category]?.spent || 0) + expense.amount;
                const budget = category.budget;
                const remaining = budget !== undefined ? budget - spent : undefined;
                summary[expense.category] = { spent, budget, remaining };
            }
            return summary;
        }, {} as { [key: string]: { spent: number; budget?: number; remaining?: number } });
        
        categories.forEach(category => {
            if (!summary[category.id]) {
                const budget = category.budget;
                const remaining = budget !== undefined ? budget : undefined;
                summary[category.id] = { spent: 0, budget, remaining };
            }
        });

        return summary;
    };


  // Get list of all months that have expenses (formatted as "YYYY-MM")
  const getAvailableMonths = (): string[] => {
    const monthSet = new Set<string>();
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthSet.add(monthKey);
    });
    return Array.from(monthSet).sort().reverse();
  };

  const value: ExpenseContextType = {
    budget,
    setBudget,
    categories,
    addCategory,
    deleteCategory,
    setCategoryBudget,
    expenses,
    addExpense,
    deleteExpense,
    totalSpent,
    remainingBalance,
    categoryWiseSummary,
    getExpensesForMonth,
    getMonthlySpent,
    getMonthlyCategoryWiseSummary,
    getAvailableMonths,
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
