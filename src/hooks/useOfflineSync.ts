import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';
import {
  isOnline,
  getPendingSync,
  removePendingSync,
  updatePendingSyncRetry,
  cacheAnalyses,
  cacheChatHistory,
  cacheUserPreferences,
  getCachedAnalyses,
  getCachedChatHistory,
  getCachedUserPreferences,
} from '@/lib/offlineStorage';
import type { CropAnalysis } from './useAnalyses';
import type { ChatMessage } from './useChat';
import type { UserPreferences } from './useUserPreferences';

const MAX_RETRIES = 3;

export function useOfflineSync() {
  const [online, setOnline] = useState(isOnline());
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Update online status
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update pending count
  useEffect(() => {
    setPendingCount(getPendingSync().length);
  }, [syncing]);

  // Sync pending operations when online
  const syncPending = useCallback(async () => {
    if (!online || syncing) return;

    const pending = getPendingSync();
    if (pending.length === 0) return;

    setSyncing(true);

    for (const item of pending) {
      if (item.retries >= MAX_RETRIES) {
        console.warn(`Removing failed sync item after ${MAX_RETRIES} retries:`, item);
        removePendingSync(item.id);
        continue;
      }

      try {
        switch (item.type) {
          case 'analysis':
            if (item.action === 'create') {
              const createData = item.data as { user_id: string; image_url: string; crop_type: string; location_data?: Json; status: string };
              await supabase.from('crop_analyses').insert([{
                user_id: createData.user_id,
                image_url: createData.image_url,
                crop_type: createData.crop_type,
                location_data: createData.location_data ?? null,
                status: createData.status || 'pending',
              }]);
            } else if (item.action === 'update') {
              const updateData = item.data as { id: string; [key: string]: unknown };
              const { id, ...data } = updateData;
              await supabase.from('crop_analyses').update(data).eq('id', id);
            } else if (item.action === 'delete') {
              const deleteId = item.data as string;
              await supabase.from('crop_analyses').delete().eq('id', deleteId);
            }
            break;

          case 'chat':
            if (item.action === 'create') {
              const chatData = item.data as { user_id: string; message_content: string; message_type?: string; metadata?: Json };
              await supabase.from('chat_conversations').insert([{
                user_id: chatData.user_id,
                message_content: chatData.message_content,
                message_type: chatData.message_type || 'text',
                metadata: chatData.metadata ?? null,
              }]);
            } else if (item.action === 'delete') {
              const deleteId = item.data as string;
              await supabase.from('chat_conversations').delete().eq('id', deleteId);
            }
            break;

          case 'preference':
            if (item.action === 'update') {
              const prefData = item.data as { user_id: string; [key: string]: unknown };
              const { user_id, ...data } = prefData;
              await supabase.from('user_preferences').update(data).eq('user_id', user_id);
            }
            break;

          case 'preference':
            if (item.action === 'update') {
              const prefData = item.data as { user_id: string; [key: string]: unknown };
              const { user_id, ...data } = prefData;
              await supabase.from('user_preferences').update(data).eq('user_id', user_id);
            }
            break;
        }

        removePendingSync(item.id);
        
        // Invalidate related queries
        if (item.type === 'analysis') {
          queryClient.invalidateQueries({ queryKey: ['analyses'] });
        } else if (item.type === 'chat') {
          queryClient.invalidateQueries({ queryKey: ['chat-history'] });
        } else if (item.type === 'preference') {
          queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
        }
      } catch (error) {
        console.error('Sync failed for item:', item, error);
        updatePendingSyncRetry(item.id);
      }
    }

    setSyncing(false);
  }, [online, syncing, queryClient]);

  // Auto-sync when coming online
  useEffect(() => {
    if (online) {
      syncPending();
    }
  }, [online, syncPending]);

  // Cache data for offline use
  const cacheData = useCallback(async () => {
    if (!user?.id || !online) return;

    try {
      // Cache analyses
      const { data: analyses } = await supabase
        .from('crop_analyses')
        .select('*')
        .order('analysis_date', { ascending: false })
        .limit(50);
      
      if (analyses) {
        cacheAnalyses(user.id, analyses);
      }

      // Cache chat history
      const { data: chat } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('conversation_date', { ascending: true })
        .limit(100);
      
      if (chat) {
        cacheChatHistory(user.id, chat);
      }

      // Cache preferences
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (prefs) {
        cacheUserPreferences(user.id, prefs);
      }
    } catch (error) {
      console.warn('Failed to cache data for offline use:', error);
    }
  }, [user?.id, online]);

  // Get cached data when offline
  const getCachedData = useCallback(() => {
    if (!user?.id) return null;

    return {
      analyses: getCachedAnalyses<CropAnalysis[]>(user.id) || [],
      chatHistory: getCachedChatHistory<ChatMessage[]>(user.id) || [],
      preferences: getCachedUserPreferences<UserPreferences>(user.id),
    };
  }, [user?.id]);

  // Periodically cache data when online
  useEffect(() => {
    if (!online || !user?.id) return;

    cacheData();
    const interval = setInterval(cacheData, 1000 * 60 * 5); // Every 5 minutes

    return () => clearInterval(interval);
  }, [online, user?.id, cacheData]);

  return {
    online,
    syncing,
    pendingCount,
    syncPending,
    cacheData,
    getCachedData,
  };
}
