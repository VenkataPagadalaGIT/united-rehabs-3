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

/**
 * PERPLEXITY RESEARCH RULES:
 * 
 * 1. DATA AVAILABILITY BY SOURCE & YEAR:
 *    - SAMHSA TEDS: 1992-present (treatment admissions - OLDEST SOURCE)
 *    - CDC WONDER: 1999-present (overdose deaths, drug-specific mortality)
 *    - SAMHSA NSDUH: 1999-present (reliable from 2002, substance use rates)
 *    - DEA: Varies by report type
 * 
 * 2. YEAR RANGE: 1992-2026
 *    - 1992-1998: Use TEDS data + historical state records, estimate other metrics
 *    - 1999-2001: CDC WONDER available, early NSDUH data
 *    - 2002-present: Full data availability from all sources
 * 
 * 3. NEVER SKIP - ALWAYS RETURN DATA:
 *    - If exact year unavailable, use closest available year
 *    - Always specify actual data year in response
 *    - Estimate using trends if necessary, clearly marked as estimates
 * 
 * 4. REQUIRED FEDERAL SOURCES (in priority order):
 *    - samhsa.gov (TEDS 1992+, NSDUH 1999+, N-SSATS)
 *    - cdc.gov (CDC WONDER 1999+, NCHS)
 *    - nida.nih.gov (NIH/NIDA research data)
 *    - dea.gov (Drug threat assessments)
 *    - State .gov health department sites
 *    - NCBI/PubMed for historical research papers
 * 
 * 5. DATA EXTRACTION RULES:
 *    - MUST return numerical values, not "N/A" or "unavailable"
 *    - If data doesn't exist, extrapolate from adjacent years
 *    - Always cite the actual source and year of data
 */

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
    const isHistorical = targetYear < 2015;
    const isPreCDC = targetYear < 1999; // Before CDC WONDER
    const dataEra = targetYear < 1999 ? "pre-cdc" : targetYear < 2002 ? "early" : targetYear < 2010 ? "mid" : "recent";

    // Base system prompt with strict rules
    const baseRules = `
CRITICAL RULES - YOU MUST FOLLOW:
1. NEVER say "data not available" - always provide numbers
2. If exact ${targetYear} data doesn't exist, use the closest available year and note it
3. For years 1992-1998: Use SAMHSA TEDS for treatment data, historical state health records, and research papers
4. For years 1999-2001: Use CDC WONDER + early NSDUH + TEDS
5. For years 2002+: Full data available from NSDUH, CDC WONDER, TEDS
6. ALWAYS cite the actual source and year of each data point
7. Return EXACT NUMBERS, not ranges or "approximately"
8. If you must estimate, mark it clearly as "[ESTIMATED from YEAR data]"
9. For pre-1999 overdose deaths, search state vital statistics, NCHS reports, and published studies
`;

    switch (researchType) {
      case "statistics":
        query = `MANDATORY DATA REQUEST for ${stateName} (${stateAbbreviation}) - Year ${targetYear}

YOU MUST PROVIDE ALL OF THESE METRICS - NO EXCEPTIONS:

${isPreCDC ? `
*** PRE-1999 DATA INSTRUCTIONS ***
For ${targetYear}, CDC WONDER is NOT available. Use these alternative sources:
- SAMHSA TEDS (Treatment Episode Data Set) - available from 1992
- State health department vital statistics archives
- NCHS mortality data files
- Published research papers and NIDA archives
- National Drug Control Strategy reports from that era
` : `
PRIMARY SOURCE: CDC WONDER Multiple Cause of Death Database
- Total drug overdose deaths in ${stateName} for ${targetYear} (ICD-10 codes X40-X44, X60-X64, X85, Y10-Y14)
- Opioid-involved deaths (T40.0-T40.4, T40.6)
${isHistorical ? `NOTE: For ${targetYear}, search CDC WONDER archives for ${stateAbbreviation} mortality data` : ''}
`}

PRIMARY SOURCE: SAMHSA NSDUH State Estimates
- Illicit drug use past month (% of population 12+) for ${stateName}
- Alcohol use disorder past year (% of population 12+)
- Any substance use disorder past year (number of people)
- Age breakdown: 12-17, 18-25, 26-34, 35+ with SUD
${dataEra === "pre-cdc" || dataEra === "early" ? `For ${targetYear}, use NSDUH data from 2002-2003 as baseline, adjust using historical treatment admission trends from TEDS` : ''}

PRIMARY SOURCE: SAMHSA TEDS (1992-present - KEY SOURCE FOR PRE-1999)
- Total SAMHSA-certified treatment facilities in ${stateName}
- Inpatient facilities count
- Outpatient facilities count  
- Treatment admissions for ${targetYear} (TEDS has this from 1992!)

ADDITIONAL METRICS TO FIND:
- Recovery rate (%) if any state or federal data exists
- Relapse rate (%) if tracked
- Economic cost of addiction in ${stateName} (billions) - estimate based on prevalence if needed

${isFutureYear ? `FUTURE YEAR HANDLING: ${targetYear} is future. Use latest available data (likely 2022 or 2023) and note the actual year.` : ''}
${isPreCDC ? `PRE-1999 YEAR HANDLING: ${targetYear} is before CDC WONDER. Use SAMHSA TEDS, state vital stats, NCHS reports, and extrapolate from 1999 data using trends. TEDS treatment admissions are REQUIRED as they exist from 1992.` : ''}
${isHistorical && !isPreCDC ? `HISTORICAL YEAR HANDLING: ${targetYear} is historical. Search CDC WONDER for mortality data. For NSDUH, use 2002 baseline adjusted for trends.` : ''}

RESPONSE FORMAT: Provide each metric with its value, source, and actual data year.`;

        systemPrompt = `You are a public health data analyst with access to federal databases and historical archives. ${baseRules}

For ${stateAbbreviation} ${targetYear}:
${isPreCDC ? `
- SAMHSA TEDS is your PRIMARY source (available 1992-present)
- Use state health department historical records
- Use NCHS mortality publications
- Search PubMed/NCBI for research papers from that era
- Extrapolate from 1999 CDC WONDER data using TEDS trends
` : `
- Use CDC WONDER for mortality data (available 1999-present)
- Use SAMHSA NSDUH for prevalence (reliable from 2002, exists from 1999)
- Use SAMHSA TEDS/N-SSATS for treatment data (available 1992-present)
`}

YOU MUST RETURN NUMERICAL DATA FOR EVERY METRIC. If exact year unavailable, use closest year and note it.`;
        break;

      case "substance_statistics":
        query = `MANDATORY SUBSTANCE-SPECIFIC DATA for ${stateName} (${stateAbbreviation}) - Year ${targetYear}

${isPreCDC ? `
*** PRE-1999 DATA INSTRUCTIONS ***
For ${targetYear}, use SAMHSA TEDS by primary substance, state health records, DAWN (Drug Abuse Warning Network), and published research.
Many specific substance metrics may need estimation from national trends applied to state population.
` : ''}

YOU MUST PROVIDE ALL CATEGORIES - NO SKIPPING:

ALCOHOL (Source: NSDUH State Estimates, CDC BRFSS, ${isPreCDC ? 'TEDS alcohol admissions' : ''})
- Alcohol use past month (% of 12+): REQUIRED
- Binge drinking rate (%): REQUIRED
- Heavy alcohol use (%): REQUIRED
- Alcohol use disorder count: REQUIRED
- Alcohol-related deaths: REQUIRED ${isPreCDC ? '(use NCHS/state vital stats)' : '(from CDC WONDER)'}

OPIOIDS (Source: NSDUH, ${isPreCDC ? 'TEDS opioid admissions, DAWN' : 'CDC WONDER'})
- Opioid use disorder count: REQUIRED
- Opioid misuse past year: REQUIRED
- Prescription opioid misuse: REQUIRED
- Heroin use count: REQUIRED (TEDS has heroin admissions from 1992!)
- Fentanyl deaths: ${targetYear < 2013 ? '0 (fentanyl crisis began ~2013, use 0 for earlier years)' : 'REQUIRED (from CDC WONDER)'}
- Fentanyl-involved overdoses: ${targetYear < 2013 ? '0' : 'REQUIRED'}

MARIJUANA (Source: NSDUH, ${isPreCDC ? 'TEDS marijuana admissions' : ''})
- Past month use: REQUIRED
- Past year use: REQUIRED
- Marijuana use disorder: REQUIRED

COCAINE (Source: NSDUH, ${isPreCDC ? 'TEDS cocaine admissions (prominent in 1992-1999!)' : 'CDC WONDER'})
- Cocaine use past year: REQUIRED
- Cocaine use disorder: REQUIRED
- Cocaine-related deaths: REQUIRED ${isPreCDC ? '(crack/cocaine epidemic era - use state records)' : ''}

METHAMPHETAMINE (Source: NSDUH, ${isPreCDC ? 'TEDS stimulant admissions' : 'CDC WONDER'})
- Meth use past year: REQUIRED
- Meth use disorder: REQUIRED
- Meth-related deaths: REQUIRED

PRESCRIPTION DRUGS (Source: NSDUH, ${isPreCDC ? 'DEA ARCOS data' : ''})
- Stimulant misuse: REQUIRED
- Sedative misuse: REQUIRED
- Tranquilizer misuse: REQUIRED

TREATMENT (Source: TEDS - available from 1992!)
- Received treatment: REQUIRED (TEDS has this!)
- Needed but didn't receive: REQUIRED (estimate from treatment gap)
- MAT recipients: ${targetYear < 2000 ? 'N/A or 0 (MAT tracking began ~2000)' : 'REQUIRED'}

MENTAL HEALTH CO-OCCURRENCE (Source: NSDUH, ${isPreCDC ? 'estimate from national studies' : ''})
- Mental illness with SUD: REQUIRED
- Serious mental illness with SUD: REQUIRED

${isPreCDC ? `PRE-1999 NOTE: TEDS by substance is your primary source. Use DAWN for ER data. Fentanyl=0. Cocaine was prominent. Estimate prevalence from treatment admission rates applied to population.` : ''}
${isHistorical && !isPreCDC ? `HISTORICAL NOTE: For ${targetYear}, fentanyl data may not exist (tracking began ~2013). Use zero or earliest available.` : ''}
${isFutureYear ? `FUTURE NOTE: Use most recent available year and note it.` : ''}`;

        systemPrompt = `You are a substance abuse epidemiologist specializing in NSDUH, TEDS, and CDC data extraction. ${baseRules}

DATA AVAILABILITY BY SUBSTANCE AND YEAR:
${isPreCDC ? `
FOR 1992-1998:
- SAMHSA TEDS: Available! Has treatment admissions BY SUBSTANCE from 1992
- DAWN (Drug Abuse Warning Network): ER visits by substance
- State vital statistics: Drug-related mortality
- National Household Survey on Drug Abuse (pre-NSDUH): Some state estimates
- Cocaine/crack was at peak - TEDS cocaine admissions are key metric
- Heroin admissions tracked in TEDS
- Estimate prevalence by applying national rates to state population, adjusted by TEDS admission rates
` : `
- Alcohol, marijuana, cocaine, heroin: NSDUH from 1999 (reliable 2002+)
- Methamphetamine: NSDUH from 2002
- Fentanyl-specific: CDC WONDER from 2013
- Prescription drugs: NSDUH from 2002
`}

NEVER return empty or N/A. Always provide a number with source citation.`;
        break;

      case "resources":
        query = `Find ALL free addiction treatment resources in ${stateName}:

FEDERAL RESOURCES (MUST INCLUDE):
1. SAMHSA National Helpline: 1-800-662-4357 (always include)
2. SAMHSA Treatment Locator facilities in ${stateAbbreviation}
3. VA addiction services locations in ${stateName}
4. Federally Qualified Health Centers with SUD treatment

STATE RESOURCES (MUST INCLUDE):
1. ${stateName} state substance abuse agency hotline
2. ${stateName} Department of Health addiction services
3. State-funded treatment program locations
4. ${stateName} Medicaid addiction treatment info
5. State naloxone/Narcan access programs

LOCAL RESOURCES TO FIND:
1. County health departments with addiction services
2. Free/sliding scale community health centers
3. Faith-based recovery programs (Salvation Army, etc.)
4. Free support groups: AA, NA, SMART Recovery meeting locations
5. Sober living homes with financial assistance

FOR EACH RESOURCE PROVIDE:
- Name (official)
- Phone number (verified)
- Website URL
- Address (if physical location)
- Services offered
- Cost (free/sliding scale/Medicaid)`;

        systemPrompt = `You are a healthcare navigator for ${stateName}. CRITICAL: You MUST return at least 10 resources. Include the SAMHSA helpline and at least 3 state-specific resources. Verify contact info is current. ${baseRules}`;
        break;

      case "faqs":
        query = `Create 15+ comprehensive FAQs about addiction treatment in ${stateName}:

INSURANCE & COST (4+ questions):
- ${stateName} Medicaid coverage for addiction treatment
- Private insurance requirements in ${stateName}
- Free rehab options in ${stateName}
- Cost ranges for different treatment types

LEGAL (4+ questions):
- ${stateName} drug possession laws and penalties
- Court-ordered treatment in ${stateName}
- ${stateName} Good Samaritan overdose laws
- ${stateName} DUI/DWI penalties and treatment requirements

TREATMENT OPTIONS (4+ questions):
- Types of rehab programs in ${stateName}
- Duration of typical programs
- Specialized programs (gender, age, profession)
- Medication-assisted treatment availability

GETTING HELP (4+ questions):
- How to find a rehab center
- What to expect during intake
- How to help a loved one
- Emergency resources and crisis lines

Each answer must be detailed (100+ words) and specific to ${stateName}.`;

        systemPrompt = `You are an addiction treatment counselor and legal expert in ${stateName}. ${baseRules}

YOU MUST provide at least 15 FAQs with detailed, ${stateName}-specific answers. Include current laws, insurance info, and verified resources.`;
        break;

      case "seo":
        query = `Research comprehensive ${stateName} addiction landscape for SEO content:

STATISTICS TO INCLUDE:
- Current overdose death rate in ${stateName}
- Comparison to national average
- Trending substances
- Most affected demographics

TREATMENT LANDSCAPE:
- Number of treatment facilities
- Geographic distribution
- Notable/top-rated centers
- Wait times if known

STATE INITIATIVES:
- Current opioid crisis response
- Harm reduction programs
- Recent legislation
- Funding information

UNIQUE FACTORS:
- What makes ${stateName}'s crisis unique
- Urban vs rural differences
- Border/geographic considerations
- Success stories

Create compelling SEO content that helps people searching for "${stateName} rehab" or "${stateName} addiction treatment".`;

        systemPrompt = `You are an SEO expert and public health communicator. Create helpful, accurate content that ranks well and genuinely helps people seeking addiction treatment in ${stateName}. ${baseRules}`;
        break;
    }

    console.log(`Researching ${researchType} for ${stateName} (${targetYear})...`);

    // Add timeout to prevent edge function from hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 second timeout

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
          // Use appropriate recency filter based on year
          search_recency_filter: isFutureYear || targetYear >= currentYear - 2 ? "year" : undefined,
          // Prioritize federal .gov sources
          search_domain_filter: [
            "cdc.gov",
            "wonder.cdc.gov",
            "samhsa.gov",
            "nsduhweb.rti.org",
            "nida.nih.gov",
            "dea.gov",
            ".gov",
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
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const err = fetchError as Error;
      if (err.name === 'AbortError') {
        console.error(`Perplexity API timeout for ${stateName} - ${researchType} (${targetYear})`);
        return new Response(
          JSON.stringify({ success: false, error: "Request timed out. The Perplexity API took too long to respond." }),
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
