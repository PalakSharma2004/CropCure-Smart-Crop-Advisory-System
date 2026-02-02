import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const analyzeRequestSchema = z.object({
  imageUrl: z.string().url().max(2000),
  cropType: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/, "Invalid crop type"),
  analysisId: z.string().uuid(),
  userId: z.string().uuid(),
  language: z.enum(["en", "hi"]).default("en"),
});

interface AnalysisResult {
  disease_prediction: string | null;
  confidence_score: number;
  severity_level: string;
  treatment_steps: string[];
  precautionary_measures: string[];
  products_recommended: string[];
  expert_tips: string[];
  timeline: string;
}

// Sanitize string output
function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, '').substring(0, 1000);
}

// Sanitize analysis result
function sanitizeResult(result: AnalysisResult): AnalysisResult {
  return {
    disease_prediction: result.disease_prediction ? sanitizeString(result.disease_prediction) : null,
    confidence_score: Math.min(Math.max(Number(result.confidence_score) || 0, 0), 1),
    severity_level: ["low", "moderate", "severe", "critical"].includes(result.severity_level) 
      ? result.severity_level 
      : "low",
    treatment_steps: Array.isArray(result.treatment_steps) 
      ? result.treatment_steps.slice(0, 10).map(s => sanitizeString(String(s)))
      : [],
    precautionary_measures: Array.isArray(result.precautionary_measures)
      ? result.precautionary_measures.slice(0, 10).map(s => sanitizeString(String(s)))
      : [],
    products_recommended: Array.isArray(result.products_recommended)
      ? result.products_recommended.slice(0, 10).map(s => sanitizeString(String(s)))
      : [],
    expert_tips: Array.isArray(result.expert_tips)
      ? result.expert_tips.slice(0, 10).map(s => sanitizeString(String(s)))
      : [],
    timeline: result.timeline ? sanitizeString(result.timeline) : "N/A",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = analyzeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: "Invalid request format",
        details: validationResult.error.issues.map(i => i.message).join(", ")
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl, cropType, analysisId, userId, language } = validationResult.data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the analysis belongs to the user
    const { data: existingAnalysis, error: fetchError } = await supabase
      .from("crop_analyses")
      .select("id, user_id")
      .eq("id", analysisId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingAnalysis) {
      return new Response(JSON.stringify({ error: "Analysis not found or access denied" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update analysis status to processing
    await supabase
      .from("crop_analyses")
      .update({ status: "processing" })
      .eq("id", analysisId);

    const systemPrompt = `You are an expert agricultural AI specializing in crop disease detection and treatment recommendations for Indian farming conditions.

Analyze the provided crop image and return a JSON response with this exact structure:
{
  "disease_prediction": "Disease name or 'Healthy' if no disease detected",
  "confidence_score": 0.85,
  "severity_level": "low|moderate|severe|critical",
  "treatment_steps": ["Step 1", "Step 2", "Step 3"],
  "precautionary_measures": ["Measure 1", "Measure 2"],
  "products_recommended": ["Product 1 (organic)", "Product 2 (chemical)"],
  "expert_tips": ["Tip 1", "Tip 2"],
  "timeline": "Expected recovery timeline"
}

Guidelines:
- Be accurate and specific about disease identification
- Provide both organic and chemical treatment options
- Consider Indian market-available products
- Include safety precautions for farmers
- severity_level must be one of: low, moderate, severe, critical
- confidence_score should be between 0 and 1
${language === 'hi' ? '- Provide treatment steps and tips in Hindi' : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this ${cropType} crop image for diseases and provide treatment recommendations.`,
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        await supabase
          .from("crop_analyses")
          .update({ status: "failed" })
          .eq("id", analysisId);
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        await supabase
          .from("crop_analyses")
          .update({ status: "failed" })
          .eq("id", analysisId);
        return new Response(JSON.stringify({ error: "AI service quota exceeded." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    let result: AnalysisResult;
    try {
      const parsed = JSON.parse(content);
      result = sanitizeResult(parsed);
    } catch {
      // Fallback if JSON parsing fails
      result = {
        disease_prediction: "Unable to analyze",
        confidence_score: 0,
        severity_level: "low",
        treatment_steps: ["Please try again with a clearer image"],
        precautionary_measures: [],
        products_recommended: [],
        expert_tips: [],
        timeline: "N/A",
      };
    }

    // Update crop analysis with results
    const { error: updateError } = await supabase
      .from("crop_analyses")
      .update({
        disease_prediction: result.disease_prediction,
        confidence_score: result.confidence_score,
        severity_level: result.severity_level,
        status: "completed",
      })
      .eq("id", analysisId);

    if (updateError) {
      console.error("Error updating analysis:", updateError);
    }

    // Create treatment recommendation
    const { error: recError } = await supabase
      .from("treatment_recommendations")
      .insert({
        analysis_id: analysisId,
        treatment_steps: result.treatment_steps,
        precautionary_measures: result.precautionary_measures,
        products_recommended: result.products_recommended,
        expert_tips: result.expert_tips,
        timeline: result.timeline,
      });

    if (recError) {
      console.error("Error creating recommendation:", recError);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: {
        disease_prediction: result.disease_prediction,
        confidence_score: result.confidence_score,
        severity_level: result.severity_level,
      },
      recommendations: {
        treatment_steps: result.treatment_steps,
        precautionary_measures: result.precautionary_measures,
        products_recommended: result.products_recommended,
        expert_tips: result.expert_tips,
        timeline: result.timeline,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analyze crop error:", error);
    return new Response(JSON.stringify({ 
      error: "Analysis failed. Please try again." 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
