import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId, language = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client to fetch user context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's recent analyses for context
    let userContext = "";
    if (userId) {
      const { data: analyses } = await supabase
        .from("crop_analyses")
        .select("crop_type, disease_prediction, severity_level, analysis_date")
        .eq("user_id", userId)
        .order("analysis_date", { ascending: false })
        .limit(5);

      if (analyses && analyses.length > 0) {
        userContext = `\n\nUser's recent crop analyses:\n${analyses.map(a => 
          `- ${a.crop_type}: ${a.disease_prediction || 'Healthy'} (${a.severity_level || 'N/A'}) on ${a.analysis_date}`
        ).join('\n')}`;
      }

      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("preferred_crops, location")
        .eq("user_id", userId)
        .single();

      if (prefs) {
        if (prefs.preferred_crops?.length) {
          userContext += `\nUser's crops: ${prefs.preferred_crops.join(', ')}`;
        }
        if (prefs.location) {
          const loc = prefs.location as { lat?: number; lng?: number; name?: string };
          if (loc.name) {
            userContext += `\nUser's location: ${loc.name}`;
          }
        }
      }
    }

    const systemPrompt = `You are CropCare AI, an expert agricultural assistant helping Indian farmers with crop management, disease identification, weather-based farming advice, and sustainable farming practices.

Key capabilities:
- Provide practical, region-specific farming advice for Indian agriculture
- Help identify and treat crop diseases based on descriptions
- Offer weather-based farming recommendations
- Suggest organic and sustainable farming practices
- Provide information in both English and Hindi when appropriate

Guidelines:
- Be concise but thorough in your responses
- Use simple language that farmers can easily understand
- Include practical, actionable advice
- When discussing treatments, mention both chemical and organic options
- Consider local weather patterns and seasonal factors
- Always prioritize farmer safety when recommending products
${language === 'hi' ? '\n- Respond primarily in Hindi with important terms also in English' : ''}
${userContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service quota exceeded. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
