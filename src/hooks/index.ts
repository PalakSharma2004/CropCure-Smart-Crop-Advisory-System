// Camera hooks
export { useCamera } from './useCamera';

// Mobile detection
export { useIsMobile } from './use-mobile';

// Language
export { useLanguage } from './useLanguage';

// Toast
export { useToast, toast } from './use-toast';

// Data hooks
export { 
  useAnalyses, 
  useAnalysis, 
  useCreateAnalysis, 
  useUpdateAnalysis, 
  useDeleteAnalysis,
  useAnalysesRealtime,
  type CropAnalysis,
  type TreatmentRecommendation,
  type CreateAnalysisInput,
} from './useAnalyses';

export {
  useChatHistory,
  useSendMessage,
  useDeleteMessage,
  useClearChatHistory,
  useChatRealtime,
  type ChatMessage,
  type SendMessageInput,
} from './useChat';

export {
  useUserPreferences,
  useUpdatePreferences,
  type UserPreferences,
  type NotificationSettings,
  type UpdatePreferencesInput,
} from './useUserPreferences';

export {
  useRecommendations,
  useCreateRecommendation,
  useUpdateRecommendation,
  useDeleteRecommendation,
  type CreateRecommendationInput,
} from './useRecommendations';

// Image upload
export { useImageUpload } from './useImageUpload';

// Offline sync
export { useOfflineSync } from './useOfflineSync';
