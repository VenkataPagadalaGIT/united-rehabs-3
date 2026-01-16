import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResearchRequest {
  stateName: string;
  stateAbbreviation: string;
  researchType: "statistics" | "substance_statistics" | "resources" | "faqs" | "seo";
  year?: number;
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

    let query = "";
    let systemPrompt = "";
    const targetYear = year || new Date().getFullYear();

    switch (researchType) {
      case "statistics":
        query = `Find official addiction and substance abuse statistics for ${stateName} (${stateAbbreviation}) for the year ${targetYear}. 
        Search for CDC WONDER database, SAMHSA NSDUH data, state health department reports.
        I need these EXACT metrics for ${targetYear}:
        1. Total drug overdose deaths in ${targetYear}
        2. Opioid-involved overdose deaths in ${targetYear}
        3. Drug abuse rate (% of population 12+) in ${targetYear}
        4. Alcohol abuse rate (% of population 12+) in ${targetYear}
        5. Estimated total people with substance use disorders in ${targetYear}
        6. Number of treatment facilities in ${targetYear}
        7. Treatment admissions in ${targetYear}
        8. Age breakdown of affected population (12-17, 18-25, 26-34, 35+) if available
        9. Recovery rate and relapse rate if available
        10. Economic cost of addiction in billions if available
        
        Provide specific numbers. If ${targetYear} data unavailable, use closest year and note it.
        Include CDC, SAMHSA, and state health department as sources.`;
        systemPrompt = `You are a public health data researcher. Find exact statistics for ${stateName} for ${targetYear}. Use CDC, SAMHSA NSDUH, state health department sources. Provide specific numbers.`;
        break;

      case "substance_statistics":
        query = `Find detailed substance-specific statistics for ${stateName} (${stateAbbreviation}) for year ${targetYear}.
        Search SAMHSA NSDUH, CDC, DEA reports.
        
        ALCOHOL DATA for ${targetYear}:
        - Alcohol use past month (%)
        - Binge drinking (%)
        - Heavy alcohol use (%)
        - Alcohol use disorder count
        - Alcohol-related deaths
        
        OPIOID DATA for ${targetYear}:
        - Opioid use disorder count
        - Opioid misuse past year
        - Prescription opioid misuse
        - Heroin use
        - Fentanyl deaths
        - Fentanyl-involved overdoses
        
        MARIJUANA DATA for ${targetYear}:
        - Marijuana use past month
        - Marijuana use past year
        - Marijuana use disorder count
        
        COCAINE DATA for ${targetYear}:
        - Cocaine use past year
        - Cocaine use disorder
        - Cocaine-related deaths
        
        METHAMPHETAMINE DATA for ${targetYear}:
        - Meth use past year
        - Meth use disorder
        - Meth-related deaths
        
        PRESCRIPTION DRUG DATA for ${targetYear}:
        - Stimulant misuse
        - Sedative misuse
        - Tranquilizer misuse
        
        TREATMENT DATA for ${targetYear}:
        - Treatment received
        - Treatment needed not received
        - MAT recipients
        
        MENTAL HEALTH CO-OCCURRENCE:
        - Mental illness with SUD
        - Serious mental illness with SUD
        
        Provide specific numbers with sources.`;
        systemPrompt = `You are a substance abuse epidemiologist. Provide detailed substance-specific data for ${stateName} for ${targetYear}. Use SAMHSA NSDUH and CDC data.`;
        break;

      case "resources":
        query = `What are the comprehensive free addiction treatment resources in ${stateName}? Include:
        1. SAMHSA National Helpline (1-800-662-4357)
        2. ${stateName} state drug and alcohol helpline
        3. State-funded treatment centers
        4. Free or sliding-scale rehab programs
        5. ${stateName} Medicaid addiction treatment coverage
        6. Veterans addiction resources in ${stateName}
        7. Local AA and NA meeting directories
        8. Crisis text lines and hotlines
        9. Narcan/Naloxone distribution programs
        10. Sober living homes with sliding scale
        
        Provide exact names, phone numbers, websites.`;
        systemPrompt = "You are a healthcare navigator specializing in free addiction resources. Provide verified contact information.";
        break;

      case "faqs":
        query = `What are the most important questions about addiction treatment in ${stateName}? Create FAQs about:
        1. Does ${stateName} Medicaid cover rehab?
        2. What are ${stateName} drug laws and consequences?
        3. How do I find free treatment in ${stateName}?
        4. What are the best rehab centers in ${stateName}?
        5. How long is rehab typically in ${stateName}?
        6. Can I be forced into treatment in ${stateName}?
        7. What insurance is accepted for treatment?
        8. Are there gender-specific programs?
        9. What about treatment for teens?
        10. How do I stage an intervention?
        
        Provide detailed, state-specific answers.`;
        systemPrompt = "You are an addiction treatment counselor familiar with ${stateName} laws and resources. Provide accurate, helpful answers.";
        break;

      case "seo":
        query = `What makes ${stateName} unique for addiction treatment? Include:
        1. ${stateName}'s addiction crisis - key statistics
        2. Types of substances most abused in ${stateName}
        3. Notable treatment centers and programs
        4. State regulations affecting treatment
        5. ${stateName}'s approach to harm reduction
        6. Success stories or notable programs
        7. Geographic challenges (rural vs urban)
        8. Insurance landscape in ${stateName}
        
        Focus on what someone searching for "${stateName} rehab centers" needs to know.`;
        systemPrompt = "You are a healthcare SEO specialist. Provide accurate, helpful content for people seeking treatment in ${stateName}.";
        break;
    }

    console.log(`Researching ${researchType} for ${stateName} (${targetYear})...`);

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

    console.log(`Research complete for ${stateName} - ${researchType} (${targetYear})`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          stateName,
          stateAbbreviation,
          researchType,
          year: targetYear,
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
