import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  stateName: string;
  stateAbbreviation: string;
  contentType: "statistics" | "resources" | "faqs" | "seo";
  researchData: string;
  citations: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stateName, stateAbbreviation, contentType, researchData, citations } = await req.json() as GenerateRequest;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Lovable API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (contentType) {
      case "statistics":
        systemPrompt = `You are a data analyst creating structured addiction statistics for ${stateName}. Output ONLY valid JSON matching this exact structure:
{
  "state_id": "${stateAbbreviation.toLowerCase()}",
  "state_name": "${stateName}",
  "year": 2024,
  "total_affected": number or null,
  "overdose_deaths": number or null,
  "opioid_deaths": number or null,
  "drug_abuse_rate": number (percentage) or null,
  "alcohol_abuse_rate": number (percentage) or null,
  "total_treatment_centers": number or null,
  "treatment_admissions": number or null,
  "recovery_rate": number (percentage) or null,
  "data_source": "source name",
  "source_url": "url if available"
}`;
        userPrompt = `Based on this research data, extract and structure the statistics for ${stateName}:\n\n${researchData}\n\nCitations: ${citations.join(", ")}\n\nOutput ONLY the JSON object, no markdown or explanation.`;
        break;

      case "resources":
        systemPrompt = `You are creating a list of free addiction treatment resources for ${stateName}. Output ONLY valid JSON as an array:
[
  {
    "title": "Resource Name",
    "description": "Brief description",
    "resource_type": "hotline" | "treatment_center" | "support_group" | "government_program",
    "phone": "phone number or null",
    "website": "url or null",
    "address": "address or null",
    "is_free": true,
    "is_nationwide": false,
    "state_id": "${stateAbbreviation.toLowerCase()}"
  }
]`;
        userPrompt = `Based on this research, create structured resource entries for ${stateName}:\n\n${researchData}\n\nOutput ONLY the JSON array, no markdown.`;
        break;

      case "faqs":
        systemPrompt = `You are creating FAQs about addiction treatment in ${stateName}. Output ONLY valid JSON as an array:
[
  {
    "question": "Question text?",
    "answer": "Detailed answer with state-specific information.",
    "category": "Insurance" | "Treatment" | "Legal" | "Resources" | "General",
    "state_id": "${stateAbbreviation.toLowerCase()}"
  }
]`;
        userPrompt = `Based on this research, create 8-10 FAQs for ${stateName}:\n\n${researchData}\n\nOutput ONLY the JSON array, no markdown.`;
        break;

      case "seo":
        systemPrompt = `You are an SEO specialist creating page content for ${stateName} rehab listings. Output ONLY valid JSON:
{
  "page_slug": "${stateName.toLowerCase().replace(/ /g, "-")}",
  "page_type": "state",
  "meta_title": "under 60 chars, include '${stateName} Rehab Centers'",
  "meta_description": "under 160 chars, compelling description",
  "h1_title": "main heading for the page",
  "intro_text": "2-3 paragraphs of introductory content about addiction treatment in ${stateName}",
  "og_title": "social sharing title",
  "og_description": "social sharing description",
  "state_id": "${stateAbbreviation.toLowerCase()}"
}`;
        userPrompt = `Based on this research, create SEO content for ${stateName}:\n\n${researchData}\n\nOutput ONLY the JSON object, no markdown.`;
        break;
    }

    console.log(`Generating ${contentType} content for ${stateName}...`);

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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Parse the JSON content
    let parsedContent;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to parse generated content as JSON",
          rawContent: content 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Content generated for ${stateName} - ${contentType}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          stateName,
          stateAbbreviation,
          contentType,
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
