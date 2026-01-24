import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  stateName?: string;
  stateAbbreviation?: string;
  batchAll?: boolean;
  startIndex?: number;
  chunkSize?: number;
  delaySeconds?: number; // Configurable delay between API calls
}

interface YearData {
  overdose_deaths: number | null;
  opioid_deaths: number | null;
  fentanyl_deaths?: number | null;
  confidence?: 'high' | 'medium' | 'low';
  source?: string;
}

interface VerificationResult {
  perplexity: Record<string, YearData> | null;
  gemini: Record<string, YearData> | null;
  merged: Record<string, YearData & { verified: boolean; discrepancy?: string }>;
}

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Parse JSON from AI response
function parseJsonFromResponse(content: string): Record<string, YearData> | null {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

// Verify with Perplexity (web search for CDC WONDER data)
async function verifyWithPerplexity(stateName: string): Promise<Record<string, YearData> | null> {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  if (!PERPLEXITY_API_KEY) {
    console.error('Missing PERPLEXITY_API_KEY');
    return null;
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{
          role: 'system',
          content: `You are a CDC WONDER data expert. Find EXACT drug overdose death counts from official CDC WONDER database, state health department vital statistics, and NCHS mortality data. Provide precise numbers - never estimate.`
        }, {
          role: 'user',
          content: `Find EXACT drug overdose death statistics for ${stateName} from CDC WONDER for years 2015-2023.

Required data points:
1. Total drug overdose deaths (ICD-10 codes X40-X44, X60-X64, X85, Y10-Y14)
2. Opioid-involved deaths (T40.0-T40.4, T40.6)
3. Synthetic opioid/fentanyl deaths (T40.4)

Search CDC WONDER, NCHS, and ${stateName} health department records.

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "2015": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2016": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2017": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2018": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2019": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2020": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2021": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2022": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2023": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL}
}

Use null ONLY for genuinely suppressed or unavailable data (small counts suppressed for privacy).`
        }],
      }),
    });

    if (!response.ok) {
      console.error(`Perplexity error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log(`Perplexity response for ${stateName}:`, content.substring(0, 300));
    
    return parseJsonFromResponse(content);
  } catch (error) {
    console.error(`Perplexity error for ${stateName}:`, error);
    return null;
  }
}

// Cross-verify with Gemini (Lovable AI)
async function verifyWithGemini(stateName: string, perplexityData: Record<string, YearData> | null): Promise<Record<string, YearData> | null> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.error('Missing LOVABLE_API_KEY');
    return null;
  }

  // Include Perplexity data for cross-reference if available
  const crossRefPrompt = perplexityData 
    ? `Cross-reference these Perplexity results and verify/correct: ${JSON.stringify(perplexityData)}`
    : '';

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${LOVABLE_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: `You are a public health data verification expert. Your task is to verify drug overdose death statistics using your training knowledge of CDC WONDER data. Be precise with numbers.`
        }, {
          role: 'user',
          content: `Verify drug overdose death statistics for ${stateName} for years 2015-2023.

${crossRefPrompt}

Based on your knowledge of CDC WONDER and NCHS mortality data, provide the most accurate numbers for:
1. Total drug overdose deaths
2. Opioid-involved deaths  
3. Synthetic opioid/fentanyl deaths

Return ONLY a valid JSON object (no markdown):
{
  "2015": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2016": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2017": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2018": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2019": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2020": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2021": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2022": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL},
  "2023": {"overdose_deaths": NUMBER_OR_NULL, "opioid_deaths": NUMBER_OR_NULL, "fentanyl_deaths": NUMBER_OR_NULL}
}`
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log(`Gemini response for ${stateName}:`, content.substring(0, 300));
    
    return parseJsonFromResponse(content);
  } catch (error) {
    console.error(`Gemini error for ${stateName}:`, error);
    return null;
  }
}

// Merge and validate results from both sources
function mergeAndValidate(
  perplexityData: Record<string, YearData> | null,
  geminiData: Record<string, YearData> | null
): Record<string, YearData & { verified: boolean; discrepancy?: string }> {
  const merged: Record<string, YearData & { verified: boolean; discrepancy?: string }> = {};
  const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
  
  const TOLERANCE = 0.05; // 5% tolerance for matching

  for (const year of years) {
    const pData = perplexityData?.[year];
    const gData = geminiData?.[year];

    // Helper to check if two numbers are within tolerance
    const isClose = (a: number | null, b: number | null): boolean => {
      if (a === null || b === null) return a === b;
      if (a === 0 && b === 0) return true;
      const diff = Math.abs(a - b);
      const avg = (Math.abs(a) + Math.abs(b)) / 2;
      return avg === 0 ? diff === 0 : (diff / avg) <= TOLERANCE;
    };

    // Prefer Perplexity data (web search) but validate with Gemini
    if (pData && gData) {
      const overdoseMatch = isClose(pData.overdose_deaths, gData.overdose_deaths);
      const opioidMatch = isClose(pData.opioid_deaths, gData.opioid_deaths);
      
      merged[year] = {
        overdose_deaths: pData.overdose_deaths ?? gData.overdose_deaths,
        opioid_deaths: pData.opioid_deaths ?? gData.opioid_deaths,
        fentanyl_deaths: pData.fentanyl_deaths ?? gData.fentanyl_deaths,
        verified: overdoseMatch && opioidMatch,
        source: 'dual-verified'
      };

      if (!overdoseMatch || !opioidMatch) {
        merged[year].discrepancy = `Perplexity: OD=${pData.overdose_deaths}, Opioid=${pData.opioid_deaths}; Gemini: OD=${gData.overdose_deaths}, Opioid=${gData.opioid_deaths}`;
        // When discrepancy exists, prefer Perplexity (has web search)
        merged[year].source = 'perplexity-preferred';
      }
    } else if (pData) {
      merged[year] = {
        ...pData,
        verified: false,
        source: 'perplexity-only'
      };
    } else if (gData) {
      merged[year] = {
        ...gData,
        verified: false,
        source: 'gemini-only'
      };
    }
  }

  return merged;
}

// Update database with verified data
async function updateDatabase(
  stateName: string,
  stateAbbreviation: string,
  mergedData: Record<string, YearData & { verified: boolean; discrepancy?: string }>
): Promise<{ recordsUpdated: number; errors: string[] }> {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { recordsUpdated: 0, errors: ['Missing Supabase credentials'] };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const stateId = stateAbbreviation.toLowerCase();
  
  let recordsUpdated = 0;
  const errors: string[] = [];

  for (const [yearStr, data] of Object.entries(mergedData)) {
    const year = parseInt(yearStr);
    
    try {
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (data.overdose_deaths !== null && data.overdose_deaths !== undefined) {
        updates.overdose_deaths = Math.round(data.overdose_deaths);
      }
      if (data.opioid_deaths !== null && data.opioid_deaths !== undefined) {
        updates.opioid_deaths = Math.round(data.opioid_deaths);
      }

      // Set source based on verification status
      if (data.verified) {
        updates.data_source = 'CDC WONDER (Dual-Verified)';
      } else if (data.source === 'perplexity-preferred' || data.source === 'perplexity-only') {
        updates.data_source = 'CDC WONDER (Perplexity)';
      } else {
        updates.data_source = 'CDC WONDER (Gemini)';
      }

      if (Object.keys(updates).length > 1) { // More than just updated_at
        const { error } = await supabase
          .from('state_addiction_statistics')
          .update(updates)
          .eq('state_id', stateId)
          .eq('year', year);

        if (error) {
          errors.push(`${year}: ${error.message}`);
        } else {
          recordsUpdated++;
        }
      }

      // Update substance_statistics for fentanyl
      if (data.fentanyl_deaths !== null && data.fentanyl_deaths !== undefined) {
        await supabase
          .from('substance_statistics')
          .update({ 
            fentanyl_deaths: Math.round(data.fentanyl_deaths),
            updated_at: new Date().toISOString()
          })
          .eq('state_id', stateId)
          .eq('year', year);
      }
    } catch (e) {
      errors.push(`${year}: ${String(e)}`);
    }
  }

  return { recordsUpdated, errors };
}

// Verify a single state using dual sources
async function verifyStateDual(
  stateName: string,
  stateAbbreviation: string,
  delayMs: number = 3000
): Promise<{
  stateName: string;
  result: VerificationResult;
  recordsUpdated: number;
  errors: string[];
}> {
  console.log(`Starting dual verification for ${stateName}...`);

  // Step 1: Get Perplexity data (web search)
  const perplexityData = await verifyWithPerplexity(stateName);
  console.log(`Perplexity complete for ${stateName}, waiting...`);
  
  // Rate limiting delay
  await delay(delayMs);

  // Step 2: Get Gemini data (with cross-reference)
  const geminiData = await verifyWithGemini(stateName, perplexityData);
  console.log(`Gemini complete for ${stateName}`);

  // Step 3: Merge and validate
  const mergedData = mergeAndValidate(perplexityData, geminiData);
  console.log(`Merged data for ${stateName}:`, Object.keys(mergedData).length, 'years');

  // Step 4: Update database
  const { recordsUpdated, errors } = await updateDatabase(stateName, stateAbbreviation, mergedData);

  return {
    stateName,
    result: {
      perplexity: perplexityData,
      gemini: geminiData,
      merged: mergedData
    },
    recordsUpdated,
    errors
  };
}

// US States list
const US_STATES = [
  { name: 'Alabama', abbr: 'AL' }, { name: 'Alaska', abbr: 'AK' }, { name: 'Arizona', abbr: 'AZ' },
  { name: 'Arkansas', abbr: 'AR' }, { name: 'California', abbr: 'CA' }, { name: 'Colorado', abbr: 'CO' },
  { name: 'Connecticut', abbr: 'CT' }, { name: 'Delaware', abbr: 'DE' }, { name: 'Florida', abbr: 'FL' },
  { name: 'Georgia', abbr: 'GA' }, { name: 'Hawaii', abbr: 'HI' }, { name: 'Idaho', abbr: 'ID' },
  { name: 'Illinois', abbr: 'IL' }, { name: 'Indiana', abbr: 'IN' }, { name: 'Iowa', abbr: 'IA' },
  { name: 'Kansas', abbr: 'KS' }, { name: 'Kentucky', abbr: 'KY' }, { name: 'Louisiana', abbr: 'LA' },
  { name: 'Maine', abbr: 'ME' }, { name: 'Maryland', abbr: 'MD' }, { name: 'Massachusetts', abbr: 'MA' },
  { name: 'Michigan', abbr: 'MI' }, { name: 'Minnesota', abbr: 'MN' }, { name: 'Mississippi', abbr: 'MS' },
  { name: 'Missouri', abbr: 'MO' }, { name: 'Montana', abbr: 'MT' }, { name: 'Nebraska', abbr: 'NE' },
  { name: 'Nevada', abbr: 'NV' }, { name: 'New Hampshire', abbr: 'NH' }, { name: 'New Jersey', abbr: 'NJ' },
  { name: 'New Mexico', abbr: 'NM' }, { name: 'New York', abbr: 'NY' }, { name: 'North Carolina', abbr: 'NC' },
  { name: 'North Dakota', abbr: 'ND' }, { name: 'Ohio', abbr: 'OH' }, { name: 'Oklahoma', abbr: 'OK' },
  { name: 'Oregon', abbr: 'OR' }, { name: 'Pennsylvania', abbr: 'PA' }, { name: 'Rhode Island', abbr: 'RI' },
  { name: 'South Carolina', abbr: 'SC' }, { name: 'South Dakota', abbr: 'SD' }, { name: 'Tennessee', abbr: 'TN' },
  { name: 'Texas', abbr: 'TX' }, { name: 'Utah', abbr: 'UT' }, { name: 'Vermont', abbr: 'VT' },
  { name: 'Virginia', abbr: 'VA' }, { name: 'Washington', abbr: 'WA' }, { name: 'West Virginia', abbr: 'WV' },
  { name: 'Wisconsin', abbr: 'WI' }, { name: 'Wyoming', abbr: 'WY' }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: VerifyRequest = await req.json();
    const delayMs = (body.delaySeconds || 3) * 1000; // Default 3 seconds between API calls
    
    // BATCH MODE
    if (body.batchAll) {
      const startIndex = body.startIndex || 0;
      const chunkSize = body.chunkSize || 2; // Process 2 states at a time (slower but more accurate)
      const endIndex = Math.min(startIndex + chunkSize, US_STATES.length);
      const statesToProcess = US_STATES.slice(startIndex, endIndex);
      
      console.log(`Dual-verifying states ${startIndex + 1} to ${endIndex}...`);
      
      const results: any[] = [];
      let totalRecords = 0;
      const allErrors: string[] = [];

      for (const state of statesToProcess) {
        try {
          const stateResult = await verifyStateDual(state.name, state.abbr, delayMs);
          
          const verifiedYears = Object.entries(stateResult.result.merged)
            .filter(([_, d]) => d.verified)
            .length;
          
          results.push({
            state: state.name,
            recordsUpdated: stateResult.recordsUpdated,
            verifiedYears,
            totalYears: Object.keys(stateResult.result.merged).length,
            hasDiscrepancies: Object.values(stateResult.result.merged).some(d => d.discrepancy),
            errors: stateResult.errors
          });
          
          totalRecords += stateResult.recordsUpdated;
          allErrors.push(...stateResult.errors);
          
          // Extra delay between states
          if (statesToProcess.indexOf(state) < statesToProcess.length - 1) {
            await delay(delayMs);
          }
        } catch (err) {
          const errorMsg = `${state.name}: ${String(err)}`;
          console.error(errorMsg);
          allErrors.push(errorMsg);
          results.push({ state: state.name, recordsUpdated: 0, verifiedYears: 0, errors: [String(err)] });
        }
      }

      const hasMore = endIndex < US_STATES.length;

      return new Response(JSON.stringify({
        success: true,
        mode: 'dual-batch',
        statesProcessed: statesToProcess.length,
        startIndex,
        endIndex,
        totalStates: US_STATES.length,
        hasMore,
        nextIndex: hasMore ? endIndex : null,
        totalRecordsUpdated: totalRecords,
        results,
        errors: allErrors
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // SINGLE STATE MODE
    if (body.stateName && body.stateAbbreviation) {
      const stateResult = await verifyStateDual(body.stateName, body.stateAbbreviation, delayMs);
      
      return new Response(JSON.stringify({
        success: true,
        mode: 'dual-single',
        ...stateResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Missing required parameters'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error) 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
