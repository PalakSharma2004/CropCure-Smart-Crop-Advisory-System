import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EducationalContent {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'article' | 'guide';
  category: 'diseases' | 'treatments' | 'prevention' | 'general';
  duration: string;
  thumbnail_url: string | null;
  content_url: string | null;
  content_body: string | null;
  is_downloadable: boolean;
  language: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserContentProgress {
  id: string;
  user_id: string;
  content_id: string;
  is_bookmarked: boolean;
  is_downloaded: boolean;
  progress_percent: number;
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentWithProgress extends EducationalContent {
  isBookmarked: boolean;
  isDownloaded: boolean;
  progressPercent: number;
}

// Fetch all educational content with user progress
export function useEducationalContent(language: string = 'en') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['educational-content', language, user?.id],
    queryFn: async () => {
      // Fetch content for the language
      const { data: content, error: contentError } = await supabase
        .from('educational_content')
        .select('*')
        .eq('language', language)
        .order('created_at', { ascending: false });

      if (contentError) throw contentError;

      // Fetch user progress if logged in
      let progressMap: Record<string, UserContentProgress> = {};
      
      if (user?.id) {
        const { data: progress, error: progressError } = await supabase
          .from('user_content_progress')
          .select('*')
          .eq('user_id', user.id);

        if (progressError) throw progressError;
        
        progressMap = (progress || []).reduce((acc, p) => {
          acc[p.content_id] = p;
          return acc;
        }, {} as Record<string, UserContentProgress>);
      }

      // Combine content with progress
      return (content || []).map((item): ContentWithProgress => ({
        ...item,
        content_type: item.content_type as EducationalContent['content_type'],
        category: item.category as EducationalContent['category'],
        isBookmarked: progressMap[item.id]?.is_bookmarked || false,
        isDownloaded: progressMap[item.id]?.is_downloaded || false,
        progressPercent: progressMap[item.id]?.progress_percent || 0,
      }));
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Toggle bookmark
export function useToggleBookmark() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ contentId, isBookmarked }: { contentId: string; isBookmarked: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Upsert the progress record
      const { error } = await supabase
        .from('user_content_progress')
        .upsert({
          user_id: user.id,
          content_id: contentId,
          is_bookmarked: !isBookmarked,
        }, {
          onConflict: 'user_id,content_id',
        });

      if (error) throw error;
      return { contentId, newState: !isBookmarked };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educational-content'] });
    },
  });
}

// Mark as downloaded
export function useMarkDownloaded() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (contentId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_content_progress')
        .upsert({
          user_id: user.id,
          content_id: contentId,
          is_downloaded: true,
        }, {
          onConflict: 'user_id,content_id',
        });

      if (error) throw error;
      return contentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educational-content'] });
    },
  });
}
