import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import type { Json } from '@/integrations/supabase/types';

export interface ChatMessage {
  id: string;
  user_id: string;
  message_content: string;
  response_content: string | null;
  conversation_date: string;
  message_type: 'text' | 'image' | 'audio' | 'system';
  metadata: Json | null;
  created_at: string;
}

export interface SendMessageInput {
  message_content: string;
  message_type?: 'text' | 'image' | 'audio';
  metadata?: Json;
}

// Fetch chat history
export function useChatHistory(limit = 50) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chat-history', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('conversation_date', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute
  });
}

// Send new message
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: SendMessageInput) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          message_content: input.message_content,
          message_type: input.message_type || 'text',
          metadata: input.metadata || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as ChatMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });
}

// Delete chat message
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', messageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });
}

// Clear all chat history
export function useClearChatHistory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });
}

// Real-time subscription for chat messages
export function useChatRealtime() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('chat-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Chat update:', payload);
          queryClient.invalidateQueries({ queryKey: ['chat-history'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
}
