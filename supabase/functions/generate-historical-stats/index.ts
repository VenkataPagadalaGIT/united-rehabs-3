import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  stateName: string;
  stateAbbreviation: string;
  startYear: number;
  endYear: number;
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

// Background task that does research, generates data, and saves to DB
async function generateAndSave(
  stateName: string,
  stateAbbreviation: string,
  startYear: number,
  endYear: number
) {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!PERPLEXITY_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required env vars');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const stateId = stateAbbreviation.toLowerCase();

  try {
    // Step 1: Perplexity research call
    console.log(`[${stateAbbreviation}] Starting research...`);
    const researchResp = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{
          role: 'user',
          content: `${stateName} addiction statistics ${startYear}-${endYear}: yearly overdose deaths, opioid deaths, fentanyl deaths (from 2013), treatment admissions, substance use disorder rates. Include CDC WONDER, SAMHSA NSDUH data. Give actual numbers for key years.`
        }],
        search_domain_filter: ['.gov'],
      }),
    });
    
    if (!researchResp.ok) {
      console.error(`[${stateAbbreviation}] Perplexity research error: ${researchResp.status}`);
      return;
    }

    const research = await researchResp.json();
    const researchText = research.choices[0].message.content;
    console.log(`[${stateAbbreviation}] Research complete, generating structured data with Perplexity...`);

    // Step 2: Use Perplexity with structured output for ALL years
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    
    // Generate in chunks to avoid token limits (5 years per chunk for better JSON reliability)
    const chunkSize = 5;
    const allStatistics: any[] = [];
    const allSubstanceStats: any[] = [];

    for (let i = 0; i < years.length; i += chunkSize) {
      const chunkYears = years.slice(i, i + chunkSize);
      console.log(`[${stateAbbreviation}] Processing years ${chunkYears[0]}-${chunkYears[chunkYears.length - 1]}...`);

      const structuredResp = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{
            role: 'system',
            content: `You are a data analyst. Based on the research provided, generate realistic addiction statistics for ${stateName}. Use interpolation for missing years. Fentanyl deaths should be 0 before 2013.`
          }, {
            role: 'user',
            content: `Research data for ${stateName}:
${researchText.substring(0, 3000)}

Generate statistics for years: ${chunkYears.join(', ')}

Return JSON with two arrays. state_id is "${stateId}", state_name is "${stateName}".

Format:
{"statistics":[{"year":YEAR,"state_id":"${stateId}","state_name":"${stateName}","total_affected":NUMBER,"overdose_deaths":NUMBER,"opioid_deaths":NUMBER,"alcohol_abuse_rate":NUMBER,"drug_abuse_rate":NUMBER,"treatment_admissions":NUMBER,"recovery_rate":NUMBER,"relapse_rate":NUMBER,"affected_age_12_17":NUMBER,"affected_age_18_25":NUMBER,"affected_age_26_34":NUMBER,"affected_age_35_plus":NUMBER,"total_treatment_centers":NUMBER,"inpatient_facilities":NUMBER,"outpatient_facilities":NUMBER,"economic_cost_billions":NUMBER,"data_source":"CDC/SAMHSA","source_url":"https://wonder.cdc.gov/"}],"substance_statistics":[{"year":YEAR,"state_id":"${stateId}","state_name":"${stateName}","alcohol_use_disorder":NUMBER,"opioid_use_disorder":NUMBER,"fentanyl_deaths":NUMBER,"cocaine_related_deaths":NUMBER,"meth_related_deaths":NUMBER,"marijuana_use_past_year":NUMBER,"treatment_received":NUMBER,"alcohol_use_past_month_percent":NUMBER,"alcohol_binge_drinking_percent":NUMBER}]}

ONLY return valid JSON, no explanation.`
          }],
        }),
      });

      if (!structuredResp.ok) {
        console.error(`[${stateAbbreviation}] Perplexity structured error: ${structuredResp.status}`);
        continue;
      }

      const structuredData = await structuredResp.json();
      const content = structuredData.choices?.[0]?.message?.content || '';
      
      // Extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Round all numeric values to integers (except rates which can be decimals)
          const roundIntegers = (obj: any) => {
            const integerFields = ['total_affected', 'overdose_deaths', 'opioid_deaths', 'treatment_admissions',
              'affected_age_12_17', 'affected_age_18_25', 'affected_age_26_34', 'affected_age_35_plus',
              'total_treatment_centers', 'inpatient_facilities', 'outpatient_facilities',
              'alcohol_use_disorder', 'opioid_use_disorder', 'fentanyl_deaths', 'cocaine_related_deaths',
              'meth_related_deaths', 'marijuana_use_past_year', 'treatment_received'];
            for (const key of integerFields) {
              if (obj[key] !== undefined && obj[key] !== null) {
                obj[key] = Math.round(obj[key]);
              }
            }
            return obj;
          };
          
          if (parsed.statistics) {
            allStatistics.push(...parsed.statistics.map(roundIntegers));
          }
          if (parsed.substance_statistics) {
            allSubstanceStats.push(...parsed.substance_statistics.map(roundIntegers));
          }
        } catch (e) {
          console.error(`[${stateAbbreviation}] JSON parse error for chunk:`, e);
        }
      }

      // Small delay between chunks to avoid rate limits
      if (i + chunkSize < years.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    console.log(`[${stateAbbreviation}] Generated ${allStatistics.length} stats, ${allSubstanceStats.length} substance stats`);

    // Step 3: Upsert to database
    if (allStatistics.length > 0) {
      const { error: statsError } = await supabase
        .from('state_addiction_statistics')
        .upsert(allStatistics, { onConflict: 'state_id,year' });
      
      if (statsError) {
        console.error(`[${stateAbbreviation}] Stats insert error:`, statsError);
      } else {
        console.log(`[${stateAbbreviation}] ✓ Saved ${allStatistics.length} statistics records`);
      }
    }

    if (allSubstanceStats.length > 0) {
      const { error: substanceError } = await supabase
        .from('substance_statistics')
        .upsert(allSubstanceStats, { onConflict: 'state_id,year' });
      
      if (substanceError) {
        console.error(`[${stateAbbreviation}] Substance insert error:`, substanceError);
      } else {
        console.log(`[${stateAbbreviation}] ✓ Saved ${allSubstanceStats.length} substance records`);
      }
    }

    console.log(`[${stateAbbreviation}] ✅ COMPLETE`);

  } catch (err) {
    console.error(`[${stateAbbreviation}] Error:`, err);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof Response) {
      return authResult;
    }

    const body = await req.json();
    
    // Support single state or batch
    const states: GenerateRequest[] = Array.isArray(body) ? body : [body];
    
    console.log(`Starting generation for ${states.length} state(s)...`);

    // Use background tasks for each state
    for (const state of states) {
      // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
      EdgeRuntime.waitUntil(
        generateAndSave(
          state.stateName,
          state.stateAbbreviation,
          state.startYear || 1992,
          state.endYear || 2026
        )
      );
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Started background generation for ${states.length} state(s)`,
      states: states.map(s => s.stateAbbreviation),
      apiCallsPerState: '1 research + ~5 structured (chunked by 7 years) = ~6 Perplexity calls'
    }), {
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
