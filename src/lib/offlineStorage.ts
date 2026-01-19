// Offline storage utility using IndexedDB via localStorage fallback
const STORAGE_PREFIX = 'fasal_offline_';
const CACHE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface PendingSync {
  id: string;
  type: 'analysis' | 'chat' | 'preference';
  action: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: number;
  retries: number;
}

// Generic cache functions
export function setCache<T>(key: string, data: T, expiryMs = CACHE_EXPIRY_MS): void {
  try {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiryMs,
    };
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(item));
  } catch (error) {
    console.warn('Failed to cache data:', error);
    // Try to clear old cache if storage is full
    cleanupOldCache();
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!stored) return null;
    
    const item: CacheItem<T> = JSON.parse(stored);
    
    // Check if expired
    if (Date.now() > item.expiry) {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.warn('Failed to retrieve cache:', error);
    return null;
  }
}

export function removeCache(key: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
}

export function clearAllCache(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
  keys.forEach(key => localStorage.removeItem(key));
}

// Cleanup old cached items
export function cleanupOldCache(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
  
  keys.forEach(key => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const item = JSON.parse(stored);
        if (Date.now() > item.expiry) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      localStorage.removeItem(key);
    }
  });
}

// Pending sync queue for offline operations
const PENDING_SYNC_KEY = `${STORAGE_PREFIX}pending_sync`;

export function getPendingSync(): PendingSync[] {
  try {
    const stored = localStorage.getItem(PENDING_SYNC_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addPendingSync(item: Omit<PendingSync, 'id' | 'timestamp' | 'retries'>): void {
  const pending = getPendingSync();
  pending.push({
    ...item,
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retries: 0,
  });
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
}

export function removePendingSync(id: string): void {
  const pending = getPendingSync().filter(item => item.id !== id);
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
}

export function updatePendingSyncRetry(id: string): void {
  const pending = getPendingSync().map(item => 
    item.id === id ? { ...item, retries: item.retries + 1 } : item
  );
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
}

// Connection status
export function isOnline(): boolean {
  return navigator.onLine;
}

// Specific cache keys
export const CACHE_KEYS = {
  ANALYSES: 'analyses',
  CHAT_HISTORY: 'chat_history',
  USER_PREFERENCES: 'user_preferences',
  PROFILE: 'profile',
} as const;

// Cache analyses
export function cacheAnalyses<T>(userId: string, data: T): void {
  setCache(`${CACHE_KEYS.ANALYSES}_${userId}`, data);
}

export function getCachedAnalyses<T>(userId: string): T | null {
  return getCache(`${CACHE_KEYS.ANALYSES}_${userId}`);
}

// Cache chat history
export function cacheChatHistory<T>(userId: string, data: T): void {
  setCache(`${CACHE_KEYS.CHAT_HISTORY}_${userId}`, data);
}

export function getCachedChatHistory<T>(userId: string): T | null {
  return getCache(`${CACHE_KEYS.CHAT_HISTORY}_${userId}`);
}

// Cache user preferences
export function cacheUserPreferences<T>(userId: string, data: T): void {
  setCache(`${CACHE_KEYS.USER_PREFERENCES}_${userId}`, data);
}

export function getCachedUserPreferences<T>(userId: string): T | null {
  return getCache(`${CACHE_KEYS.USER_PREFERENCES}_${userId}`);
}

// Initialize cleanup on module load
if (typeof window !== 'undefined') {
  // Run cleanup on load
  cleanupOldCache();
  
  // Set up periodic cleanup
  setInterval(cleanupOldCache, 1000 * 60 * 60); // Every hour
}
