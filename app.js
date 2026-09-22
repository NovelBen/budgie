/**
 * ==============================================================================
 * BUDGIE - APPLICATION CORE LOGIC
 * High-performance, offline-first personal budgeting application
 * Features: Speed Add, Income Input, Per-Category Budget Limits (Groceries, Gas, Misc),
 * Google Sheets Auto-Sync, PWA Offline Support, Zero Emojis (Pure SVG Icons)
 * ==============================================================================
 */

(() => {
  'use strict';

  // ============================================================================
  // SVG ICON REGISTRY
  // ============================================================================
  const ICONS = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    dining: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
    groceries: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
    coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
    transit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
    shopping: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
    bills: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
    entertainment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>',
    health: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',
    activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    dollar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>'
  };

  function getIconSvg(name) {
    return ICONS[name] || ICONS.tag;
  }

  // ============================================================================
  // CONSTANTS & CATEGORY DEFINITIONS
  // User requested primary categories: Groceries, Gas, Misc
  // ============================================================================
  const STORAGE_KEYS = {
    TRANSACTIONS: 'budgie_transactions_v3',
    CATEGORIES: 'budgie_categories_v3',
    SETTINGS: 'budgie_settings_v3',
    SYNC_QUEUE: 'budgie_sync_queue_v3',
    RECURRING: 'budgie_recurring_v3'
  };

  const DEFAULT_CATEGORIES = [
    { id: 'groceries', name: 'Groceries', icon: 'groceries', color: '#84CC16', budgetLimit: 400 },
    { id: 'gas', name: 'Gas', icon: 'transit', color: '#3B82F6', budgetLimit: 150 },
    { id: 'misc', name: 'Misc', icon: 'tag', color: '#8B5CF6', budgetLimit: 200 },
    { id: 'food', name: 'Food & Dining', icon: 'dining', color: '#10B981', budgetLimit: 300 },
    { id: 'bills', name: 'Bills & Utilities', icon: 'bills', color: '#F43F5E', budgetLimit: 500 },
    { id: 'entertainment', name: 'Entertainment', icon: 'entertainment', color: '#EC4899', budgetLimit: 150 },
    { id: 'health', name: 'Health & Wellness', icon: 'health', color: '#06B6D4', budgetLimit: 100 }
  ];

  const DEFAULT_INCOME_CATEGORIES = [
    { id: 'paycheck', name: 'Paycheck', icon: 'dollar', color: '#10B981' },
    { id: 'sidegig', name: 'Side Gig', icon: 'activity', color: '#06B6D4' },
    { id: 'investment', name: 'Investment', icon: 'star', color: '#F59E0B' },
    { id: 'gift', name: 'Gift / Refund', icon: 'gift', color: '#EC4899' },
    { id: 'income_misc', name: 'Misc Income', icon: 'tag', color: '#8B5CF6' }
  ];

  const DEFAULT_SETTINGS = {
    expectedIncome: 3500,
    monthlyBudget: 2000,
    currency: '$',
    sheetsUrl: '',
    haptics: true
  };

  const DEMO_TRANSACTIONS = [
    {
      id: 'tx_demo_inc_1',
      type: 'income',
      amount: 1750.00,
      category: 'Paycheck',
      categoryId: 'paycheck',
      note: 'Bi-weekly Direct Deposit',
      method: 'Bank',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      synced: true
    },
    {
      id: 'tx_demo_1',
      type: 'expense',
      amount: 68.40,
      category: 'Groceries',
      categoryId: 'groceries',
      note: 'Trader Joe’s groceries',
      method: 'Card',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      synced: true
    },
    {
      id: 'tx_demo_2',
      type: 'expense',
      amount: 42.00,
      category: 'Gas',
      categoryId: 'gas',
      note: 'Shell fuel fill-up',
      method: 'Card',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      synced: true
    },
    {
      id: 'tx_demo_3',
      type: 'expense',
      amount: 19.99,
      category: 'Misc',
      categoryId: 'misc',
      note: 'Home essentials',
      method: 'Card',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      synced: true
    },
    {
      id: 'tx_demo_4',
      type: 'expense',
      amount: 15.50,
      category: 'Food & Dining',
      categoryId: 'food',
      note: 'Chipotle Lunch',
      method: 'Card',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      synced: true
    }
  ];

  // ============================================================================
  // APP STATE
  // ============================================================================
  const state = {
    transactions: [],
    recurringRules: [],
    categories: [],
    incomeCategories: [...DEFAULT_INCOME_CATEGORIES],
    settings: { ...DEFAULT_SETTINGS },
    syncQueue: [],
    
    // Speed Add State
    entryMode: 'expense', // 'expense' or 'income'
    currentAmountStr: '',
    selectedCategoryId: 'groceries',
    selectedMethod: 'Card',
    
    // Filter & Search State
    activeView: 'view-add',
    historyCategoryFilter: 'all',
    historySearchQuery: '',
    analyticsTimeframe: 'month',
    
    // Custom Category Form State
    newCategoryIcon: 'tag',
    newCategoryColor: '#84CC16',
    newCategoryBudget: 200,

    deferredInstallPrompt: null
  };

  // ============================================================================
  // DOM ELEMENT REFERENCES
  // ============================================================================
  const dom = {};

  function cacheDomElements() {
    dom.currentMonthYear = document.getElementById('currentMonthYear');
    dom.syncStatusBadge = document.getElementById('syncStatusBadge');
    dom.syncStatusText = document.getElementById('syncStatusText');
    dom.installPwaBtn = document.getElementById('installPwaBtn');
    
    // View 1: Add
    dom.modeExpenseBtn = document.getElementById('modeExpenseBtn');
    dom.modeIncomeBtn = document.getElementById('modeIncomeBtn');
    dom.amountDisplay = document.getElementById('amountDisplay');
    dom.amountDisplayContainer = dom.amountDisplay.parentElement;
    dom.currencySymbol = document.getElementById('currencySymbol');
    dom.glanceRemaining = document.getElementById('glanceRemaining');
    dom.glanceFill = document.getElementById('glanceFill');
    dom.glanceDailyAmount = document.getElementById('glanceDailyAmount');
    dom.voiceAddBtn = document.getElementById('voiceAddBtn');
    dom.voiceStatusHint = document.getElementById('voiceStatusHint');
    dom.quickPresetsRow = document.getElementById('quickPresetsRow');
    dom.clearAmountBtn = document.getElementById('clearAmountBtn');
    dom.categoryGrid = document.getElementById('categoryGrid');
    dom.manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    dom.expenseNoteInput = document.getElementById('expenseNoteInput');
    dom.expenseDateInput = document.getElementById('expenseDateInput');
    dom.methodChips = document.getElementById('methodChips');
    dom.numpad = document.getElementById('numpad');
    dom.submitExpenseBtn = document.getElementById('submitExpenseBtn');
    dom.submitBtnText = document.getElementById('submitBtnText');

    // View 2: History
    dom.historyCount = document.getElementById('historyCount');
    dom.historyTotalSpent = document.getElementById('historyTotalSpent');
    dom.historySearchInput = document.getElementById('historySearchInput');
    dom.clearSearchBtn = document.getElementById('clearSearchBtn');
    dom.categoryFilterPills = document.getElementById('categoryFilterPills');
    dom.transactionsFeed = document.getElementById('transactionsFeed');
    dom.historyEmptyState = document.getElementById('historyEmptyState');

    // View 3: Analytics
    dom.analyticsTotalIncome = document.getElementById('analyticsTotalIncome');
    dom.analyticsTotalExpense = document.getElementById('analyticsTotalExpense');
    dom.analyticsNetBalance = document.getElementById('analyticsNetBalance');
    dom.analyticsSpent = document.getElementById('analyticsSpent');
    dom.analyticsBudgetLimit = document.getElementById('analyticsBudgetLimit');
    dom.budgetPercentageBadge = document.getElementById('budgetPercentageBadge');
    dom.analyticsBudgetBar = document.getElementById('analyticsBudgetBar');
    dom.analyticsRemaining = document.getElementById('analyticsRemaining');
    dom.analyticsDailyPace = document.getElementById('analyticsDailyPace');
    dom.analyticsDaysLeft = document.getElementById('analyticsDaysLeft');
    dom.categoryBudgetMeters = document.getElementById('categoryBudgetMeters');
    dom.editBudgetsLinkBtn = document.getElementById('editBudgetsLinkBtn');
    dom.categoryDonutChart = document.getElementById('categoryDonutChart');
    dom.donutTotalAmount = document.getElementById('donutTotalAmount');
    dom.categoryBarsList = document.getElementById('categoryBarsList');
    dom.methodBreakdownRow = document.getElementById('methodBreakdownRow');

    // View 4: Settings
    dom.sheetsWebhookInput = document.getElementById('sheetsWebhookInput');
    dom.saveSheetUrlBtn = document.getElementById('saveSheetUrlBtn');
    dom.testSheetConnBtn = document.getElementById('testSheetConnBtn');
    dom.syncPendingBtn = document.getElementById('syncPendingBtn');
    dom.pendingCountBadge = document.getElementById('pendingCountBadge');
    dom.sheetsStatusMsg = document.getElementById('sheetsStatusMsg');
    dom.copyAppsScriptBtn = document.getElementById('copyAppsScriptBtn');
    dom.monthlyIncomeInput = document.getElementById('monthlyIncomeInput');
    dom.monthlyBudgetInput = document.getElementById('monthlyBudgetInput');
    dom.currencySelect = document.getElementById('currencySelect');
    dom.hapticsToggle = document.getElementById('hapticsToggle');
    dom.savePreferencesBtn = document.getElementById('savePreferencesBtn');
    dom.openAddCategoryFromSettingsBtn = document.getElementById('openAddCategoryFromSettingsBtn');
    dom.categoryLimitsEditorList = document.getElementById('categoryLimitsEditorList');
    dom.exportCsvBtn = document.getElementById('exportCsvBtn');
    dom.exportJsonBtn = document.getElementById('exportJsonBtn');
    dom.importJsonInput = document.getElementById('importJsonInput');
    dom.resetDataBtn = document.getElementById('resetDataBtn');
    dom.forceUpdateBtn = document.getElementById('forceUpdateBtn');
    dom.clearAllHistoryBtn = document.getElementById('clearAllHistoryBtn');

    // Navigation & Modals
    dom.dockTabs = document.querySelectorAll('.dock-tab');
    dom.appViews = document.querySelectorAll('.app-view');
    dom.toast = document.getElementById('toastNotification');
    dom.toastTitle = document.getElementById('toastTitle');
    dom.toastDesc = document.getElementById('toastDesc');
    dom.toastIcon = document.getElementById('toastIcon');

    // Category Modal
    dom.categoryModal = document.getElementById('categoryModal');
    dom.closeCategoryModalBtn = document.getElementById('closeCategoryModalBtn');
    dom.newCategoryName = document.getElementById('newCategoryName');
    dom.newCategoryBudget = document.getElementById('newCategoryBudget');
    dom.iconPickerRow = document.getElementById('iconPickerRow');
    dom.colorPickerRow = document.getElementById('colorPickerRow');
    dom.saveCustomCategoryBtn = document.getElementById('saveCustomCategoryBtn');

    // Recurring Bill Elements
    dom.expenseIsRecurringToggle = document.getElementById('expenseIsRecurringToggle');
    dom.recurOptionsRow = document.getElementById('recurOptionsRow');
    dom.recurFrequencySelect = document.getElementById('recurFrequencySelect');
    dom.recurDayInput = document.getElementById('recurDayInput');
    dom.recurDayGroup = document.getElementById('recurDayGroup');
    dom.recurringList = document.getElementById('recurringList');
    dom.openAddRecurringBtn = document.getElementById('openAddRecurringBtn');
    dom.recurringModal = document.getElementById('recurringModal');
    dom.recurringModalTitle = document.getElementById('recurringModalTitle');
    dom.closeRecurringModalBtn = document.getElementById('closeRecurringModalBtn');
    dom.newRecurTitle = document.getElementById('newRecurTitle');
    dom.newRecurAmount = document.getElementById('newRecurAmount');
    dom.newRecurType = document.getElementById('newRecurType');
    dom.newRecurCategory = document.getElementById('newRecurCategory');
    dom.newRecurFrequency = document.getElementById('newRecurFrequency');
    dom.newRecurNextDate = document.getElementById('newRecurNextDate');
    dom.newRecurAutoPost = document.getElementById('newRecurAutoPost');
    dom.editingRecurId = document.getElementById('editingRecurId');
    dom.saveRecurringRuleBtn = document.getElementById('saveRecurringRuleBtn');
    dom.analyticsRecurringTotal = document.getElementById('analyticsRecurringTotal');
  }

  // ============================================================================
  // STORAGE & DATA LOAD/SAVE
  // ============================================================================
  function loadData() {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        state.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }

      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (storedCategories) {
        const parsed = JSON.parse(storedCategories);
        state.categories = parsed.map(c => {
          delete c.emoji;
          if (!c.icon) c.icon = 'tag';
          if (typeof c.budgetLimit === 'undefined') c.budgetLimit = 200;
          return c;
        });
      } else {
        state.categories = [...DEFAULT_CATEGORIES];
        saveCategories();
      }

      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (storedTx) {
        state.transactions = JSON.parse(storedTx);
      } else {
        state.transactions = [];
        saveTransactions();
      }

      const storedRec = localStorage.getItem(STORAGE_KEYS.RECURRING);
      state.recurringRules = storedRec ? JSON.parse(storedRec) : [];

      const storedQueue = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      state.syncQueue = storedQueue ? JSON.parse(storedQueue) : [];

    } catch (err) {
      console.error('Budgie: Error loading stored data:', err);
      state.transactions = [];
      state.recurringRules = [];
      state.categories = [...DEFAULT_CATEGORIES];
      state.settings = { ...DEFAULT_SETTINGS };
      state.syncQueue = [];
    }
  }

  function saveRecurringRules() {
    try {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(state.recurringRules));
    } catch (e) {
      console.error('Error saving recurring rules:', e);
    }
  }

  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
    } catch (e) {
      console.error('Error saving transactions:', e);
    }
  }

  function saveCategories() {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(state.categories));
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }

  function saveSyncQueue() {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(state.syncQueue));
      updatePendingBadge();
    } catch (e) {
      console.error('Error saving sync queue:', e);
    }
  }

  // ============================================================================
  // HAPTIC FEEDBACK (Android Vibration)
  // ============================================================================
  function triggerHaptic(duration = 14) {
    if (!state.settings.haptics) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // Ignored
      }
    }
  }

  // ============================================================================
  // TOAST NOTIFICATIONS (Pure SVG Vector Icons)
  // ============================================================================
  let toastTimer = null;
  function showToast(title, desc, iconName = 'check') {
    if (!dom.toast) return;
    clearTimeout(toastTimer);
    dom.toastTitle.textContent = title;
    dom.toastDesc.textContent = desc;
    dom.toastIcon.innerHTML = getIconSvg(iconName);
    dom.toast.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      dom.toast.classList.add('hidden');
    }, 3200);
  }

  // ============================================================================
  // ENTRY MODE (EXPENSE vs INCOME)
  // ============================================================================
  function setEntryMode(mode) {
    triggerHaptic(16);
    state.entryMode = mode;

    if (mode === 'income') {
      dom.modeIncomeBtn.classList.add('active');
      dom.modeIncomeBtn.setAttribute('aria-selected', 'true');
      dom.modeExpenseBtn.classList.remove('active');
      dom.modeExpenseBtn.setAttribute('aria-selected', 'false');

      dom.amountDisplayContainer.classList.add('income-mode');
      dom.submitBtnText.textContent = 'Save Income';
      dom.currencySymbol.textContent = '+' + state.settings.currency;

      // Select first income category
      state.selectedCategoryId = state.incomeCategories[0].id;

      // Render income presets
      renderPresetsRow([100, 500, 1000, 2000]);
    } else {
      dom.modeExpenseBtn.classList.add('active');
      dom.modeExpenseBtn.setAttribute('aria-selected', 'true');
      dom.modeIncomeBtn.classList.remove('active');
      dom.modeIncomeBtn.setAttribute('aria-selected', 'false');

      dom.amountDisplayContainer.classList.remove('income-mode');
      dom.submitBtnText.textContent = 'Save Expense';
      dom.currencySymbol.textContent = state.settings.currency;

      // Select Groceries by default
      state.selectedCategoryId = 'groceries';

      // Render expense presets
      renderPresetsRow([5, 10, 20, 50]);
    }

    renderCategoryGrid();
  }

  function renderPresetsRow(presetValues) {
    let html = '';
    presetValues.forEach(val => {
      html += `<button type="button" class="preset-chip" data-add="${val}">+${val}</button>`;
    });
    html += `<button type="button" class="preset-chip clear-chip" id="clearAmountBtn">Clear</button>`;
    dom.quickPresetsRow.innerHTML = html;

    dom.quickPresetsRow.querySelectorAll('.preset-chip[data-add]').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = parseFloat(chip.getAttribute('data-add'));
        addPresetAmount(val);
      });
    });

    const clearBtn = document.getElementById('clearAmountBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearAmount);
  }

  // ============================================================================
  // SPEED ADD & NUMPAD LOGIC
  // ============================================================================
  function handleNumpadInput(key) {
    triggerHaptic(12);
    let str = state.currentAmountStr;

    if (key === 'backspace') {
      if (str.length > 0) {
        str = str.slice(0, -1);
      }
    } else if (key === '.') {
      if (!str.includes('.')) {
        str = str === '' ? '0.' : str + '.';
      }
    } else if (/^[0-9]$/.test(key)) {
      const dotIndex = str.indexOf('.');
      if (dotIndex !== -1 && str.length - dotIndex > 2) {
        return;
      }
      if (str === '0') {
        str = key;
      } else {
        str += key;
      }
    }

    state.currentAmountStr = str;
    updateAmountDisplay();
  }

  function addPresetAmount(amountToAdd) {
    triggerHaptic(18);
    const currentVal = parseFloat(state.currentAmountStr) || 0;
    const newVal = (currentVal + amountToAdd).toFixed(2);
    state.currentAmountStr = newVal;
    updateAmountDisplay();
  }

  function clearAmount() {
    triggerHaptic(15);
    state.currentAmountStr = '';
    updateAmountDisplay();
  }

  function updateAmountDisplay() {
    const raw = state.currentAmountStr;
    const num = parseFloat(raw);

    if (!raw || isNaN(num) || num === 0) {
      dom.amountDisplay.textContent = '0.00';
      dom.submitExpenseBtn.disabled = true;
      dom.amountDisplayContainer.classList.remove('active-typing');
    } else {
      dom.amountDisplay.textContent = raw;
      dom.submitExpenseBtn.disabled = false;
      dom.amountDisplayContainer.classList.add('active-typing');
    }

    dom.amountDisplay.classList.remove('pulse-anim');
    void dom.amountDisplay.offsetWidth;
    dom.amountDisplay.classList.add('pulse-anim');
  }

  function renderCategoryGrid() {
    dom.categoryGrid.innerHTML = '';
    const activeList = state.entryMode === 'income' ? state.incomeCategories : state.categories;

    activeList.forEach((cat) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `category-chip ${cat.id === state.selectedCategoryId ? 'selected' : ''}`;
      chip.setAttribute('data-category-id', cat.id);
      chip.setAttribute('role', 'radio');
      chip.setAttribute('aria-checked', cat.id === state.selectedCategoryId);

      chip.innerHTML = `
        <div class="cat-icon" style="color: ${cat.color};">${getIconSvg(cat.icon || 'tag')}</div>
        <span class="cat-name">${escapeHtml(cat.name)}</span>
      `;

      chip.addEventListener('click', () => {
        triggerHaptic(14);
        state.selectedCategoryId = cat.id;
        document.querySelectorAll('.category-chip').forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
        chip.classList.add('selected');
        chip.setAttribute('aria-checked', 'true');
      });

      dom.categoryGrid.appendChild(chip);
    });
  }

  // ============================================================================
  // LOG ENTRY (EXPENSE OR INCOME SUBMISSION)
  // ============================================================================
  function saveCurrentExpense() {
    const amount = parseFloat(state.currentAmountStr);
    if (isNaN(amount) || amount <= 0) return;

    triggerHaptic(30);

    const isIncome = state.entryMode === 'income';
    const activeList = isIncome ? state.incomeCategories : state.categories;
    const categoryObj = activeList.find(c => c.id === state.selectedCategoryId) || activeList[0];
    const note = dom.expenseNoteInput.value.trim();
    const date = dom.expenseDateInput.value || new Date().toISOString().split('T')[0];
    const now = new Date();

    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      type: isIncome ? 'income' : 'expense',
      amount: parseFloat(amount.toFixed(2)),
      category: categoryObj.name,
      categoryId: categoryObj.id,
      note: note || categoryObj.name,
      method: state.selectedMethod,
      date: date,
      dateStr: date,
      timeStr: now.toTimeString().split(' ')[0],
      createdAt: now.toISOString(),
      synced: false
    };

    state.transactions.unshift(newTx);
    saveTransactions();

    enqueueForSheetSync(newTx);

    const actionText = isIncome ? 'Income Logged' : 'Expense Logged';
    const prefix = isIncome ? '+' : '-';
    showToast(
      actionText, 
      `${prefix}${state.settings.currency}${newTx.amount.toFixed(2)} (${categoryObj.name})`, 
      isIncome ? 'dollar' : 'check'
    );

    // If recurring toggle was active, create a recurring rule
    if (dom.expenseIsRecurringToggle && dom.expenseIsRecurringToggle.checked) {
      const freq = dom.recurFrequencySelect ? dom.recurFrequencySelect.value : 'monthly';
      const targetDay = dom.recurDayInput ? parseInt(dom.recurDayInput.value, 10) || 1 : 1;
      const nextDue = getNextOccurrence(date, freq, targetDay);

      const newRule = {
        id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title: note || categoryObj.name,
        amount: parseFloat(amount.toFixed(2)),
        type: isIncome ? 'income' : 'expense',
        category: categoryObj.name,
        categoryId: categoryObj.id,
        frequency: freq,
        nextDueDate: nextDue,
        autoPost: true,
        active: true,
        lastPostedDate: date
      };

      state.recurringRules.push(newRule);
      saveRecurringRules();
      renderRecurringList();

      dom.expenseIsRecurringToggle.checked = false;
      if (dom.recurOptionsRow) dom.recurOptionsRow.classList.add('hidden');
    }

    state.currentAmountStr = '';
    dom.expenseNoteInput.value = '';
    updateAmountDisplay();

    const detailsEl = document.getElementById('optionalDetails');
    if (detailsEl) detailsEl.open = false;

    updateTopMonthHeader();
    renderGlanceBar();
    renderHistoryFeed();
    renderAnalytics();
  }

  // ============================================================================
  // SPEECH-TO-TEXT VOICE EXPENSE/INCOME ENTRY
  // ============================================================================
  function setupVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      dom.voiceAddBtn.style.display = 'none';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let isListening = false;

    dom.voiceAddBtn.addEventListener('click', () => {
      triggerHaptic(20);
      if (isListening) {
        recognition.stop();
        return;
      }

      try {
        recognition.start();
        isListening = true;
        dom.voiceAddBtn.classList.add('listening');
        dom.voiceStatusHint.classList.remove('hidden');
        dom.voiceStatusHint.textContent = 'Listening... e.g. "Groceries 65" or "Gas 40 dollars"';
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    });

    recognition.onresult = (event) => {
      isListening = false;
      dom.voiceAddBtn.classList.remove('listening');
      dom.voiceStatusHint.classList.add('hidden');

      const transcript = event.results[0][0].transcript.toLowerCase();
      parseVoiceExpense(transcript);
    };

    recognition.onerror = () => {
      isListening = false;
      dom.voiceAddBtn.classList.remove('listening');
      dom.voiceStatusHint.classList.add('hidden');
    };

    recognition.onend = () => {
      isListening = false;
      dom.voiceAddBtn.classList.remove('listening');
      dom.voiceStatusHint.classList.add('hidden');
    };
  }

  function parseVoiceExpense(text) {
    let amount = null;
    const amountMatch = text.match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1]);
    }

    let matchedCat = null;
    const lower = text.toLowerCase();

    // Check for income keywords first
    if (lower.includes('paycheck') || lower.includes('salary') || lower.includes('income')) {
      setEntryMode('income');
      matchedCat = 'paycheck';
    } else if (lower.includes('side gig') || lower.includes('freelance') || lower.includes('bonus')) {
      setEntryMode('income');
      matchedCat = 'sidegig';
    } else if (lower.includes('grocer') || lower.includes('trader') || lower.includes('safeway') || lower.includes('market') || lower.includes('food')) {
      setEntryMode('expense');
      matchedCat = 'groceries';
    } else if (lower.includes('gas') || lower.includes('fuel') || lower.includes('chevron') || lower.includes('shell')) {
      setEntryMode('expense');
      matchedCat = 'gas';
    } else if (lower.includes('misc') || lower.includes('other') || lower.includes('stuff')) {
      setEntryMode('expense');
      matchedCat = 'misc';
    } else if (lower.includes('coffee') || lower.includes('latte') || lower.includes('starbucks')) {
      setEntryMode('expense');
      matchedCat = 'food';
    } else if (lower.includes('bill') || lower.includes('electric') || lower.includes('wifi') || lower.includes('rent')) {
      setEntryMode('expense');
      matchedCat = 'bills';
    }

    if (matchedCat) {
      state.selectedCategoryId = matchedCat;
      renderCategoryGrid();
    }

    if (amount && amount > 0) {
      triggerHaptic(25);
      state.currentAmountStr = amount.toFixed(2);
      updateAmountDisplay();
      dom.expenseNoteInput.value = text;
      showToast('Voice Detected', `Heard: "${text}"`, 'mic');
    } else {
      showToast('Voice Entry', `Heard: "${text}" (Amount not recognized)`, 'info');
    }
  }

  // ============================================================================
  // GOOGLE SHEETS SYNC ENGINE
  // ============================================================================
  function enqueueForSheetSync(tx) {
    if (!state.settings.sheetsUrl) {
      updateSyncStatusBadge('local');
      return;
    }

    state.syncQueue.push(tx);
    saveSyncQueue();
    processSyncQueue();
  }

  function sendDeleteSync(txId) {
    if (!state.settings.sheetsUrl) return;

    // If this transaction is currently pending in syncQueue, cancel the pending upload
    const pendingIdx = state.syncQueue.findIndex(item => !item.action && item.id === txId);
    if (pendingIdx !== -1) {
      state.syncQueue.splice(pendingIdx, 1);
      saveSyncQueue();
      return;
    }

    const payload = { action: 'delete', id: txId };
    state.syncQueue.push(payload);
    saveSyncQueue();
    processSyncQueue();
  }

  function sendClearAllSync() {
    if (!state.settings.sheetsUrl) return;
    state.syncQueue = [{ action: 'clearAll' }];
    saveSyncQueue();
    processSyncQueue();
  }

  let isSyncing = false;
  async function processSyncQueue() {
    if (isSyncing || state.syncQueue.length === 0) return;
    if (!state.settings.sheetsUrl) {
      updateSyncStatusBadge('local');
      return;
    }

    if (!navigator.onLine) {
      updateSyncStatusBadge('offline');
      return;
    }

    isSyncing = true;
    updateSyncStatusBadge('syncing');

    try {
      while (state.syncQueue.length > 0 && navigator.onLine) {
        const nextItem = state.syncQueue[0];

        if (nextItem.action) {
          // Special action (delete or clearAll)
          await fetch(state.settings.sheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(nextItem)
          });

          // Action sent successfully
          state.syncQueue.shift();
          saveSyncQueue();
        } else {
          // Gather consecutive normal transactions to batch send
          const batch = [];
          while (state.syncQueue.length > 0 && !state.syncQueue[0].action) {
            batch.push(state.syncQueue.shift());
          }

          if (batch.length > 0) {
            await fetch(state.settings.sheetsUrl, {
              method: 'POST',
              mode: 'no-cors',
              headers: {
                'Content-Type': 'text/plain;charset=utf-8'
              },
              body: JSON.stringify(batch)
            });

            const syncedIds = new Set(batch.map(item => item.id));
            state.transactions.forEach(t => {
              if (syncedIds.has(t.id)) t.synced = true;
            });
            saveTransactions();
            saveSyncQueue();
          }
        }
      }

      updateSyncStatusBadge('online');
      showToast('Google Sheets Synced', 'Changes updated to your sheet', 'cloud');

    } catch (err) {
      console.warn('Budgie: Google Sheets sync deferred:', err);
      updateSyncStatusBadge('offline');
    } finally {
      isSyncing = false;
      updatePendingBadge();
    }
  }

  function updateSyncStatusBadge(status) {
    dom.syncStatusBadge.className = 'sync-badge ' + status;
    if (status === 'online') {
      dom.syncStatusText.textContent = 'Synced';
    } else if (status === 'offline') {
      const count = state.syncQueue.length;
      dom.syncStatusText.textContent = count > 0 ? `${count} Queued` : 'Offline';
    } else if (status === 'syncing') {
      dom.syncStatusText.textContent = 'Syncing...';
    } else {
      dom.syncStatusText.textContent = 'Local';
    }
  }

  function updatePendingBadge() {
    if (dom.pendingCountBadge) {
      dom.pendingCountBadge.textContent = state.syncQueue.length;
    }
  }

  // ============================================================================
  // BUDGET & ANALYTICS CALCULATIONS
  // ============================================================================
  function getMonthSpendMetrics() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let totalMonthSpent = 0;
    let totalMonthIncome = 0;
    const categoryTotals = {};
    const methodTotals = {};

    state.transactions.forEach(tx => {
      const txDate = new Date(tx.date || tx.createdAt);
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
        if (tx.type === 'income') {
          totalMonthIncome += tx.amount;
        } else {
          totalMonthSpent += tx.amount;
          categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
          methodTotals[tx.method || 'Card'] = (methodTotals[tx.method || 'Card'] || 0) + tx.amount;
        }
      }
    });

    const budget = state.settings.monthlyBudget || 2000;
    const remaining = Math.max(0, budget - totalMonthSpent);
    const percentSpent = budget > 0 ? Math.min(100, (totalMonthSpent / budget) * 100) : 0;
    const netBalance = totalMonthIncome - totalMonthSpent;

    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysLeft = Math.max(1, totalDaysInMonth - dayOfMonth + 1);
    const dailySafeSpend = remaining / daysLeft;

    return {
      spent: totalMonthSpent,
      income: totalMonthIncome,
      netBalance: netBalance,
      budget: budget,
      remaining: remaining,
      percentSpent: percentSpent,
      daysLeft: daysLeft,
      dailySafeSpend: dailySafeSpend,
      categoryTotals: categoryTotals,
      methodTotals: methodTotals
    };
  }

  function renderGlanceBar() {
    const metrics = getMonthSpendMetrics();
    const sym = state.settings.currency;

    dom.glanceRemaining.textContent = `${sym}${metrics.remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    dom.glanceFill.style.width = `${Math.min(100, metrics.percentSpent)}%`;

    if (metrics.percentSpent > 90) {
      dom.glanceFill.style.background = 'linear-gradient(90deg, #F43F5E, #E11D48)';
      dom.glanceRemaining.style.color = '#F43F5E';
    } else if (metrics.percentSpent > 75) {
      dom.glanceFill.style.background = 'linear-gradient(90deg, #F59E0B, #D97706)';
      dom.glanceRemaining.style.color = '#F59E0B';
    } else {
      dom.glanceFill.style.background = 'linear-gradient(90deg, #10B981, #34D399)';
      dom.glanceRemaining.style.color = '#34D399';
    }

    dom.glanceDailyAmount.textContent = `${sym}${metrics.dailySafeSpend.toFixed(2)}/day`;
  }

  function updateTopMonthHeader() {
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    dom.currentMonthYear.textContent = monthName;
  }

  // ============================================================================
  // VIEW 2: TRANSACTIONS HISTORY RENDERING
  // ============================================================================
  function renderHistoryFeed() {
    const query = state.historySearchQuery.toLowerCase().trim();
    const filterCat = state.historyCategoryFilter;

    const filtered = state.transactions.filter(tx => {
      const matchCat = filterCat === 'all' || tx.categoryId === filterCat || tx.category === filterCat;
      const matchQuery = !query || 
        (tx.note && tx.note.toLowerCase().includes(query)) ||
        (tx.category && tx.category.toLowerCase().includes(query)) ||
        (tx.amount.toString().includes(query));
      return matchCat && matchQuery;
    });

    const totalFilteredSpend = filtered.filter(t => t.type !== 'income').reduce((acc, t) => acc + t.amount, 0);
    dom.historyCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'}`;
    dom.historyTotalSpent.textContent = `${state.settings.currency}${totalFilteredSpend.toFixed(2)} spent`;

    if (filtered.length === 0) {
      dom.transactionsFeed.innerHTML = '';
      dom.historyEmptyState.classList.remove('hidden');
      return;
    }

    dom.historyEmptyState.classList.add('hidden');

    const groups = {};
    filtered.forEach(tx => {
      const dateKey = tx.date || tx.createdAt.split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let html = '';

    sortedDates.forEach(dateStr => {
      const txs = groups[dateStr];
      const dayNet = txs.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

      let dateTitle = dateStr;
      if (dateStr === todayStr) {
        dateTitle = 'Today';
      } else if (dateStr === yesterdayStr) {
        dateTitle = 'Yesterday';
      } else {
        const d = new Date(dateStr + 'T00:00:00');
        dateTitle = d.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
      }

      const sign = dayNet >= 0 ? '+' : '-';
      const dayTotalText = `${sign}${state.settings.currency}${Math.abs(dayNet).toFixed(2)}`;

      html += `
        <div class="history-date-group">
          <div class="group-header">
            <span>${dateTitle}</span>
            <span class="group-total">${dayTotalText}</span>
          </div>
      `;

      txs.forEach(tx => {
        const isIncome = tx.type === 'income';
        const allCats = [...state.categories, ...state.incomeCategories];
        const catObj = allCats.find(c => c.id === tx.categoryId || c.name === tx.category) || {
          icon: isIncome ? 'dollar' : 'tag',
          color: isIncome ? '#10B981' : '#8B5CF6'
        };

        const timeStr = tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const amountPrefix = isIncome ? '+' : '-';
        const amountClass = isIncome ? 'tx-amount income' : 'tx-amount';

        html += `
          <div class="tx-card" data-tx-id="${tx.id}">
            <div class="tx-left">
              <div class="tx-icon-bubble" style="border-color: ${catObj.color}33; color: ${catObj.color}; background: ${catObj.color}15;">
                ${getIconSvg(catObj.icon || (isIncome ? 'dollar' : 'tag'))}
              </div>
              <div class="tx-details">
                <span class="tx-category-name">${escapeHtml(tx.category)}</span>
                <span class="tx-note">${escapeHtml(tx.note || tx.category)}</span>
                <div class="tx-meta">
                  <span>${timeStr}</span>
                  <span class="method-tag">${escapeHtml(tx.method || 'Card')}</span>
                </div>
              </div>
            </div>
            <div class="tx-right">
              <span class="${amountClass}">${amountPrefix}${state.settings.currency}${tx.amount.toFixed(2)}</span>
              <button type="button" class="tx-delete-btn" data-delete-id="${tx.id}" title="Delete entry" aria-label="Delete entry">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    });

    dom.transactionsFeed.innerHTML = html;

    dom.transactionsFeed.querySelectorAll('.tx-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const txId = btn.getAttribute('data-delete-id');
        deleteTransaction(txId);
      });
    });
  }

  function deleteTransaction(id) {
    triggerHaptic(20);
    const txIndex = state.transactions.findIndex(t => t.id === id);
    if (txIndex === -1) return;

    const removed = state.transactions.splice(txIndex, 1)[0];
    saveTransactions();

    sendDeleteSync(removed.id);

    showToast('Deleted', `Removed ${removed.type === 'income' ? 'income' : 'expense'} of ${state.settings.currency}${removed.amount.toFixed(2)}`, 'trash');

    renderHistoryFeed();
    renderGlanceBar();
    renderAnalytics();
  }

  function renderCategoryFilterPills() {
    let html = `<button type="button" class="filter-pill ${state.historyCategoryFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>`;

    state.categories.forEach(cat => {
      const active = state.historyCategoryFilter === cat.id ? 'active' : '';
      html += `
        <button type="button" class="filter-pill ${active}" data-filter="${cat.id}">
          ${getIconSvg(cat.icon || 'tag')}
          <span>${escapeHtml(cat.name)}</span>
        </button>
      `;
    });

    dom.categoryFilterPills.innerHTML = html;

    dom.categoryFilterPills.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        triggerHaptic(12);
        state.historyCategoryFilter = pill.getAttribute('data-filter');
        renderCategoryFilterPills();
        renderHistoryFeed();
      });
    });
  }

  // ============================================================================
  // VIEW 3: BUDGETS & ANALYTICS RENDERING
  // ============================================================================
  function renderAnalytics() {
    const metrics = getMonthSpendMetrics();
    const sym = state.settings.currency;

    // 1. Cash Flow Summary
    dom.analyticsTotalIncome.textContent = `+${sym}${metrics.income.toFixed(2)}`;
    dom.analyticsTotalExpense.textContent = `-${sym}${metrics.spent.toFixed(2)}`;
    const netSign = metrics.netBalance >= 0 ? '+' : '-';
    dom.analyticsNetBalance.textContent = `${netSign}${sym}${Math.abs(metrics.netBalance).toFixed(2)}`;
    dom.analyticsNetBalance.style.color = metrics.netBalance >= 0 ? 'var(--primary-light)' : 'var(--accent-rose)';

    // Recurring Bills Commitment calculation
    let monthlyRecurTotal = 0;
    (state.recurringRules || []).forEach(r => {
      if (!r.active || r.type === 'income') return;
      if (r.frequency === 'weekly') monthlyRecurTotal += (r.amount * 52) / 12;
      else if (r.frequency === 'biweekly') monthlyRecurTotal += (r.amount * 26) / 12;
      else if (r.frequency === 'yearly') monthlyRecurTotal += r.amount / 12;
      else monthlyRecurTotal += r.amount;
    });
    if (dom.analyticsRecurringTotal) {
      dom.analyticsRecurringTotal.textContent = `${sym}${monthlyRecurTotal.toFixed(2)}/mo`;
    }

    // 2. Total Budget Meter
    dom.analyticsSpent.textContent = `${sym}${metrics.spent.toFixed(2)}`;
    dom.analyticsBudgetLimit.textContent = `of ${sym}${metrics.budget.toLocaleString()} monthly budget`;
    dom.budgetPercentageBadge.textContent = `${Math.round(metrics.percentSpent)}%`;

    dom.analyticsBudgetBar.style.width = `${Math.min(100, metrics.percentSpent)}%`;
    if (metrics.percentSpent > 90) {
      dom.analyticsBudgetBar.style.background = 'linear-gradient(90deg, #F43F5E, #E11D48)';
      dom.budgetPercentageBadge.style.color = '#F43F5E';
      dom.budgetPercentageBadge.style.borderColor = 'rgba(244, 63, 94, 0.4)';
    } else if (metrics.percentSpent > 75) {
      dom.analyticsBudgetBar.style.background = 'linear-gradient(90deg, #F59E0B, #D97706)';
      dom.budgetPercentageBadge.style.color = '#F59E0B';
      dom.budgetPercentageBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    } else {
      dom.analyticsBudgetBar.style.background = 'linear-gradient(90deg, #10B981, #34D399)';
      dom.budgetPercentageBadge.style.color = '#34D399';
      dom.budgetPercentageBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    }

    dom.analyticsRemaining.textContent = `${sym}${metrics.remaining.toFixed(2)}`;
    dom.analyticsDailyPace.textContent = `${sym}${metrics.dailySafeSpend.toFixed(2)} / day`;
    dom.analyticsDaysLeft.textContent = metrics.daysLeft;

    // 3. Per-Category Budget Progress Meters (Groceries, Gas, Misc, etc.)
    renderCategoryBudgetMeters(metrics.categoryTotals);

    // 4. Donut Chart & Category Bars
    renderDonutChart(metrics.categoryTotals, metrics.spent);
    renderCategoryBars(metrics.categoryTotals, metrics.spent);
    renderPaymentBreakdown(metrics.methodTotals);
  }

  function renderCategoryBudgetMeters(categoryTotals) {
    let html = '';
    const sym = state.settings.currency;

    state.categories.forEach(cat => {
      const spent = categoryTotals[cat.name] || 0;
      const limit = cat.budgetLimit || 200;
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const fillWidth = Math.min(100, percent);

      let statusClass = 'safe';
      let statusText = `${sym}${(limit - spent).toFixed(2)} left`;
      let barBg = cat.color;

      if (spent > limit) {
        statusClass = 'over';
        statusText = `+${sym}${(spent - limit).toFixed(2)} over limit`;
        barBg = '#F43F5E';
      } else if (percent >= 80) {
        statusClass = 'warn';
        statusText = `${sym}${(limit - spent).toFixed(2)} left (${percent}%)`;
        barBg = '#F59E0B';
      }

      html += `
        <div class="cat-budget-meter">
          <div class="cat-budget-header">
            <div class="cat-budget-left">
              <div class="cat-budget-icon" style="color: ${cat.color}; background: ${cat.color}18;">
                ${getIconSvg(cat.icon || 'tag')}
              </div>
              <span class="cat-budget-name">${escapeHtml(cat.name)}</span>
            </div>
            <div class="cat-budget-numbers">
              <span class="cat-budget-spent">${sym}${spent.toFixed(2)}</span>
              <span class="cat-budget-limit">/ ${sym}${limit}</span>
            </div>
          </div>
          <div class="cat-budget-track">
            <div class="cat-budget-fill" style="width: ${fillWidth}%; background: ${barBg};"></div>
          </div>
          <div class="cat-budget-footer">
            <span class="cat-budget-percent">${percent}% spent</span>
            <span class="cat-budget-remaining ${statusClass}">${statusText}</span>
          </div>
        </div>
      `;
    });

    dom.categoryBudgetMeters.innerHTML = html;
  }

  function renderDonutChart(categoryTotals, totalSpent) {
    dom.donutTotalAmount.textContent = `${state.settings.currency}${Math.round(totalSpent)}`;

    const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0 || totalSpent === 0) {
      dom.categoryDonutChart.innerHTML = `
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="24"></circle>
      `;
      return;
    }

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;
    let svgContent = '';

    entries.forEach(([catName, amount]) => {
      const percentage = amount / totalSpent;
      const strokeDash = percentage * circumference;
      const rotation = (accumulatedAngle * 360) - 90;

      const catObj = state.categories.find(c => c.name === catName) || { color: '#6366F1' };

      svgContent += `
        <circle cx="100" cy="100" r="${radius}" fill="none"
          stroke="${catObj.color}" stroke-width="24"
          stroke-dasharray="${strokeDash} ${circumference}"
          transform="rotate(${rotation} 100 100)"
          stroke-linecap="round"
          style="transition: stroke-dasharray 600ms ease;"
        ></circle>
      `;

      accumulatedAngle += percentage;
    });

    dom.categoryDonutChart.innerHTML = svgContent;
  }

  function renderCategoryBars(categoryTotals, totalSpent) {
    const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      dom.categoryBarsList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.82rem; text-align: center;">No expenses recorded this month yet.</div>';
      return;
    }

    let html = '';
    entries.forEach(([catName, amount]) => {
      const catObj = state.categories.find(c => c.name === catName) || { icon: 'tag', color: '#10B981' };
      const percent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

      html += `
        <div class="cat-bar-item">
          <div class="cat-bar-header">
            <span class="cat-bar-label">
              <span style="color: ${catObj.color}; display: flex; align-items: center;">${getIconSvg(catObj.icon || 'tag')}</span>
              <span>${escapeHtml(catName)}</span>
            </span>
            <span class="cat-bar-amount">${state.settings.currency}${amount.toFixed(2)} (${percent}%)</span>
          </div>
          <div class="cat-bar-track">
            <div class="cat-bar-fill" style="width: ${percent}%; background: ${catObj.color};"></div>
          </div>
        </div>
      `;
    });

    dom.categoryBarsList.innerHTML = html;
  }

  function renderPaymentBreakdown(methodTotals) {
    const entries = Object.entries(methodTotals);
    if (entries.length === 0) {
      dom.methodBreakdownRow.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem;">No payment data yet.</div>';
      return;
    }

    let html = '';
    entries.forEach(([method, amount]) => {
      html += `
        <div class="method-stat-card">
          <span class="method-name">${escapeHtml(method)}</span>
          <span class="method-val">${state.settings.currency}${amount.toFixed(2)}</span>
        </div>
      `;
    });

    dom.methodBreakdownRow.innerHTML = html;
  }

  // ============================================================================
  // SETTINGS & CATEGORY BUDGET LIMITS LIST
  // ============================================================================
  function renderCategoryLimitsEditor() {
    let html = '';
    const sym = state.settings.currency;

    state.categories.forEach(cat => {
      html += `
        <div class="category-limit-row" data-category-id="${cat.id}">
          <div class="cat-limit-info">
            <div class="cat-limit-icon" style="color: ${cat.color}; background: ${cat.color}18;">
              ${getIconSvg(cat.icon || 'tag')}
            </div>
            <span class="cat-limit-name">${escapeHtml(cat.name)}</span>
          </div>
          <div class="cat-limit-input-wrap">
            <span class="cat-limit-symbol">${sym}</span>
            <input type="number" class="cat-limit-input" data-category-id="${cat.id}" value="${cat.budgetLimit || 0}" min="0" step="25">
          </div>
        </div>
      `;
    });

    dom.categoryLimitsEditorList.innerHTML = html;

    dom.categoryLimitsEditorList.querySelectorAll('.cat-limit-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const catId = input.getAttribute('data-category-id');
        const newLimit = parseFloat(e.target.value) || 0;
        const targetCat = state.categories.find(c => c.id === catId);
        if (targetCat) {
          triggerHaptic(14);
          targetCat.budgetLimit = newLimit;
          saveCategories();
          renderCategoryBudgetMeters(getMonthSpendMetrics().categoryTotals);
          showToast('Limit Updated', `${targetCat.name} limit set to ${sym}${newLimit}`, 'check');
        }
      });
    });
  }

  function loadSettingsIntoDom() {
    dom.monthlyIncomeInput.value = state.settings.expectedIncome || 3500;
    dom.monthlyBudgetInput.value = state.settings.monthlyBudget || 2000;
    dom.currencySelect.value = state.settings.currency;
    dom.currencySymbol.textContent = state.entryMode === 'income' ? '+' + state.settings.currency : state.settings.currency;
    dom.hapticsToggle.checked = state.settings.haptics !== false;
    dom.sheetsWebhookInput.value = state.settings.sheetsUrl || '';

    renderCategoryLimitsEditor();
    updatePendingBadge();
    updateSyncStatusBadge(state.settings.sheetsUrl ? 'online' : 'local');
  }

  function saveGeneralSettings() {
    triggerHaptic(15);
    const incomeVal = parseFloat(dom.monthlyIncomeInput.value);
    if (!isNaN(incomeVal) && incomeVal >= 0) {
      state.settings.expectedIncome = incomeVal;
    }

    const budgetVal = parseFloat(dom.monthlyBudgetInput.value);
    if (!isNaN(budgetVal) && budgetVal > 0) {
      state.settings.monthlyBudget = budgetVal;
    }

    state.settings.currency = dom.currencySelect.value;
    state.settings.haptics = dom.hapticsToggle.checked;
    dom.currencySymbol.textContent = state.entryMode === 'income' ? '+' + state.settings.currency : state.settings.currency;

    saveSettings();
    renderGlanceBar();
    renderAnalytics();
    renderHistoryFeed();
    renderCategoryLimitsEditor();

    showToast('Settings Saved', 'Preferences updated successfully', 'settings');
  }

  function saveGoogleSheetsUrl() {
    triggerHaptic(15);
    const url = dom.sheetsWebhookInput.value.trim();
    state.settings.sheetsUrl = url;
    saveSettings();

    if (url) {
      showCallout('Google Sheets Webhook saved! Testing connection...', 'success');
      testGoogleSheetsConnection();
    } else {
      showCallout('Webhook removed. Operating in 100% local mode.', 'success');
      updateSyncStatusBadge('local');
    }
  }

  async function testGoogleSheetsConnection() {
    triggerHaptic(15);
    const url = state.settings.sheetsUrl;
    if (!url) {
      showCallout('Please enter a Google Apps Script Web App URL first.', 'error');
      return;
    }

    showCallout('Testing connection to Google Sheets...', 'success');

    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          id: 'test_ping',
          type: 'system',
          amount: 0,
          category: 'Budgie Setup',
          note: 'Connection Test Ping',
          method: 'System',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        })
      });

      showCallout('Connection successful! Your Google Sheet is linked and ready.', 'success');
      updateSyncStatusBadge('online');
    } catch (err) {
      showCallout('Connection failed: ' + err.message, 'error');
      updateSyncStatusBadge('error');
    }
  }

  function showCallout(msg, type) {
    dom.sheetsStatusMsg.textContent = msg;
    dom.sheetsStatusMsg.className = `status-callout ${type}`;
    dom.sheetsStatusMsg.classList.remove('hidden');
  }

  // ============================================================================
  // CUSTOM CATEGORY MODAL (EASILY ADD CATEGORIES LATER)
  // ============================================================================
  function setupCategoryModal() {
    const openModal = () => {
      triggerHaptic(15);
      dom.categoryModal.classList.remove('hidden');
      dom.newCategoryName.focus();
    };

    dom.manageCategoriesBtn.addEventListener('click', openModal);
    if (dom.openAddCategoryFromSettingsBtn) {
      dom.openAddCategoryFromSettingsBtn.addEventListener('click', openModal);
    }
    if (dom.editBudgetsLinkBtn) {
      dom.editBudgetsLinkBtn.addEventListener('click', () => {
        triggerHaptic(14);
        switchView('view-settings');
        const targetEl = document.getElementById('categoryBudgetsSettingsCard');
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
      });
    }

    dom.closeCategoryModalBtn.addEventListener('click', () => {
      dom.categoryModal.classList.add('hidden');
    });

    dom.iconPickerRow.querySelectorAll('.icon-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHaptic(12);
        dom.iconPickerRow.querySelectorAll('.icon-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.newCategoryIcon = btn.getAttribute('data-icon');
      });
    });

    dom.colorPickerRow.querySelectorAll('.color-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHaptic(12);
        dom.colorPickerRow.querySelectorAll('.color-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.newCategoryColor = btn.getAttribute('data-color');
      });
    });

    dom.saveCustomCategoryBtn.addEventListener('click', () => {
      const name = dom.newCategoryName.value.trim();
      if (!name) return;

      const budgetLimit = parseFloat(dom.newCategoryBudget.value) || 200;

      triggerHaptic(20);
      const newCat = {
        id: 'cat_' + Date.now(),
        name: name,
        icon: state.newCategoryIcon || 'tag',
        color: state.newCategoryColor || '#84CC16',
        budgetLimit: budgetLimit
      };

      state.categories.push(newCat);
      saveCategories();

      state.selectedCategoryId = newCat.id;
      renderCategoryGrid();
      renderCategoryFilterPills();
      renderCategoryBudgetMeters(getMonthSpendMetrics().categoryTotals);
      renderCategoryLimitsEditor();

      dom.categoryModal.classList.add('hidden');
      dom.newCategoryName.value = '';

      showToast('Category Added', `Added ${newCat.name} ($${budgetLimit}/mo limit)`, 'tag');
    });
  }

  // ============================================================================
  // RECURRING BILLS & SUBSCRIPTIONS ENGINE
  // ============================================================================
  function getNextOccurrence(fromDateStr, frequency, targetDay = null) {
    if (!fromDateStr) fromDateStr = new Date().toISOString().split('T')[0];
    const parts = fromDateStr.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);

    if (frequency === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else if (frequency === 'biweekly') {
      d.setDate(d.getDate() + 14);
    } else if (frequency === 'yearly') {
      d.setFullYear(d.getFullYear() + 1);
    } else {
      // Monthly (default)
      const nextMonth = d.getMonth() + 1;
      const desiredDay = targetDay ? Math.min(targetDay, 28) : Math.min(parts[2], 28);
      d.setMonth(nextMonth, desiredDay);
      const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const actualTarget = targetDay || parts[2];
      d.setDate(Math.min(actualTarget, daysInTargetMonth));
    }

    return d.toISOString().split('T')[0];
  }

  function formatFrequency(freq) {
    switch (freq) {
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'yearly': return 'Yearly';
      case 'monthly':
      default: return 'Monthly';
    }
  }

  function formatDateFriendly(dateStr) {
    if (!dateStr) return 'N/A';
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) return 'Today';
    
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function checkAndProcessRecurring() {
    if (!state.recurringRules || state.recurringRules.length === 0) return 0;
    const todayStr = new Date().toISOString().split('T')[0];
    let postedCount = 0;

    state.recurringRules.forEach(rule => {
      if (!rule.active || !rule.autoPost) return;

      if (!rule.nextDueDate) {
        rule.nextDueDate = todayStr;
      }

      let safetyLimit = 0;
      while (rule.nextDueDate <= todayStr && safetyLimit < 52) {
        safetyLimit++;
        const tx = {
          id: 'tx_rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          type: rule.type || 'expense',
          amount: parseFloat(rule.amount.toFixed(2)),
          category: rule.category,
          categoryId: rule.categoryId,
          note: `${rule.title} (Recurring)`,
          method: 'Auto',
          date: rule.nextDueDate,
          dateStr: rule.nextDueDate,
          timeStr: '00:00:00',
          createdAt: new Date().toISOString(),
          synced: false
        };

        state.transactions.unshift(tx);
        enqueueForSheetSync(tx);

        rule.lastPostedDate = rule.nextDueDate;
        rule.nextDueDate = getNextOccurrence(rule.nextDueDate, rule.frequency);
        postedCount++;
      }
    });

    if (postedCount > 0) {
      saveTransactions();
      saveRecurringRules();
      renderGlanceBar();
      renderHistoryFeed();
      renderAnalytics();
      renderRecurringList();
      showToast('Recurring Logged', `${postedCount} scheduled bill(s) recorded`, 'bills');
    }

    return postedCount;
  }

  function renderRecurringList() {
    if (!dom.recurringList) return;

    if (!state.recurringRules || state.recurringRules.length === 0) {
      dom.recurringList.innerHTML = `
        <div class="recurring-empty-state" style="text-align: center; padding: 18px 10px; color: var(--text-muted); font-size: 0.85rem;">
          <p style="margin-bottom: 4px; font-weight: 500;">No recurring bills or subscriptions added yet.</p>
          <span style="font-size: 0.76rem; color: var(--text-secondary);">Tap "+ Add Rule" to schedule rent, Netflix, gym, or salary.</span>
        </div>
      `;
      return;
    }

    let html = '';
    state.recurringRules.forEach(rule => {
      const isIncome = rule.type === 'income';
      const amountPrefix = isIncome ? '+' : '-';
      const amountClass = isIncome ? 'recurring-amount income' : 'recurring-amount';
      const cardClass = rule.active ? 'recurring-card' : 'recurring-card paused';
      const pauseLabel = rule.active ? 'Pause' : 'Resume';

      html += `
        <div class="${cardClass}" data-rule-id="${rule.id}">
          <div class="recurring-header">
            <div class="recurring-title-row">
              <span class="recurring-title">${escapeHtml(rule.title)}</span>
              <span class="badge-freq">${escapeHtml(formatFrequency(rule.frequency))}</span>
            </div>
            <span class="${amountClass}">${amountPrefix}${state.settings.currency}${rule.amount.toFixed(2)}</span>
          </div>
          <div class="recurring-footer">
            <span class="recurring-due-label">
              Next: <strong>${formatDateFriendly(rule.nextDueDate)}</strong>
              ${rule.autoPost ? '<span style="font-size: 0.7rem; color: var(--primary-light); margin-left: 4px;">• Auto-logs</span>' : ''}
            </span>
            <div class="recurring-actions">
              <button type="button" class="rec-btn-small post-now-btn" data-post-id="${rule.id}" title="Post transaction right now">
                Post Now
              </button>
              <button type="button" class="rec-btn-small toggle-active-btn" data-toggle-id="${rule.id}">
                ${pauseLabel}
              </button>
              <button type="button" class="rec-btn-small delete-rule-btn" data-del-id="${rule.id}" title="Delete rule">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
    });

    dom.recurringList.innerHTML = html;

    // Attach recurring item action listeners
    dom.recurringList.querySelectorAll('.post-now-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHaptic(18);
        const ruleId = btn.getAttribute('data-post-id');
        postRecurringRuleNow(ruleId);
      });
    });

    dom.recurringList.querySelectorAll('.toggle-active-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHaptic(14);
        const ruleId = btn.getAttribute('data-toggle-id');
        toggleRecurringRuleActive(ruleId);
      });
    });

    dom.recurringList.querySelectorAll('.delete-rule-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHaptic(20);
        const ruleId = btn.getAttribute('data-del-id');
        deleteRecurringRule(ruleId);
      });
    });
  }

  function postRecurringRuleNow(ruleId) {
    const rule = state.recurringRules.find(r => r.id === ruleId);
    if (!rule) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();

    const tx = {
      id: 'tx_rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      type: rule.type || 'expense',
      amount: parseFloat(rule.amount.toFixed(2)),
      category: rule.category,
      categoryId: rule.categoryId,
      note: `${rule.title} (Recurring)`,
      method: 'Auto',
      date: todayStr,
      dateStr: todayStr,
      timeStr: now.toTimeString().split(' ')[0],
      createdAt: now.toISOString(),
      synced: false
    };

    state.transactions.unshift(tx);
    saveTransactions();
    enqueueForSheetSync(tx);

    rule.lastPostedDate = todayStr;
    rule.nextDueDate = getNextOccurrence(todayStr, rule.frequency);
    saveRecurringRules();

    renderGlanceBar();
    renderHistoryFeed();
    renderAnalytics();
    renderRecurringList();

    showToast('Bill Logged', `Recorded ${rule.title} (${state.settings.currency}${rule.amount.toFixed(2)})`, 'bills');
  }

  function toggleRecurringRuleActive(ruleId) {
    const rule = state.recurringRules.find(r => r.id === ruleId);
    if (!rule) return;

    rule.active = !rule.active;
    saveRecurringRules();
    renderRecurringList();
    renderAnalytics();

    showToast(rule.active ? 'Rule Resumed' : 'Rule Paused', rule.title, 'info');
  }

  function deleteRecurringRule(ruleId) {
    const idx = state.recurringRules.findIndex(r => r.id === ruleId);
    if (idx === -1) return;

    const removed = state.recurringRules.splice(idx, 1)[0];
    saveRecurringRules();
    renderRecurringList();
    renderAnalytics();

    showToast('Rule Deleted', `Removed ${removed.title}`, 'trash');
  }

  function setupRecurringManager() {
    const populateCategories = () => {
      if (!dom.newRecurCategory || !dom.newRecurType) return;
      const isIncome = dom.newRecurType.value === 'income';
      const catList = isIncome ? state.incomeCategories : state.categories;

      dom.newRecurCategory.innerHTML = catList.map(c => 
        `<option value="${c.id}">${escapeHtml(c.name)}</option>`
      ).join('');
    };

    const openModal = (ruleToEdit = null) => {
      triggerHaptic(15);
      populateCategories();

      if (ruleToEdit) {
        dom.recurringModalTitle.textContent = 'Edit Recurring Rule';
        dom.editingRecurId.value = ruleToEdit.id;
        dom.newRecurTitle.value = ruleToEdit.title;
        dom.newRecurAmount.value = ruleToEdit.amount;
        dom.newRecurType.value = ruleToEdit.type || 'expense';
        populateCategories();
        dom.newRecurCategory.value = ruleToEdit.categoryId || '';
        dom.newRecurFrequency.value = ruleToEdit.frequency || 'monthly';
        dom.newRecurNextDate.value = ruleToEdit.nextDueDate || new Date().toISOString().split('T')[0];
        dom.newRecurAutoPost.checked = ruleToEdit.autoPost !== false;
      } else {
        dom.recurringModalTitle.textContent = 'New Recurring Bill / Income';
        dom.editingRecurId.value = '';
        dom.newRecurTitle.value = '';
        dom.newRecurAmount.value = '';
        dom.newRecurType.value = 'expense';
        populateCategories();
        dom.newRecurFrequency.value = 'monthly';
        dom.newRecurNextDate.value = new Date().toISOString().split('T')[0];
        dom.newRecurAutoPost.checked = true;
      }

      dom.recurringModal.classList.remove('hidden');
      dom.newRecurTitle.focus();
    };

    if (dom.openAddRecurringBtn) {
      dom.openAddRecurringBtn.addEventListener('click', () => openModal());
    }

    if (dom.closeRecurringModalBtn) {
      dom.closeRecurringModalBtn.addEventListener('click', () => {
        dom.recurringModal.classList.add('hidden');
      });
    }

    if (dom.newRecurType) {
      dom.newRecurType.addEventListener('change', populateCategories);
    }

    if (dom.saveRecurringRuleBtn) {
      dom.saveRecurringRuleBtn.addEventListener('click', () => {
        const title = dom.newRecurTitle.value.trim();
        const amount = parseFloat(dom.newRecurAmount.value);
        if (!title) {
          alert('Please enter a bill or income name.');
          return;
        }
        if (isNaN(amount) || amount <= 0) {
          alert('Please enter a valid amount greater than 0.');
          return;
        }

        const type = dom.newRecurType.value;
        const catList = type === 'income' ? state.incomeCategories : state.categories;
        const categoryObj = catList.find(c => c.id === dom.newRecurCategory.value) || catList[0];
        const freq = dom.newRecurFrequency.value;
        const nextDate = dom.newRecurNextDate.value || new Date().toISOString().split('T')[0];
        const autoPost = dom.newRecurAutoPost.checked;

        triggerHaptic(20);

        const editId = dom.editingRecurId.value;
        if (editId) {
          const rule = state.recurringRules.find(r => r.id === editId);
          if (rule) {
            rule.title = title;
            rule.amount = parseFloat(amount.toFixed(2));
            rule.type = type;
            rule.category = categoryObj.name;
            rule.categoryId = categoryObj.id;
            rule.frequency = freq;
            rule.nextDueDate = nextDate;
            rule.autoPost = autoPost;
          }
        } else {
          const newRule = {
            id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            title: title,
            amount: parseFloat(amount.toFixed(2)),
            type: type,
            category: categoryObj.name,
            categoryId: categoryObj.id,
            frequency: freq,
            nextDueDate: nextDate,
            autoPost: autoPost,
            active: true,
            lastPostedDate: null
          };
          state.recurringRules.push(newRule);
        }

        saveRecurringRules();
        renderRecurringList();
        renderAnalytics();
        checkAndProcessRecurring();

        dom.recurringModal.classList.add('hidden');
        showToast('Rule Saved', `${title} (${state.settings.currency}${amount.toFixed(2)} ${formatFrequency(freq)})`, 'bills');
      });
    }

    // Handle Speed Add Recurring toggle
    if (dom.expenseIsRecurringToggle) {
      dom.expenseIsRecurringToggle.addEventListener('change', () => {
        triggerHaptic(12);
        if (dom.expenseIsRecurringToggle.checked) {
          dom.recurOptionsRow.classList.remove('hidden');
        } else {
          dom.recurOptionsRow.classList.add('hidden');
        }
      });
    }
  }

  // ============================================================================
  // CSV & JSON EXPORT / RESTORE
  // ============================================================================
  function exportToCsv() {
    triggerHaptic(15);
    if (state.transactions.length === 0) {
      showToast('Export CSV', 'No transactions to export yet', 'info');
      return;
    }

    const headers = ['Type', 'Date', 'Time', 'Amount', 'Category', 'Note', 'Method', 'ID', 'CreatedAt'];
    const rows = state.transactions.map(tx => [
      `"${tx.type || 'expense'}"`,
      `"${tx.date || ''}"`,
      `"${tx.timeStr || ''}"`,
      tx.amount,
      `"${(tx.category || '').replace(/"/g, '""')}"`,
      `"${(tx.note || '').replace(/"/g, '""')}"`,
      `"${(tx.method || '').replace(/"/g, '""')}"`,
      `"${tx.id}"`,
      `"${tx.createdAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `budgie_expenses_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Export Complete', 'Downloaded CSV file', 'download');
  }

  function exportToJson() {
    triggerHaptic(15);
    const backupData = {
      version: 3,
      exportedAt: new Date().toISOString(),
      settings: state.settings,
      categories: state.categories,
      recurringRules: state.recurringRules,
      transactions: state.transactions
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `budgie_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Export Complete', 'Downloaded JSON backup', 'download');
  }

  function restoreFromJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported.transactions)) {
          state.transactions = imported.transactions;
          saveTransactions();
        }
        if (Array.isArray(imported.recurringRules)) {
          state.recurringRules = imported.recurringRules;
          saveRecurringRules();
        }
        if (Array.isArray(imported.categories)) {
          state.categories = imported.categories.map(c => {
            delete c.emoji;
            if (!c.icon) c.icon = 'tag';
            if (typeof c.budgetLimit === 'undefined') c.budgetLimit = 200;
            return c;
          });
          saveCategories();
        }
        if (imported.settings) {
          state.settings = { ...DEFAULT_SETTINGS, ...imported.settings };
          saveSettings();
        }

        renderCategoryGrid();
        renderCategoryFilterPills();
        renderGlanceBar();
        renderHistoryFeed();
        renderAnalytics();
        renderRecurringList();
        loadSettingsIntoDom();

        showToast('Restore Successful', `Imported ${state.transactions.length} transactions`, 'check');
      } catch (err) {
        alert('Invalid JSON backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // ============================================================================
  // PWA & SERVICE WORKER SETUP
  // ============================================================================
  function setupPwa() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
          console.log('Budgie ServiceWorker registered:', reg.scope);
        }).catch((err) => {
          console.warn('Budgie ServiceWorker registration error:', err);
        });
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      state.deferredInstallPrompt = e;
      dom.installPwaBtn.classList.remove('hidden');
    });

    dom.installPwaBtn.addEventListener('click', () => {
      triggerHaptic(15);
      if (state.deferredInstallPrompt) {
        state.deferredInstallPrompt.prompt();
        state.deferredInstallPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            dom.installPwaBtn.classList.add('hidden');
          }
          state.deferredInstallPrompt = null;
        });
      }
    });

    window.addEventListener('appinstalled', () => {
      dom.installPwaBtn.classList.add('hidden');
      showToast('Budgie Installed', 'Ready on your home screen', 'check');
    });
  }

  // ============================================================================
  // NAVIGATION (BOTTOM DOCK)
  // ============================================================================
  function setupNavigation() {
    dom.dockTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        triggerHaptic(14);
        const targetId = tab.getAttribute('data-target');
        switchView(targetId);
      });
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'history') {
      switchView('view-history');
    }
  }

  function switchView(viewId) {
    state.activeView = viewId;

    dom.dockTabs.forEach(tab => {
      if (tab.getAttribute('data-target') === viewId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    dom.appViews.forEach(view => {
      if (view.id === viewId) {
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
      }
    });

    if (viewId === 'view-history') {
      renderHistoryFeed();
    } else if (viewId === 'view-analytics') {
      renderAnalytics();
    } else if (viewId === 'view-add') {
      renderGlanceBar();
    } else if (viewId === 'view-settings') {
      renderRecurringList();
    }
    checkAndProcessRecurring();
  }

  // ============================================================================
  // EVENT LISTENERS BINDING
  // ============================================================================
  function attachEventListeners() {
    // Mode Switch (Expense vs Income)
    dom.modeExpenseBtn.addEventListener('click', () => setEntryMode('expense'));
    dom.modeIncomeBtn.addEventListener('click', () => setEntryMode('income'));

    // Numpad input
    dom.numpad.querySelectorAll('.key-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        handleNumpadInput(key);
      });
    });

    // Preset chips
    renderPresetsRow([5, 10, 20, 50]);

    dom.submitExpenseBtn.addEventListener('click', saveCurrentExpense);

    dom.methodChips.querySelectorAll('.method-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        triggerHaptic(12);
        dom.methodChips.querySelectorAll('.method-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedMethod = chip.getAttribute('data-method');
      });
    });

    dom.historySearchInput.addEventListener('input', (e) => {
      state.historySearchQuery = e.target.value;
      if (state.historySearchQuery) {
        dom.clearSearchBtn.classList.remove('hidden');
      } else {
        dom.clearSearchBtn.classList.add('hidden');
      }
      renderHistoryFeed();
    });

    dom.clearSearchBtn.addEventListener('click', () => {
      dom.historySearchInput.value = '';
      state.historySearchQuery = '';
      dom.clearSearchBtn.classList.add('hidden');
      renderHistoryFeed();
    });

    dom.savePreferencesBtn.addEventListener('click', saveGeneralSettings);
    dom.saveSheetUrlBtn.addEventListener('click', saveGoogleSheetsUrl);
    dom.testSheetConnBtn.addEventListener('click', testGoogleSheetsConnection);
    dom.syncPendingBtn.addEventListener('click', () => {
      triggerHaptic(15);
      processSyncQueue();
    });

    dom.exportCsvBtn.addEventListener('click', exportToCsv);
    dom.exportJsonBtn.addEventListener('click', exportToJson);
    dom.importJsonInput.addEventListener('change', restoreFromJson);

    function clearAllTransactionsAction() {
      state.transactions = [];
      saveTransactions();
      sendClearAllSync();
      renderCategoryGrid();
      renderCategoryFilterPills();
      renderGlanceBar();
      renderHistoryFeed();
      renderAnalytics();
      renderCategoryLimitsEditor();
      showToast('All Cleared', 'Transactions cleared. Ready for real expenses!', 'check');
    }

    let resetConfirmTimeout = null;
    let isResetConfirming = false;

    if (dom.resetDataBtn) {
      dom.resetDataBtn.addEventListener('click', () => {
        triggerHaptic(20);
        if (!isResetConfirming) {
          isResetConfirming = true;
          dom.resetDataBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
          dom.resetDataBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Tap Again to Confirm Clear
          `;
          resetConfirmTimeout = setTimeout(() => {
            isResetConfirming = false;
            dom.resetDataBtn.style.background = '';
            dom.resetDataBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Clear All Transactions (Start Fresh)
            `;
          }, 4500);
        } else {
          clearTimeout(resetConfirmTimeout);
          isResetConfirming = false;
          dom.resetDataBtn.style.background = '';
          dom.resetDataBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear All Transactions (Start Fresh)
          `;
          clearAllTransactionsAction();
        }
      });
    }

    if (dom.clearAllHistoryBtn) {
      let isHistoryConfirming = false;
      let historyTimeout = null;
      dom.clearAllHistoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerHaptic(20);
        if (!isHistoryConfirming) {
          isHistoryConfirming = true;
          dom.clearAllHistoryBtn.textContent = 'Tap to confirm?';
          dom.clearAllHistoryBtn.style.color = '#f59e0b';
          historyTimeout = setTimeout(() => {
            isHistoryConfirming = false;
            dom.clearAllHistoryBtn.textContent = 'Clear All';
            dom.clearAllHistoryBtn.style.color = '';
          }, 4500);
        } else {
          clearTimeout(historyTimeout);
          isHistoryConfirming = false;
          dom.clearAllHistoryBtn.textContent = 'Clear All';
          dom.clearAllHistoryBtn.style.color = '';
          clearAllTransactionsAction();
        }
      });
    }

    if (dom.forceUpdateBtn) {
      dom.forceUpdateBtn.addEventListener('click', async () => {
        triggerHaptic(25);
        showToast('Updating Budgie...', 'Clearing cache and reloading latest version...', 'refresh');
        try {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (let reg of regs) {
              await reg.unregister();
            }
          }
          if ('caches' in window) {
            const keys = await caches.keys();
            for (let k of keys) {
              await caches.delete(k);
            }
          }
        } catch (err) {
          console.warn('Error clearing caches:', err);
        }
        setTimeout(() => {
          window.location.reload(true);
        }, 500);
      });
    }

    dom.copyAppsScriptBtn.addEventListener('click', async () => {
      triggerHaptic(15);
      try {
        const response = await fetch('./google-sheets-script.js');
        const scriptCode = await response.text();
        await navigator.clipboard.writeText(scriptCode);
        showToast('Copied to Clipboard', 'Paste into Extensions > Apps Script in Sheets', 'check');
      } catch (err) {
        showToast('Copy Note', 'See google-sheets-script.js in repository', 'info');
      }
    });

    dom.syncStatusBadge.addEventListener('click', () => {
      switchView('view-settings');
    });

    window.addEventListener('online', () => {
      showToast('Back Online', 'Flushing offline sync queue...', 'cloud');
      processSyncQueue();
    });

    window.addEventListener('offline', () => {
      updateSyncStatusBadge('offline');
    });

    window.addEventListener('keydown', (e) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      if (state.activeView === 'view-add') {
        if (/^[0-9]$/.test(e.key) || e.key === '.') {
          handleNumpadInput(e.key);
        } else if (e.key === 'Backspace') {
          handleNumpadInput('backspace');
        } else if (e.key === 'Enter') {
          saveCurrentExpense();
        }
      }
    });
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ============================================================================
  // INITIALIZATION ENTRY POINT
  // ============================================================================
  function init() {
    cacheDomElements();
    loadData();

    dom.expenseDateInput.value = new Date().toISOString().split('T')[0];

    updateTopMonthHeader();
    renderCategoryGrid();
    renderCategoryFilterPills();
    renderGlanceBar();
    renderHistoryFeed();
    renderAnalytics();
    loadSettingsIntoDom();

    attachEventListeners();
    setupCategoryModal();
    setupRecurringManager();
    renderRecurringList();
    checkAndProcessRecurring();
    setupVoiceRecognition();
    setupNavigation();
    setupPwa();

    if (state.syncQueue.length > 0 && navigator.onLine && state.settings.sheetsUrl) {
      processSyncQueue();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
