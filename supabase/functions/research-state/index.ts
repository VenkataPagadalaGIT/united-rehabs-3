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
    const currentYear = new Date().getFullYear();
    const isFutureYear = targetYear > currentYear;
    const isRecentYear = targetYear >= currentYear - 1;

    switch (researchType) {
      case "statistics":
        // Enhanced query targeting official federal sources
        query = `Search for official ${stateName} (${stateAbbreviation}) addiction and substance abuse statistics for year ${targetYear}.

PRIORITY DATA SOURCES (in order):
1. CDC WONDER Database - Drug overdose deaths by state and year
2. SAMHSA NSDUH (National Survey on Drug Use and Health) - State-level estimates
3. SAMHSA TEDS (Treatment Episode Data Set) - Treatment admissions
4. ${stateName} Department of Health official reports
5. NIH/NIDA state-specific data
6. DEA state drug threat assessments

REQUIRED METRICS FOR ${stateName} ${targetYear}:
- Total drug overdose deaths (from CDC WONDER)
- Opioid-involved overdose deaths (from CDC WONDER)
- Drug abuse rate as percentage of population 12+ (from NSDUH)
- Alcohol abuse rate as percentage of population 12+ (from NSDUH)
- Total people with substance use disorders (from NSDUH)
- Number of SAMHSA-certified treatment facilities
- Number of treatment admissions (from TEDS)
- Breakdown by age groups: 12-17, 18-25, 26-34, 35+ (from NSDUH)
- Recovery rate percentage if available
- Relapse rate percentage if available
- Economic cost of addiction in billions (from state reports)

${isFutureYear ? `NOTE: ${targetYear} is a future year. Use the most recent available data and note the actual data year.` : ''}
${isRecentYear ? `NOTE: ${targetYear} data may not be fully released. Use preliminary data if available or most recent year with complete data.` : ''}

IMPORTANT: Provide EXACT numbers with source citations. If exact ${targetYear} data unavailable, use closest available year and specify which year the data is from.`;

        systemPrompt = `You are a public health data analyst specializing in federal addiction statistics. Extract precise numerical data from CDC, SAMHSA, NSDUH, and state health department sources. Always cite the specific source (e.g., "CDC WONDER 2023", "NSDUH 2022-2023"). Provide actual numbers, not ranges.`;
        break;

      case "substance_statistics":
        query = `Search for detailed substance-specific statistics for ${stateName} (${stateAbbreviation}) for year ${targetYear}.

PRIMARY SOURCES TO SEARCH:
1. SAMHSA NSDUH State Estimates - substance use prevalence
2. CDC NCHS - drug-specific mortality data
3. DEA drug seizure and threat data for ${stateAbbreviation}
4. ${stateName} substance monitoring program data

ALCOHOL DATA REQUIRED:
- Alcohol use past month (% of 12+)
- Binge drinking rate (%)
- Heavy alcohol use (%)
- People with alcohol use disorder (number)
- Alcohol-related deaths (number)

OPIOID DATA REQUIRED:
- People with opioid use disorder (number)
- Opioid misuse past year (number)
- Prescription opioid misuse (number)
- Heroin users (number)
- Fentanyl deaths (number)
- Fentanyl-involved overdoses (number)

MARIJUANA DATA REQUIRED:
- Marijuana use past month (number)
- Marijuana use past year (number)
- Marijuana use disorder (number)

COCAINE DATA REQUIRED:
- Cocaine use past year (number)
- Cocaine use disorder (number)
- Cocaine-related deaths (number)

METHAMPHETAMINE DATA REQUIRED:
- Meth use past year (number)
- Meth use disorder (number)
- Meth-related deaths (number)

PRESCRIPTION DRUG MISUSE:
- Prescription stimulant misuse (number)
- Prescription sedative misuse (number)
- Prescription tranquilizer misuse (number)

TREATMENT DATA:
- People who received treatment (number)
- People needing but not receiving treatment (number)
- MAT (Medication-Assisted Treatment) recipients (number)

MENTAL HEALTH CO-OCCURRENCE:
- People with mental illness and SUD (number)
- People with serious mental illness and SUD (number)

${isFutureYear ? `NOTE: ${targetYear} is a future year. Use most recent available data and note actual year.` : ''}

Provide exact numbers from NSDUH state estimates. Include source year if different from ${targetYear}.`;

        systemPrompt = `You are a substance abuse epidemiologist. Extract precise substance-specific data from SAMHSA NSDUH state-level estimates. Provide actual numbers, not ranges or percentages alone. Cite data year and source.`;
        break;

      case "resources":
        query = `Find comprehensive FREE addiction treatment and recovery resources available in ${stateName}:

FEDERAL RESOURCES:
1. SAMHSA National Helpline: 1-800-662-4357
2. SAMHSA Treatment Locator results for ${stateName}
3. Veterans Affairs addiction services in ${stateName}
4. Medicare/Medicaid addiction treatment coverage in ${stateName}

STATE RESOURCES:
1. ${stateName} state substance abuse helpline
2. ${stateName} Department of Health addiction services
3. State-funded treatment programs
4. ${stateName} Medicaid addiction treatment benefits
5. State naloxone distribution programs

LOCAL RESOURCES:
1. County mental health centers with addiction services
2. Free community health centers offering addiction treatment
3. Faith-based recovery programs
4. Sober living homes with sliding scale
5. Free support group meetings (AA, NA, SMART Recovery)

For each resource provide:
- Official name
- Phone number
- Website URL
- Physical address if applicable
- What services they provide
- Whether it's free or sliding scale`;

        systemPrompt = "You are a healthcare navigator specializing in free addiction resources. Verify all contact information is current and accurate. Focus on truly free or government-funded programs.";
        break;

      case "faqs":
        query = `Create comprehensive FAQs about addiction treatment specific to ${stateName}:

INSURANCE & COST QUESTIONS:
1. Does ${stateName} Medicaid cover addiction treatment?
2. What insurance is accepted at ${stateName} rehab centers?
3. Are there free rehab centers in ${stateName}?
4. What does outpatient treatment cost in ${stateName}?

LEGAL QUESTIONS:
1. What are ${stateName}'s drug possession laws?
2. Can someone be court-ordered to treatment in ${stateName}?
3. Does ${stateName} have Good Samaritan laws for overdoses?
4. What are ${stateName}'s drunk driving penalties?

TREATMENT OPTIONS:
1. What types of rehab programs exist in ${stateName}?
2. How long is inpatient rehab typically in ${stateName}?
3. Are there gender-specific programs in ${stateName}?
4. What about treatment for adolescents in ${stateName}?

GETTING HELP:
1. How do I find a rehab center in ${stateName}?
2. What should I look for in a ${stateName} treatment center?
3. How do I stage an intervention in ${stateName}?
4. What's the first step to getting help in ${stateName}?

Provide detailed, accurate answers specific to ${stateName} laws and programs.`;

        systemPrompt = `You are an addiction treatment counselor and legal expert familiar with ${stateName} laws, regulations, and resources. Provide accurate, state-specific answers with current information.`;
        break;

      case "seo":
        query = `Research ${stateName}'s addiction landscape for SEO content:

CRISIS STATISTICS:
- Current overdose death rate in ${stateName}
- How ${stateName} compares to national averages
- Trending substances in ${stateName}
- ${stateName}'s most affected populations

TREATMENT LANDSCAPE:
- Number of treatment facilities in ${stateName}
- Notable treatment centers in ${stateName}
- ${stateName}'s treatment capacity
- Wait times for treatment in ${stateName}

STATE INITIATIVES:
- ${stateName}'s approach to the opioid crisis
- Harm reduction programs in ${stateName}
- State funding for addiction treatment
- Recent legislation affecting treatment

GEOGRAPHIC FACTORS:
- Urban vs rural treatment access in ${stateName}
- Major cities with treatment concentration
- Underserved areas in ${stateName}

UNIQUE ASPECTS:
- What makes ${stateName}'s addiction crisis unique
- Success stories or model programs
- Challenges specific to ${stateName}

Focus on what someone searching "rehab in ${stateName}" or "${stateName} addiction treatment" needs to know.`;

        systemPrompt = `You are a healthcare SEO specialist and public health communicator. Provide accurate, helpful content that addresses search intent for people seeking addiction treatment in ${stateName}.`;
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
        search_domain_filter: [
          "cdc.gov",
          "samhsa.gov",
          "nida.nih.gov",
          "dea.gov",
          ".gov",
        ],
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
