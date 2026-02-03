import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CropAnalysis } from './useAnalyses';

export interface DashboardStats {
  totalScans: number;
  scansThisMonth: number;
  healthyPercentage: number;
  issuesCount: number;
  recentAnalyses: CropAnalysis[];
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) {
        return {
          totalScans: 0,
          scansThisMonth: 0,
          healthyPercentage: 0,
          issuesCount: 0,
          recentAnalyses: [],
        };
      }

      // Fetch all analyses for the user
      const { data: analyses, error } = await supabase
        .from('crop_analyses')
        .select('*')
        .order('analysis_date', { ascending: false });

      if (error) throw error;

      const allAnalyses = (analyses || []) as CropAnalysis[];
      
      // Calculate stats
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const scansThisMonth = allAnalyses.filter(
        a => new Date(a.analysis_date) >= firstDayOfMonth
      ).length;

      const completedAnalyses = allAnalyses.filter(a => a.status === 'completed');
      const healthyCount = completedAnalyses.filter(
        a => !a.disease_prediction || 
             a.disease_prediction.toLowerCase() === 'healthy' ||
             a.disease_prediction.toLowerCase().includes('no disease')
      ).length;

      const healthyPercentage = completedAnalyses.length > 0 
        ? Math.round((healthyCount / completedAnalyses.length) * 100)
        : 0;

      const issuesCount = completedAnalyses.length - healthyCount;

      return {
        totalScans: allAnalyses.length,
        scansThisMonth,
        healthyPercentage,
        issuesCount,
        recentAnalyses: allAnalyses.slice(0, 5),
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
