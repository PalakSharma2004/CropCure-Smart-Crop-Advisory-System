// Background Sync utilities for PWA
// Handles offline image uploads and data synchronization

const SYNC_TAG_UPLOAD = 'image-upload-sync';
const PENDING_UPLOADS_KEY = 'cropcare_pending_uploads';

export interface PendingUpload {
  id: string;
  imageData: string; // base64 or blob URL
  cropType: string;
  locationData?: {
    lat: number;
    lng: number;
    name?: string;
  };
  timestamp: number;
}

// Register for background sync
export async function registerBackgroundSync(tag: string = SYNC_TAG_UPLOAD): Promise<boolean> {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // @ts-ignore - SyncManager types not complete
      await registration.sync.register(tag);
      console.log('Background sync registered:', tag);
      return true;
    } catch (error) {
      console.warn('Background sync registration failed:', error);
      return false;
    }
  }
  return false;
}

// Store pending upload for background sync
export function addPendingUpload(upload: Omit<PendingUpload, 'id' | 'timestamp'>): string {
  const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const pendingUpload: PendingUpload = {
    ...upload,
    id,
    timestamp: Date.now(),
  };

  const pending = getPendingUploads();
  pending.push(pendingUpload);
  
  try {
    localStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pending));
    
    // Try to register for background sync
    registerBackgroundSync();
  } catch (error) {
    console.error('Failed to store pending upload:', error);
  }

  return id;
}

// Get all pending uploads
export function getPendingUploads(): PendingUpload[] {
  try {
    const stored = localStorage.getItem(PENDING_UPLOADS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Remove a pending upload after successful sync
export function removePendingUpload(id: string): void {
  try {
    const pending = getPendingUploads().filter(u => u.id !== id);
    localStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error('Failed to remove pending upload:', error);
  }
}

// Clear all pending uploads
export function clearPendingUploads(): void {
  try {
    localStorage.removeItem(PENDING_UPLOADS_KEY);
  } catch (error) {
    console.error('Failed to clear pending uploads:', error);
  }
}

// Process pending uploads (called when back online)
export async function processPendingUploads(
  uploadFn: (upload: PendingUpload) => Promise<boolean>
): Promise<{ success: number; failed: number }> {
  const pending = getPendingUploads();
  let success = 0;
  let failed = 0;

  for (const upload of pending) {
    try {
      const result = await uploadFn(upload);
      if (result) {
        removePendingUpload(upload.id);
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('Failed to process upload:', upload.id, error);
      failed++;
    }
  }

  return { success, failed };
}

// Check if we have pending uploads
export function hasPendingUploads(): boolean {
  return getPendingUploads().length > 0;
}

// Get pending uploads count
export function getPendingUploadsCount(): number {
  return getPendingUploads().length;
}

// Listen for online status and trigger sync
export function setupAutoSync(
  uploadFn: (upload: PendingUpload) => Promise<boolean>,
  onComplete?: (result: { success: number; failed: number }) => void
): () => void {
  const handleOnline = async () => {
    if (hasPendingUploads()) {
      console.log('Back online, processing pending uploads...');
      const result = await processPendingUploads(uploadFn);
      onComplete?.(result);
    }
  };

  window.addEventListener('online', handleOnline);
  
  // Also try to process on mount if online
  if (navigator.onLine && hasPendingUploads()) {
    handleOnline();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
