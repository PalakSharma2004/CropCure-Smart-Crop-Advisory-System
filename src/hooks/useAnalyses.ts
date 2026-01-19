import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import type { Json } from '@/integrations/supabase/types';

export interface CropAnalysis {
  id: string;
  user_id: string;
  image_url: string;
  disease_prediction: string | null;
  confidence_score: number | null;
  severity_level: 'low' | 'medium' | 'high' | 'critical' | null;
  analysis_date: string;
  location_data: Json | null;
  crop_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface TreatmentRecommendation {
  id: string;
  analysis_id: string;
  treatment_steps: Json;
  precautionary_measures: Json;
  products_recommended: Json;
  timeline: string | null;
  expert_tips: Json;
  created_at: string;
  updated_at: string;
}

export interface CreateAnalysisInput {
  image_url: string;
  crop_type: string;
  location_data?: Json;
}

// Fetch user's crop analysis history
export function useAnalyses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analyses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('crop_analyses')
        .select('*')
        .order('analysis_date', { ascending: false });
      
      if (error) throw error;
      return data as CropAnalysis[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch specific analysis with recommendations
export function useAnalysis(analysisId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: async () => {
      if (!analysisId || !user?.id) return null;
      
      const { data: analysis, error: analysisError } = await supabase
        .from('crop_analyses')
        .select('*')
        .eq('id', analysisId)
        .maybeSingle();
      
      if (analysisError) throw analysisError;
      if (!analysis) return null;
      
      const { data: recommendations, error: recError } = await supabase
        .from('treatment_recommendations')
        .select('*')
        .eq('analysis_id', analysisId)
        .maybeSingle();
      
      if (recError && recError.code !== 'PGRST116') throw recError;
      
      return {
        analysis: analysis as CropAnalysis,
        recommendations: recommendations as TreatmentRecommendation | null,
      };
    },
    enabled: !!analysisId && !!user?.id,
  });
}

// Create new crop analysis
export function useCreateAnalysis() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateAnalysisInput) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('crop_analyses')
        .insert({
          user_id: user.id,
          image_url: input.image_url,
          crop_type: input.crop_type,
          location_data: input.location_data || null,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as CropAnalysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
  });
}

// Update analysis
export function useUpdateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<{
      image_url: string;
      disease_prediction: string | null;
      confidence_score: number | null;
      severity_level: string | null;
      location_data: Json | null;
      crop_type: string;
      status: string;
    }>) => {
      const { data, error } = await supabase
        .from('crop_analyses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as CropAnalysis;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['analysis', data.id] });
    },
  });
}

// Delete analysis
export function useDeleteAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (analysisId: string) => {
      const { error } = await supabase
        .from('crop_analyses')
        .delete()
        .eq('id', analysisId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
  });
}

// Real-time subscription for analyses updates
export function useAnalysesRealtime() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('analyses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crop_analyses',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Analysis update:', payload);
          queryClient.invalidateQueries({ queryKey: ['analyses'] });
          
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['analysis', payload.new.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
}
