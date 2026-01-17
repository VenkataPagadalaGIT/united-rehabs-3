import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QARequest {
  stateName: string;
  contentType: "statistics" | "resources" | "faqs" | "seo";
  generatedContent: unknown;
  originalResearch: string;
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
    const rateLimitResult = await checkRateLimit(authResult.userId, "qa-review");
    if (!rateLimitResult.allowed && rateLimitResult.error) {
      return rateLimitResult.error;
    }

    const { stateName, contentType, generatedContent, originalResearch } = await req.json() as QARequest;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Lovable API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a quality assurance specialist reviewing content about addiction treatment in ${stateName}. 
Your job is to:
1. Verify the content is accurate and matches the research data
2. Check for any harmful or misleading information
3. Ensure the content is appropriate for a healthcare website
4. Score the quality from 0-100
5. Flag any issues that need human review

Output ONLY valid JSON:
{
  "approved": boolean,
  "score": number (0-100),
  "issues": ["list of issues found"] or [],
  "suggestions": ["list of improvements"] or [],
  "flaggedForHumanReview": boolean,
  "reviewNotes": "brief explanation of your review"
}`;

    const userPrompt = `Review this ${contentType} content for ${stateName}:

GENERATED CONTENT:
${JSON.stringify(generatedContent, null, 2)}

ORIGINAL RESEARCH:
${originalResearch}

Verify accuracy, appropriateness, and quality. Output ONLY the JSON review object.`;

    console.log(`QA reviewing ${contentType} for ${stateName}...`);

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

    let review;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      review = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse QA response:", content);
      // Default to flagging for human review if we can't parse
      review = {
        approved: false,
        score: 50,
        issues: ["Could not automatically review content"],
        suggestions: [],
        flaggedForHumanReview: true,
        reviewNotes: "Automatic review failed - requires human review",
      };
    }

    console.log(`QA complete for ${stateName} - ${contentType}: Score ${review.score}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          stateName,
          contentType,
          review,
          timestamp: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("QA review error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
