import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Wallet, PiggyBank, TrendingUp, User, Plus, Minus, History, Target, 
  ChevronRight, DollarSign, X, Edit2, Trash2, Home, Settings,
  Sparkles, PiggyBank as SavingsIcon, Search, Download,
  MoreVertical, Check, ChevronDown, BadgeDollarSign
} from 'lucide-react';
import './src/design-system.css';
import { ChildAvatar, AddChildAvatar } from './src/AvatarIllustrations.jsx';
import { BalanceChart } from './src/BalanceChart.jsx';
import confetti from 'canvas-confetti';

// ============================================
// SPRINT 5: DATA & PERSISTENCE
// ============================================

// Storage keys
const STORAGE_KEYS = {
  CHILDREN: 'family_bank_children',
  TRANSACTIONS: 'family_bank_transactions',
  GOALS: 'family_bank_goals',
  SETTINGS: 'family_bank_settings',
  LAST_INTEREST_DATE: 'family_bank_last_interest'
};

// Transaction categories
const TRANSACTION_CATEGORIES = {
  deposit: [
    { id: 'allowance', label: 'Allowance', icon: '💰' },
    { id: 'chore', label: 'Chore', icon: '🧹' },
    { id: 'gift', label: 'Gift', icon: '🎁' },
    { id: 'interest', label: 'Interest', icon: '📈' },
    { id: 'other', label: 'Other', icon: '✨' }
  ],
  withdrawal: [
    { id: 'spending', label: 'Spending', icon: '🛒' },
    { id: 'treat', label: 'Treat', icon: '🍦' },
    { id: 'toy', label: 'Toy', icon: '🧸' },
    { id: 'game', label: 'Game', icon: '🎮' },
    { id: 'other', label: 'Other', icon: '📝' }
  ]
};

// Default data
const DEFAULT_CHILDREN = [
  { id: 'alex', name: 'Alex', age: 10, balance: 45.50 },
  { id: 'sam', name: 'Sam', age: 8, balance: 23.00 },
];

const DEFAULT_TRANSACTIONS = [
  { id: 1, child: 'alex', type: 'deposit', amount: 10, note: 'Weekly allowance', category: 'allowance', date: '2026-02-16' },
  { id: 2, child: 'alex', type: 'withdrawal', amount: 5, note: 'Bought toy', category: 'toy', date: '2026-02-14' },
  { id: 3, child: 'sam', type: 'deposit', amount: 8, note: 'Chore completion', category: 'chore', date: '2026-02-15' },
  { id: 4, child: 'alex', type: 'interest', amount: 0.50, note: 'Monthly interest', category: 'interest', date: '2026-02-01' },
  { id: 5, child: 'sam', type: 'withdrawal', amount: 3, note: 'Ice cream', category: 'treat', date: '2026-02-10' },
];

const DEFAULT_GOALS = [
  { id: 1, childId: 'alex', name: 'New Bike', targetAmount: 100, currentAmount: 32, icon: '🚲' },
  { id: 2, childId: 'sam', name: 'Toy Robot', targetAmount: 50, currentAmount: 15, icon: '🤖' },
  { id: 3, childId: 'alex', name: 'Video Game', targetAmount: 60, currentAmount: 20, icon: '🎮' },
];

const DEFAULT_SETTINGS = {
  interestRate: 5,
  currency: 'USD'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Load from localStorage
function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

// Save to localStorage
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Export data as JSON file
function exportData(children, transactions, goals, settings) {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    children,
    transactions,
    goals,
    settings
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `family-bank-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Calculate monthly interest
function calculateInterest(balance, rate) {
  return (balance * (rate / 100)) / 12;
}

// ============================================
// COMPONENTS
// ============================================

// Toast Notification System
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500' : 
                  type === 'error' ? 'bg-rose-500' : 
                  type === 'celebrate' ? 'bg-violet-500' : 'bg-slate-800';

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 ${bgColor} text-white px-6 py-3 rounded-full shadow-lg animate-in slide-in-from-top fade-in duration-300`}>
      <div className="flex items-center gap-2">
        {type === 'celebrate' && <Sparkles className="w-4 h-4" />}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{subtitle}</p>
      {action}
    </div>
  );
}

