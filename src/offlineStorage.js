// ═══════════════════════════════════════════════════════════════
// BIC Field Reporter — Offline Storage (IndexedDB)
// Stores data locally when offline, syncs when back online
// ═══════════════════════════════════════════════════════════════

const DB_NAME = 'bic-field-reporter';
const DB_VERSION = 1;

let db = null;

// Initialize IndexedDB
export async function initOfflineStorage() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('IndexedDB initialized');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Store for app state
      if (!database.objectStoreNames.contains('appState')) {
        database.createObjectStore('appState', { keyPath: 'id' });
      }

      // Store for pending sync operations
      if (!database.objectStoreNames.contains('pendingSync')) {
        const syncStore = database.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncStore.createIndex('type', 'type', { unique: false });
      }

      // Store for cached photos (base64)
      if (!database.objectStoreNames.contains('photoCache')) {
        database.createObjectStore('photoCache', { keyPath: 'id' });
      }

      console.log('IndexedDB schema created');
    };
  });
}

// Save app state to IndexedDB
export async function saveAppState(state) {
  if (!db) await initOfflineStorage();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['appState'], 'readwrite');
    const store = transaction.objectStore('appState');

    // Save state with timestamp
    const stateToSave = {
      id: 'currentState',
      data: state,
      savedAt: new Date().toISOString()
    };

    const request = store.put(stateToSave);

    request.onsuccess = () => {
      console.log('State saved to IndexedDB');
      resolve();
    };

    request.onerror = () => {
      console.error('Failed to save state:', request.error);
      reject(request.error);
    };
  });
}

// Load app state from IndexedDB
export async function loadAppState() {
  if (!db) await initOfflineStorage();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['appState'], 'readonly');
    const store = transaction.objectStore('appState');
    const request = store.get('currentState');

    request.onsuccess = () => {
      if (request.result) {
        console.log('State loaded from IndexedDB, saved at:', request.result.savedAt);
        resolve(request.result.data);
      } else {
        resolve(null);
      }
    };

    request.onerror = () => {
      console.error('Failed to load state:', request.error);
      reject(request.error);
    };
  });
}

// Add operation to pending sync queue
export async function addPendingSync(operation) {
  if (!db) await initOfflineStorage();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');

    const syncItem = {
      ...operation,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    const request = store.add(syncItem);

    request.onsuccess = () => {
      console.log('Added to sync queue:', operation.type);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Failed to add to sync queue:', request.error);
      reject(request.error);
    };
  });
}

// Get all pending sync operations
export async function getPendingSyncs() {
  if (!db) await initOfflineStorage();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSync'], 'readonly');
    const store = transaction.objectStore('pendingSync');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error('Failed to get pending syncs:', request.error);
      reject(request.error);
    };
  });
}

// Remove completed sync operation
export async function removePendingSync(id) {
  if (!db) await initOfflineStorage();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log('Removed from sync queue:', id);
      resolve();
    };

    request.onerror = () => {
      console.error('Failed to remove from sync queue:', request.error);
      reject(request.error);
    };
  });
}

// Clear all pending syncs (after successful full sync)
export async function clearPendingSyncs() {
  if (!db) await initOfflineStorage();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');
    const request = store.clear();

    request.onsuccess = () => {
      console.log('Cleared sync queue');
      resolve();
    };

    request.onerror = () => {
      console.error('Failed to clear sync queue:', request.error);
      reject(request.error);
    };
  });
}

// Check if we're online
export function isOnline() {
  return navigator.onLine;
}

// Register for online/offline events
export function onConnectivityChange(callback) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));

  // Return cleanup function
  return () => {
    window.removeEventListener('online', () => callback(true));
    window.removeEventListener('offline', () => callback(false));
  };
}

// Request background sync (if supported)
export async function requestBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in window.registration) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-reports');
      console.log('Background sync registered');
    } catch (error) {
      console.log('Background sync not supported:', error);
    }
  }
}

// Get pending sync count
export async function getPendingSyncCount() {
  const pending = await getPendingSyncs();
  return pending.length;
}
