import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TreatmentRecommendation } from './useAnalyses';

export interface CreateRecommendationInput {
  analysis_id: string;
  treatment_steps: string[];
  precautionary_measures: string[];
  products_recommended: string[];
  timeline?: string;
  expert_tips: string[];
}

// Fetch recommendations for an analysis
export function useRecommendations(analysisId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recommendations', analysisId],
    queryFn: async () => {
      if (!analysisId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('treatment_recommendations')
        .select('*')
        .eq('analysis_id', analysisId)
        .maybeSingle();
      
      if (error) throw error;
      return data as TreatmentRecommendation | null;
    },
    enabled: !!analysisId && !!user?.id,
  });
}

// Create recommendation
export function useCreateRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRecommendationInput) => {
      const { data, error } = await supabase
        .from('treatment_recommendations')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data as TreatmentRecommendation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', data.analysis_id] });
      queryClient.invalidateQueries({ queryKey: ['analysis', data.analysis_id] });
    },
  });
}

// Update recommendation
export function useUpdateRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TreatmentRecommendation> & { id: string }) => {
      const { data, error } = await supabase
        .from('treatment_recommendations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as TreatmentRecommendation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', data.analysis_id] });
      queryClient.invalidateQueries({ queryKey: ['analysis', data.analysis_id] });
    },
  });
}

// Delete recommendation
export function useDeleteRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recommendationId: string) => {
      // Get analysis_id before deleting
      const { data: rec } = await supabase
        .from('treatment_recommendations')
        .select('analysis_id')
        .eq('id', recommendationId)
        .single();
      
      const { error } = await supabase
        .from('treatment_recommendations')
        .delete()
        .eq('id', recommendationId);
      
      if (error) throw error;
      return rec?.analysis_id;
    },
    onSuccess: (analysisId) => {
      if (analysisId) {
        queryClient.invalidateQueries({ queryKey: ['recommendations', analysisId] });
        queryClient.invalidateQueries({ queryKey: ['analysis', analysisId] });
      }
    },
  });
}