// Animated number component
function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 600;
    const startTime = Date.now();
    const startValue = displayValue;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * easeOut;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  return <span>{prefix}{displayValue.toFixed(2)}{suffix}</span>;
}

// Goal Card with Celebration and Delete
function GoalCard({ goal, child, onAdd, onCelebrate, onDelete }) {
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const isComplete = goal.currentAmount >= goal.targetAmount;
  const wasComplete = useRef(isComplete);
  const [showActions, setShowActions] = useState(false);
  
  useEffect(() => {
    if (isComplete && !wasComplete.current) {
      onCelebrate?.(goal);
    }
    wasComplete.current = isComplete;
  }, [isComplete, goal, onCelebrate]);

  return (
    <div className={`bg-white rounded-2xl p-5 border transition-all duration-300 ${isComplete ? 'border-violet-300 shadow-md' : 'border-slate-100'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isComplete ? 'bg-violet-100' : 'bg-slate-100'}`}>
          {isComplete ? '🎉' : goal.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate">{goal.name}</h3>
          <p className="text-sm text-slate-500">{child?.name}</p>
        </div>        
        <div className="flex items-center gap-2">
          <div className={`font-semibold ${isComplete ? 'text-violet-600' : 'text-slate-800'}`}>
            {Math.round(progress)}%
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-slate-100 rounded-lg"
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>
            {showActions && (
              <>
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      onDelete(goal.id);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
                <div className="fixed inset-0 z-0" onClick={() => setShowActions(false)} />
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-violet-500' : 'bg-violet-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {isComplete ? (
            <span className="text-violet-600 font-medium">Goal reached! 🎉</span>
          ) : (
            `$${goal.currentAmount} of $${goal.targetAmount}`
          )}
        </span>
        
        {!isComplete && (
          <button
            onClick={() => onAdd(goal.id, 5)}
            className="px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 active:scale-95 transition-all"
          >
            +$5
          </button>
        )}
      </div>
    </div>
  );
}

// Transaction Item with Edit/Delete
function TransactionItem({ transaction, child, onEdit, onDelete, showChild = false }) {
  const [showActions, setShowActions] = useState(false);
  const category = TRANSACTION_CATEGORIES[transaction.type]?.find(c => c.id === transaction.category);
  
  return (
    <div className="flex items-center justify-between p-4 group">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          transaction.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' :
          transaction.type === 'withdrawal' ? 'bg-rose-50 text-rose-600' :
          'bg-violet-50 text-violet-600'
        }`}
        >
          {transaction.type === 'deposit' ? <Plus className="w-5 h-5" /> :
           transaction.type === 'withdrawal' ? <Minus className="w-5 h-5" /> :
           <TrendingUp className="w-5 h-5" />}
        </div>
        <div>
          <div className="font-medium text-slate-800">{transaction.note}</div>
          <div className="text-sm text-slate-400 flex items-center gap-2">
            {transaction.date}
            {category && (
              <span className="flex items-center gap-1">
                <span>•</span>
                <span>{category.icon} {category.label}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`font-semibold ${
          transaction.type === 'withdrawal' ? 'text-rose-600' : 'text-emerald-600'
        }`}
        >
          {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount.toFixed(2)}
        </div>
        {showChild && (
          <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-medium text-violet-700">
            {child?.name[0]}
          </div>
        )}
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setShowActions(!showActions)}
            className="p-1 hover:bg-slate-100 rounded-lg"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
          {showActions && (
            <>
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onEdit(transaction);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(transaction);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
              <div className="fixed inset-0 z-0" onClick={() => setShowActions(false)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Child Selector Dropdown
function ChildSelector({ children, selectedChild, onSelect, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = children.find(c => c.id === selectedChild);
  
  return (
    <div className="relative">
      {label && <label className="block text-sm text-slate-500 mb-2">{label}</label>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-slate-100 rounded-xl text-slate-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-sm">
            {selected?.name[0]}
          </div>
          <span className="font-medium">{selected?.name}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => {
                  onSelect(child.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 ${selectedChild === child.id ? 'bg-violet-50' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  selectedChild === child.id ? 'bg-violet-500' : 'bg-slate-400'
                }`}>
                  {child.name[0]}
                </div>
                <span className={`${selectedChild === child.id ? 'font-medium text-violet-700' : 'text-slate-700'}`}>
                  {child.name}
                </span>
                {selectedChild === child.id && <Check className="w-4 h-4 text-amber-500 ml-auto" />}
              </button>
            ))}
          </div>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================

