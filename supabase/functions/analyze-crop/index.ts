import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, cropType, analysisId, userId, language = "en" } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
      result = JSON.parse(content);
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
      error: error instanceof Error ? error.message : "Analysis failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
