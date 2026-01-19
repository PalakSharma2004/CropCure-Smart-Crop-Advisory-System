import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  weather_alerts: boolean;
  disease_alerts: boolean;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  language: string;
  location: Json | null;
  preferred_crops: string[];
  notification_settings: NotificationSettings;
  created_at: string;
  updated_at: string;
}

export interface UpdatePreferencesInput {
  language?: string;
  location?: Json;
  preferred_crops?: string[];
  notification_settings?: Partial<NotificationSettings>;
}

// Helper to safely parse notification settings
function parseNotificationSettings(data: Json | null): NotificationSettings {
  const defaults: NotificationSettings = {
    push: true,
    email: true,
    sms: false,
    weather_alerts: true,
    disease_alerts: true,
  };
  
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return defaults;
  }
  
  return {
    push: typeof (data as Record<string, unknown>).push === 'boolean' ? (data as Record<string, unknown>).push as boolean : defaults.push,
    email: typeof (data as Record<string, unknown>).email === 'boolean' ? (data as Record<string, unknown>).email as boolean : defaults.email,
    sms: typeof (data as Record<string, unknown>).sms === 'boolean' ? (data as Record<string, unknown>).sms as boolean : defaults.sms,
    weather_alerts: typeof (data as Record<string, unknown>).weather_alerts === 'boolean' ? (data as Record<string, unknown>).weather_alerts as boolean : defaults.weather_alerts,
    disease_alerts: typeof (data as Record<string, unknown>).disease_alerts === 'boolean' ? (data as Record<string, unknown>).disease_alerts as boolean : defaults.disease_alerts,
  };
}

// Helper to transform database row to UserPreferences
function toUserPreferences(data: {
  id: string;
  user_id: string;
  language: string;
  location: Json | null;
  preferred_crops: string[] | null;
  notification_settings: Json | null;
  created_at: string;
  updated_at: string;
}): UserPreferences {
  return {
    id: data.id,
    user_id: data.user_id,
    language: data.language,
    location: data.location,
    preferred_crops: data.preferred_crops || [],
    notification_settings: parseNotificationSettings(data.notification_settings),
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

// Fetch user preferences
export function useUserPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no preferences exist, create default ones
      if (!data) {
        const { data: newPrefs, error: createError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            language: 'en',
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return toUserPreferences(newPrefs);
      }
      
      return toUserPreferences(data);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Update user preferences
export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: UpdatePreferencesInput) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Build update data
      const updateData: Record<string, unknown> = {};
      
      if (input.language !== undefined) {
        updateData.language = input.language;
      }
      if (input.location !== undefined) {
        updateData.location = input.location;
      }
      if (input.preferred_crops !== undefined) {
        updateData.preferred_crops = input.preferred_crops;
      }
      
      // Merge notification settings if partial
      if (input.notification_settings) {
        const { data: currentPrefs } = await supabase
          .from('user_preferences')
          .select('notification_settings')
          .eq('user_id', user.id)
          .single();
        
        const currentSettings = parseNotificationSettings(currentPrefs?.notification_settings || null);
        
        updateData.notification_settings = {
          ...currentSettings,
          ...input.notification_settings,
        };
      }
      
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return toUserPreferences(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
  });
}
