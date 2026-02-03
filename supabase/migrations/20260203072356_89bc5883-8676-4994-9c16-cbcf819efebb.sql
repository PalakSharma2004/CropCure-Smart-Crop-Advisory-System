-- Create educational_content table for the Learn page
CREATE TABLE public.educational_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'article', 'guide')),
  category TEXT NOT NULL CHECK (category IN ('diseases', 'treatments', 'prevention', 'general')),
  duration TEXT NOT NULL,
  thumbnail_url TEXT,
  content_url TEXT,
  content_body TEXT,
  is_downloadable BOOLEAN NOT NULL DEFAULT false,
  language TEXT NOT NULL DEFAULT 'en',
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_content_progress table to track bookmarks and downloads
CREATE TABLE public.user_content_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL REFERENCES public.educational_content(id) ON DELETE CASCADE,
  is_bookmarked BOOLEAN NOT NULL DEFAULT false,
  is_downloaded BOOLEAN NOT NULL DEFAULT false,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- Enable RLS
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_progress ENABLE ROW LEVEL SECURITY;

-- Educational content is readable by all authenticated users (public content)
CREATE POLICY "Anyone can view educational content"
ON public.educational_content
FOR SELECT
USING (true);

-- User progress policies
CREATE POLICY "Users can view their own progress"
ON public.user_content_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
ON public.user_content_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_content_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON public.user_content_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_educational_content_updated_at
BEFORE UPDATE ON public.educational_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_content_progress_updated_at
BEFORE UPDATE ON public.user_content_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed educational content
INSERT INTO public.educational_content (title, description, content_type, category, duration, is_downloadable, language) VALUES
('Identifying Common Tomato Diseases', 'Learn to recognize early signs of blight, wilt, and other tomato diseases with visual examples.', 'video', 'diseases', '5 min', false, 'en'),
('Organic Pest Control Methods', 'Discover natural ways to protect your crops from common pests without chemicals.', 'article', 'prevention', '3 min read', true, 'en'),
('Best Practices for Rice Cultivation', 'Complete guide to growing healthy rice crops from planting to harvest.', 'video', 'general', '8 min', true, 'en'),
('Treating Wheat Rust Disease', 'Step-by-step treatment guide for wheat rust with recommended fungicides.', 'guide', 'treatments', '4 min read', true, 'en'),
('Early Blight Prevention in Potatoes', 'Preventive measures to protect potato crops from early blight infection.', 'article', 'prevention', '5 min read', true, 'en'),
('Water Management for Crops', 'Efficient irrigation techniques to optimize water usage and crop yield.', 'video', 'general', '6 min', false, 'en'),
('Cotton Leaf Curl Virus Guide', 'Understanding and managing cotton leaf curl virus in your fields.', 'guide', 'diseases', '7 min read', true, 'en'),
('Integrated Pest Management', 'Comprehensive approach combining biological, cultural, and chemical pest control.', 'video', 'treatments', '10 min', false, 'en'),
('टमाटर की सामान्य बीमारियों की पहचान', 'झुलसा और अन्य टमाटर रोगों के शुरुआती लक्षणों को पहचानना सीखें।', 'video', 'diseases', '5 मिनट', false, 'hi'),
('जैविक कीट नियंत्रण के तरीके', 'रसायनों के बिना फसलों को कीटों से बचाने के प्राकृतिक तरीके।', 'article', 'prevention', '3 मिनट पढ़ें', true, 'hi');