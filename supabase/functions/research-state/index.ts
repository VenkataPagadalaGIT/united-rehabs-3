import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResearchRequest {
  stateName: string;
  stateAbbreviation: string;
  researchType: "statistics" | "resources" | "faqs" | "seo";
  year?: number; // For statistics, specify the year to research
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stateName, stateAbbreviation, researchType, year } = await req.json() as ResearchRequest;

    const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Perplexity API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build research query based on type
    let query = "";
    let systemPrompt = "";

    switch (researchType) {
      case "statistics":
        const targetYear = year || new Date().getFullYear();
        query = `What are the addiction and substance abuse statistics for ${stateName} (${stateAbbreviation}) for the year ${targetYear}? Include: 
        - Total overdose deaths in ${targetYear}
        - Opioid-related deaths in ${targetYear}
        - Drug abuse rate percentage in ${targetYear}
        - Alcohol abuse rate percentage in ${targetYear}
        - Number of treatment facilities in ${targetYear}
        - Treatment admission numbers in ${targetYear}
        - Recovery rates if available for ${targetYear}
        If ${targetYear} data is not available, provide the closest available year's data and note the actual year.
        Provide specific numbers with sources.`;
        systemPrompt = `You are a research assistant specializing in addiction and public health statistics. Focus on finding data for ${targetYear} specifically. Provide accurate, cited data.`;
        break;

      case "resources":
        query = `What are the best free addiction treatment resources and helplines available in ${stateName}? Include:
        - State-run treatment programs
        - Free or low-cost rehab centers
        - Crisis hotlines
        - Support groups (AA, NA meetings)
        - Mental health resources
        - Government assistance programs
        Provide names, phone numbers, and websites where available.`;
        systemPrompt = "You are a healthcare resource specialist. Provide accurate contact information for addiction treatment resources.";
        break;

      case "faqs":
        query = `What are the most common questions people ask about addiction treatment and rehab in ${stateName}? Consider:
        - Insurance coverage for treatment
        - State-specific laws about treatment
        - How to find quality treatment centers
        - Medicaid/Medicare coverage
        - Court-ordered treatment options
        - Family intervention resources
        Provide 8-10 relevant FAQs with detailed answers.`;
        systemPrompt = "You are an addiction treatment expert. Provide helpful, accurate answers to common questions about treatment in this state.";
        break;

      case "seo":
        query = `What are the key facts about ${stateName}'s addiction crisis that someone searching for "rehab centers in ${stateName}" or "drug treatment ${stateAbbreviation}" would need to know? Include:
        - Unique challenges this state faces
        - Types of addiction most prevalent
        - Notable treatment options or programs
        - State regulations affecting treatment
        Provide information that would help someone choose treatment in this state.`;
        systemPrompt = "You are an SEO content specialist focused on healthcare. Provide accurate, helpful information for people seeking treatment.";
        break;
    }

    console.log(`Researching ${researchType} for ${stateName}...`);

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        search_recency_filter: "year",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Perplexity API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];

    console.log(`Research complete for ${stateName} - ${researchType}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          stateName,
          stateAbbreviation,
          researchType,
          content,
          citations,
          timestamp: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Research error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
