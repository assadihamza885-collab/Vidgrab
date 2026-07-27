const HistoryManager = (() => {
  const STORAGE_KEY = 'vdp_download_history';

  const getHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const addEntry = (entry) => {
    const history = getHistory();
    const newEntry = {
      id: Date.now(),
      title: entry.title,
      format: entry.format,
      quality: entry.quality,
      timestamp: new Date().toLocaleDateString()
    };
    history.unshift(newEntry);
    if (history.length > 10) history.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    renderHistory();
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  };

  const renderHistory = () => {
    const historyList = document.getElementById('historyList');
    const history = getHistory();

    if (history.length === 0) {
      historyList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No download history available.</p>';
      return;
    }

    historyList.innerHTML = history.map((item) => `
      <div class="history-item animate-fade-in">
        <div class="history-info">
          <span class="history-title">${item.title}</span>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <span class="platform-tag">${item.format.toUpperCase()} (${item.quality})</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${item.timestamp}</span>
        </div>
      </div>
    `).join('');
  };

  return {
    getHistory,
    addEntry,
    clearHistory,
    renderHistory
  };
})();