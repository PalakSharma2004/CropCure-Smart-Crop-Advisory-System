import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "./useImageUpload";

export interface AnalysisResult {
  id: string;
  imageUrl: string;
  cropType: string;
  diseasePrediction: string | null;
  confidenceScore: number | null;
  severityLevel: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  recommendations?: {
    treatmentSteps: string[];
    precautionaryMeasures: string[];
    productsRecommended: string[];
    expertTips: string[];
    timeline: string | null;
  };
}

export function useCropAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();

  const analyzeImage = useCallback(async (
    file: File,
    cropType: string,
    locationData?: { lat: number; lng: number }
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to analyze crop images",
        variant: "destructive",
      });
      return null;
    }

    setIsAnalyzing(true);
    setError(null);
    setCurrentAnalysis(null);

    try {
      // Upload image first
      const uploadResult = await uploadImage(file, { bucket: "crop-images" });
      if (!uploadResult) {
        throw new Error("Failed to upload image");
      }

      const imageUrl = uploadResult.url;

      // Create analysis record
      const { data: analysisRecord, error: insertError } = await supabase
        .from("crop_analyses")
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          crop_type: cropType,
          status: "pending",
          location_data: locationData ? { lat: locationData.lat, lng: locationData.lng } : null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setCurrentAnalysis({
        id: analysisRecord.id,
        imageUrl,
        cropType,
        diseasePrediction: null,
        confidenceScore: null,
        severityLevel: null,
        status: "pending",
      });

      // Call AI analysis edge function
      const { data, error: analysisError } = await supabase.functions.invoke("analyze-crop", {
        body: {
          imageUrl,
          cropType,
          analysisId: analysisRecord.id,
          userId: user.id,
          language: "en",
        },
      });

      if (analysisError) {
        throw new Error(analysisError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const result: AnalysisResult = {
        id: analysisRecord.id,
        imageUrl: uploadResult.url,
        cropType,
        diseasePrediction: data.analysis.disease_prediction,
        confidenceScore: data.analysis.confidence_score,
        severityLevel: data.analysis.severity_level,
        status: "completed",
        recommendations: {
          treatmentSteps: data.recommendations.treatment_steps || [],
          precautionaryMeasures: data.recommendations.precautionary_measures || [],
          productsRecommended: data.recommendations.products_recommended || [],
          expertTips: data.recommendations.expert_tips || [],
          timeline: data.recommendations.timeline,
        },
      };

      setCurrentAnalysis(result);
      
      toast({
        title: "Analysis Complete",
        description: result.diseasePrediction === "Healthy" 
          ? "Your crop looks healthy! 🌱"
          : `Detected: ${result.diseasePrediction}`,
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      
      if (currentAnalysis?.id) {
        await supabase
          .from("crop_analyses")
          .update({ status: "failed" })
          .eq("id", currentAnalysis.id);
      }

      toast({
        title: "Analysis Failed",
        description: message,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, uploadImage, toast]);

  const getAnalysisHistory = useCallback(async (limit = 10) => {
    if (!user) return [];

    try {
      const { data, error: fetchError } = await supabase
        .from("crop_analyses")
        .select(`
          *,
          treatment_recommendations (*)
        `)
        .eq("user_id", user.id)
        .order("analysis_date", { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      return data?.map((item) => ({
        id: item.id,
        imageUrl: item.image_url,
        cropType: item.crop_type,
        diseasePrediction: item.disease_prediction,
        confidenceScore: item.confidence_score,
        severityLevel: item.severity_level,
        status: item.status as AnalysisResult["status"],
        analysisDate: item.analysis_date,
        recommendations: item.treatment_recommendations?.[0] ? {
          treatmentSteps: (item.treatment_recommendations[0].treatment_steps as string[]) || [],
          precautionaryMeasures: (item.treatment_recommendations[0].precautionary_measures as string[]) || [],
          productsRecommended: (item.treatment_recommendations[0].products_recommended as string[]) || [],
          expertTips: (item.treatment_recommendations[0].expert_tips as string[]) || [],
          timeline: item.treatment_recommendations[0].timeline,
        } : undefined,
      })) || [];
    } catch (err) {
      console.error("Error fetching analysis history:", err);
      return [];
    }
  }, [user]);

  const getAnalysisById = useCallback(async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("crop_analyses")
        .select(`
          *,
          treatment_recommendations (*)
        `)
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      return {
        id: data.id,
        imageUrl: data.image_url,
        cropType: data.crop_type,
        diseasePrediction: data.disease_prediction,
        confidenceScore: data.confidence_score,
        severityLevel: data.severity_level,
        status: data.status as AnalysisResult["status"],
        analysisDate: data.analysis_date,
        recommendations: data.treatment_recommendations?.[0] ? {
          treatmentSteps: (data.treatment_recommendations[0].treatment_steps as string[]) || [],
          precautionaryMeasures: (data.treatment_recommendations[0].precautionary_measures as string[]) || [],
          productsRecommended: (data.treatment_recommendations[0].products_recommended as string[]) || [],
          expertTips: (data.treatment_recommendations[0].expert_tips as string[]) || [],
          timeline: data.treatment_recommendations[0].timeline,
        } : undefined,
      };
    } catch (err) {
      console.error("Error fetching analysis:", err);
      return null;
    }
  }, []);

  return {
    analyzeImage,
    getAnalysisHistory,
    getAnalysisById,
    currentAnalysis,
    isAnalyzing: isAnalyzing || uploading,
    error,
  };
}