export default function FamilyBank() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedChild, setSelectedChild] = useState('alex');
  const [toast, setToast] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Data states with localStorage persistence
  const [children, setChildren] = useState(DEFAULT_CHILDREN);
  const [transactions, setTransactions] = useState(DEFAULT_TRANSACTIONS);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  // UI states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showEditTransactionModal, setShowEditTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef(null);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const loadedChildren = loadFromStorage(STORAGE_KEYS.CHILDREN, DEFAULT_CHILDREN);
    const loadedTransactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
    const loadedGoals = loadFromStorage(STORAGE_KEYS.GOALS, DEFAULT_GOALS);
    const loadedSettings = loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    
    setChildren(loadedChildren);
    setTransactions(loadedTransactions);
    setGoals(loadedGoals);
    setSettings(loadedSettings);
    setIsLoaded(true);
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.CHILDREN, children);
    }
  }, [children, isLoaded]);
  
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    }
  }, [transactions, isLoaded]);
  
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.GOALS, goals);
    }
  }, [goals, isLoaded]);
  
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    }
  }, [settings, isLoaded]);

  // Close account menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Apply monthly interest
  useEffect(() => {
    if (!isLoaded) return;
    
    const lastInterestDate = localStorage.getItem(STORAGE_KEYS.LAST_INTEREST_DATE);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    
    if (lastInterestDate !== currentMonth) {
      // Apply interest to all children
      let interestApplied = false;
      
      setChildren(prev => prev.map(child => {
        const interest = calculateInterest(child.balance, settings.interestRate);
        if (interest > 0.01) {
          interestApplied = true;
          // Add interest transaction
          const interestTx = {
            id: Date.now() + Math.random(),
            child: child.id,
            type: 'interest',
            amount: parseFloat(interest.toFixed(2)),
            note: `Monthly interest (${settings.interestRate}%)`,
            category: 'interest',
            date: new Date().toISOString().split('T')[0]
          };
          setTransactions(prevTx => [interestTx, ...prevTx]);
          
          return { ...child, balance: child.balance + interest };
        }
        return child;
      }));
      
      if (interestApplied) {
        showToast('Monthly interest applied!', 'success');
      }
      
      localStorage.setItem(STORAGE_KEYS.LAST_INTEREST_DATE, currentMonth);
    }
  }, [isLoaded, settings.interestRate]);
  
  const currentChild = children.find(c => c.id === selectedChild);
  const childGoals = goals.filter(g => g.childId === selectedChild);
  const childTransactions = transactions.filter(t => t.child === selectedChild);
  
  // Filtered transactions for history tab
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         children.find(c => c.id === t.child)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Toast helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Celebration with confetti
  const celebrateGoal = useCallback((goal) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FBBF24', '#F59E0B', '#10B981', '#3B82F6']
    });
    showToast(`${goal.name} completed! 🎉`, 'celebrate');
  }, [showToast]);

  const getTotalSaved = (childId) => {
    return goals.filter(g => g.childId === childId).reduce((sum, g) => sum + g.currentAmount, 0);
  };

  const allocateToGoal = (goalId, amount) => {
    setGoals(prev => {
      const goal = prev.find(g => g.id === goalId);
      const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
      
      if (newAmount >= goal.targetAmount && goal.currentAmount < goal.targetAmount) {
        setTimeout(() => celebrateGoal(goal), 100);
      }
      
      return prev.map(g => 
        g.id === goalId 
          ? { ...g, currentAmount: newAmount }
          : g
      );
    });
  };

  const processDeposit = (childId, amount, note, category, goalId) => {
    const val = parseFloat(amount);
    const newTransaction = {
      id: Date.now(),
      child: childId,
      type: 'deposit',
      amount: val,
      note: note || 'Deposit',
      category: category || 'other',
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions([newTransaction, ...transactions]);
    setChildren(children.map(c => 
      c.id === childId ? { ...c, balance: c.balance + val } : c
    ));
    if (goalId) allocateToGoal(goalId, val);
    showToast(`Added $${val} to ${children.find(c => c.id === childId)?.name}'s account`);
  };

  const processWithdrawal = (childId, amount, note, category) => {
    const val = parseFloat(amount);
    const child = children.find(c => c.id === childId);
    if (val > child.balance) {
      showToast('Insufficient funds', 'error');
      return;
    }
    const newTransaction = {
      id: Date.now(),
      child: childId,
      type: 'withdrawal',
      amount: val,
      note: note || 'Withdrawal',
      category: category || 'other',
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions([newTransaction, ...transactions]);
    setChildren(children.map(c => 
      c.id === childId ? { ...c, balance: c.balance - val } : c
    ));
    showToast(`Spent $${val} from ${child?.name}'s account`);
  };

  const editTransaction = (transaction, newAmount, newNote, newCategory) => {
    const val = parseFloat(newAmount);
    const oldVal = transaction.amount;
    const diff = val - oldVal;
    
    // Update transaction
    setTransactions(prev => prev.map(t => 
      t.id === transaction.id 
        ? { ...t, amount: val, note: newNote, category: newCategory }
        : t
    ));
    
    // Update child balance
    if (transaction.type === 'deposit' || transaction.type === 'interest') {
      setChildren(prev => prev.map(c => 
        c.id === transaction.child ? { ...c, balance: c.balance + diff } : c
      ));
    } else {
      setChildren(prev => prev.map(c => 
        c.id === transaction.child ? { ...c, balance: c.balance - diff } : c
      ));
    }
    
    showToast('Transaction updated');
  };

  const deleteTransaction = (transaction) => {
    // Remove transaction
    setTransactions(prev => prev.filter(t => t.id !== transaction.id));
    
    // Reverse the balance change
    if (transaction.type === 'deposit' || transaction.type === 'interest') {
      setChildren(prev => prev.map(c => 
        c.id === transaction.child ? { ...c, balance: c.balance - transaction.amount } : c
      ));
    } else {
      setChildren(prev => prev.map(c => 
        c.id === transaction.child ? { ...c, balance: c.balance + transaction.amount } : c
      ));
    }
    
    showToast('Transaction deleted');
  };

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    showToast('Goal deleted');
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowEditTransactionModal(true);
  };

  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'transactions', icon: BadgeDollarSign, label: 'Activities' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'learn', icon: Sparkles, label: 'Learn' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">Family Bank</span>
          </div>
          <div className="relative" ref={accountMenuRef}>
            <button 
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <User className="w-4 h-4 text-slate-500" />
            </button>
            
            {/* Account Menu Dropdown */}
            {showAccountMenu && (
              <div className="absolute right-0 top-10 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="font-semibold text-slate-800">My Account</div>
                  <div className="text-xs text-slate-500">Parent Dashboard</div>
                </div>
                
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setShowAccountMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <Home className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-700">Dashboard</span>
                </button>
                
                <button
                  onClick={() => {
                    const newRate = prompt('Enter new interest rate (%):', settings.interestRate);
                    if (newRate && !isNaN(newRate)) {
                      setSettings({ ...settings, interestRate: parseFloat(newRate) });
                      showToast(`Interest rate updated to ${newRate}%`);
                    }
                    setShowAccountMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  <div className="flex-1 text-left">
                    <div className="text-slate-700">Interest Rate</div>
                    <div className="text-xs text-slate-400">{settings.interestRate}%</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    exportData(children, transactions, goals, settings);
                    showToast('Data exported successfully');
                    setShowAccountMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-700">Export Data</span>
                </button>
                
                <div className="border-t border-slate-100 my-2"></div>
                
                <button
                  onClick={() => {
                    if (confirm('Are you sure? This will reset all data to defaults.')) {
                      localStorage.removeItem(STORAGE_KEYS.CHILDREN);
                      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
                      localStorage.removeItem(STORAGE_KEYS.GOALS);
                      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
                      setChildren(DEFAULT_CHILDREN);
                      setTransactions(DEFAULT_TRANSACTIONS);
                      setGoals(DEFAULT_GOALS);
                      setSettings(DEFAULT_SETTINGS);
                      showToast('Data reset to defaults');
                    }
                    setShowAccountMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset All Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-[57px] z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                    isActive ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-24">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Child Selector */}
            <section className="py-1">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-1">
                {children.map(child => (
                  <ChildAvatar
                    key={child.id}
                    child={child}
                    isSelected={selectedChild === child.id}
                    onClick={() => setSelectedChild(child.id)}
                  />
                ))}
                <AddChildAvatar onClick={() => showToast('Add child feature coming soon!')} />
              </div>
            </section>

            {/* Featured Balance */}
            <section className="bg-violet-500 rounded-3xl p-6 text-white">
              <div className="flex items-center gap-2 text-violet-100 mb-2">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Available Balance</span>
              </div>
              <div className="text-4xl font-bold mb-1">
                <AnimatedNumber value={currentChild?.balance || 0} prefix="$" />
              </div>
              <div className="text-violet-100 text-sm">{currentChild?.name}'s money</div>
            </section>

            {/* Secondary Stats */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <SavingsIcon className="w-4 h-4" />
                  <span className="text-sm">Saved</span>
                </div>
                <div className="text-2xl font-semibold text-slate-800">
                  ${getTotalSaved(selectedChild).toFixed(0)}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Interest</span>
                </div>
                <div className="text-2xl font-semibold text-slate-800">{settings.interestRate}%</div>
              </div>
            </section>

            {/* Balance Chart */}
            <section>
              <BalanceChart 
                currentBalance={currentChild?.balance || 0} 
                childName={currentChild?.name}
              />
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowDepositModal(true)}
                className="flex items-center justify-center gap-2 py-4 bg-slate-800 text-white rounded-2xl font-medium hover:bg-slate-900 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Money
              </button>
              
              <button 
                onClick={() => setShowWithdrawModal(true)}
                className="flex items-center justify-center gap-2 py-4 bg-white text-slate-800 border border-slate-200 rounded-2xl font-medium hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Minus className="w-5 h-5" />
                Spend
              </button>
            </section>

            {/* Goals Preview */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800">Goals</h2>
                <button 
                  onClick={() => setActiveTab('goals')}
                  className="text-sm text-violet-600 font-medium"
                >
                  See all
                </button>
              </div>
              
              {childGoals.length > 0 ? (
                <div className="space-y-3">
                  {childGoals.slice(0, 2).map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      child={currentChild}
                      onAdd={allocateToGoal}
                      onCelebrate={celebrateGoal}
                      onDelete={deleteGoal}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200">
                  <EmptyState
                    icon={Target}
                    title="No goals yet"
                    subtitle="Set a savings goal to get started"
                    action={
                      <button 
                        onClick={() => setActiveTab('goals')}
                        className="px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg"
                      >
                        Create Goal
                      </button>
                    }
                  />
                </div>
              )}
            </section>

            {/* Recent Activity */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800">Recent</h2>
                <button 
                  onClick={() => setActiveTab('transactions')}
                  className="text-sm text-violet-600 font-medium"
                >
                  See all
                </button>
              </div>
              
              {childTransactions.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {childTransactions.slice(0, 3).map((t, i) => (
                    <div key={t.id} className={i !== 0 ? 'border-t border-slate-100' : ''}>
                      <TransactionItem
                        transaction={t}
                        child={currentChild}
                        onEdit={handleEditTransaction}
                        onDelete={deleteTransaction}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200">
                  <EmptyState
                    icon={History}
                    title="No transactions"
                    subtitle="Add money or make a purchase to see activity"
                  />
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-800">Savings Goals</h1>
              <button 
                onClick={() => showToast('Create goal coming soon!')}
                className="px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg"
              >
                + New Goal
              </button>
            </div>
            
            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    child={children.find(c => c.id === goal.childId)}
                    onAdd={allocateToGoal}
                    onCelebrate={celebrateGoal}
                    onDelete={deleteGoal}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200">
                <EmptyState
                  icon={Target}
                  title="No goals yet"
                  subtitle="Create your first savings goal"
                  action={
                    <button 
                      onClick={() => showToast('Create goal coming soon!')}
                      className="px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg"
                    >
                      Create Goal
                    </button>
                  }
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <h1 className="text-xl font-bold text-slate-800">History</h1>
            
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'deposit', label: 'Deposits' },
                  { id: 'withdrawal', label: 'Spending' },
                  { id: 'interest', label: 'Interest' }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterType(filter.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      filterType === filter.id
                        ? 'bg-violet-500 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            
            {filteredTransactions.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {filteredTransactions.map((t, i) => {
                  const child = children.find(c => c.id === t.child);
                  return (
                    <div key={t.id} className={i !== 0 ? 'border-t border-slate-100' : ''}>
                      <TransactionItem
                        transaction={t}
                        child={child}
                        onEdit={handleEditTransaction}
                        onDelete={deleteTransaction}
                        showChild={true}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200">
                <EmptyState
                  icon={History}
                  title="No transactions found"
                  subtitle={searchQuery ? "Try a different search term" : "Your transaction history will appear here"}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-100 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-violet-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Money Quests</h2>
              <p className="text-slate-500 mb-6">Learn about money through fun challenges!</p>
              
              <div className="space-y-3">
                {[
                  { title: 'Needs vs Wants', level: 'Beginner', icon: '🎯', color: 'bg-emerald-100 text-emerald-600' },
                  { title: 'Saving Basics', level: 'Beginner', icon: '💰', color: 'bg-blue-100 text-blue-600' },
                  { title: 'Budgeting 101', level: 'Intermediate', icon: '📊', color: 'bg-violet-100 text-violet-600' },
                  { title: 'Compound Interest', level: 'Advanced', icon: '📈', color: 'bg-amber-100 text-amber-600' },
                ].map((quest, i) => (
                  <button
                    key={i}
                    onClick={() => showToast(`${quest.title} - Coming soon!`)}
                    className="w-full bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className={`w-12 h-12 rounded-xl ${quest.color} flex items-center justify-center text-2xl`}>
                      {quest.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-slate-800">{quest.title}</div>
                      <div className="text-xs text-slate-500">{quest.level}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showDepositModal && (
        <DepositModal 
          children={children}
          selectedChild={selectedChild}
          goals={childGoals}
          onClose={() => setShowDepositModal(false)}
          onDeposit={processDeposit}
          onSelectChild={setSelectedChild}
        />
      )}

      {showWithdrawModal && (
        <WithdrawModal
          children={children}
          selectedChild={selectedChild}
          onClose={() => setShowWithdrawModal(false)}
          onWithdraw={processWithdrawal}
          onSelectChild={setSelectedChild}
        />
      )}

      {showEditTransactionModal && editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => {
            setShowEditTransactionModal(false);
            setEditingTransaction(null);
          }}
          onSave={editTransaction}
        />
      )}
    </div>
  );
}

// ============================================
// MODALS
// ============================================

function DepositModal({ children, selectedChild, goals, onClose, onDeposit, onSelectChild }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('allowance');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [childId, setChildId] = useState(selectedChild);
  
  const currentChild = children.find(c => c.id === childId);
  const childGoalsList = goals.filter(g => g.childId === childId);

  const handleSubmit = () => {
    const val = parseFloat(amount);
    if (val > 0) {
      onDeposit(childId, val, note, category, selectedGoal);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add Money</h2>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="space-y-4">
          {/* Child Selector */}
          <ChildSelector
            label="For"
            children={children}
            selectedChild={childId}
            onSelect={(id) => {
              setChildId(id);
              setSelectedGoal(null);
            }}
          />

          <div>
            <label className="block text-sm text-slate-500 mb-2">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-2">Category</label>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {TRANSACTION_CATEGORIES.deposit.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
                    category === cat.id 
                      ? 'bg-violet-500 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-2">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this for?"
              className="w-full px-4 py-3 bg-slate-100 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {childGoalsList.length > 0 && (
            <div>
              <label className="block text-sm text-slate-500 mb-2">Add to goal</label>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setSelectedGoal(null)}
                  className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap ${
                    selectedGoal === null 
                      ? 'bg-violet-500 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Just balance
                </button>
                {childGoalsList.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap flex items-center gap-2 ${
                      selectedGoal === goal.id 
                        ? 'bg-violet-500 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>{goal.icon}</span>
                    {goal.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full mt-6 py-4 bg-slate-800 text-white font-semibold rounded-2xl disabled:opacity-50"
        >
          Add ${amount || '0'} to {currentChild?.name}'s account
        </button>
      </div>
    </div>
  );
}

function WithdrawModal({ children, selectedChild, onClose, onWithdraw, onSelectChild }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('spending');
  const [childId, setChildId] = useState(selectedChild);
  
  const currentChild = children.find(c => c.id === childId);

  const handleSubmit = () => {
    const val = parseFloat(amount);
    if (val > 0 && val <= currentChild?.balance) {
      onWithdraw(childId, val, note, category);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Spend</h2>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="space-y-4">
          {/* Child Selector */}
          <ChildSelector
            label="From"
            children={children}
            selectedChild={childId}
            onSelect={setChildId}
          />

          <div className="p-4 bg-slate-100 rounded-2xl">
            <div className="text-sm text-slate-500">Available</div>
            <div className="text-2xl font-bold text-slate-800">${currentChild?.balance.toFixed(2)}</div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-2">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                autoFocus
              />
            </div>
            {parseFloat(amount) > currentChild?.balance && (
              <p className="text-rose-500 text-sm mt-2">Exceeds balance</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-2">Category</label>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {TRANSACTION_CATEGORIES.withdrawal.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
                    category === cat.id 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-2">What for?</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Toy store"
              className="w-full px-4 py-3 bg-slate-100 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentChild?.balance}
          className="w-full mt-6 py-4 bg-slate-800 text-white font-semibold rounded-2xl disabled:opacity-50"
        >
          Spend ${amount || '0'} from {currentChild?.name}'s account
        </button>
      </div>
    </div>
  );
}

function EditTransactionModal({ transaction, onClose, onSave }) {
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [note, setNote] = useState(transaction.note);
  const [category, setCategory] = useState(transaction.category || 'other');
  
  const categories = TRANSACTION_CATEGORIES[transaction.type] || TRANSACTION_CATEGORIES.deposit;

  const handleSubmit = () => {
    const val = parseFloat(amount);
    if (val > 0) {
      onSave(transaction, val, note, category);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Edit Transaction</h2>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-500 mb-2">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-2">Category</label>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
                    category === cat.id 
                      ? transaction.type === 'withdrawal' ? 'bg-rose-500 text-white' : 'bg-violet-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-2">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 bg-slate-100 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full mt-6 py-4 bg-slate-800 text-white font-semibold rounded-2xl disabled:opacity-50"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
