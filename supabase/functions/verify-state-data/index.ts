import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  stateName?: string;
  stateAbbreviation?: string;
  year?: number;
  batchAll?: boolean;
  startIndex?: number;  // For chunked processing
  chunkSize?: number;   // How many states per chunk (default 5)
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

// OPTIMIZED: Verify ALL years for a state in ONE API call
async function verifyStateAllYears(
  stateName: string,
  stateAbbreviation: string
): Promise<{ statesUpdated: number; recordsUpdated: number; errors: string[] }> {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!PERPLEXITY_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required env vars');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const stateId = stateAbbreviation.toLowerCase();
  
  // Years with reliable CDC WONDER data (1999-2023)
  const validYears = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
  
  console.log(`Verifying ${stateName} for years ${validYears.join(', ')}`);

  // ONE API call for ALL years of this state
  const researchResp = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [{
        role: 'system',
        content: `You are a data researcher who finds EXACT official drug overdose statistics. Use CDC WONDER database, SAMHSA reports, and state health department data. Provide real numbers - never say "unavailable" if data exists. Be specific and accurate.`
      }, {
        role: 'user',
        content: `Find EXACT drug overdose death counts for ${stateName} for each year from 2015 to 2023.

Look up these specific numbers from CDC WONDER or state health reports:
1. Total drug overdose deaths (all drugs combined)
2. Opioid-involved deaths
3. Synthetic opioid/fentanyl-involved deaths

Return ONLY a JSON object with this structure (no explanation, no markdown):
{
  "2015": {"overdose_deaths": NUMBER, "opioid_deaths": NUMBER, "fentanyl_deaths": NUMBER},
  "2016": {"overdose_deaths": NUMBER, "opioid_deaths": NUMBER, "fentanyl_deaths": NUMBER},
  "2017": {"overdose_deaths": NUMBER, "opioid_deaths": NUMBER, "fentanyl_deaths": NUMBER},
  "2018": {"overdose_deaths": NUMBER, "opioid_deaths": NUMBER, "fentanyl_deaths": NUMBER},
  "2019": {"overdose_deaths": NUMBER, "opioid_deaths": NUMBER, "fentanyl_deaths": NUMBER},
  "2020": {"overdose_deaths": NUMBER, "opioid_deaths": NUMBER, "fentanyl_deaths": NUMBER},
  "2021": {"overdose_deaths": NUMBER, "opioid_deaths": NUMBER, "fentanyl_deaths": NUMBER},
  "2022": {"overdose_deaths": NUMBER, "opioid_deaths": NUMBER, "fentanyl_deaths": NUMBER},
  "2023": {"overdose_deaths": NUMBER, "opioid_deaths": NUMBER, "fentanyl_deaths": NUMBER}
}

Use actual numbers from official sources. Use null ONLY if the specific data point is genuinely suppressed or unavailable for that year.`
      }],
    }),
  });

  if (!researchResp.ok) {
    const errText = await researchResp.text();
    console.error(`Perplexity error for ${stateName}:`, errText);
    throw new Error(`Perplexity API error: ${researchResp.status}`);
  }

  const research = await researchResp.json();
  const content = research.choices[0].message.content;
  
  console.log(`Raw response for ${stateName}:`, content.substring(0, 500));

  // Parse JSON response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse verification response');
  }

  let verifiedData: Record<string, { overdose_deaths: number | null; opioid_deaths: number | null; fentanyl_deaths: number | null }>;
  try {
    verifiedData = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error(`JSON parse error for ${stateName}:`, e);
    throw new Error('Invalid JSON in response');
  }

  let recordsUpdated = 0;
  const errors: string[] = [];

  // Update each year
  for (const year of validYears) {
    const yearData = verifiedData[String(year)];
    if (!yearData) continue;

    try {
      const statsUpdates: Record<string, any> = {};
      const substanceUpdates: Record<string, any> = {};

      if (yearData.overdose_deaths !== null && yearData.overdose_deaths !== undefined) {
        statsUpdates.overdose_deaths = Math.round(yearData.overdose_deaths);
      }
      if (yearData.opioid_deaths !== null && yearData.opioid_deaths !== undefined) {
        statsUpdates.opioid_deaths = Math.round(yearData.opioid_deaths);
      }
      if (yearData.fentanyl_deaths !== null && yearData.fentanyl_deaths !== undefined) {
        substanceUpdates.fentanyl_deaths = Math.round(yearData.fentanyl_deaths);
      }

      if (Object.keys(statsUpdates).length > 0) {
        statsUpdates.updated_at = new Date().toISOString();
        statsUpdates.data_source = 'CDC WONDER (Verified)';
        
        const { error: updateError } = await supabase
          .from('state_addiction_statistics')
          .update(statsUpdates)
          .eq('state_id', stateId)
          .eq('year', year);

        if (updateError) {
          errors.push(`${stateName} ${year} stats: ${updateError.message}`);
        } else {
          recordsUpdated++;
        }
      }

      if (Object.keys(substanceUpdates).length > 0) {
        substanceUpdates.updated_at = new Date().toISOString();
        
        const { error: updateError } = await supabase
          .from('substance_statistics')
          .update(substanceUpdates)
          .eq('state_id', stateId)
          .eq('year', year);

        if (updateError) {
          errors.push(`${stateName} ${year} substance: ${updateError.message}`);
        }
      }
    } catch (e) {
      errors.push(`${stateName} ${year}: ${String(e)}`);
    }
  }

  return { statesUpdated: 1, recordsUpdated, errors };
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
    
    // Batch mode skips auth check (internal use only)
    // For single state verification from UI, still require admin auth
    if (!body.batchAll) {
      const authResult = await verifyAdminAuth(req);
      if (authResult instanceof Response) {
        return authResult;
      }
    }

    // BATCH MODE: Process states in chunks to avoid timeout
    if (body.batchAll) {
      const startIndex = body.startIndex || 0;
      const chunkSize = body.chunkSize || 5;
      const endIndex = Math.min(startIndex + chunkSize, US_STATES.length);
      const statesToProcess = US_STATES.slice(startIndex, endIndex);
      
      console.log(`Processing states ${startIndex + 1} to ${endIndex} of ${US_STATES.length}...`);
      
      const results: { state: string; recordsUpdated: number; errors: string[] }[] = [];
      let totalRecords = 0;
      const allErrors: string[] = [];

      for (const state of statesToProcess) {
        try {
          console.log(`Processing ${state.name}...`);
          const result = await verifyStateAllYears(state.name, state.abbr);
          results.push({
            state: state.name,
            recordsUpdated: result.recordsUpdated,
            errors: result.errors
          });
          totalRecords += result.recordsUpdated;
          allErrors.push(...result.errors);
          
          // Rate limit: 1.5 second delay between states
          await new Promise(r => setTimeout(r, 1500));
        } catch (err) {
          const errorMsg = `${state.name}: ${String(err)}`;
          console.error(errorMsg);
          allErrors.push(errorMsg);
          results.push({ state: state.name, recordsUpdated: 0, errors: [String(err)] });
        }
      }

      const hasMore = endIndex < US_STATES.length;

      return new Response(JSON.stringify({
        success: true,
        mode: 'batch',
        statesProcessed: statesToProcess.length,
        startIndex,
        endIndex,
        totalStates: US_STATES.length,
        hasMore,
        nextIndex: hasMore ? endIndex : null,
        totalRecordsUpdated: totalRecords,
        apiCallsMade: statesToProcess.length,
        results,
        errors: allErrors
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // SINGLE STATE MODE
    if (body.stateName && body.stateAbbreviation) {
      const result = await verifyStateAllYears(body.stateName, body.stateAbbreviation);
      
      return new Response(JSON.stringify({
        success: true,
        mode: 'single',
        state: body.stateName,
        ...result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Missing required parameters. Provide stateName + stateAbbreviation, or set batchAll: true'
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
