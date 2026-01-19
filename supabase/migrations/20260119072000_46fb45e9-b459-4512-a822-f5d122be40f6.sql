-- Create crop_analyses table
CREATE TABLE public.crop_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  disease_prediction TEXT,
  confidence_score DECIMAL(5,2),
  severity_level TEXT CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location_data JSONB,
  crop_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treatment_recommendations table
CREATE TABLE public.treatment_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.crop_analyses(id) ON DELETE CASCADE,
  treatment_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  precautionary_measures JSONB NOT NULL DEFAULT '[]'::jsonb,
  products_recommended JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline TEXT,
  expert_tips JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_preferences table (separate from profiles for specific app settings)
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  language TEXT NOT NULL DEFAULT 'en',
  location JSONB,
  preferred_crops TEXT[] DEFAULT '{}'::text[],
  notification_settings JSONB NOT NULL DEFAULT '{"push": true, "email": true, "sms": false, "weather_alerts": true, "disease_alerts": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_content TEXT NOT NULL,
  response_content TEXT,
  conversation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'system')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.crop_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for crop_analyses
CREATE POLICY "Users can view their own analyses"
  ON public.crop_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses"
  ON public.crop_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
  ON public.crop_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
  ON public.crop_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for treatment_recommendations (via analysis ownership)
CREATE POLICY "Users can view recommendations for their analyses"
  ON public.treatment_recommendations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.crop_analyses
    WHERE crop_analyses.id = treatment_recommendations.analysis_id
    AND crop_analyses.user_id = auth.uid()
  ));

CREATE POLICY "Users can create recommendations for their analyses"
  ON public.treatment_recommendations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.crop_analyses
    WHERE crop_analyses.id = treatment_recommendations.analysis_id
    AND crop_analyses.user_id = auth.uid()
  ));

CREATE POLICY "Users can update recommendations for their analyses"
  ON public.treatment_recommendations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.crop_analyses
    WHERE crop_analyses.id = treatment_recommendations.analysis_id
    AND crop_analyses.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete recommendations for their analyses"
  ON public.treatment_recommendations FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.crop_analyses
    WHERE crop_analyses.id = treatment_recommendations.analysis_id
    AND crop_analyses.user_id = auth.uid()
  ));

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON public.user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for chat_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_crop_analyses_updated_at
  BEFORE UPDATE ON public.crop_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatment_recommendations_updated_at
  BEFORE UPDATE ON public.treatment_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create crop-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'crop-images',
  'crop-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Storage policies for crop-images bucket
CREATE POLICY "Users can view their own crop images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own crop images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own crop images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own crop images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public read access for crop images (needed for display)
CREATE POLICY "Public can view crop images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'crop-images');

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.crop_analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;

-- Create indexes for performance
CREATE INDEX idx_crop_analyses_user_id ON public.crop_analyses(user_id);
CREATE INDEX idx_crop_analyses_analysis_date ON public.crop_analyses(analysis_date DESC);
CREATE INDEX idx_crop_analyses_status ON public.crop_analyses(status);
CREATE INDEX idx_treatment_recommendations_analysis_id ON public.treatment_recommendations(analysis_id);
CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_date ON public.chat_conversations(conversation_date DESC);

-- Create function to auto-create user preferences on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id, language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-creating preferences
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();