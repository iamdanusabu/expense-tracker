
import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenses } from '../contexts/ExpenseContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const {
    budget,
    totalSpent,
    categories,
    categoryWiseSummary,
  } = useExpenses();

  const remainingBalance = (budget || 0) - (totalSpent || 0);
  const totalSpentPercentage = (budget || 0) > 0 ? ((totalSpent || 0) / (budget || 0)) * 100 : 0;

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

  const displayCategorySummary = categories.map(category => {
    const summary = categoryWiseSummary[category.id] || { spent: 0, budget: category.budget || 0 };
    return {
      id: category.id,
      name: category.name,
      spent: summary.spent,
      budget: summary.budget,
      color: category.color,
      icon: getCategoryIcon(category.name),
    };
  });

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.main}>
        <BudgetSummary
          remaining={remainingBalance}
          budget={budget}
          spent={totalSpent}
          spentPercentage={totalSpentPercentage}
        />
        <CategorySpending summary={displayCategorySummary} />
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const Header = () => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.headerIconContainer}>
      <MaterialIcons name="menu" size={24} style={styles.icon} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Monthly Overview</Text>
    <TouchableOpacity style={styles.headerIconContainer}>
      <MaterialIcons name="calendar-today" size={24} style={styles.icon} />
    </TouchableOpacity>
  </View>
);

const BudgetSummary = ({ remaining = 0, budget = 0, spent = 0, spentPercentage = 0 }) => (
  <View style={styles.budgetSummaryCard}>
    <Text style={styles.remainingText}>₹{remaining.toFixed(2)} Remaining</Text>
    <Text style={styles.budgetText}>out of ₹{budget.toFixed(2)} budget</Text>
    <View style={styles.progressContainer}>
      <View style={styles.totalSpentRow}>
        <Text style={styles.totalSpentLabel}>Total Spent</Text>
        <Text style={styles.totalSpentValue}>₹{spent.toFixed(2)}</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBar, { width: `${spentPercentage}%` }]} />
      </View>
    </View>
  </View>
);

const CategorySpending = ({ summary }) => (
  <View>
    <View style={styles.categoryHeader}>
      <Text style={styles.categoryTitle}>Spending by Category</Text>
      <TouchableOpacity>
        <Text style={styles.viewAllText}>View All</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.categoryList}>
      {summary.map((item) => (
        <CategoryItem key={item.id} item={item} />
      ))}
    </View>
  </View>
);

const CategoryItem = ({ item }) => {
  const spent = item.spent || 0;
  const budget = item.budget || 0;
  const spentPercentage = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <View style={styles.categoryItemCard}>
      <View style={[styles.categoryIconContainer, { backgroundColor: `${item.color}20` }]}>
        <MaterialIcons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.categoryInfo}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryAmount}>
            ₹{spent.toFixed(2)} <Text style={styles.categoryBudget}>/ ₹{budget.toFixed(2)}</Text>
          </Text>
        </View>
        <View style={styles.categoryProgressBarBackground}>
          <View style={[styles.categoryProgressBar, { width: `${spentPercentage}%`, backgroundColor: item.color }]} />
        </View>
      </View>
    </View>
  );
};

const BottomNav = () => {
    const router = useRouter();
    return(
        <View style={styles.nav}>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
            <MaterialIcons name="home" size={24} style={styles.navIconActive} />
            <Text style={styles.navTextActive}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/add-expense')}>
            <MaterialIcons name="add-shopping-cart" size={24} style={styles.navIcon} />
            <Text style={styles.navText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
            <MaterialIcons name="category" size={24} style={styles.navIcon} />
            <Text style={styles.navText}>Add Category</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
            <MaterialIcons name="settings" size={24} style={styles.navIcon} />
            <Text style={styles.navText}>Settings</Text>
            </TouchableOpacity>
        </View>
    )
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f6', // background-light
    fontFamily: 'Inter-Bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40, // Adjust for status bar
    paddingBottom: 12,
    backgroundColor: 'rgba(246, 248, 246, 0.8)', // background-light with opacity
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#0d1b0d', // text-light-primary
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0d1b0d', // text-light-primary
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
  },
  budgetSummaryCard: {
    backgroundColor: '#ffffff', // card-light
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  remainingText: {
    fontSize: 30,
    fontFamily: 'Inter-ExtraBold',
    color: '#0d1b0d', // text-light-primary
  },
  budgetText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#435943', // text-light-secondary
    paddingTop: 4,
  },
  progressContainer: {
    marginTop: 16,
  },
  totalSpentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalSpentLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0d1b0d', // text-light-primary
  },
  totalSpentValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0d1b0d', // text-light-primary
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(19, 236, 19, 0.2)', // primary with 20% opacity
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#13ec13', // primary
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#0d1b0d', // text-light-primary
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#13ec13', // primary
  },
  categoryList: {
    gap: 12,
  },
  categoryItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // card-light
    borderRadius: 8,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryName: {
    fontFamily: 'Inter-SemiBold',
    color: '#0d1b0d', // text-light-primary
  },
  categoryAmount: {
    fontFamily: 'Inter-Medium',
    color: '#0d1b0d', // text-light-primary
  },
  categoryBudget: {
    fontFamily: 'Inter-Regular',
    color: '#435943', // text-light-secondary
  },
  categoryProgressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(19, 236, 19, 0.2)', // primary with 20% opacity
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  categoryProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e0e6e0', // border-light
    backgroundColor: 'rgba(246, 248, 246, 0.8)', // background-light with opacity
    paddingTop: 8,
    paddingBottom: 24, // For home indicator
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navIcon: {
    color: '#435943', // text-light-secondary
  },
  navIconActive: {
    color: '#13ec13', // primary
  },
  navText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#435943', // text-light-secondary
  },
  navTextActive: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#13ec13', // primary
  },
});
