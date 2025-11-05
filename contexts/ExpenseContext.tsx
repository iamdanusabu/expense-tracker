
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces
export interface Category { id: string; name: string; color: string; budget?: number; }
export interface Expense { id: string; amount: number; category: string; description: string; date: string; }

// Context Type
interface ExpenseContextType {
  budget: number;
  setBudget: (amount: number) => void;
  categories: Category[];
  addCategory: (name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  setCategoryBudget: (categoryId: string, budget: number) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Storage Keys
const STORAGE_KEYS = {
  BUDGET: '@expense_tracker_budget',
  CATEGORIES: '@expense_tracker_categories',
  EXPENSES: '@expense_tracker_expenses',
};

// Default Categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food', color: '#FF6B6B' },
  { id: '2', name: 'Transport', color: '#4ECDC4' },
  { id: '3', name: 'Shopping', color: '#45B7D1' },
  { id: '4', name: 'Entertainment', color: '#FFA07A' },
  { id: '5', name: 'Bills', color: '#98D8C8' },
];

// Provider Component
export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [budget, setBudgetState] = useState<number>(0);
    const [categories, setCategoriesState] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [expenses, setExpensesState] = useState<Expense[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => { loadData(); }, []);

    useEffect(() => { if (isLoaded) { saveData(); } }, [budget, categories, expenses, isLoaded]);

    const loadData = async () => {
        try {
            const [budgetData, categoriesData, expensesData] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.BUDGET),
                AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES),
                AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
            ]);
            if (budgetData) setBudgetState(JSON.parse(budgetData));
            if (categoriesData) setCategoriesState(JSON.parse(categoriesData));
            else setCategoriesState(DEFAULT_CATEGORIES);
            if (expensesData) setExpensesState(JSON.parse(expensesData));
            setIsLoaded(true);
        } catch (error) {
            console.error('Error loading data:', error);
            setIsLoaded(true);
        }
    };

    const saveData = async () => {
        try {
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget)),
                AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)),
                AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)),
            ]);
        } catch (error) { console.error('Error saving data:', error); }
    };

    const setBudget = (amount: number) => { setBudgetState(amount); };
    const setCategoryBudget = (categoryId: string, categoryBudget: number) => {
        setCategoriesState(prev => prev.map(c => c.id === categoryId ? { ...c, budget: categoryBudget } : c));
    };
    const addCategory = (name: string, color: string) => {
        setCategoriesState(prev => [...prev, { id: Date.now().toString(), name, color }]);
    };
    const deleteCategory = (id: string) => {
        setCategoriesState(prev => prev.filter(c => c.id !== id));
    };
    const addExpense = (expense: Omit<Expense, 'id'>) => {
        setExpensesState(prev => [...prev, { ...expense, id: Date.now().toString() }]);
    };
    const deleteExpense = (id: string) => {
        setExpensesState(prev => prev.filter(e => e.id !== id));
    };

    const value: ExpenseContextType = { budget, setBudget, categories, addCategory, deleteCategory, setCategoryBudget, expenses, addExpense, deleteExpense };

    return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

// Custom Hook
export const useExpenses = (date: Date = new Date()) => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }

  const { budget, expenses: allExpenses, ...rest } = context;

  const year = date.getFullYear();
  const month = date.getMonth();

  const monthlyExpenses = allExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
  });

  const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categoryWiseSummary = monthlyExpenses.reduce((summary, expense) => {
      const category = context.categories.find(c => c.id === expense.category);
      if (category) {
          const spent = (summary[expense.category]?.spent || 0) + expense.amount;
          summary[expense.category] = { spent, budget: category.budget };
      }
      return summary;
  }, {} as { [key: string]: { spent: number; budget?: number } });

  context.categories.forEach(category => {
      if (!categoryWiseSummary[category.id]) {
          categoryWiseSummary[category.id] = { spent: 0, budget: category.budget };
      }
  });

  return {
    ...rest,
    budget,
    expenses: monthlyExpenses, // Keep the name `expenses` for compatibility. This is now FILTERED.
    allExpenses, // New property with all expenses.
    totalSpent,
    categoryWiseSummary,
  };
};
