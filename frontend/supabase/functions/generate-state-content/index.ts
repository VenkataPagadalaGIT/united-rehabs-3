import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  stateId: string;
  stateName: string;
  contentType: "faqs" | "resources";
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

  const authSupabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await authSupabase.auth.getUser();
  
  if (error || !user) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized - invalid token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check if user has admin role
  const { data: roleData } = await authSupabase
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
    const rateLimitResult = await checkRateLimit(authResult.userId, "generate-state-content");
    if (!rateLimitResult.allowed && rateLimitResult.error) {
      return rateLimitResult.error;
    }

    const { stateId, stateName, contentType } = await req.json() as GenerateRequest;

    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!perplexityKey || !lovableKey || !supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required API keys" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const stateAbbreviation = stateId.toUpperCase();

    console.log(`Generating ${contentType} for ${stateName} (${stateId})...`);

    // Step 1: Research with Perplexity
    let researchQuery = "";
    let researchSystemPrompt = "";

    if (contentType === "faqs") {
      researchQuery = `Create 10 comprehensive FAQs about addiction treatment in ${stateName}:

INSURANCE & COST (3 questions):
- ${stateName} Medicaid coverage for addiction treatment
- Private insurance requirements in ${stateName}
- Free and low-cost rehab options in ${stateName}

LEGAL (2 questions):
- ${stateName} drug possession laws and penalties
- ${stateName} Good Samaritan overdose laws

TREATMENT OPTIONS (3 questions):
- Types of rehab programs available in ${stateName}
- Medication-assisted treatment (MAT) availability
- How long does rehab typically last

GETTING HELP (2 questions):
- How to find a quality rehab center in ${stateName}
- What to expect during the first week of treatment

Each answer should be 3-5 sentences with ${stateName}-specific information.`;

      researchSystemPrompt = `You are an addiction treatment counselor and legal expert in ${stateName}. Provide accurate, helpful information. Focus on verified facts about ${stateName}'s treatment landscape.`;
    } else {
      researchQuery = `Find free addiction treatment resources in ${stateName}:

ALWAYS INCLUDE:
1. SAMHSA National Helpline: 1-800-662-4357

STATE RESOURCES TO FIND:
1. ${stateName} state substance abuse agency hotline/contact
2. ${stateName} Department of Health addiction services
3. ${stateName} crisis hotline
4. State-funded treatment programs

LOCAL RESOURCES TO FIND:
1. Major free/sliding scale treatment centers in ${stateName}
2. Naloxone/Narcan access programs
3. AA/NA meeting resources for ${stateName}
4. Free support groups and recovery communities

FOR EACH RESOURCE:
- Official name
- Phone number
- Website URL
- Brief description of services`;

      researchSystemPrompt = `You are a healthcare navigator for ${stateName}. Provide verified, current contact information for addiction treatment resources. Focus on free and accessible options.`;
    }

    // Research with Perplexity
    const researchResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: researchSystemPrompt },
          { role: "user", content: researchQuery },
        ],
        search_domain_filter: ["samhsa.gov", "cdc.gov", ".gov", "aa.org", "na.org"],
      }),
    });

    if (!researchResponse.ok) {
      const errorText = await researchResponse.text();
      console.error("Perplexity error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Research failed: ${researchResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const researchData = await researchResponse.json();
    const researchContent = researchData.choices?.[0]?.message?.content || "";
    const citations = researchData.citations || [];

    console.log(`Research complete for ${stateName} ${contentType}. Generating structured content...`);

    // Step 2: Generate structured JSON with Lovable AI
    let generateSystemPrompt = "";
    let generateUserPrompt = "";

    if (contentType === "faqs") {
      generateSystemPrompt = `You are creating FAQs about addiction treatment in ${stateName}. Output ONLY valid JSON array:
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
Create exactly 10 FAQs. Assign sort_order 1-10.`;
      generateUserPrompt = `Create 10 FAQs for ${stateName} from this research:\n\n${researchContent}\n\nSources: ${citations.join(", ")}\n\nOutput ONLY JSON array, no markdown.`;
    } else {
      generateSystemPrompt = `You are creating addiction treatment resources for ${stateName}. Output ONLY valid JSON array:
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
Create 8-12 verified resources. First resource MUST be SAMHSA National Helpline with is_nationwide: true.`;
      generateUserPrompt = `Create resources for ${stateName} from this research:\n\n${researchContent}\n\nOutput ONLY JSON array, no markdown.`;
    }

    const generateResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: generateSystemPrompt },
          { role: "user", content: generateUserPrompt },
        ],
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error("Lovable AI error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Generation failed: ${generateResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generateData = await generateResponse.json();
    const content = generateData.choices?.[0]?.message?.content || "";

    // Parse JSON
    let parsedContent;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to parse generated content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Save to database
    const tableName = contentType === "faqs" ? "faqs" : "free_resources";
    
    // First, check if content already exists for this state
    const { data: existing } = await supabase
      .from(tableName)
      .select("id")
      .eq("state_id", stateId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`${stateName} already has ${contentType}. Skipping insert.`);
      return new Response(
        JSON.stringify({
          success: true,
          message: `${stateName} already has ${contentType}`,
          skipped: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert new content
    const { data: insertedData, error: insertError } = await supabase
      .from(tableName)
      .insert(parsedContent)
      .select();

    if (insertError) {
      console.error(`Failed to insert ${contentType}:`, insertError);
      return new Response(
        JSON.stringify({ success: false, error: `Database insert failed: ${insertError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully saved ${parsedContent.length} ${contentType} for ${stateName}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          stateName,
          stateId,
          contentType,
          count: parsedContent.length,
          timestamp: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate state content error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
