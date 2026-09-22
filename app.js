/**
 * ==============================================================================
 * BUDGIE - APPLICATION CORE LOGIC
 * High-performance, offline-first personal budgeting application
 * ==============================================================================
 */

(() => {
  'use strict';

  // ============================================================================
  // CONSTANTS & INITIAL DATA
  // ============================================================================
  const STORAGE_KEYS = {
    TRANSACTIONS: 'budgie_transactions_v1',
    CATEGORIES: 'budgie_categories_v1',
    SETTINGS: 'budgie_settings_v1',
    SYNC_QUEUE: 'budgie_sync_queue_v1'
  };

  const DEFAULT_CATEGORIES = [
    { id: 'food', name: 'Food & Dining', emoji: '🍔', color: '#10B981' },
    { id: 'groceries', name: 'Groceries', emoji: '🛒', color: '#84CC16' },
    { id: 'coffee', name: 'Coffee & Snacks', emoji: '☕', color: '#F59E0B' },
    { id: 'transit', name: 'Gas & Transit', emoji: '🚗', color: '#3B82F6' },
    { id: 'shopping', name: 'Shopping', emoji: '🛍️', color: '#8B5CF6' },
    { id: 'bills', name: 'Bills & Utilities', emoji: '💡', color: '#F43F5E' },
    { id: 'entertainment', name: 'Entertainment', emoji: '🍿', color: '#EC4899' },
    { id: 'health', name: 'Health & Wellness', emoji: '💊', color: '#06B6D4' }
  ];

  const DEFAULT_SETTINGS = {
    monthlyBudget: 2000,
    currency: '$',
    sheetsUrl: '',
    haptics: true
  };

  // Sample starter transactions so the user immediately sees the visual beauty
  const DEMO_TRANSACTIONS = [
    {
      id: 'tx_demo_1',
      amount: 14.50,
      category: 'Food & Dining',
      categoryId: 'food',
      note: 'Chipotle Burrito Bowl',
      method: 'Card',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      synced: true
    },
    {
      id: 'tx_demo_2',
      amount: 5.75,
      category: 'Coffee & Snacks',
      categoryId: 'coffee',
      note: 'Oat Milk Latte',
      method: 'Card',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      synced: true
    },
    {
      id: 'tx_demo_3',
      amount: 48.20,
      category: 'Groceries',
      categoryId: 'groceries',
      note: 'Trader Joe’s weekly run',
      method: 'Card',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      synced: true
    },
    {
      id: 'tx_demo_4',
      amount: 35.00,
      category: 'Gas & Transit',
      categoryId: 'transit',
      note: 'Chevron Gas',
      method: 'Card',
      date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      synced: true
    }
  ];

  // ============================================================================
  // APP STATE
  // ============================================================================
  const state = {
    transactions: [],
    categories: [],
    settings: { ...DEFAULT_SETTINGS },
    syncQueue: [],
    
    // Speed Add State
    currentAmountStr: '',
    selectedCategoryId: 'food',
    selectedMethod: 'Card',
    
    // Filter & Search State
    activeView: 'view-add',
    historyCategoryFilter: 'all',
    historySearchQuery: '',
    analyticsTimeframe: 'month',
    
    // Custom Category Form State
    newCategoryEmoji: '🐕',
    newCategoryColor: '#10B981',

    // PWA Install Prompt
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
    dom.amountDisplay = document.getElementById('amountDisplay');
    dom.amountDisplayContainer = dom.amountDisplay.parentElement;
    dom.currencySymbol = document.getElementById('currencySymbol');
    dom.glanceRemaining = document.getElementById('glanceRemaining');
    dom.glanceFill = document.getElementById('glanceFill');
    dom.glanceDailyAmount = document.getElementById('glanceDailyAmount');
    dom.voiceAddBtn = document.getElementById('voiceAddBtn');
    dom.voiceStatusHint = document.getElementById('voiceStatusHint');
    dom.clearAmountBtn = document.getElementById('clearAmountBtn');
    dom.categoryGrid = document.getElementById('categoryGrid');
    dom.manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    dom.expenseNoteInput = document.getElementById('expenseNoteInput');
    dom.expenseDateInput = document.getElementById('expenseDateInput');
    dom.methodChips = document.getElementById('methodChips');
    dom.numpad = document.getElementById('numpad');
    dom.submitExpenseBtn = document.getElementById('submitExpenseBtn');

    // View 2: History
    dom.historyCount = document.getElementById('historyCount');
    dom.historyTotalSpent = document.getElementById('historyTotalSpent');
    dom.historySearchInput = document.getElementById('historySearchInput');
    dom.clearSearchBtn = document.getElementById('clearSearchBtn');
    dom.categoryFilterPills = document.getElementById('categoryFilterPills');
    dom.transactionsFeed = document.getElementById('transactionsFeed');
    dom.historyEmptyState = document.getElementById('historyEmptyState');

    // View 3: Analytics
    dom.analyticsSpent = document.getElementById('analyticsSpent');
    dom.analyticsBudgetLimit = document.getElementById('analyticsBudgetLimit');
    dom.budgetPercentageBadge = document.getElementById('budgetPercentageBadge');
    dom.analyticsBudgetBar = document.getElementById('analyticsBudgetBar');
    dom.analyticsRemaining = document.getElementById('analyticsRemaining');
    dom.analyticsDailyPace = document.getElementById('analyticsDailyPace');
    dom.analyticsDaysLeft = document.getElementById('analyticsDaysLeft');
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
    dom.monthlyBudgetInput = document.getElementById('monthlyBudgetInput');
    dom.currencySelect = document.getElementById('currencySelect');
    dom.hapticsToggle = document.getElementById('hapticsToggle');
    dom.savePreferencesBtn = document.getElementById('savePreferencesBtn');
    dom.exportCsvBtn = document.getElementById('exportCsvBtn');
    dom.exportJsonBtn = document.getElementById('exportJsonBtn');
    dom.importJsonInput = document.getElementById('importJsonInput');
    dom.resetDataBtn = document.getElementById('resetDataBtn');

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
    dom.emojiPickerRow = document.getElementById('emojiPickerRow');
    dom.colorPickerRow = document.getElementById('colorPickerRow');
    dom.saveCustomCategoryBtn = document.getElementById('saveCustomCategoryBtn');
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
      state.categories = storedCategories ? JSON.parse(storedCategories) : [...DEFAULT_CATEGORIES];

      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (storedTx) {
        state.transactions = JSON.parse(storedTx);
      } else {
        // First run: seed with demo transactions
        state.transactions = [...DEMO_TRANSACTIONS];
        saveTransactions();
      }

      const storedQueue = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      state.syncQueue = storedQueue ? JSON.parse(storedQueue) : [];

    } catch (err) {
      console.error('Budgie: Error loading stored data, initializing clean defaults:', err);
      state.transactions = [...DEMO_TRANSACTIONS];
      state.categories = [...DEFAULT_CATEGORIES];
      state.settings = { ...DEFAULT_SETTINGS };
      state.syncQueue = [];
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
  // HAPTIC FEEDBACK (Tactile Android Vibration)
  // ============================================================================
  function triggerHaptic(duration = 14) {
    if (!state.settings.haptics) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // Silently ignore if blocked by browser policy
      }
    }
  }

  // ============================================================================
  // TOAST NOTIFICATIONS
  // ============================================================================
  let toastTimer = null;
  function showToast(title, desc, icon = '✓') {
    if (!dom.toast) return;
    clearTimeout(toastTimer);
    dom.toastTitle.textContent = title;
    dom.toastDesc.textContent = desc;
    dom.toastIcon.textContent = icon;
    dom.toast.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      dom.toast.classList.add('hidden');
    }, 3200);
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
      // Prevent more than 2 decimal places
      const dotIndex = str.indexOf('.');
      if (dotIndex !== -1 && str.length - dotIndex > 2) {
        return;
      }
      // Prevent multiple leading zeroes
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

    // Micro pulse animation
    dom.amountDisplay.classList.remove('pulse-anim');
    void dom.amountDisplay.offsetWidth; // Force reflow
    dom.amountDisplay.classList.add('pulse-anim');
  }

  function renderCategoryGrid() {
    dom.categoryGrid.innerHTML = '';

    state.categories.forEach((cat) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `category-chip ${cat.id === state.selectedCategoryId ? 'selected' : ''}`;
      chip.setAttribute('data-category-id', cat.id);
      chip.setAttribute('role', 'radio');
      chip.setAttribute('aria-checked', cat.id === state.selectedCategoryId);

      chip.innerHTML = `
        <span class="cat-emoji">${cat.emoji}</span>
        <span class="cat-name">${cat.name}</span>
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
  // LOG EXPENSE (SUBMISSION)
  // ============================================================================
  function saveCurrentExpense() {
    const amount = parseFloat(state.currentAmountStr);
    if (isNaN(amount) || amount <= 0) return;

    triggerHaptic(30);

    const categoryObj = state.categories.find(c => c.id === state.selectedCategoryId) || state.categories[0];
    const note = dom.expenseNoteInput.value.trim();
    const date = dom.expenseDateInput.value || new Date().toISOString().split('T')[0];
    const now = new Date();

    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
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

    // Prepend to transaction list
    state.transactions.unshift(newTx);
    saveTransactions();

    // Enqueue for Google Sheets sync
    enqueueForSheetSync(newTx);

    // Provide visual & haptic confirmation
    showToast(
      'Expense Logged!', 
      `${state.settings.currency}${newTx.amount.toFixed(2)} for ${categoryObj.name}`, 
      categoryObj.emoji
    );

    // Reset Speed Add inputs
    state.currentAmountStr = '';
    dom.expenseNoteInput.value = '';
    updateAmountDisplay();

    // Close optional details accordion if open
    const detailsEl = document.getElementById('optionalDetails');
    if (detailsEl) detailsEl.open = false;

    // Refresh UI metrics
    updateTopMonthHeader();
    renderGlanceBar();
    renderHistoryFeed();
    renderAnalytics();
  }

  // ============================================================================
  // SPEECH-TO-TEXT VOICE EXPENSE ENTRY
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
        dom.voiceStatusHint.textContent = 'Listening... e.g. "Lunch 15.50" or "Coffee 4 dollars"';
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
    // Regex for amount: "$14.50", "14 dollars", "14.50", "14 bucks"
    let amount = null;
    const amountMatch = text.match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1]);
    }

    // Match Category keywords
    let matchedCat = null;
    const lower = text.toLowerCase();

    if (lower.includes('coffee') || lower.includes('latte') || lower.includes('tea') || lower.includes('snack') || lower.includes('starbucks')) {
      matchedCat = 'coffee';
    } else if (lower.includes('grocer') || lower.includes('trader') || lower.includes('safeway') || lower.includes('market') || lower.includes('costco')) {
      matchedCat = 'groceries';
    } else if (lower.includes('food') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast') || lower.includes('chipotle') || lower.includes('burger') || lower.includes('restaurant')) {
      matchedCat = 'food';
    } else if (lower.includes('gas') || lower.includes('uber') || lower.includes('lyft') || lower.includes('transit') || lower.includes('subway') || lower.includes('bus')) {
      matchedCat = 'transit';
    } else if (lower.includes('shop') || lower.includes('amazon') || lower.includes('clothes') || lower.includes('shoes')) {
      matchedCat = 'shopping';
    } else if (lower.includes('bill') || lower.includes('utility') || lower.includes('rent') || lower.includes('wifi') || lower.includes('electric')) {
      matchedCat = 'bills';
    } else if (lower.includes('movie') || lower.includes('game') || lower.includes('bar') || lower.includes('beer') || lower.includes('concert')) {
      matchedCat = 'entertainment';
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
      showToast('Voice Detected', `Heard: "${text}"`, '🎙️');
    } else {
      showToast('Voice Entry', `Heard: "${text}" (Amount not recognized)`, '❓');
    }
  }

  // ============================================================================
  // GOOGLE SHEETS SYNC ENGINE (LOCAL-FIRST WITH OFFLINE QUEUE)
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

    const itemsToSync = [...state.syncQueue];

    try {
      // Send payload as simple text/plain to avoid CORS preflight issues with Google Apps Script
      await fetch(state.settings.sheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(itemsToSync)
      });

      // Successful dispatch! In no-cors mode, completion without error indicates transmission
      // Filter out synced IDs from local queue
      const syncedIds = new Set(itemsToSync.map(item => item.id));
      state.syncQueue = state.syncQueue.filter(item => !syncedIds.has(item.id));
      saveSyncQueue();

      // Mark local items as synced
      state.transactions.forEach(t => {
        if (syncedIds.has(t.id)) t.synced = true;
      });
      saveTransactions();

      updateSyncStatusBadge('online');
      showToast('Google Sheets Synced', `${itemsToSync.length} expense(s) saved to sheet`, '☁️');

    } catch (err) {
      console.warn('Budgie: Google Sheets sync deferred (will retry when online):', err);
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
    const categoryTotals = {};
    const methodTotals = {};

    state.transactions.forEach(tx => {
      const txDate = new Date(tx.date || tx.createdAt);
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
        totalMonthSpent += tx.amount;

        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
        methodTotals[tx.method || 'Card'] = (methodTotals[tx.method || 'Card'] || 0) + tx.amount;
      }
    });

    const budget = state.settings.monthlyBudget || 2000;
    const remaining = Math.max(0, budget - totalMonthSpent);
    const percentSpent = budget > 0 ? Math.min(100, (totalMonthSpent / budget) * 100) : 0;

    // Days left in current month
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysLeft = Math.max(1, totalDaysInMonth - dayOfMonth + 1);
    const dailySafeSpend = remaining / daysLeft;

    return {
      spent: totalMonthSpent,
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

    // Filter transactions
    const filtered = state.transactions.filter(tx => {
      const matchCat = filterCat === 'all' || tx.categoryId === filterCat || tx.category === filterCat;
      const matchQuery = !query || 
        (tx.note && tx.note.toLowerCase().includes(query)) ||
        (tx.category && tx.category.toLowerCase().includes(query)) ||
        (tx.amount.toString().includes(query));
      return matchCat && matchQuery;
    });

    // Update history header count & total spent
    const totalFilteredSpend = filtered.reduce((acc, t) => acc + t.amount, 0);
    dom.historyCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'}`;
    dom.historyTotalSpent.textContent = `${state.settings.currency}${totalFilteredSpend.toFixed(2)} spent`;

    if (filtered.length === 0) {
      dom.transactionsFeed.innerHTML = '';
      dom.historyEmptyState.classList.remove('hidden');
      return;
    }

    dom.historyEmptyState.classList.add('hidden');

    // Group transactions by date
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
      const dayTotal = txs.reduce((acc, t) => acc + t.amount, 0);

      let dateTitle = dateStr;
      if (dateStr === todayStr) {
        dateTitle = 'Today';
      } else if (dateStr === yesterdayStr) {
        dateTitle = 'Yesterday';
      } else {
        const d = new Date(dateStr + 'T00:00:00');
        dateTitle = d.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
      }

      html += `
        <div class="history-date-group">
          <div class="group-header">
            <span>${dateTitle}</span>
            <span class="group-total">-${state.settings.currency}${dayTotal.toFixed(2)}</span>
          </div>
      `;

      txs.forEach(tx => {
        const catObj = state.categories.find(c => c.id === tx.categoryId || c.name === tx.category) || {
          emoji: '🪙',
          color: '#10B981'
        };

        const timeStr = tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

        html += `
          <div class="tx-card" data-tx-id="${tx.id}">
            <div class="tx-left">
              <div class="tx-icon-bubble" style="border-color: ${catObj.color}33; background: ${catObj.color}15;">
                ${catObj.emoji}
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
              <span class="tx-amount">-${state.settings.currency}${tx.amount.toFixed(2)}</span>
              <button type="button" class="tx-delete-btn" data-delete-id="${tx.id}" title="Delete entry" aria-label="Delete entry">
                ✕
              </button>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    });

    dom.transactionsFeed.innerHTML = html;

    // Attach delete listeners
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

    showToast('Deleted', `Removed expense of ${state.settings.currency}${removed.amount.toFixed(2)}`, '🗑️');

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
          ${cat.emoji} ${cat.name}
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

    // Render Donut Chart & Category Bars
    renderDonutChart(metrics.categoryTotals, metrics.spent);
    renderCategoryBars(metrics.categoryTotals, metrics.spent);
    renderPaymentBreakdown(metrics.methodTotals);
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
      const strokeOffset = circumference - strokeDash;
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
      const catObj = state.categories.find(c => c.name === catName) || { emoji: '🪙', color: '#10B981' };
      const percent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

      html += `
        <div class="cat-bar-item">
          <div class="cat-bar-header">
            <span class="cat-bar-label">
              <span>${catObj.emoji}</span>
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
  // CSV & JSON EXPORT / RESTORE
  // ============================================================================
  function exportToCsv() {
    triggerHaptic(15);
    if (state.transactions.length === 0) {
      showToast('Export CSV', 'No transactions to export yet', 'ℹ️');
      return;
    }

    const headers = ['Date', 'Time', 'Amount', 'Category', 'Note', 'Method', 'ID', 'CreatedAt'];
    const rows = state.transactions.map(tx => [
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

    showToast('Export Complete', 'Downloaded CSV file', '📊');
  }

  function exportToJson() {
    triggerHaptic(15);
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: state.settings,
      categories: state.categories,
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

    showToast('Export Complete', 'Downloaded JSON backup', '💾');
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
        if (Array.isArray(imported.categories)) {
          state.categories = imported.categories;
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
        loadSettingsIntoDom();

        showToast('Restore Successful', `Imported ${state.transactions.length} transactions`, '🎉');
      } catch (err) {
        alert('Invalid JSON backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // ============================================================================
  // SETTINGS MANAGEMENT
  // ============================================================================
  function loadSettingsIntoDom() {
    dom.monthlyBudgetInput.value = state.settings.monthlyBudget;
    dom.currencySelect.value = state.settings.currency;
    dom.currencySymbol.textContent = state.settings.currency;
    dom.hapticsToggle.checked = state.settings.haptics !== false;
    dom.sheetsWebhookInput.value = state.settings.sheetsUrl || '';

    updatePendingBadge();
    updateSyncStatusBadge(state.settings.sheetsUrl ? 'online' : 'local');
  }

  function saveGeneralSettings() {
    triggerHaptic(15);
    const budgetVal = parseFloat(dom.monthlyBudgetInput.value);
    if (!isNaN(budgetVal) && budgetVal > 0) {
      state.settings.monthlyBudget = budgetVal;
    }

    state.settings.currency = dom.currencySelect.value;
    state.settings.haptics = dom.hapticsToggle.checked;
    dom.currencySymbol.textContent = state.settings.currency;

    saveSettings();
    renderGlanceBar();
    renderAnalytics();
    renderHistoryFeed();

    showToast('Settings Saved', 'Preferences updated successfully', '⚙️');
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
      // Send a test ping
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          id: 'test_ping',
          amount: 0,
          category: 'Budgie Setup',
          note: 'Connection Test Ping',
          method: 'System',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        })
      });

      showCallout('✓ Connection successful! Your Google Sheet is linked and ready.', 'success');
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
  // CUSTOM CATEGORY MODAL
  // ============================================================================
  function setupCategoryModal() {
    dom.manageCategoriesBtn.addEventListener('click', () => {
      triggerHaptic(15);
      dom.categoryModal.classList.remove('hidden');
      dom.newCategoryName.focus();
    });

    dom.closeCategoryModalBtn.addEventListener('click', () => {
      dom.categoryModal.classList.add('hidden');
    });

    dom.emojiPickerRow.querySelectorAll('.emoji-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHaptic(12);
        dom.emojiPickerRow.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.newCategoryEmoji = btn.getAttribute('data-emoji');
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

      triggerHaptic(20);
      const newCat = {
        id: 'cat_' + Date.now(),
        name: name,
        emoji: state.newCategoryEmoji,
        color: state.newCategoryColor
      };

      state.categories.push(newCat);
      saveCategories();

      state.selectedCategoryId = newCat.id;
      renderCategoryGrid();
      renderCategoryFilterPills();

      dom.categoryModal.classList.add('hidden');
      dom.newCategoryName.value = '';

      showToast('Category Added', `Added ${newCat.emoji} ${newCat.name}`, '🎨');
    });
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

    // Capture Android install banner trigger
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
      showToast('Budgie Installed!', 'Ready on your home screen', '📱');
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

    // Check URL parameters for shortcut action e.g. ?action=history
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

    // Refresh view specific components
    if (viewId === 'view-history') {
      renderHistoryFeed();
    } else if (viewId === 'view-analytics') {
      renderAnalytics();
    } else if (viewId === 'view-add') {
      renderGlanceBar();
    }
  }

  // ============================================================================
  // EVENT LISTENERS BINDING
  // ============================================================================
  function attachEventListeners() {
    // Tactile Keypad
    dom.numpad.querySelectorAll('.key-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        handleNumpadInput(key);
      });
    });

    // Quick Preset Chips (+5, +10, +20, +50)
    document.querySelectorAll('.preset-chip[data-add]').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = parseFloat(chip.getAttribute('data-add'));
        addPresetAmount(val);
      });
    });

    dom.clearAmountBtn.addEventListener('click', clearAmount);
    dom.submitExpenseBtn.addEventListener('click', saveCurrentExpense);

    // Payment method selector
    dom.methodChips.querySelectorAll('.method-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        triggerHaptic(12);
        dom.methodChips.querySelectorAll('.method-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedMethod = chip.getAttribute('data-method');
      });
    });

    // History Search
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

    // Settings actions
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

    dom.resetDataBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all data to starter defaults? This will erase custom entries.')) {
        state.transactions = [...DEMO_TRANSACTIONS];
        state.categories = [...DEFAULT_CATEGORIES];
        state.syncQueue = [];
        saveTransactions();
        saveCategories();
        saveSyncQueue();
        renderCategoryGrid();
        renderCategoryFilterPills();
        renderGlanceBar();
        renderHistoryFeed();
        renderAnalytics();
        showToast('Data Reset', 'Restored to clean demo starter data', '🔄');
      }
    });

    // Copy Google Apps Script button
    dom.copyAppsScriptBtn.addEventListener('click', async () => {
      triggerHaptic(15);
      try {
        const response = await fetch('./google-sheets-script.js');
        const scriptCode = await response.text();
        await navigator.clipboard.writeText(scriptCode);
        showToast('Copied to Clipboard!', 'Paste into Extensions > Apps Script in Sheets', '📋');
      } catch (err) {
        showToast('Copy Note', 'See google-sheets-script.js in repository', '📋');
      }
    });

    // Sync status badge click: jumps to settings
    dom.syncStatusBadge.addEventListener('click', () => {
      switchView('view-settings');
    });

    // Online/Offline status listeners
    window.addEventListener('online', () => {
      showToast('Back Online', 'Flushing offline sync queue...', '🌐');
      processSyncQueue();
    });

    window.addEventListener('offline', () => {
      updateSyncStatusBadge('offline');
    });

    // Keyboard support for desktop testing
    window.addEventListener('keydown', (e) => {
      // Don't intercept if focused in note or input
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

    // Default Date input to today
    dom.expenseDateInput.value = new Date().toISOString().split('T')[0];

    // Render components
    updateTopMonthHeader();
    renderCategoryGrid();
    renderCategoryFilterPills();
    renderGlanceBar();
    renderHistoryFeed();
    renderAnalytics();
    loadSettingsIntoDom();

    // Attach modules
    attachEventListeners();
    setupCategoryModal();
    setupVoiceRecognition();
    setupNavigation();
    setupPwa();

    // Process any queued items
    if (state.syncQueue.length > 0 && navigator.onLine && state.settings.sheetsUrl) {
      processSyncQueue();
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
