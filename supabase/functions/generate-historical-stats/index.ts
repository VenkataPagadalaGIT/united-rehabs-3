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

// Background task that does research, generates data, and saves to DB
async function generateAndSave(
  stateName: string,
  stateAbbreviation: string,
  startYear: number,
  endYear: number
) {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!PERPLEXITY_API_KEY || !LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required env vars');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const stateId = stateAbbreviation.toLowerCase();

  try {
    // Step 1: ONE Perplexity research call
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
      console.error(`[${stateAbbreviation}] Perplexity error: ${researchResp.status}`);
      return;
    }

    const research = await researchResp.json();
    const researchText = research.choices[0].message.content;
    console.log(`[${stateAbbreviation}] Research complete, generating data...`);

    // Step 2: Generate ALL years in ONE AI call with structured output
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    
    const prompt = `Based on this research for ${stateName}:
${researchText.substring(0, 4000)}

Generate statistics for ALL years: ${years.join(',')}

Return JSON with two arrays. Use realistic interpolation for missing years.
Fentanyl deaths: 0 before 2013, then increasing.

{"statistics":[
  {"year":YEAR,"state_id":"${stateId}","state_name":"${stateName}","total_affected":N,"overdose_deaths":N,"opioid_deaths":N,"alcohol_abuse_rate":N,"drug_abuse_rate":N,"treatment_admissions":N,"recovery_rate":N,"relapse_rate":N,"affected_age_12_17":N,"affected_age_18_25":N,"affected_age_26_34":N,"affected_age_35_plus":N,"total_treatment_centers":N,"inpatient_facilities":N,"outpatient_facilities":N,"economic_cost_billions":N,"data_source":"CDC/SAMHSA","source_url":"https://wonder.cdc.gov/"}
],"substance_statistics":[
  {"year":YEAR,"state_id":"${stateId}","state_name":"${stateName}","alcohol_use_disorder":N,"opioid_use_disorder":N,"fentanyl_deaths":N,"cocaine_related_deaths":N,"meth_related_deaths":N,"marijuana_use_past_year":N,"treatment_received":N,"alcohol_use_past_month_percent":N,"alcohol_binge_drinking_percent":N}
]}

ONLY return valid JSON, no explanation.`;

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro', // Use Pro for larger context
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!aiResp.ok) {
      console.error(`[${stateAbbreviation}] AI error: ${aiResp.status}`);
      return;
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`[${stateAbbreviation}] No JSON in AI response`);
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`[${stateAbbreviation}] Generated ${parsed.statistics?.length || 0} stats, ${parsed.substance_statistics?.length || 0} substance stats`);

    // Step 3: Upsert to database
    if (parsed.statistics?.length > 0) {
      const { error: statsError } = await supabase
        .from('state_addiction_statistics')
        .upsert(parsed.statistics, { onConflict: 'state_id,year' });
      
      if (statsError) {
        console.error(`[${stateAbbreviation}] Stats insert error:`, statsError);
      } else {
        console.log(`[${stateAbbreviation}] ✓ Saved ${parsed.statistics.length} statistics records`);
      }
    }

    if (parsed.substance_statistics?.length > 0) {
      const { error: substanceError } = await supabase
        .from('substance_statistics')
        .upsert(parsed.substance_statistics, { onConflict: 'state_id,year' });
      
      if (substanceError) {
        console.error(`[${stateAbbreviation}] Substance insert error:`, substanceError);
      } else {
        console.log(`[${stateAbbreviation}] ✓ Saved ${parsed.substance_statistics.length} substance records`);
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
      apiCallsPerState: 2 // 1 Perplexity + 1 AI
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
