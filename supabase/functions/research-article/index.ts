import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResearchRequest {
  topic: string;
  focusAreas?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, focusAreas } = await req.json() as ResearchRequest;

    const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Perplexity API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const focusAreasText = focusAreas?.length 
      ? `Focus particularly on: ${focusAreas.join(", ")}` 
      : "";

    const query = `Comprehensive medical research on "${topic}" for a health education article:

RESEARCH OBJECTIVES:
${focusAreasText}

REQUIRED DATA POINTS:

1. EPIDEMIOLOGY & STATISTICS (latest available):
   - Prevalence rates (US and global)
   - Demographics most affected (age, gender, socioeconomic)
   - Mortality and morbidity statistics
   - Trends over the past 10 years
   - Economic burden/costs

2. MEDICAL DEFINITION & PATHOPHYSIOLOGY:
   - Clinical definition (DSM-5/ICD-11 criteria if applicable)
   - Biological mechanisms
   - How it affects the brain and body
   - Disease progression stages

3. RISK FACTORS:
   - Genetic factors
   - Environmental factors
   - Co-occurring conditions
   - Behavioral risk factors

4. SIGNS & SYMPTOMS:
   - Early warning signs
   - Physical symptoms
   - Psychological symptoms
   - Behavioral indicators
   - Criteria for diagnosis

5. TREATMENT OPTIONS:
   - Evidence-based treatments
   - Medications (FDA-approved, off-label)
   - Behavioral therapies
   - Emerging treatments
   - Treatment success rates

6. PREVENTION:
   - Primary prevention strategies
   - Harm reduction approaches
   - Screening recommendations
   - Protective factors

7. RESOURCES & SUPPORT:
   - National organizations
   - Hotlines and crisis resources
   - Support groups
   - Where to seek help

8. LATEST RESEARCH:
   - Recent breakthroughs
   - Clinical trials
   - New understanding
   - Future directions

SOURCES TO PRIORITIZE:
- NIH/NIDA/NIAAA research
- CDC data and reports
- SAMHSA resources
- Peer-reviewed journals (JAMA, NEJM, Lancet)
- Professional medical associations (AMA, APA)
- WHO data

Provide detailed, factual information with specific numbers and citations.`;

    const systemPrompt = `You are a medical researcher and public health expert creating content for a comprehensive health education article about "${topic}".

CRITICAL GUIDELINES:
1. Provide EXACT statistics with sources and years
2. Use medical terminology but explain it clearly
3. Cite peer-reviewed research and authoritative sources
4. Include both US and global perspectives
5. Present balanced, evidence-based information
6. Include latest research from 2023-2024 when available
7. Never provide medical advice - focus on education and encourage seeking professional help
8. Be compassionate and non-stigmatizing in language

Your research will be used to create a definitive, medically-reviewed article that helps people understand this health topic.`;

    console.log(`Researching article topic: ${topic}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
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
          search_domain_filter: [
            "nih.gov",
            "nida.nih.gov",
            "niaaa.nih.gov",
            "cdc.gov",
            "samhsa.gov",
            "who.int",
            "ncbi.nlm.nih.gov",
            "jamanetwork.com",
            "thelancet.com",
            "nejm.org",
            "psychiatry.org",
            "mayoclinic.org",
            "hopkinsmedicine.org",
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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

      console.log(`Research complete for: ${topic}`);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            topic,
            content,
            citations,
            timestamp: new Date().toISOString(),
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const err = fetchError as Error;
      if (err.name === 'AbortError') {
        console.error(`Perplexity API timeout for ${topic}`);
        return new Response(
          JSON.stringify({ success: false, error: "Request timed out" }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Research error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
