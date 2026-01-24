import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  stateName: string;
  stateAbbreviation: string;
  contentType: "statistics" | "substance_statistics" | "resources" | "faqs" | "seo";
  researchData: string;
  citations: string[];
  year?: number;
}

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 30;
const RATE_LIMIT_WINDOW_MINUTES = 60;

async function checkRateLimit(userId: string, functionName: string): Promise<{ allowed: boolean; error?: Response }> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_user_id: userId,
    p_function_name: functionName,
    p_max_requests: RATE_LIMIT_MAX_REQUESTS,
    p_window_minutes: RATE_LIMIT_WINDOW_MINUTES,
  });

  if (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true };
  }

  if (!data) {
    return {
      allowed: false,
      error: new Response(
        JSON.stringify({
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: RATE_LIMIT_WINDOW_MINUTES * 60,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(RATE_LIMIT_WINDOW_MINUTES * 60),
          },
        }
      ),
    };
  }

  return { allowed: true };
}

// Admin authentication helper
async function verifyAdminAuth(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized - missing authentication" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized - invalid token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check if user has admin role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (!roleData) {
    return new Response(
      JSON.stringify({ success: false, error: "Forbidden - Admin access required" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return { userId: user.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof Response) {
      return authResult;
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(authResult.userId, "generate-content");
    if (!rateLimitResult.allowed && rateLimitResult.error) {
      return rateLimitResult.error;
    }

    const { stateName, stateAbbreviation, contentType, researchData, citations, year } = await req.json() as GenerateRequest;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Lovable API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";
    const targetYear = year || new Date().getFullYear();
    const stateId = stateAbbreviation.toLowerCase();

    switch (contentType) {
      case "statistics":
        systemPrompt = `You are a data analyst extracting addiction statistics for ${stateName}. Output ONLY valid JSON with this EXACT structure:
{
  "state_id": "${stateId}",
  "state_name": "${stateName}",
  "year": ${targetYear},
  "total_affected": <number or null>,
  "overdose_deaths": <number or null>,
  "opioid_deaths": <number or null>,
  "drug_abuse_rate": <number as percentage like 5.8 or null>,
  "alcohol_abuse_rate": <number as percentage like 6.2 or null>,
  "affected_age_12_17": <number or null>,
  "affected_age_18_25": <number or null>,
  "affected_age_26_34": <number or null>,
  "affected_age_35_plus": <number or null>,
  "total_treatment_centers": <number or null>,
  "inpatient_facilities": <number or null>,
  "outpatient_facilities": <number or null>,
  "treatment_admissions": <number or null>,
  "recovery_rate": <number as percentage or null>,
  "relapse_rate": <number as percentage or null>,
  "economic_cost_billions": <number like 5.2 or null>,
  "data_source": "CDC, SAMHSA NSDUH",
  "source_url": "https://www.samhsa.gov/data/nsduh"
}
Extract numbers from research. Use null if data not found. Year MUST be ${targetYear}.`;
        userPrompt = `Extract statistics for ${stateName} for ${targetYear} from this research:\n\n${researchData}\n\nSources: ${citations.join(", ")}\n\nOutput ONLY JSON, no markdown.`;
        break;

      case "substance_statistics":
        systemPrompt = `You are extracting substance-specific statistics for ${stateName}. Output ONLY valid JSON with this EXACT structure:
{
  "state_id": "${stateId}",
  "state_name": "${stateName}",
  "year": ${targetYear},
  "alcohol_use_past_month_percent": <number or null>,
  "alcohol_binge_drinking_percent": <number or null>,
  "alcohol_heavy_use_percent": <number or null>,
  "alcohol_use_disorder": <number or null>,
  "alcohol_related_deaths": <number or null>,
  "opioid_use_disorder": <number or null>,
  "opioid_misuse_past_year": <number or null>,
  "prescription_opioid_misuse": <number or null>,
  "heroin_use": <number or null>,
  "fentanyl_deaths": <number or null>,
  "fentanyl_involved_overdoses": <number or null>,
  "marijuana_use_past_month": <number or null>,
  "marijuana_use_past_year": <number or null>,
  "marijuana_use_disorder": <number or null>,
  "cocaine_use_past_year": <number or null>,
  "cocaine_use_disorder": <number or null>,
  "cocaine_related_deaths": <number or null>,
  "meth_use_past_year": <number or null>,
  "meth_use_disorder": <number or null>,
  "meth_related_deaths": <number or null>,
  "prescription_stimulant_misuse": <number or null>,
  "prescription_sedative_misuse": <number or null>,
  "prescription_tranquilizer_misuse": <number or null>,
  "treatment_received": <number or null>,
  "treatment_needed_not_received": <number or null>,
  "mat_recipients": <number or null>,
  "mental_illness_with_sud": <number or null>,
  "serious_mental_illness_with_sud": <number or null>
}
Extract numbers from research. Use null if not found. Year MUST be ${targetYear}.`;
        userPrompt = `Extract substance statistics for ${stateName} for ${targetYear} from this research:\n\n${researchData}\n\nSources: ${citations.join(", ")}\n\nOutput ONLY JSON, no markdown.`;
        break;

      case "resources":
        systemPrompt = `You are creating addiction treatment resources for ${stateName}. Output ONLY valid JSON array:
[
  {
    "title": "Resource Name",
    "description": "Detailed description (2-3 sentences)",
    "resource_type": "hotline" | "treatment_center" | "support_group" | "government_program" | "crisis_line",
    "phone": "phone number with area code or null",
    "website": "full URL or null",
    "address": "full address or null",
    "is_free": true,
    "is_nationwide": false,
    "state_id": "${stateId}",
    "featured": true for important resources
  }
]
Create 10-15 verified resources. Always include SAMHSA Helpline.`;
        userPrompt = `Create resources for ${stateName} from this research:\n\n${researchData}\n\nOutput ONLY JSON array, no markdown.`;
        break;

      case "faqs":
        systemPrompt = `You are creating FAQs about addiction treatment in ${stateName}. Output ONLY valid JSON array:
[
  {
    "question": "Question about treatment in ${stateName}?",
    "answer": "Detailed answer (3-5 sentences) with ${stateName}-specific information.",
    "category": "Insurance" | "Treatment" | "Legal" | "Resources" | "General",
    "state_id": "${stateId}",
    "is_active": true,
    "sort_order": 1
  }
]
Create 10 relevant FAQs. Include insurance, legal, and treatment questions.`;
        userPrompt = `Create 10 FAQs for ${stateName} from this research:\n\n${researchData}\n\nOutput ONLY JSON array, no markdown.`;
        break;

      case "seo":
        systemPrompt = `You are creating SEO content for ${stateName} rehab listings. Output ONLY valid JSON:
{
  "page_slug": "${stateName.toLowerCase().replace(/ /g, "-")}-addiction-rehabs",
  "page_type": "state",
  "meta_title": "${stateName} Rehab Centers | Find Treatment Near You",
  "meta_description": "Under 160 chars describing ${stateName} addiction treatment options",
  "h1_title": "Addiction Treatment Centers in ${stateName}",
  "intro_text": "3-4 paragraphs about addiction treatment in ${stateName}. Include statistics, treatment options, insurance info.",
  "og_title": "${stateName} Drug & Alcohol Rehab Centers",
  "og_description": "Find the best addiction treatment in ${stateName}. Free resources and verified rehab centers.",
  "state_id": "${stateId}",
  "meta_keywords": ["${stateName} rehab", "${stateName} addiction treatment", "drug rehab ${stateAbbreviation}"],
  "is_active": true
}`;
        userPrompt = `Create SEO content for ${stateName} from this research:\n\n${researchData}\n\nOutput ONLY JSON, no markdown.`;
        break;
    }

    console.log(`Generating ${contentType} for ${stateName} (${targetYear})...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: `AI gateway error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsedContent;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to parse generated content as JSON",
          rawContent: content 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generated ${contentType} for ${stateName} (${targetYear})`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          stateName,
          stateAbbreviation,
          contentType,
          year: targetYear,
          content: parsedContent,
          timestamp: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate content error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
