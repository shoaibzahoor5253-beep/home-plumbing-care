/**
 * Home Plumbing Care – Leak & Maintenance Planner
 * Application Logic & LocalStorage State Management
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Storage Keys & Default Data Schemas
  // --------------------------------------------------------------------------
  const STORAGE_KEYS = {
    CHECKLIST: 'hpc_checklist_items',
    ISSUES: 'hpc_issues_list',
    REMINDERS: 'hpc_reminders_list',
    HISTORY: 'hpc_history_records',
    SAFETY_DISMISSED: 'hpc_safety_banner_dismissed'
  };

  const DEFAULT_CHECKLIST_ITEMS = [
    { id: 'chk_1', text: 'Inspect faucets for leaks', category: 'Bathroom & Kitchen', completed: false },
    { id: 'chk_2', text: 'Check visible pipes for moisture', category: 'General', completed: false },
    { id: 'chk_3', text: 'Inspect under kitchen and bathroom sinks', category: 'Sinks & Vanities', completed: false },
    { id: 'chk_4', text: 'Check toilet flushing and visible leaks', category: 'Toilets', completed: false },
    { id: 'chk_5', text: 'Inspect water heater exterior for visible signs of leakage', category: 'Basement / Utility', completed: false },
    { id: 'chk_6', text: 'Check drains for slow drainage', category: 'Drains', completed: false },
    { id: 'chk_7', text: 'Inspect outdoor hose connections', category: 'Outdoor', completed: false }
  ];

  // Helper function to generate today's date formatted as YYYY-MM-DD
  function getTodayString(daysOffset = 0) {
    const d = new Date();
    if (daysOffset !== 0) {
      d.setDate(d.getDate() + daysOffset);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const DEFAULT_SAMPLE_ISSUES = [
    {
      id: 'iss_101',
      title: 'Slow drip on powder room faucet cold handle',
      type: 'Faucet Drip',
      location: 'Guest Half-Bath',
      date: getTodayString(-3),
      severity: 'Low',
      status: 'Pending',
      notes: 'Approximately 1 drop every 15 seconds when faucet is off. Valve seat or cartridge likely needs washer replacement.'
    },
    {
      id: 'iss_102',
      title: 'Kitchen sink drain empties sluggishly',
      type: 'Slow Drain',
      location: 'Kitchen',
      date: getTodayString(-7),
      severity: 'Medium',
      status: 'In Progress',
      notes: 'Cleared hair snare; organic grease buildup further down trap. Using hot water and plunger.'
    }
  ];

  const DEFAULT_SAMPLE_REMINDERS = [
    {
      id: 'rem_201',
      title: 'Flush sediment from water heater tank',
      dueDate: getTodayString(14),
      frequency: 'Annual',
      priority: 'Normal',
      completed: false,
      notes: 'Connect hose to lower tank drain valve. Turn off power/gas first.'
    },
    {
      id: 'rem_202',
      title: 'Inspect washing machine stainless-braided hoses',
      dueDate: getTodayString(-2), // overdue example
      frequency: 'Seasonal',
      priority: 'High',
      completed: false,
      notes: 'Check for bulges, cracked rubber gaskets, or rust on brass fittings.'
    }
  ];

  const DEFAULT_SAMPLE_HISTORY = [
    {
      id: 'hist_301',
      date: getTodayString(-45),
      title: 'Replaced cracked toilet flapper & fill valve',
      category: 'Leak Repair',
      location: 'Master Bathroom',
      notes: 'Toilet was constantly running and ghost-flushing. Installed new universal rubber flapper. Silent operation restored.'
    },
    {
      id: 'hist_302',
      date: getTodayString(-90),
      title: 'Annual Seasonal Plumbing Inspection Completed',
      category: 'Inspection',
      location: 'Whole Home',
      notes: 'Inspected 100% of routine check points. All main shut-off valves turned freely.'
    }
  ];

  // --------------------------------------------------------------------------
  // Application State
  // --------------------------------------------------------------------------
  const appState = {
    checklist: [],
    issues: [],
    reminders: [],
    history: [],
    activeTab: 'dashboard',
    checklistFilter: 'all',
    issuesFilterStatus: 'all',
    issuesFilterSeverity: 'all',
    issuesSearch: '',
    remindersFilterStatus: 'all',
    remindersSearch: '',
    historyFilterCategory: 'all',
    historySearch: ''
  };

  // Temporary container for confirmation modal action callback
  let pendingConfirmAction = null;

  // --------------------------------------------------------------------------
  // LocalStorage Helper Functions
  // --------------------------------------------------------------------------
  function loadDataFromStorage() {
    try {
      const storedChecklist = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
      appState.checklist = storedChecklist ? JSON.parse(storedChecklist) : [...DEFAULT_CHECKLIST_ITEMS];

      const storedIssues = localStorage.getItem(STORAGE_KEYS.ISSUES);
      appState.issues = storedIssues ? JSON.parse(storedIssues) : [...DEFAULT_SAMPLE_ISSUES];

      const storedReminders = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      appState.reminders = storedReminders ? JSON.parse(storedReminders) : [...DEFAULT_SAMPLE_REMINDERS];

      const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      appState.history = storedHistory ? JSON.parse(storedHistory) : [...DEFAULT_SAMPLE_HISTORY];
    } catch (e) {
      console.error('Failed to parse data from localStorage. Restoring sensible defaults.', e);
      appState.checklist = [...DEFAULT_CHECKLIST_ITEMS];
      appState.issues = [...DEFAULT_SAMPLE_ISSUES];
      appState.reminders = [...DEFAULT_SAMPLE_REMINDERS];
      appState.history = [...DEFAULT_SAMPLE_HISTORY];
    }
  }

  function saveChecklist() {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(appState.checklist));
    updateDashboardMetrics();
  }

  function saveIssues() {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(appState.issues));
    updateDashboardMetrics();
  }

  function saveReminders() {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(appState.reminders));
    updateDashboardMetrics();
  }

  function saveHistory() {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(appState.history));
    updateDashboardMetrics();
  }

  // --------------------------------------------------------------------------
  // Toast Notification System
  // --------------------------------------------------------------------------
  function showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');

    toast.innerHTML = `
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        toast.style.transition = 'all 200ms ease';
        setTimeout(() => toast.remove(), 200);
      }
    }, duration);
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function generateUniqueId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  // --------------------------------------------------------------------------
  // Tab Navigation Handling
  // --------------------------------------------------------------------------
  function initNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = tab.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    // Metric cards on dashboard act as shortcuts
    const metricChecklistCard = document.getElementById('metricChecklistCard');
    if (metricChecklistCard) metricChecklistCard.addEventListener('click', () => switchTab('checklist'));

    const metricIssuesCard = document.getElementById('metricIssuesCard');
    if (metricIssuesCard) metricIssuesCard.addEventListener('click', () => switchTab('issues'));

    const metricRemindersCard = document.getElementById('metricRemindersCard');
    if (metricRemindersCard) metricRemindersCard.addEventListener('click', () => switchTab('reminders'));

    const metricHistoryCard = document.getElementById('metricHistoryCard');
    if (metricHistoryCard) metricHistoryCard.addEventListener('click', () => switchTab('history'));

    const dashGoToChecklistBtn = document.getElementById('dashGoToChecklistBtn');
    if (dashGoToChecklistBtn) dashGoToChecklistBtn.addEventListener('click', () => switchTab('checklist'));

    // Footer links
    document.querySelectorAll('[data-switch-tab]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = el.getAttribute('data-switch-tab');
        switchTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function switchTab(tabName) {
    appState.activeTab = tabName;

    // Update nav tab UI
    document.querySelectorAll('.nav-tab').forEach(tab => {
      const isTarget = tab.getAttribute('data-tab') === tabName;
      tab.classList.toggle('active', isTarget);
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    // Update Views
    document.querySelectorAll('.tab-view').forEach(view => {
      const isTarget = view.id === `view-${tabName}`;
      view.classList.toggle('active', isTarget);
      if (isTarget) {
        view.removeAttribute('hidden');
      } else {
        view.setAttribute('hidden', 'true');
      }
    });

    // Re-render specific views upon entry
    if (tabName === 'dashboard') updateDashboardMetrics();
    if (tabName === 'checklist') renderChecklist();
    if (tabName === 'issues') renderIssues();
    if (tabName === 'reminders') renderReminders();
    if (tabName === 'history') renderHistory();
  }

  // --------------------------------------------------------------------------
  // Dashboard Metrics & Overview
  // --------------------------------------------------------------------------
  function updateDashboardMetrics() {
    // 1. Checklist progress
    const totalChecks = appState.checklist.length;
    const completedChecks = appState.checklist.filter(item => item.completed).length;
    const checkPct = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

    const dashChecklistScore = document.getElementById('dashChecklistScore');
    if (dashChecklistScore) dashChecklistScore.textContent = `${checkPct}%`;

    const dashChecklistCompletedPill = document.getElementById('dashChecklistCompletedPill');
    if (dashChecklistCompletedPill) {
      dashChecklistCompletedPill.textContent = `${completedChecks} / ${totalChecks} Done`;
      dashChecklistCompletedPill.className = `metric-pill ${checkPct === 100 ? 'success' : 'warning'}`;
    }

    const dashChecklistProgressBar = document.getElementById('dashChecklistProgressBar');
    if (dashChecklistProgressBar) dashChecklistProgressBar.style.width = `${checkPct}%`;

    const dashChecklistCaption = document.getElementById('dashChecklistCaption');
    if (dashChecklistCaption) {
      const remaining = totalChecks - completedChecks;
      dashChecklistCaption.textContent = remaining === 0 
        ? 'All routine inspection points verified!' 
        : `${remaining} inspection checks remaining`;
    }

    const checklistProgressBadge = document.getElementById('checklistProgressBadge');
    if (checklistProgressBadge) checklistProgressBadge.textContent = `${completedChecks}/${totalChecks}`;

    // 2. Issues counts
    const activeIssues = appState.issues.filter(i => i.status !== 'Resolved');
    const pendingIssues = appState.issues.filter(i => i.status === 'Pending');
    const inProgressIssues = appState.issues.filter(i => i.status === 'In Progress');
    const resolvedIssues = appState.issues.filter(i => i.status === 'Resolved');

    const dashActiveIssuesCount = document.getElementById('dashActiveIssuesCount');
    if (dashActiveIssuesCount) dashActiveIssuesCount.textContent = activeIssues.length;

    const dashPendingBadge = document.getElementById('dashPendingBadge');
    if (dashPendingBadge) dashPendingBadge.textContent = `${pendingIssues.length} Pending`;

    const dashInProgressCount = document.getElementById('dashInProgressCount');
    if (dashInProgressCount) dashInProgressCount.textContent = `${inProgressIssues.length} In Progress`;

    const dashResolvedCount = document.getElementById('dashResolvedCount');
    if (dashResolvedCount) dashResolvedCount.textContent = `${resolvedIssues.length} Resolved`;

    const activeIssuesBadge = document.getElementById('activeIssuesBadge');
    if (activeIssuesBadge) activeIssuesBadge.textContent = activeIssues.length;

    // 3. Reminders counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let upcomingCount = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;

    appState.reminders.forEach(rem => {
      if (!rem.completed) {
        upcomingCount++;
        const dueDate = new Date(rem.dueDate + 'T00:00:00');
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          overdueCount++;
        } else if (diffDays <= 7) {
          dueSoonCount++;
        }
      }
    });

    const dashUpcomingRemindersCount = document.getElementById('dashUpcomingRemindersCount');
    if (dashUpcomingRemindersCount) dashUpcomingRemindersCount.textContent = upcomingCount;

    const dashOverdueBadge = document.getElementById('dashOverdueBadge');
    if (dashOverdueBadge) {
      dashOverdueBadge.textContent = `${overdueCount} Overdue`;
      dashOverdueBadge.className = `metric-pill ${overdueCount > 0 ? 'alert' : 'success'}`;
    }

    const dashDueSoonCount = document.getElementById('dashDueSoonCount');
    if (dashDueSoonCount) dashDueSoonCount.textContent = `${dueSoonCount} Due in next 7 days`;

    const remindersBadge = document.getElementById('remindersBadge');
    if (remindersBadge) remindersBadge.textContent = overdueCount > 0 ? overdueCount : upcomingCount;

    // 4. Lifetime History
    const dashLifetimeRepairsCount = document.getElementById('dashLifetimeRepairsCount');
    if (dashLifetimeRepairsCount) dashLifetimeRepairsCount.textContent = appState.history.length;

    const dashLastResolvedDate = document.getElementById('dashLastResolvedDate');
    if (dashLastResolvedDate) {
      if (appState.history.length > 0) {
        const sortedHistory = [...appState.history].sort((a, b) => new Date(b.date) - new Date(a.date));
        dashLastResolvedDate.textContent = `Latest log: ${sortedHistory[0].date}`;
      } else {
        dashLastResolvedDate.textContent = 'No records logged yet';
      }
    }

    // Render Urgent Alerts in Dashboard
    renderDashboardAlerts();

    // Render Quick Checklist in Dashboard
    renderDashboardQuickChecklist();
  }

  function renderDashboardAlerts() {
    const alertsContainer = document.getElementById('dashboardAlertsList');
    if (!alertsContainer) return;

    const alerts = [];

    // Check emergency or high severity active issues
    appState.issues
      .filter(i => i.status !== 'Resolved' && (i.severity === 'Emergency' || i.severity === 'High'))
      .forEach(i => {
        alerts.push({
          type: 'issue',
          title: `[${i.severity.toUpperCase()}] ${i.title}`,
          subtitle: `Location: ${i.location || 'Unspecified'} • Detected: ${i.date}`,
          isEmergency: i.severity === 'Emergency',
          targetTab: 'issues'
        });
      });

    // Check overdue reminders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    appState.reminders
      .filter(r => !r.completed)
      .forEach(r => {
        const dueDate = new Date(r.dueDate + 'T00:00:00');
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          alerts.push({
            type: 'reminder',
            title: `Overdue Task: ${r.title}`,
            subtitle: `Was due on ${r.dueDate} (${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ago)`,
            isEmergency: false,
            targetTab: 'reminders'
          });
        }
      });

    if (alerts.length === 0) {
      alertsContainer.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem 1rem; margin: 0;">
          <svg class="empty-state-icon" style="width: 32px; height: 32px; color: var(--color-success);" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <h4 style="font-size: 0.95rem; margin-bottom: 2px;">No Urgent Plumbing Issues</h4>
          <p style="font-size: 0.8rem; margin: 0;">All scheduled tasks and high-priority leak repairs are up to date.</p>
        </div>
      `;
      return;
    }

    alertsContainer.innerHTML = alerts.map(a => `
      <div class="alert-item-card ${a.isEmergency ? '' : 'warning-item'}">
        <div class="alert-item-info">
          <h5>${escapeHtml(a.title)}</h5>
          <p>${escapeHtml(a.subtitle)}</p>
        </div>
        <button class="btn btn-outline btn-xs alert-action-btn" data-target="${a.targetTab}">
          Review &rarr;
        </button>
      </div>
    `).join('');

    alertsContainer.querySelectorAll('.alert-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        switchTab(target);
      });
    });
  }

  function renderDashboardQuickChecklist() {
    const listEl = document.getElementById('dashQuickChecklist');
    if (!listEl) return;

    if (appState.checklist.length === 0) {
      listEl.innerHTML = '<li class="text-muted text-sm">No checklist items configured.</li>';
      return;
    }

    // Display first 4 items for quick check
    const itemsToShow = appState.checklist.slice(0, 5);

    listEl.innerHTML = itemsToShow.map(item => `
      <li class="quick-check-item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
        <span class="custom-checkbox ${item.completed ? 'checked' : ''}" style="width: 16px; height: 16px;">
          <svg viewBox="0 0 20 20" fill="currentColor" style="display: ${item.completed ? 'block' : 'none'}; width: 12px; height: 12px;">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </span>
        <span style="flex: 1;">${escapeHtml(item.text)}</span>
      </li>
    `).join('');

    listEl.querySelectorAll('.quick-check-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        toggleChecklistItem(id);
      });
    });
  }

  // --------------------------------------------------------------------------
  // Checklist Implementation
  // --------------------------------------------------------------------------
  function initChecklistListeners() {
    // Filter pills
    document.querySelectorAll('.checklist-filter-pills .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.checklist-filter-pills .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        appState.checklistFilter = pill.getAttribute('data-filter');
        renderChecklist();
      });
    });

    // Reset default checklist
    const resetBtn = document.getElementById('resetChecklistBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        openConfirmModal(
          'Reset Checklist to Default?',
          'This will reset your checklist back to the 7 standard homeowner inspection checks. Custom checklist items will be removed.',
          () => {
            appState.checklist = JSON.parse(JSON.stringify(DEFAULT_CHECKLIST_ITEMS));
            saveChecklist();
            renderChecklist();
            showToast('Checklist restored to standard 7 items.', 'success');
          }
        );
      });
    }

    // Add new custom check modal triggers
    const addChecklistBtn = document.getElementById('addNewChecklistBtn');
    if (addChecklistBtn) {
      addChecklistBtn.addEventListener('click', () => {
        openChecklistModal();
      });
    }

    // Log Completed Inspection
    const logBtn = document.getElementById('logCompletedInspectionBtn');
    if (logBtn) {
      logBtn.addEventListener('click', () => {
        const total = appState.checklist.length;
        const completed = appState.checklist.filter(i => i.completed).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        const newRecord = {
          id: generateUniqueId('hist'),
          date: getTodayString(),
          title: `Home Inspection Checklist Log (${completed}/${total} checks completed)`,
          category: 'Inspection',
          location: 'Whole Home',
          notes: `Visual inspection score: ${pct}%. Verified faucets, visible pipes, toilets, and water heater.`
        };

        appState.history.unshift(newRecord);
        saveHistory();
        renderHistory();
        showToast(`Inspection logged to history! (${pct}% completed)`, 'success');
      });
    }
  }

  function renderChecklist() {
    const container = document.getElementById('mainChecklistContainer');
    if (!container) return;

    const total = appState.checklist.length;
    const completed = appState.checklist.filter(i => i.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const progressText = document.getElementById('checklistProgressText');
    if (progressText) {
      progressText.textContent = `${completed} of ${total} items completed (${pct}%)`;
    }

    const progressBar = document.getElementById('mainChecklistProgressBar');
    if (progressBar) {
      progressBar.style.width = `${pct}%`;
    }

    let filtered = appState.checklist;
    if (appState.checklistFilter === 'pending') {
      filtered = appState.checklist.filter(i => !i.completed);
    } else if (appState.checklistFilter === 'completed') {
      filtered = appState.checklist.filter(i => i.completed);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          <h4>No Checklist Items Found</h4>
          <p>No checks match your current filter. You can switch filters or add a new custom check.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => `
      <li class="checklist-item ${item.completed ? 'checked' : ''}" data-id="${item.id}">
        <div class="checklist-item-left">
          <div class="custom-checkbox" role="checkbox" aria-checked="${item.completed}" tabindex="0" title="Mark complete">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div>
            <span class="checklist-item-title">${escapeHtml(item.text)}</span>
            ${item.category ? `<span class="checklist-item-tag">${escapeHtml(item.category)}</span>` : ''}
          </div>
        </div>
        <div class="checklist-item-actions">
          <button class="action-icon-btn edit-check-btn" data-id="${item.id}" title="Edit check title" aria-label="Edit check title">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
          </button>
          <button class="action-icon-btn delete delete-check-btn" data-id="${item.id}" title="Remove checklist item" aria-label="Remove checklist item">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </li>
    `).join('');

    // Attach event listeners to items
    container.querySelectorAll('.checklist-item-left').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.closest('.checklist-item').getAttribute('data-id');
        toggleChecklistItem(id);
      });
    });

    container.querySelectorAll('.edit-check-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = appState.checklist.find(i => i.id === id);
        if (item) {
          const newText = prompt('Edit checklist task description:', item.text);
          if (newText && newText.trim() !== '') {
            item.text = newText.trim();
            saveChecklist();
            renderChecklist();
            showToast('Checklist item updated.', 'success');
          }
        }
      });
    });

    container.querySelectorAll('.delete-check-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        openConfirmModal('Delete Checklist Item?', 'Are you sure you want to remove this item from your checklist?', () => {
          appState.checklist = appState.checklist.filter(i => i.id !== id);
          saveChecklist();
          renderChecklist();
          showToast('Checklist item deleted.', 'warning');
        });
      });
    });
  }

  function toggleChecklistItem(id) {
    const item = appState.checklist.find(i => i.id === id);
    if (!item) return;

    item.completed = !item.completed;
    saveChecklist();
    renderChecklist();
    updateDashboardMetrics();

    if (item.completed) {
      showToast(`Completed: "${item.text}"`, 'success', 2500);
    }
  }

  function openChecklistModal() {
    const modal = document.getElementById('checklistModal');
    const form = document.getElementById('checklistForm');
    const input = document.getElementById('checkItemText');
    if (!modal || !form || !input) return;

    form.reset();
    input.classList.remove('is-invalid');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    input.focus();
  }

  function closeChecklistModal() {
    const modal = document.getElementById('checklistModal');
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // --------------------------------------------------------------------------
  // Leak & Plumbing Issue Tracker Implementation
  // --------------------------------------------------------------------------
  function initIssuesListeners() {
    // Open Add Modal Buttons
    const openBtn = document.getElementById('openAddIssueModalBtn');
    if (openBtn) openBtn.addEventListener('click', () => openIssueModal());

    const quickAddBtn = document.getElementById('quickAddIssueBtn');
    if (quickAddBtn) quickAddBtn.addEventListener('click', () => openIssueModal());

    const dashAddBtn = document.getElementById('dashAddIssueBtn');
    if (dashAddBtn) dashAddBtn.addEventListener('click', () => openIssueModal());

    // Search and Filters
    const searchInput = document.getElementById('issuesSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        appState.issuesSearch = e.target.value.toLowerCase().trim();
        renderIssues();
      });
    }

    const statusFilter = document.getElementById('issuesStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        appState.issuesFilterStatus = e.target.value;
        renderIssues();
      });
    }

    const severityFilter = document.getElementById('issuesSeverityFilter');
    if (severityFilter) {
      severityFilter.addEventListener('change', (e) => {
        appState.issuesFilterSeverity = e.target.value;
        renderIssues();
      });
    }

    // Modal Close and Submit
    const closeBtn = document.getElementById('closeIssueModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeIssueModal);

    const cancelBtn = document.getElementById('cancelIssueModalBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeIssueModal);

    const form = document.getElementById('issueForm');
    if (form) {
      form.addEventListener('submit', handleIssueFormSubmit);
    }
  }

  function openIssueModal(issueToEdit = null) {
    const modal = document.getElementById('issueModal');
    const form = document.getElementById('issueForm');
    const modalTitle = document.getElementById('issueModalTitle');
    if (!modal || !form) return;

    form.reset();
    document.querySelectorAll('#issueForm .form-control').forEach(el => el.classList.remove('is-invalid'));

    if (issueToEdit) {
      modalTitle.textContent = 'Edit Plumbing Issue';
      document.getElementById('issueId').value = issueToEdit.id;
      document.getElementById('issueTitle').value = issueToEdit.title;
      document.getElementById('issueType').value = issueToEdit.type || 'Faucet Drip';
      document.getElementById('issueLocation').value = issueToEdit.location || '';
      document.getElementById('issueDate').value = issueToEdit.date || getTodayString();
      document.getElementById('issueSeverity').value = issueToEdit.severity || 'Medium';
      document.getElementById('issueStatus').value = issueToEdit.status || 'Pending';
      document.getElementById('issueNotes').value = issueToEdit.notes || '';
    } else {
      modalTitle.textContent = 'Record Plumbing Issue';
      document.getElementById('issueId').value = '';
      document.getElementById('issueDate').value = getTodayString();
      document.getElementById('issueSeverity').value = 'Medium';
      document.getElementById('issueStatus').value = 'Pending';
    }

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('issueTitle').focus();
  }

  function closeIssueModal() {
    const modal = document.getElementById('issueModal');
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function handleIssueFormSubmit(e) {
    e.preventDefault();

    const titleInput = document.getElementById('issueTitle');
    const dateInput = document.getElementById('issueDate');

    let isValid = true;
    if (!titleInput.value.trim()) {
      titleInput.classList.add('is-invalid');
      isValid = false;
    } else {
      titleInput.classList.remove('is-invalid');
    }

    if (!dateInput.value) {
      dateInput.classList.add('is-invalid');
      isValid = false;
    } else {
      dateInput.classList.remove('is-invalid');
    }

    if (!isValid) return;

    const issueId = document.getElementById('issueId').value;
    const isNew = !issueId;

    const issueData = {
      id: issueId || generateUniqueId('iss'),
      title: titleInput.value.trim(),
      type: document.getElementById('issueType').value,
      location: document.getElementById('issueLocation').value.trim() || 'Unspecified Location',
      date: dateInput.value,
      severity: document.getElementById('issueSeverity').value,
      status: document.getElementById('issueStatus').value,
      notes: document.getElementById('issueNotes').value.trim()
    };

    if (isNew) {
      appState.issues.unshift(issueData);
      showToast('Plumbing issue recorded successfully.', 'success');
    } else {
      const idx = appState.issues.findIndex(i => i.id === issueId);
      if (idx !== -1) {
        const oldStatus = appState.issues[idx].status;
        appState.issues[idx] = issueData;

        // If status transitioned to Resolved, log into history
        if (oldStatus !== 'Resolved' && issueData.status === 'Resolved') {
          logIssueToHistory(issueData);
        }
      }
      showToast('Plumbing issue updated.', 'success');
    }

    saveIssues();
    closeIssueModal();
    renderIssues();
  }

  function logIssueToHistory(issue) {
    const histEntry = {
      id: generateUniqueId('hist'),
      date: getTodayString(),
      title: `Resolved: ${issue.title}`,
      category: 'Leak Repair',
      location: issue.location,
      notes: issue.notes ? `Issue resolved. Diagnostic notes: ${issue.notes}` : 'Issue resolved and verified leak-free.'
    };
    appState.history.unshift(histEntry);
    saveHistory();
    renderHistory();
  }

  function renderIssues() {
    const container = document.getElementById('issuesListContainer');
    if (!container) return;

    let filtered = appState.issues;

    // Filter by status
    if (appState.issuesFilterStatus !== 'all') {
      filtered = filtered.filter(i => i.status === appState.issuesFilterStatus);
    }

    // Filter by severity
    if (appState.issuesFilterSeverity !== 'all') {
      filtered = filtered.filter(i => i.severity === appState.issuesFilterSeverity);
    }

    // Filter by search query
    if (appState.issuesSearch) {
      filtered = filtered.filter(i => 
        i.title.toLowerCase().includes(appState.issuesSearch) ||
        (i.location && i.location.toLowerCase().includes(appState.issuesSearch)) ||
        (i.notes && i.notes.toLowerCase().includes(appState.issuesSearch)) ||
        (i.type && i.type.toLowerCase().includes(appState.issuesSearch))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg class="empty-state-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <h4>No Plumbing Issues Found</h4>
          <p>No issues match your current filters. Click "Record New Issue" to track a problem.</p>
          <button class="btn btn-primary btn-sm" id="emptyAddIssueBtn">Record Issue</button>
        </div>
      `;
      const btn = document.getElementById('emptyAddIssueBtn');
      if (btn) btn.addEventListener('click', () => openIssueModal());
      return;
    }

    container.innerHTML = filtered.map(issue => {
      let statusClass = 'pending';
      if (issue.status === 'In Progress') statusClass = 'in-progress';
      if (issue.status === 'Resolved') statusClass = 'resolved';

      return `
        <div class="issue-card severity-${escapeHtml(issue.severity || 'Medium')}" data-id="${issue.id}">
          <div class="issue-card-header">
            <h3 class="issue-card-title">${escapeHtml(issue.title)}</h3>
            <span class="badge-status ${statusClass}">${escapeHtml(issue.status)}</span>
          </div>
          
          <div class="issue-card-meta">
            <span class="badge-tag">${escapeHtml(issue.type || 'General')}</span>
            <span class="badge-tag">&#128205; ${escapeHtml(issue.location || 'House')}</span>
            <span class="badge-tag">Severity: ${escapeHtml(issue.severity)}</span>
          </div>

          ${issue.notes ? `<div class="issue-card-notes">${escapeHtml(issue.notes)}</div>` : ''}

          <div class="issue-card-footer">
            <span class="issue-date-label">Detected: ${escapeHtml(issue.date)}</span>
            <div class="issue-actions">
              ${issue.status !== 'Resolved' ? `
                <button class="btn btn-secondary btn-xs resolve-issue-btn" data-id="${issue.id}" title="Mark as Resolved">
                  &check; Resolve
                </button>
              ` : ''}
              <button class="action-icon-btn edit-issue-btn" data-id="${issue.id}" title="Edit issue details">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
              </button>
              <button class="action-icon-btn delete delete-issue-btn" data-id="${issue.id}" title="Delete record">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Event Listeners to cards
    container.querySelectorAll('.resolve-issue-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const issue = appState.issues.find(i => i.id === id);
        if (issue) {
          issue.status = 'Resolved';
          logIssueToHistory(issue);
          saveIssues();
          renderIssues();
          showToast(`Issue "${issue.title}" marked as Resolved and saved to history!`, 'success');
        }
      });
    });

    container.querySelectorAll('.edit-issue-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const issue = appState.issues.find(i => i.id === id);
        if (issue) openIssueModal(issue);
      });
    });

    container.querySelectorAll('.delete-issue-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openConfirmModal('Delete Plumbing Issue?', 'Are you sure you want to permanently delete this issue record?', () => {
          appState.issues = appState.issues.filter(i => i.id !== id);
          saveIssues();
          renderIssues();
          showToast('Plumbing issue removed.', 'warning');
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // Maintenance Reminder Planner Implementation
  // --------------------------------------------------------------------------
  function initRemindersListeners() {
    const openBtn = document.getElementById('openAddReminderModalBtn');
    if (openBtn) openBtn.addEventListener('click', () => openReminderModal());

    const dashBtn = document.getElementById('dashAddReminderBtn');
    if (dashBtn) dashBtn.addEventListener('click', () => openReminderModal());

    const closeBtn = document.getElementById('closeReminderModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeReminderModal);

    const cancelBtn = document.getElementById('cancelReminderModalBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeReminderModal);

    const form = document.getElementById('reminderForm');
    if (form) form.addEventListener('submit', handleReminderFormSubmit);

    const searchInput = document.getElementById('remindersSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        appState.remindersSearch = e.target.value.toLowerCase().trim();
        renderReminders();
      });
    }

    const filterSelect = document.getElementById('remindersStatusFilter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        appState.remindersFilterStatus = e.target.value;
        renderReminders();
      });
    }
  }

  function openReminderModal(reminderToEdit = null) {
    const modal = document.getElementById('reminderModal');
    const form = document.getElementById('reminderForm');
    const modalTitle = document.getElementById('reminderModalTitle');
    if (!modal || !form) return;

    form.reset();
    document.querySelectorAll('#reminderForm .form-control').forEach(el => el.classList.remove('is-invalid'));

    if (reminderToEdit) {
      modalTitle.textContent = 'Edit Maintenance Task';
      document.getElementById('reminderId').value = reminderToEdit.id;
      document.getElementById('reminderTitle').value = reminderToEdit.title;
      document.getElementById('reminderDueDate').value = reminderToEdit.dueDate;
      document.getElementById('reminderFrequency').value = reminderToEdit.frequency || 'Seasonal';
      document.getElementById('reminderPriority').value = reminderToEdit.priority || 'Normal';
      document.getElementById('reminderNotes').value = reminderToEdit.notes || '';
    } else {
      modalTitle.textContent = 'Schedule Maintenance Task';
      document.getElementById('reminderId').value = '';
      document.getElementById('reminderDueDate').value = getTodayString(14);
      document.getElementById('reminderFrequency').value = 'Seasonal';
      document.getElementById('reminderPriority').value = 'Normal';
    }

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('reminderTitle').focus();
  }

  function closeReminderModal() {
    const modal = document.getElementById('reminderModal');
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function handleReminderFormSubmit(e) {
    e.preventDefault();

    const titleInput = document.getElementById('reminderTitle');
    const dateInput = document.getElementById('reminderDueDate');

    let isValid = true;
    if (!titleInput.value.trim()) {
      titleInput.classList.add('is-invalid');
      isValid = false;
    } else {
      titleInput.classList.remove('is-invalid');
    }

    if (!dateInput.value) {
      dateInput.classList.add('is-invalid');
      isValid = false;
    } else {
      dateInput.classList.remove('is-invalid');
    }

    if (!isValid) return;

    const reminderId = document.getElementById('reminderId').value;
    const isNew = !reminderId;

    const reminderData = {
      id: reminderId || generateUniqueId('rem'),
      title: titleInput.value.trim(),
      dueDate: dateInput.value,
      frequency: document.getElementById('reminderFrequency').value,
      priority: document.getElementById('reminderPriority').value,
      notes: document.getElementById('reminderNotes').value.trim(),
      completed: isNew ? false : (appState.reminders.find(r => r.id === reminderId)?.completed || false)
    };

    if (isNew) {
      appState.reminders.push(reminderData);
      showToast('Maintenance task scheduled.', 'success');
    } else {
      const idx = appState.reminders.findIndex(r => r.id === reminderId);
      if (idx !== -1) {
        appState.reminders[idx] = reminderData;
      }
      showToast('Maintenance task updated.', 'success');
    }

    saveReminders();
    closeReminderModal();
    renderReminders();
  }

  function renderReminders() {
    const container = document.getElementById('remindersListContainer');
    if (!container) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = [...appState.reminders];

    // Filter status
    if (appState.remindersFilterStatus === 'upcoming') {
      filtered = filtered.filter(r => !r.completed);
    } else if (appState.remindersFilterStatus === 'overdue') {
      filtered = filtered.filter(r => {
        if (r.completed) return false;
        const due = new Date(r.dueDate + 'T00:00:00');
        return due < today;
      });
    } else if (appState.remindersFilterStatus === 'completed') {
      filtered = filtered.filter(r => r.completed);
    }

    // Filter search
    if (appState.remindersSearch) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(appState.remindersSearch) ||
        (r.notes && r.notes.toLowerCase().includes(appState.remindersSearch))
      );
    }

    // Sort by due date ascending
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
          <h4>No Maintenance Reminders Found</h4>
          <p>No reminders match your criteria. Stay proactive by scheduling your seasonal checks.</p>
          <button class="btn btn-primary btn-sm" id="emptyAddReminderBtn">Schedule Task</button>
        </div>
      `;
      const btn = document.getElementById('emptyAddReminderBtn');
      if (btn) btn.addEventListener('click', () => openReminderModal());
      return;
    }

    container.innerHTML = filtered.map(rem => {
      const dueDate = new Date(rem.dueDate + 'T00:00:00');
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      let cardClass = '';
      let pillText = `Due ${rem.dueDate}`;
      let pillClass = 'normal';

      if (rem.completed) {
        cardClass = 'completed';
        pillText = 'Completed';
        pillClass = 'normal';
      } else if (diffDays < 0) {
        cardClass = 'overdue';
        pillText = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
        pillClass = 'overdue';
      } else if (diffDays === 0) {
        cardClass = 'due-today';
        pillText = 'Due Today';
        pillClass = 'today';
      } else if (diffDays <= 7) {
        pillText = `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
        pillClass = 'today';
      }

      return `
        <div class="reminder-card ${cardClass}" data-id="${rem.id}">
          <div class="reminder-left-col">
            <button class="reminder-check-btn toggle-reminder-btn" data-id="${rem.id}" title="${rem.completed ? 'Mark pending' : 'Mark completed'}" aria-label="Toggle task status">
              ${rem.completed ? '&check;' : ''}
            </button>
            <div class="reminder-info">
              <h4>${escapeHtml(rem.title)}</h4>
              <div class="reminder-meta">
                <span class="due-pill ${pillClass}">${escapeHtml(pillText)}</span>
                <span>Frequency: ${escapeHtml(rem.frequency || 'One-time')}</span>
                ${rem.priority !== 'Normal' ? `<span>Priority: <strong>${escapeHtml(rem.priority)}</strong></span>` : ''}
              </div>
              ${rem.notes ? `<div style="font-size: 0.8rem; color: var(--color-navy-700); margin-top: 0.35rem;">${escapeHtml(rem.notes)}</div>` : ''}
            </div>
          </div>
          <div class="reminder-right-actions">
            <button class="action-icon-btn edit-reminder-btn" data-id="${rem.id}" title="Edit reminder">
              <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
            </button>
            <button class="action-icon-btn delete delete-reminder-btn" data-id="${rem.id}" title="Delete reminder">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach reminder action listeners
    container.querySelectorAll('.toggle-reminder-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const rem = appState.reminders.find(r => r.id === id);
        if (rem) {
          rem.completed = !rem.completed;
          saveReminders();
          renderReminders();

          if (rem.completed) {
            // Automatically log to history
            const histEntry = {
              id: generateUniqueId('hist'),
              date: getTodayString(),
              title: `Completed Task: ${rem.title}`,
              category: 'Maintenance',
              location: 'Whole Home',
              notes: rem.notes ? `Task completed. Notes: ${rem.notes}` : 'Scheduled maintenance completed.'
            };
            appState.history.unshift(histEntry);
            saveHistory();
            renderHistory();
            showToast(`Task "${rem.title}" marked completed and logged to history!`, 'success');
          } else {
            showToast(`Task marked as pending.`, 'info');
          }
        }
      });
    });

    container.querySelectorAll('.edit-reminder-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const rem = appState.reminders.find(r => r.id === id);
        if (rem) openReminderModal(rem);
      });
    });

    container.querySelectorAll('.delete-reminder-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openConfirmModal('Delete Maintenance Task?', 'Are you sure you want to delete this scheduled task?', () => {
          appState.reminders = appState.reminders.filter(r => r.id !== id);
          saveReminders();
          renderReminders();
          showToast('Maintenance task deleted.', 'warning');
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // Repair History & Logbook Implementation
  // --------------------------------------------------------------------------
  function initHistoryListeners() {
    const printBtn1 = document.getElementById('printHistoryReportBtn');
    if (printBtn1) printBtn1.addEventListener('click', triggerPrintableReport);

    const printBtn2 = document.getElementById('headerPrintBtn');
    if (printBtn2) printBtn2.addEventListener('click', triggerPrintableReport);

    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportDataBackup);

    const clearBtn = document.getElementById('clearAllDataBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        openConfirmModal(
          'Reset Entire Application Data?',
          'WARNING: This will permanently erase all saved leaks, reminders, custom checklist items, and repair history. This action cannot be undone.',
          () => {
            localStorage.clear();
            appState.checklist = JSON.parse(JSON.stringify(DEFAULT_CHECKLIST_ITEMS));
            appState.issues = [];
            appState.reminders = [];
            appState.history = [];
            saveChecklist();
            saveIssues();
            saveReminders();
            saveHistory();
            renderChecklist();
            renderIssues();
            renderReminders();
            renderHistory();
            updateDashboardMetrics();
            showToast('All planner data has been reset.', 'danger');
          }
        );
      });
    }

    const searchInput = document.getElementById('historySearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        appState.historySearch = e.target.value.toLowerCase().trim();
        renderHistory();
      });
    }

    const categoryFilter = document.getElementById('historyCategoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        appState.historyFilterCategory = e.target.value;
        renderHistory();
      });
    }
  }

  function renderHistory() {
    const tableBody = document.getElementById('historyTableBody');
    const totalCountEl = document.getElementById('historyTotalCount');
    if (!tableBody) return;

    let filtered = [...appState.history];

    if (appState.historyFilterCategory !== 'all') {
      filtered = filtered.filter(h => h.category === appState.historyFilterCategory);
    }

    if (appState.historySearch) {
      filtered = filtered.filter(h => 
        h.title.toLowerCase().includes(appState.historySearch) ||
        (h.notes && h.notes.toLowerCase().includes(appState.historySearch)) ||
        (h.location && h.location.toLowerCase().includes(appState.historySearch)) ||
        (h.category && h.category.toLowerCase().includes(appState.historySearch))
      );
    }

    // Sort descending by date
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (totalCountEl) totalCountEl.textContent = filtered.length;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="padding: 2.5rem; text-align: center; color: var(--color-text-muted);">
            No repair or maintenance history records found.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(item => `
      <tr data-id="${item.id}">
        <td style="font-family: var(--font-mono); font-size: 0.8rem; white-space: nowrap;">
          ${escapeHtml(item.date)}
        </td>
        <td>
          <strong>${escapeHtml(item.title)}</strong>
        </td>
        <td>
          <span class="badge-tag">${escapeHtml(item.category || 'General')}</span>
        </td>
        <td style="font-size: 0.825rem; color: var(--color-navy-700);">
          ${escapeHtml(item.location || 'House')}
        </td>
        <td style="font-size: 0.825rem; color: var(--color-navy-700); max-width: 320px;">
          ${escapeHtml(item.notes || '—')}
        </td>
        <td>
          <button class="action-icon-btn delete delete-history-btn" data-id="${item.id}" title="Remove record" aria-label="Delete history entry">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          </button>
        </td>
      </tr>
    `).join('');

    tableBody.querySelectorAll('.delete-history-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openConfirmModal('Delete History Record?', 'Are you sure you want to remove this logbook entry?', () => {
          appState.history = appState.history.filter(h => h.id !== id);
          saveHistory();
          renderHistory();
          showToast('History entry removed.', 'warning');
        });
      });
    });
  }

  function triggerPrintableReport() {
    const printDate = document.getElementById('printReportDate');
    if (printDate) {
      const now = new Date();
      printDate.textContent = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    window.print();
  }

  // --------------------------------------------------------------------------
  // Data Backup & JSON Restore Features
  // --------------------------------------------------------------------------
  function initBackupRestore() {
    const backupBtn = document.getElementById('backupRestoreBtn');
    if (backupBtn) {
      backupBtn.addEventListener('click', () => {
        const modal = document.getElementById('backupModal');
        if (modal) {
          modal.classList.add('show');
          modal.setAttribute('aria-hidden', 'false');
        }
      });
    }

    const closeBtn = document.getElementById('closeBackupModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeBackupModal);

    const closeFooterBtn = document.getElementById('closeBackupModalFooterBtn');
    if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeBackupModal);

    const downloadBtn = document.getElementById('downloadBackupBtn');
    if (downloadBtn) downloadBtn.addEventListener('click', exportDataBackup);

    const triggerImport = document.getElementById('triggerImportBtn');
    const fileInput = document.getElementById('importJsonFileInput');
    if (triggerImport && fileInput) {
      triggerImport.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', handleImportJsonFile);
    }
  }

  function closeBackupModal() {
    const modal = document.getElementById('backupModal');
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function exportDataBackup() {
    const data = {
      app: 'Home Plumbing Care - Leak & Maintenance Planner',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      checklist: appState.checklist,
      issues: appState.issues,
      reminders: appState.reminders,
      history: appState.history
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `home-plumbing-care-backup-${getTodayString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup file downloaded successfully.', 'success');
  }

  function handleImportJsonFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.checklist || imported.issues || imported.history) {
          appState.checklist = Array.isArray(imported.checklist) ? imported.checklist : appState.checklist;
          appState.issues = Array.isArray(imported.issues) ? imported.issues : appState.issues;
          appState.reminders = Array.isArray(imported.reminders) ? imported.reminders : appState.reminders;
          appState.history = Array.isArray(imported.history) ? imported.history : appState.history;

          saveChecklist();
          saveIssues();
          saveReminders();
          saveHistory();

          renderChecklist();
          renderIssues();
          renderReminders();
          renderHistory();
          updateDashboardMetrics();

          closeBackupModal();
          showToast('Data restored successfully from backup!', 'success');
        } else {
          showToast('Invalid backup file format.', 'danger');
        }
      } catch (err) {
        console.error('Import error:', err);
        showToast('Error reading backup file.', 'danger');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // --------------------------------------------------------------------------
  // Confirmation Modal
  // --------------------------------------------------------------------------
  function initConfirmModal() {
    const modal = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('cancelConfirmBtn');
    const closeBtn = document.getElementById('closeConfirmModalBtn');
    const proceedBtn = document.getElementById('proceedConfirmBtn');

    if (cancelBtn) cancelBtn.addEventListener('click', closeConfirmModal);
    if (closeBtn) closeBtn.addEventListener('click', closeConfirmModal);

    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        if (typeof pendingConfirmAction === 'function') {
          pendingConfirmAction();
        }
        closeConfirmModal();
      });
    }
  }

  function openConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmModalTitle');
    const messageEl = document.getElementById('confirmModalMessage');
    if (!modal) return;

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    pendingConfirmAction = onConfirm;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    }
    pendingConfirmAction = null;
  }

  // --------------------------------------------------------------------------
  // Custom Checklist Modal Listener
  // --------------------------------------------------------------------------
  function initChecklistModal() {
    const form = document.getElementById('checklistForm');
    const closeBtn = document.getElementById('closeChecklistModalBtn');
    const cancelBtn = document.getElementById('cancelChecklistModalBtn');

    if (closeBtn) closeBtn.addEventListener('click', closeChecklistModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeChecklistModal);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('checkItemText');
        const catSelect = document.getElementById('checkItemCategory');
        if (!input.value.trim()) {
          input.classList.add('is-invalid');
          return;
        }

        const newItem = {
          id: generateUniqueId('chk'),
          text: input.value.trim(),
          category: catSelect ? catSelect.value : 'General',
          completed: false
        };

        appState.checklist.push(newItem);
        saveChecklist();
        renderChecklist();
        closeChecklistModal();
        showToast('Checklist task added.', 'success');
      });
    }
  }

  // --------------------------------------------------------------------------
  // Safety Banner & General UI Polish
  // --------------------------------------------------------------------------
  function initSafetyBanner() {
    const banner = document.querySelector('.safety-banner');
    const dismissBtn = document.getElementById('dismissSafetyBanner');

    const isDismissed = localStorage.getItem(STORAGE_KEYS.SAFETY_DISMISSED);
    if (isDismissed === 'true' && banner) {
      banner.style.display = 'none';
    }

    if (dismissBtn && banner) {
      dismissBtn.addEventListener('click', () => {
        banner.style.display = 'none';
        localStorage.setItem(STORAGE_KEYS.SAFETY_DISMISSED, 'true');
        showToast('Safety notice dismissed for this session.', 'info');
      });
    }
  }

  function initGlobalShortcutsAndEsc() {
    // ESC key closes all active modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeIssueModal();
        closeReminderModal();
        closeChecklistModal();
        closeBackupModal();
        closeConfirmModal();
      }
    });

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeIssueModal();
          closeReminderModal();
          closeChecklistModal();
          closeBackupModal();
          closeConfirmModal();
        }
      });
    });

    // Copyright year
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Refresh alerts button on dashboard
    const refreshBtn = document.getElementById('refreshAlertsBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        updateDashboardMetrics();
        showToast('Dashboard metrics refreshed.', 'info');
      });
    }
  }

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------
  function initApp() {
    loadDataFromStorage();
    initNavigation();
    initChecklistListeners();
    initChecklistModal();
    initIssuesListeners();
    initRemindersListeners();
    initHistoryListeners();
    initBackupRestore();
    initConfirmModal();
    initSafetyBanner();
    initGlobalShortcutsAndEsc();

    // Initial render
    updateDashboardMetrics();
    renderChecklist();
    renderIssues();
    renderReminders();
    renderHistory();
  }

  // DOM ready check
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
